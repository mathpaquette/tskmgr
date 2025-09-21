/*
const si = require('systeminformation');

async function getSystemLoad() {
  try {
    const data = await si.currentLoad();
    console.log('Current System Load:');
    console.log(`Average Load (1 min): ${data.avgload1}`);
    console.log(`Average Load (5 min): ${data.avgload5}`);
    console.log(`Average Load (15 min): ${data.avgload15}`);
    console.log(`Current CPU Usage (%): ${data.currentLoad}`); // Overall CPU usage
    console.log(`User CPU Usage (%): ${data.currentLoadUser}`);
    console.log(`System CPU Usage (%): ${data.currentLoadSystem}`);
    console.log(`Idle CPU Usage (%): ${data.currentLoadIdle}`);
  } catch (e) {
    console.error(e);
  }
}

setInterval(getSystemLoad, 5000);

getSystemLoad();
*/

const si = require('systeminformation');

async function getMemoryUsage() {
  try {
    // const mem = await si.mem();
    // console.log('Memory Usage:');
    // console.log(`Total: ${(mem.total / 1024 / 1024).toFixed(2)} MB`);
    // console.log(`Used: ${(mem.used / 1024 / 1024).toFixed(2)} MB`);
    // console.log(`Free: ${(mem.free / 1024 / 1024).toFixed(2)} MB`);
    // console.log(`Active: ${(mem.active / 1024 / 1024).toFixed(2)} MB`);
    // console.log(`Available: ${(mem.available / 1024 / 1024).toFixed(2)} MB`);
    // console.log(`Memory Usage (%): ${(mem.used / mem.total * 100).toFixed(2)}%`);

    console.log(JSON.stringify(await si.mem(), null, 2));
  } catch (e) {
    console.error(e);
  }
}

setInterval(getMemoryUsage, 5000);

getMemoryUsage();