import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RunStatus, TaskPriority, Run, File } from '@tskmgr/common';
import { FileEntity } from '../files/file.entity';

@Entity({ name: 'run' })
export class RunEntity implements Run {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ default: false })
  closed: boolean;

  @Column({ nullable: true })
  url: string;

  @Column({ name: 'fail_fast', default: true })
  failFast: boolean;

  @Column({ name: 'leader_id', nullable: true })
  leaderId: string;

  @Column({ type: 'simple-array', default: TaskPriority.Longest })
  prioritization: TaskPriority[];

  @Column({ type: 'jsonb', nullable: true })
  parameters: object;

  @Column({ default: false })
  affinity: boolean;

  @Column({ nullable: true })
  duration: number;

  @Column({ type: 'enum', enum: RunStatus, default: RunStatus.Created })
  status: RunStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'ended_at', nullable: true })
  endedAt: Date;

  @OneToMany(() => FileEntity, (file) => file.id, { nullable: false })
  files: File[];
}
