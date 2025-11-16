/**
 * Usage:
 *   npm run client:example
 */

import { execSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { unlinkSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CreateTaskDto, Run, Task, TaskPriority } from '@tskmgr/common';
import { ClientOptions, ClientFactory } from '@tskmgr/client';
import { v4 as uuid } from 'uuid';
import Debug from 'debug';

const debug = Debug('tskmgr:client-example');

async function main() {
  const options: ClientOptions = {
    parallel: 1,
    dataCallback,
    errorCallback,
  };

  let run: Run;
  let completed = false;
  const client = ClientFactory.createNew('http://localhost:3333', 'RUNNER_1', options);

  try {
    // 1. Create the new run
    run = await client.createRun({
      name: uuid(),
      type: '123',
      prioritization: [TaskPriority.Longest],
      info: {
        COMMIT_ID: '5544639e825f91cfc5c265c1cf11a230ff9c75ba',
      },
      parameters: {
        JENKINS: 'example',
      },
    });
    debug(run);

    // 2. Leader should create some tasks to run
    const election = await client.setLeader(run.id);
    if (election.leader) {
      const tasks = getNxTasks(['lint', 'test', 'build']).map<CreateTaskDto>((x) => {
        const command = `npx nx run ${x.id}`;
        return {
          name: x.id,
          type: x.target.target,
          command: command.trim(),
          options: { shell: true },
          priority: TaskPriority.Longest,
          dependencies: x.dependencies,
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
}

main();

function getNxTasks(targets: string[]): NxGraphTask[] {
  const tmpFile = join(tmpdir(), uuid()) + '.json';
  const command = `npx nx run-many --all --graph=${tmpFile} --target=${targets.join(',')}`;
  execSync(command);
  const parsed = JSON.parse(readFileSync(tmpFile).toString());
  unlinkSync(tmpFile);
  return Object.entries<any>(parsed.tasks.tasks).map(([key, value]) => {
    return {
      id: key,
      target: value.target,
      dependencies: parsed.tasks.dependencies[key],
    };
  });
}

function dataCallback(task: Task, data: string, cached: () => void): void {
  // Nx read the output from the cache instead of running the command for 1 out of 1 tasks.
  const regex = /Nx read the output from the cache instead of running the command for (\d+) out of (\d+) tasks\./;
  const match = data.match(regex);
  if (match && match[1] === match[2]) {
    cached();
  }
  console.log(`[stdout] ${data}`);
}

function errorCallback(task: Task, data: string): void {
  console.log(`[stderr] ${data}`);
}

interface NxGraphTask {
  id: string;
  target: { project: string; target: string };
  dependencies: string[];
}
