import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RunStatus, TaskPriority, Run, File, DateUtil } from '@tskmgr/common';
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

  public hasEnded(): boolean {
    return !!this.endedAt;
  }

  public complete(): void {
    if (this.hasEnded()) {
      throw new Error(`Can't complete already ended run.`);
    }

    const endedAt = new Date();
    this.status = RunStatus.Completed;
    this.duration = DateUtil.getDuration(this.createdAt, endedAt);
    this.endedAt = endedAt;
  }

  public fail(): void {
    if (this.hasEnded()) {
      throw new Error(`Can't fail already ended run.`);
    }

    const endedAt = new Date();
    this.status = RunStatus.Failed;
    this.duration = DateUtil.getDuration(this.createdAt, endedAt);
    this.endedAt = endedAt;
  }

  public abort(): void {
    if (this.hasEnded()) {
      throw new Error(`Can't abort already ended run.`);
    }

    const endedAt = new Date();
    this.status = RunStatus.Aborted;
    this.duration = DateUtil.getDuration(this.createdAt, endedAt);
    this.endedAt = endedAt;
  }

  public close(): void {
    if (this.closed) {
      throw new Error(`Run has been already closed!`);
    }

    this.closed = true;
  }
}
