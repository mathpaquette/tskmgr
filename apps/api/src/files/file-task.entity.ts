import { Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { TaskEntity } from '../tasks/task.entity';
import { FileEntity } from './file.entity';

@Entity({ name: 'file-task' })
export class FileTaskEntity extends FileEntity {
  @ManyToOne(() => TaskEntity, (task) => task.id, { nullable: false })
  @JoinColumn({ name: 'task_id' })
  @Index()
  task: TaskEntity;
}
