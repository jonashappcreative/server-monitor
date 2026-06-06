const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const cors = require('cors');

const app = express();
const execAsync = promisify(exec);

app.use(cors());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

async function getSystemStats() {
  try {
    // CPU: vmstat gives idle %, subtract from 100
    const { stdout: cpuOut } = await execAsync("vmstat 1 1 | tail -1 | awk '{print 100 - $15}'");
    const cpuUsage = parseFloat(cpuOut.trim()) || 0;

    // Memory: used MB and total MB
    const { stdout: memOut } = await execAsync("free -m | awk 'NR==2{printf \"%s %s\", $3, $2}'");
    const [memUsedMB, memTotalMB] = memOut.trim().split(' ').map(Number);
    const memoryUsage = parseFloat((memUsedMB / 1024).toFixed(2));
    const memoryTotal = parseFloat((memTotalMB / 1024).toFixed(1));

    // Disk: root partition usage percentage
    const { stdout: diskOut } = await execAsync("df / | awk 'NR==2{print $5}' | tr -d '%'");
    const diskUsage = parseFloat(diskOut.trim()) || 0;

    // Uptime in days (from /proc/uptime, seconds → days)
    const { stdout: uptimeOut } = await execAsync("awk '{printf \"%d\", $1/86400}' /proc/uptime");
    const uptime = parseInt(uptimeOut.trim()) || 0;

    return {
      cpu: cpuUsage,
      memory: memoryUsage,
      memoryTotal: memoryTotal,
      disk: diskUsage,
      uptime: uptime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return {
      cpu: 0,
      memory: 0,
      memoryTotal: 0,
      disk: 0,
      uptime: 0,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

async function getDockerContainers() {
  try {
    const { stdout } = await execAsync("docker ps --format '{{.Names}}|{{.Status}}|{{.Ports}}'");
    if (!stdout.trim()) return [];

    return stdout.trim().split('\n').map(line => {
      const [name, status, ports] = line.split('|');
      const isRunning = status && status.toLowerCase().startsWith('up');
      const uptimeMatch = status && status.match(/Up (.+)/i);
      return {
        name: name || 'unknown',
        status: isRunning ? 'running' : 'stopped',
        ports: ports ? ports.trim() : '',
        uptime: uptimeMatch ? uptimeMatch[1] : (status || '—')
      };
    });
  } catch (error) {
    console.error('Error fetching containers:', error);
    return [];
  }
}

async function getServices() {
  // Services are derived from running containers + known static entries
  try {
    const containers = await getDockerContainers();
    const serviceMap = {
      'obsidian-bot': { url: 'obsidian-bot.jonashapp.com', port: 8080 },
      'supabase-db':  { url: 'localhost:5432',             port: 5432 },
      'redis-cache':  { url: 'localhost:6379',             port: 6379 },
      'nginx':        { url: 'server.jonashapp.com',       port: 443  }
    };

    const found = containers.map(c => ({
      name: c.name,
      url: serviceMap[c.name]?.url || `localhost:${serviceMap[c.name]?.port || '—'}`,
      status: c.status,
      port: serviceMap[c.name]?.port || null
    }));

    // Add any known services not currently running as containers
    const foundNames = new Set(found.map(s => s.name));
    const fallback = Object.entries(serviceMap)
      .filter(([name]) => !foundNames.has(name))
      .map(([name, info]) => ({
        name,
        url: info.url,
        status: 'stopped',
        port: info.port
      }));

    return [...found, ...fallback];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// All monitoring data
app.get('/api/stats', async (req, res) => {
  try {
    const [systemStats, containers, services] = await Promise.all([
      getSystemStats(),
      getDockerContainers(),
      getServices()
    ]);

    res.json({
      timestamp: new Date().toISOString(),
      system: systemStats,
      containers,
      services
    });
  } catch (error) {
    console.error('Error in /api/stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats', message: error.message });
  }
});

app.get('/api/system', async (req, res) => {
  try {
    res.json(await getSystemStats());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/containers', async (req, res) => {
  try {
    res.json({ containers: await getDockerContainers() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/services', async (req, res) => {
  try {
    res.json({ services: await getServices() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server Monitor running on port ${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
