import { TaskPriority } from '../tasks/task-priority';
import { Task } from '../tasks/task';
import { File } from '../files/file';
import { RunParameters } from './run-parameters';

export interface Run {
  id: number;
  name: string;
  url: string;
  type: string;
  status: string;
  closed: boolean;
  prioritization: TaskPriority[];
  leaderId: string;
  affinityId: string;
  failFast: boolean;
  parameters: RunParameters;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  endedAt: Date;
  tasks: Task[];
  files: File[];
}
