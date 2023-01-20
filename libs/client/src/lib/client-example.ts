/**
 * IntelliJ debug:
 *  Node parameters: --require ts-node/register --require tsconfig-paths/register
 *  Environment variables: TS_NODE_PROJECT=libs/client/tsconfig.lib.json
 *
 *  Start API:
 *    nx serve api
 *  Command:
 *    DEBUG=tskmgr:* TS_NODE_PROJECT=libs/client/tsconfig.lib.json node --require ts-node/register --require tsconfig-paths/register libs/client/src/lib/client-example.ts
 */

import { execSync } from 'child_process';
import { CreateTaskDto, Run, Task, TaskPriority } from '@tskmgr/common';
import { ClientOptions } from './client-options';
import { ClientFactory } from './client-factory';
import { v4 as uuid } from 'uuid';
import Debug from 'debug';
const debug = Debug('tskmgr:client-example');

delete process.env.TS_NODE_PROJECT;

const options: ClientOptions = { parallel: 1, dataCallback, errorCallback };
const client = ClientFactory.createNew('http://localhost:3333', 'RUNNER_1', options);

let completed = false;
let run: Run;

(async () => {
  try {
    // 1. Create the new run
    run = await client.createRun({
      name: uuid(),
      type: '123',
      prioritization: [TaskPriority.Longest],
    });
    debug(run);

    // 2. Leader should create some tasks to run
    const election = await client.setLeader(run.id);
    if (election.leader) {
      const tasks = getNxTasks().map<CreateTaskDto>((nxTask) => {
        return {
          name: nxTask.target.project,
          type: nxTask.target.target,
          command: nxTask.command,
          options: { shell: true },
          priority: TaskPriority.Longest,
        };
      });

      const createdTasks = await client.createTasks(run.id, { tasks });
      debug(createdTasks);

      const closeRun = await client.closeRun(run.id);
      debug(closeRun);
    }

    // 3. Execute tasks
    const result = await client.runTasks(run.id);
    if (result.completed) {
      // if failFast set to false, runTasks will continue without throwing errors.
      completed = true;
    }
  } catch (e) {
    console.error(e);
  } finally {
    // 4. See results
    console.log('--------------------------------------------------');
    console.log(`  tskmgr run: http://localhost:4200/runs/${run.id}`);
    console.log('--------------------------------------------------');
    console.log(`${completed ? 'COMPLETED!' : 'FAILED!'}`);
    process.exit(completed ? 0 : 1);
  }
})();

function getNxTasks(): NxTask[] {
  const tasks: NxTask[] = [
    // --all should be removed in CI environment. Just for demo purpose.
    ...JSON.parse(execSync('npx nx print-affected --all --target=lint').toString()).tasks,
    ...JSON.parse(execSync('npx nx print-affected --all --target=test').toString()).tasks,
    ...JSON.parse(execSync('npx nx print-affected --all --target=build').toString()).tasks,
  ];
  return tasks;
}

function dataCallback(task: Task, data: string, cached: () => void): void {
  // > nx run frontend:lint  [existing outputs match the cache, left as is]
  // > nx run client:lint  [local cache]
  if (
    (data.startsWith(`> nx run ${task.name}:${task.type}`) &&
      data.endsWith('[existing outputs match the cache, left as is]')) ||
    data.endsWith('[local cache]')
  ) {
    cached();
  }

  console.log(`[stdout] ${data}`);
}

function errorCallback(task: Task, data: string): void {
  console.log(`[stderr] ${data}`);
}

interface NxTask {
  id: string;
  overrides: any;
  target: { project: string; target: string };
  command: string;
  outputs: string[];
}
