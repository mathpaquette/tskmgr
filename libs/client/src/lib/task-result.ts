import { Run, Task } from '@tskmgr/common';
import { ChildProcess } from 'child_process';

export interface TaskResult {
  run: Run;
  task: Task;
  childProcess: ChildProcess;
  hasCompleted: boolean;
  error?: Error;
}
