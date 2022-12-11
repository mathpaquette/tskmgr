import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { PullRequest as PullRequest_ } from '@tskmgr/common';
import { Run } from '../runs/run.entity';

@Entity()
export class PullRequest implements PullRequest_ {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  url: string;

  @OneToMany((type) => Run, (run) => run.pullRequest)
  runs: Run[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
