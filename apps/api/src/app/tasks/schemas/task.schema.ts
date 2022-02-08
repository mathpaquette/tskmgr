import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Build } from '../../builds/schemas/build.schema';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { PullRequest } from '../../builds/schemas/pull-request.schema';

export type TaskDocument = Task & Document;

export enum TaskStatus {
  Pending = 'PENDING', // waiting to be executed
  Started = 'STARTED', // started
  Failed = 'FAILED', // failed
  Completed = 'COMPLETED', // completed
}

@Schema()
export class Task {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Build', required: true })
  build: Build;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PullRequest', required: true })
  pullRequest: PullRequest;

  @Prop()
  name: string;

  @Prop()
  type: string;

  @Prop({ required: true })
  command: string;

  @Prop()
  arguments: string[];

  @Prop({ type: Object })
  options: object;

  @Prop()
  runnerId: string;

  @Prop()
  runnerHost: string;

  @Prop({ enum: TaskStatus, default: TaskStatus.Pending })
  status: string;

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop()
  startedAt: Date;

  @Prop()
  endedAt: Date;

  @Prop()
  cached: boolean;

  @Prop()
  duration: number;

  @Prop()
  avgDuration: number;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
