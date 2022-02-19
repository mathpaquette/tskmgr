import { spawn } from 'child_process';
import { Client } from './client';
import { Task } from '@tskmgr/common';
import { ClientFactory } from './client-factory';
import { v4 as uuid } from 'uuid';

// console.log(process.env);
//
// const a = spawn('nx', ['--help']);
//
// a.stdout.on('data', (data) => {
//   console.log(data.toString());
// });
//
//

// import { spawnAsync } from './client';
//
// (async () => {
//   try {
//     console.log(process.env);
//     await spawnAsync('nsdsdx', ['--help'], { shell: true });
//   } catch (e) {
//     const aasd = e;
//     console.log(e);
//     console.log(`error123: ${e}`);
//     console.log('sds');
//   }
// })();

// (task, data) => {
//   if (data.includes(`${task.name}:${task.type}  [existing outputs match the cache, left as is]`)) {
//     return true;
//   }
//   return false;
// }

delete process.env.TS_NODE_PROJECT;

const dataCallback = (task: Task, data: any, cached: () => void) => {
  console.log(`${data}`);
  if (data.includes(`${task.name}:${task.type}  [existing outputs match the cache, left as is]`)) {
    cached();
  }
};

const errorCallback = (task: Task, data: any) => {
  console.log(`${data}`);
};

(async () => {
  const client = ClientFactory.createNew('http://localhost:3333', '1', 1, dataCallback, errorCallback);

  try {
    const newBuild = await client.createBuild({ name: uuid(), type: '123', pullRequestId: '123' });
    console.log(newBuild);

    await client.createTasks(newBuild._id, {
      tasks: [
        { name: 'api', type: 'lint', command: 'nx lint api --skip-nx-cache', options: { shell: true } },
        // { name: 'api', type: 'test', command: 'nx test api --skip-nx-cache', options: { shell: true } },
        { name: 'api', type: 'build', command: 'nx build api --skip-nx-cache', options: { shell: true } },
      ],
    });

    setTimeout(async () => {
      const closeBuild = await client.closeBuild(newBuild._id);
      console.log(closeBuild);
    }, 10 * 1000);

    await client.runTasks(newBuild._id);
  } catch (e) {
    // console.log(e);
    process.exit(1);
  }
})();
