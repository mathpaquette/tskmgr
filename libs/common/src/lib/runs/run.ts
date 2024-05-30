import { TaskPriority } from '../tasks/task-priority';
import { Task } from '../tasks/task';
import { File } from '../files/file';
import { RunParameters } from './run-parameters';
import { RunInfo } from './run-info';

export interface Run {
  id: number;
  name: string;
  url: string;
  type: string;
  status: string;
  closed: boolean;
  prioritization: TaskPriority[];
  leaderId: string;
  failFast: boolean;
  info: RunInfo;
  parameters: RunParameters;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  endedAt: Date | null;
  tasks: Task[];
  files: File[];
}
