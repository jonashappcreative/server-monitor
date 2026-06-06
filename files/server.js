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

/**
 * HELPER FUNCTIONS
 */

/**
 * Parst System-Stats von Linux Commands
 */
async function getSystemStats() {
  try {
    // TODO: CPU Usage auslesen
    const cpuUsage = 0;

    // TODO: Memory Usage auslesen
    const memoryUsage = 0;
    const memoryTotal = 16;

    // TODO: Disk Usage auslesen
    const diskUsage = 0;

    // TODO: Uptime auslesen
    const uptime = 0;

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
      memoryTotal: 16,
      disk: 0,
      uptime: 0,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

/**
 * Holt laufende Docker Container
 */
async function getDockerContainers() {
  try {
    // TODO: Docker ps ausführen und parsen
    // Format: docker ps --format 'table {{.Names}}|{{.Status}}|{{.Ports}}'
    
    const containers = [];
    return containers;
  } catch (error) {
    console.error('Error fetching containers:', error);
    return [];
  }
}

/**
 * Holt Service Information
 */
async function getServices() {
  try {
    // TODO: Services auslesen (z.B. aus docker-compose oder fester Liste)
    const services = [
      {
        name: 'Obsidian Bot',
        url: 'obsidian-bot.jonashapp.com',
        status: 'running',
        port: 8080
      },
      {
        name: 'Supabase DB',
        url: 'localhost:5432',
        status: 'running',
        port: 5432
      },
      {
        name: 'Redis Cache',
        url: 'localhost:6379',
        status: 'running',
        port: 6379
      }
    ];
    return services;
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

/**
 * API ENDPOINTS
 */

/**
 * Health Check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * Get all monitoring data
 */
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
      containers: containers,
      services: services
    });
  } catch (error) {
    console.error('Error in /api/stats:', error);
    res.status(500).json({
      error: 'Failed to fetch stats',
      message: error.message
    });
  }
});

/**
 * Get only system stats
 */
app.get('/api/system', async (req, res) => {
  try {
    const stats = await getSystemStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get only containers
 */
app.get('/api/containers', async (req, res) => {
  try {
    const containers = await getDockerContainers();
    res.json({ containers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get only services
 */
app.get('/api/services', async (req, res) => {
  try {
    const services = await getServices();
    res.json({ services });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * START SERVER
 */
app.listen(PORT, () => {
  console.log(`🚀 Server Monitor running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
