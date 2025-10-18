/**
 * Usage:
 *   DEBUG=tskmgr:* npx ts-node --project tsconfig.base.json -r tsconfig-paths/register "examples/client-example.ts"
 */

import { execSync } from 'child_process';
import { CreateTaskDto, Run, Task, TaskPriority } from '@tskmgr/common';
import { ClientOptions, ClientFactory } from '@tskmgr/client';
import { v4 as uuid } from 'uuid';
import Debug from 'debug';
import { readJsonFile } from '@nx/devkit';
import { unlinkSync } from 'fs';

const debug = Debug('tskmgr:client-example');

const options: ClientOptions = {
  parallel: 1,
  dataCallback,
  errorCallback,
};
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
        const command = `npx nx run ${nxTask.target.project}:${nxTask.target.target} --configuration=production`;
        return {
          name: nxTask.target.project,
          type: nxTask.target.target,
          command: command.trim(),
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
  const graphFileName = uuid() + '.json';
  // In CI environment use npx nx affected --graph=${graphFileName} --target=lint command. run-many is just for demo purpose.
  execSync(`npx nx run-many --graph=lint-${graphFileName} --target=lint`);
  const lintJson = readJsonFile(`lint-${graphFileName}`);
  unlinkSync(`lint-${graphFileName}`);
  const lintTasks: NxTask[] = Object.values(lintJson.tasks.tasks);

  execSync(`npx nx run-many --graph=test-${graphFileName} --target=test`);
  const testJson = readJsonFile(`test-${graphFileName}`);
  unlinkSync(`test-${graphFileName}`);
  const testTasks: NxTask[] = Object.values(testJson.tasks.tasks);

  execSync(`npx nx run-many --graph=build-${graphFileName} --target=build`);
  const buildJson = readJsonFile(`build-${graphFileName}`);
  unlinkSync(`build-${graphFileName}`);
  const buildTasks: NxTask[] = Object.values(buildJson.tasks.tasks);

  execSync(`npx nx run-many --graph=e2e-${graphFileName} --target=e2e`);
  const e2eJson = readJsonFile(`e2e-${graphFileName}`);
  unlinkSync(`e2e-${graphFileName}`);
  const e2eTasks: NxTask[] = Object.values(e2eJson.tasks.tasks);

  return [...lintTasks, ...testTasks, ...buildTasks, ...e2eTasks];
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
