import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RunStatus, TaskPriority, Run as Run_, DateUtil } from '@tskmgr/common';
import { PullRequest } from '../pull-requests/pull-request.entity';

@Entity()
export class Run implements Run_ {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  closed: boolean;

  @Column({ nullable: true })
  duration: number;

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

  @ManyToOne((type) => PullRequest, (pullRequest) => pullRequest.id, { eager: true, nullable: true })
  @JoinColumn({ name: 'pull_request_id' })
  pullRequest: PullRequest;

  @Column({ default: false })
  affinity: boolean;

  @Column()
  runners: number;

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
