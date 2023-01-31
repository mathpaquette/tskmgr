import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { File } from '@tskmgr/common';
import { RunEntity } from '../runs/run.entity';
import { TaskEntity } from '../tasks/task.entity';

@Entity({ name: 'file' })
export class FileEntity implements File {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne('run', 'files', { nullable: false })
  @JoinColumn({ name: 'run_id' })
  @Index()
  run: RunEntity;

  @ManyToOne('task', 'files', { nullable: true })
  @JoinColumn({ name: 'task_id' })
  @Index()
  task: TaskEntity;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  type: string;

  @Column({ name: 'origin_name' })
  originName: string;

  @Column()
  filename: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
