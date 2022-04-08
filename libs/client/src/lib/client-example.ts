/**
 * IntelliJ debug:
 *  Node parameters: --require ts-node/register --require tsconfig-paths/register
 *  Environment variables: TS_NODE_PROJECT=libs/client/tsconfig.lib.json
 */

import { execSync } from 'child_process';
import { CreateTaskDto, Task } from '@tskmgr/common';
import { ClientOptions } from './client';
import { ClientFactory } from './client-factory';
import { v4 as uuid } from 'uuid';

delete process.env.TS_NODE_PROJECT;

const options: ClientOptions = { parallel: 4, dataCallback, errorCallback };
const client = ClientFactory.createNew('http://localhost:3333', 'RUNNER_1', options);

(async () => {
  try {
    const nxTasks = getNxTasks();
    const tasks: CreateTaskDto[] = [];

    for (const nxTask of nxTasks) {
      tasks.push({ name: nxTask.target.project, type: nxTask.target.target, command: nxTask.command, options: { shell: true } });
    }

    const newRun = await client.createRun({ name: uuid(), type: '123', pullRequestName: '123' });
    console.log(newRun);

    const res = await client.setLeader(newRun._id);
    if (res.isLeader) {
      const createdTasks = await client.createTasks(newRun._id, { tasks });
      console.log(createdTasks);

      const closeRun = await client.closeRun(newRun._id);
      console.log(closeRun);
    }

    await client.runTasks(newRun._id);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();

function getNxTasks(): NxTask[] {
  const tasks: NxTask[] = [
    ...JSON.parse(execSync('npx nx print-affected --target=lint').toString()).tasks,
    ...JSON.parse(execSync('npx nx print-affected --target=test').toString()).tasks,
    ...JSON.parse(execSync('npx nx print-affected --target=build').toString()).tasks,
  ];
  return tasks;
}

function dataCallback(task: Task, data: string, cached: () => void): void {
  console.log(data);
  // "> nx run client:lint  [existing outputs match the cache, left as is]"
  if (data.startsWith(`> nx run ${task.name}:${task.type}`) && data.endsWith('[existing outputs match the cache, left as is]')) {
    cached();
  }
}

function errorCallback(task: Task, data: string): void {
  console.log(data);
}

interface NxTask {
  id: string;
  overrides: any;
  target: { project: string; target: string };
  command: string;
  outputs: string[];
}
