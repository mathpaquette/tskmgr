import { TaskPriority } from '../tasks/task-priority';
import { Task } from '../tasks/task';
import { File } from '../files/file';

export interface Run {
  id: number;
  name: string;
  url: string;
  type: string;
  status: string;
  closed: boolean;
  prioritization: TaskPriority[];
  leaderId: string;
  affinity: boolean;
  failFast: boolean;
  parameters: object;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
  endedAt: Date;
  tasks: Task[];
  files: File[];
}
