// Get CPU usage percentage in Node.js
const os = require('os');

function getCpuUsage(callback, interval = 1000) {
  const start = os.cpus();

  const numCores = os.cpus().length;
  console.log(`Number of CPU cores: ${numCores}`);
  setTimeout(() => {
    const end = os.cpus();
    let idleDiff = 0;
    let totalDiff = 0;

    for (let i = 0; i < start.length; i++) {
      const startCpu = start[i].times;
      const endCpu = end[i].times;

      const idle = endCpu.idle - startCpu.idle;
      const total = Object.keys(endCpu).reduce((acc, key) => acc + (endCpu[key] - startCpu[key]), 0);

      idleDiff += idle;
      totalDiff += total;
    }

    const usage = 100 - Math.round((100 * idleDiff) / totalDiff);
    callback(usage);
  }, interval);
}

// Example usage:
getCpuUsage((usage) => {
  console.log(`CPU Usage: ${usage}%`);
});
