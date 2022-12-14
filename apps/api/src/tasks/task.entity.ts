import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Task as Task_, TaskPriority, TaskStatus } from '@tskmgr/common';
import { Run } from '../runs/run.entity';

@Entity()
export class Task implements Task_ {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Run, (run) => run.id)
  @JoinColumn({ name: 'run_id' })
  run: Run;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  command: string;

  @Column({ type: 'simple-array', nullable: true })
  arguments: string[];

  @Column({ type: 'jsonb', nullable: true })
  options: object;

  @Column({ name: 'runner_id', nullable: true }) // TODO: move it's own table
  runnerId: string;

  @Column({ name: 'runner_host', nullable: true }) // TODO: move it's own table
  runnerHost: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.Pending })
  status: TaskStatus;

  @Column({ nullable: true })
  cached: boolean;

  @Column({ nullable: true })
  duration: number;

  @Column({ name: 'avg_duration', nullable: true })
  avgDuration: number;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.Longest })
  priority: TaskPriority;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'ended_at', nullable: true })
  endedAt: Date;
}
