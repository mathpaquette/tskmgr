import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { PullRequest } from '../../pull-requests/schemas/pull-request.schema';
import { RunStatus, TaskPriority, Run as Run_, DateUtil } from '@tskmgr/common';

export type RunDocument = Run & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Run implements Run_ {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PullRequest' })
  pullRequest: PullRequest;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  url: string;

  @Prop()
  type: string;

  @Prop({ enum: RunStatus, default: RunStatus.Created })
  status: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  endedAt: Date;

  @Prop()
  duration: number;

  @Prop({ enum: TaskPriority, default: TaskPriority.Longest })
  priority: string;

  @Prop()
  leaderId: string;

  close: (hasAllTasksCompleted: boolean) => RunDocument;

  complete: () => RunDocument;

  abort: () => RunDocument;
}

export const RunSchema = SchemaFactory.createForClass(Run);

RunSchema.methods.close = function (hasAllTasksCompleted: boolean): RunDocument {
  if (hasAllTasksCompleted) {
    this.complete();
    return this;
  }

  if (this.status === RunStatus.Created || this.status === RunStatus.Started) {
    this.status = RunStatus.Closed;
    return this;
  }
  throw new Error(`Run with ${this.status} status can't move to ${RunStatus.Closed}`);
};

RunSchema.methods.complete = function (): RunDocument {
  if (this.endedAt) {
    throw new Error(`Can't complete already ended run.`);
  }

  const endedAt = new Date();
  this.status = RunStatus.Completed;
  this.duration = DateUtil.getDuration(this.createdAt, endedAt);
  this.endedAt = endedAt;
  return this;
};

RunSchema.methods.abort = function (): RunDocument {
  if (this.endedAt) {
    throw new Error(`Can't abort already ended run.`);
  }

  const endedAt = new Date();
  this.status = RunStatus.Aborted;
  this.duration = DateUtil.getDuration(this.createdAt, endedAt);
  this.endedAt = endedAt;
  return this;
};
