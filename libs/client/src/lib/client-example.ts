/**
 * IntelliJ debug:
 *  Node parameters: --require ts-node/register --require tsconfig-paths/register
 *  Environment variables: TS_NODE_PROJECT=libs/client/tsconfig.lib.json
 *
 *  Start API:
 *    nx serve api
 *  Command:
 *    DEBUG=tskmgr:* ts-node --project libs/client/tsconfig.lib.json -r tsconfig-paths/register "libs/client/src/lib/client-example.ts"
 */

import { execSync } from 'child_process';
import { CreateTaskDto, Run, Task, TaskPriority } from '@tskmgr/common';
import { ClientOptions } from './client-options';
import { ClientFactory } from './client-factory';
import { v4 as uuid } from 'uuid';
import Debug from 'debug';
import { readJsonFile } from '@nx/devkit';
import { unlinkSync } from 'fs';
import { createTaskGraph } from 'nx/src/tasks-runner/create-task-graph';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import * as graph from './graph.json';
import { readNxJson } from 'nx/src/config/configuration';
// import {readNxJson} from "nx/src/config/configuration";

const debug = Debug('tskmgr:client-example');

delete process.env.TS_NODE_PROJECT;

const options: ClientOptions = {
  parallel: 1,
  dataCallback,
  errorCallback,
  spawnOptions: { env: { ...process.env, NO_COLOR: '1' } },
};
const client = ClientFactory.createNew('http://localhost:3333', 'RUNNER_1', options);

let completed = false;
let run: Run;

(async () => {
  try {
    // const projects = [
    //   "api",
    //   "client",
    //   "common",
    //   "frontend",
    //   "frontend-e2e",
    //   "db"
    // ];
    // const targets = ['build']
    // const nxJson = readNxJson();
    // const targetDependencies = {};
    // Object.keys(nxJson.targetDefaults ?? {}).forEach((k) => {
    //   targetDependencies[k] = nxJson.targetDefaults[k].dependsOn;
    // });
    // const taskGraph = createTaskGraph(graph, targetDependencies, projects, targets, undefined, {});
    // console.log('taskGraph', taskGraph)
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
        const dependsOn =
          nxTask.target.project === 'frontend' && nxTask.target.target === 'build'
            ? [{ project: 'common', target: 'build' }]
            : undefined;
        console.log('Depends On : ', dependsOn);
        return {
          name: nxTask.target.project,
          type: nxTask.target.target,
          command: command.trim(),
          dependsOn: dependsOn,
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
  // unlinkSync(`build-${graphFileName}`);
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
