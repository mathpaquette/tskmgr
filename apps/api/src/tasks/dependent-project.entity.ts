import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { TaskEntity } from './task.entity';

@Entity()
export class DependentProjectEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  project: string;

  @Column({ type: 'varchar', length: 200 })
  target: string;

  @ManyToOne(() => TaskEntity, (task) => task.dependsOn)
  task: TaskEntity;
}
