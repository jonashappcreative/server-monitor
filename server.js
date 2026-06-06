const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const http = require('http');
const fs = require('fs').promises;
const os = require('os');
const cors = require('cors');

const app = express();
const execAsync = promisify(exec);

app.use(cors());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Read /proc/stat twice to compute CPU usage %
async function getCpuUsage() {
  const read = async () => {
    const data = await fs.readFile('/proc/stat', 'utf8');
    const vals = data.split('\n')[0].split(/\s+/).slice(1).map(Number);
    const idle = vals[3] + vals[4];
    const total = vals.reduce((a, b) => a + b, 0);
    return { idle, total };
  };
  const s1 = await read();
  await new Promise(r => setTimeout(r, 200));
  const s2 = await read();
  const idleDiff = s2.idle - s1.idle;
  const totalDiff = s2.total - s1.total;
  return parseFloat((100 - (idleDiff / totalDiff) * 100).toFixed(1));
}

async function getSystemStats() {
  try {
    const [cpu, diskOut, uptimeRaw] = await Promise.all([
      getCpuUsage(),
      execAsync("df / | awk 'NR==2{print $5}' | tr -d '%'"),
      fs.readFile('/proc/uptime', 'utf8')
    ]);

    const memTotal = os.totalmem();
    const memUsed = memTotal - os.freemem();
    const uptimeDays = Math.floor(parseFloat(uptimeRaw.split(' ')[0]) / 86400);

    return {
      cpu,
      memory: parseFloat((memUsed / 1073741824).toFixed(2)),
      memoryTotal: parseFloat((memTotal / 1073741824).toFixed(1)),
      disk: parseFloat(diskOut.stdout.trim()) || 0,
      uptime: uptimeDays,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return { cpu: 0, memory: 0, memoryTotal: 0, disk: 0, uptime: 0, timestamp: new Date().toISOString(), error: error.message };
  }
}

// Query Docker daemon directly via Unix socket — no docker CLI needed
function dockerRequest(path) {
  return new Promise((resolve) => {
    const req = http.request({
      socketPath: '/var/run/docker.sock',
      path,
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve([]); }
      });
    });
    req.on('error', () => resolve([]));
    req.end();
  });
}

async function getDockerContainers() {
  try {
    const list = await dockerRequest('/containers/json');
    if (!Array.isArray(list)) return [];
    return list.map(c => ({
      name: c.Names[0].replace(/^\//, ''),
      status: c.State === 'running' ? 'running' : 'stopped',
      ports: c.Ports
        .filter(p => p.PublicPort)
        .map(p => `${p.PublicPort}:${p.PrivatePort}`)
        .join(', ') || c.Ports.map(p => String(p.PrivatePort)).filter(Boolean).join(', ') || '',
      uptime: c.Status
    }));
  } catch (error) {
    console.error('Error fetching containers:', error);
    return [];
  }
}

async function getServices() {
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
      url: serviceMap[c.name]?.url || '',
      status: c.status,
      port: serviceMap[c.name]?.port || null
    }));

    const foundNames = new Set(found.map(s => s.name));
    const fallback = Object.entries(serviceMap)
      .filter(([name]) => !foundNames.has(name))
      .map(([name, info]) => ({ name, url: info.url, status: 'stopped', port: info.port }));

    return [...found, ...fallback];
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/api/stats', async (req, res) => {
  try {
    const [system, containers, services] = await Promise.all([
      getSystemStats(), getDockerContainers(), getServices()
    ]);
    res.json({ timestamp: new Date().toISOString(), system, containers, services });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats', message: error.message });
  }
});

app.get('/api/system',     async (req, res) => { try { res.json(await getSystemStats()); }     catch (e) { res.status(500).json({ error: e.message }); } });
app.get('/api/containers', async (req, res) => { try { res.json({ containers: await getDockerContainers() }); } catch (e) { res.status(500).json({ error: e.message }); } });
app.get('/api/services',   async (req, res) => { try { res.json({ services: await getServices() }); }   catch (e) { res.status(500).json({ error: e.message }); } });

app.listen(PORT, () => {
  console.log(`Server Monitor running on port ${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}`);
});
