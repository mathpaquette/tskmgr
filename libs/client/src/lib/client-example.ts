/**
 * IntelliJ debug:
 *  Node parameters: --require ts-node/register --require tsconfig-paths/register
 *  Environment variables: TS_NODE_PROJECT=libs/client/tsconfig.lib.json
 */

import { execSync } from 'child_process';
import { CreateTaskDto, Task } from '@tskmgr/common';
import { ClientFactory } from './client-factory';
import { v4 as uuid } from 'uuid';

delete process.env.TS_NODE_PROJECT;

const client = ClientFactory.createNew('http://localhost:3333', '1', 4, dataCallback, errorCallback);

(async () => {
  try {
    const printAffected = execSync('nx print-affected --all');
    const printAffectedO = JSON.parse(printAffected.toString());

    const tasks: CreateTaskDto[] = [];

    printAffectedO.projects
      .filter((x) => !x.includes('-e2e'))
      .forEach((project) => {
        tasks.push({ name: project, type: 'lint', command: `nx lint ${project} --skip-nx-cache`, options: { shell: true } });
        tasks.push({ name: project, type: 'test', command: `nx test ${project} --skip-nx-cache`, options: { shell: true } });
        tasks.push({ name: project, type: 'build', command: `nx build ${project} --skip-nx-cache`, options: { shell: true } });
      });

    const newRun = await client.createRun({ name: uuid(), type: '123', pullRequestName: '123' });
    console.log(newRun);

    const createdTasks = await client.createTasks(newRun._id, { tasks });
    console.log(createdTasks);

    const closeRun = await client.closeRun(newRun._id);
    console.log(closeRun);

    await client.runTasks(newRun._id);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

function dataCallback(task: Task, data: any, cached: () => void): void {
  console.log(`${data}`);
  if (data.includes(`${task.name}:${task.type}  [existing outputs match the cache, left as is]`)) {
    cached();
  }
}

function errorCallback(task: Task, data: any): void {
  console.log(`${data}`);
}
