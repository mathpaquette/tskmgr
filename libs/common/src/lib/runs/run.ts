import { TaskPriority } from '../tasks/task-priority';

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
}
