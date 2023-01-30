import { Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { RunEntity } from '../runs/run.entity';
import { FileEntity } from './file.entity';

@Entity({ name: 'file-run' })
export class FileRunEntity extends FileEntity {
  @ManyToOne(() => RunEntity, (run) => run.id, { nullable: false })
  @JoinColumn({ name: 'run_id' })
  @Index()
  run: RunEntity;
}
