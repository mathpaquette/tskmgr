import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Run } from '../../runs/schemas/run.schema';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { PullRequest } from '../../pull-requests/schemas/pull-request.schema';
import { DateUtil, Task as Task_, TaskPriority, TaskStatus } from '@tskmgr/common';

export type TaskDocument = Task & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
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

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

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

  @Prop({ type: MongooseSchema.Types.String, enum: TaskPriority, default: TaskPriority.Longest })
  priority: TaskPriority;

  complete: (cached: boolean) => TaskDocument;

  fail: () => TaskDocument;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

TaskSchema.methods.complete = function (cached: boolean): TaskDocument {
  if (!this.startedAt || this.endedAt) {
    throw new Error(`Task with ${this.status} status can't change to ${TaskStatus.Completed}`);
  }

  const endedAt = new Date();
  this.endedAt = endedAt;
  this.status = TaskStatus.Completed;
  this.duration = DateUtil.getDuration(this.startedAt, endedAt);
  this.cached = cached;
  return this;
};

TaskSchema.methods.fail = function (): TaskDocument {
  if (!this.startedAt || this.endedAt) {
    throw new Error(`Task with ${this.status} status can't change to ${TaskStatus.Failed}`);
  }

  const endedAt = new Date();
  this.endedAt = endedAt;
  this.status = TaskStatus.Failed;
  this.duration = DateUtil.getDuration(this.startedAt, endedAt);
  return this;
};
