import { readFileSync } from 'fs';
import { resolve } from 'path';
import { DAG } from '../tasks/dag';

interface AffectedTasks {
  tasks: AffectedTask[];
}

interface AffectedTask {
  name: string;
  dependencies: string[];
}

const content = readFileSync(resolve(__dirname, 'affected-tasks.json'), { encoding: 'utf-8' });
const affectedTasks: AffectedTasks = JSON.parse(content);
const dag = new DAG();

for (const task of affectedTasks.tasks) {
  for (const dependency of task.dependencies) {
    dag.addDependency(dependency, task.name);
  }
}

console.log('dependencies:', dag.getAllDependencies('D'));
console.log('dependents:', dag.getAllDependents('E'));
