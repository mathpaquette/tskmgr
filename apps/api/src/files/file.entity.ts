import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { File } from '@tskmgr/common';
import { RunEntity } from '../runs/run.entity';
import { TaskEntity } from '../tasks/task.entity';

@Entity({ name: 'file' })
export class FileEntity implements File {
  filename: string;
  destination: string;
  mimeType: string;
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => RunEntity, (run) => run.id, { nullable: true })
  @JoinColumn({ name: 'run_id' })
  run: RunEntity;

  @ManyToOne(() => TaskEntity, (task) => task.id, { nullable: true })
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity;
}
