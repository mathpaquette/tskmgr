import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Run } from '../../runs/schemas/run.schema';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { PullRequest } from '../../pull-requests/schemas/pull-request.schema';
import { Task as Task_, TaskStatus } from '@tskmgr/common';

export type TaskDocument = Task & Document;

@Schema()
export class Task implements Task_ {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Run', required: true })
  run: Run;

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
