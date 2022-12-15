import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RunStatus, TaskPriority, Run } from '@tskmgr/common';

@Entity({ name: 'run' })
export class RunEntity implements Run {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  closed: boolean;

  @Column()
  url: string;

  @Column({ name: 'fail_fast', default: true })
  failFast: boolean;

  @Column({ name: 'leader_id', nullable: true })
  leaderId: string;

  @Column()
  name: string;

  @Column({ type: 'simple-array', default: TaskPriority.Longest })
  prioritization: TaskPriority[];

  @Column({ type: 'jsonb' })
  parameters: object;

  @Column({ default: false })
  affinity: boolean;

  @Column({ nullable: true })
  duration: number;

  @Column({ type: 'enum', enum: RunStatus, default: RunStatus.Created })
  status: RunStatus;

  @Column()
  type: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'ended_at', nullable: true })
  endedAt: Date;
}
