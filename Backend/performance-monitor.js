const os = require('os');
const logger = require('./utils/logger');

class PerformanceMonitor {
  constructor() {
    this.startTime = Date.now();
    this.lastCheck = Date.now();
    this.checks = 0;
  }

  logSystemStats() {
    const now = Date.now();
    const uptime = now - this.startTime;
    this.checks++;

    const stats = {
      uptime: Math.round(uptime / 1000),
      checks: this.checks,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        system: Math.round(os.totalmem() / 1024 / 1024),
        free: Math.round(os.freemem() / 1024 / 1024)
      },
      cpu: {
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      }
    };

    // Log warning if memory usage is high
    const memoryUsagePercent = (stats.memory.used / stats.memory.total) * 100;
    if (memoryUsagePercent > 80) {
      logger.warn(`High memory usage: ${memoryUsagePercent.toFixed(1)}% (${stats.memory.used}MB/${stats.memory.total}MB)`);
    }

    // Log warning if CPU load is high
    const cpuLoad = stats.cpu.loadAverage[0];
    if (cpuLoad > stats.cpu.cores * 0.8) {
      logger.warn(`High CPU load: ${cpuLoad.toFixed(2)} (cores: ${stats.cpu.cores})`);
    }

    logger.info('System Stats:', {
      uptime: `${stats.uptime}s`,
      memory: `${stats.memory.used}MB/${stats.memory.total}MB (${memoryUsagePercent.toFixed(1)}%)`,
      cpu: `Load: ${cpuLoad.toFixed(2)}/${stats.cpu.cores}`,
      checks: stats.checks
    });

    this.lastCheck = now;
  }

  startMonitoring(intervalMs = 30000) {
    logger.info('Starting performance monitoring...');
    this.logSystemStats();
    
    setInterval(() => {
      this.logSystemStats();
    }, intervalMs);
  }
}

module.exports = PerformanceMonitor;
