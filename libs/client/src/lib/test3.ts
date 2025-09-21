const si = require('systeminformation');

async function getSystemMemoryInfo() {
    try {
        const memData = await si.mem();
        console.log('\nSystem Memory Information:');
        console.log(`Total: ${memData.total / (1024 * 1024 * 1024)} GB`);
        console.log(`Free: ${memData.free / (1024 * 1024 * 1024)} GB`);
        console.log(`Used: ${memData.used / (1024 * 1024 * 1024)} GB`);
        console.log(`Active: ${memData.active / (1024 * 1024 * 1024)} GB`);
        console.log(`Available: ${memData.available / (1024 * 1024 * 1024)} GB`);
    } catch (e) {
        console.error(e);
    }
}

getSystemMemoryInfo();