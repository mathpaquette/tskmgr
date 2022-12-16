import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { TaskEntity } from '../tasks/task.entity';

@Entity({ name: 'runner' })
export class RunnerEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  status: string; // TODO: running, failed, aborted ? check with jenkins

  @ManyToOne(() => RunnerEntity, (run) => run.id)
  run: RunnerEntity;

  @OneToMany(() => TaskEntity, (task) => task.id)
  tasks: TaskEntity[];

  // @OneToMany(() => TaskEntity, (task) => task.id)
  // files: TaskEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({name: 'updated_at'})
  updatedAt: Date;
}
