import { Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { File } from '@tskmgr/common';

export abstract class FileEntity implements File {
  @PrimaryGeneratedColumn()
  id: number;

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
