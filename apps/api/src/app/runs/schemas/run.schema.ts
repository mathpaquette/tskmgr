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

  @Prop({ default: false })
  closed: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  endedAt: Date;

  @Prop()
  duration: number;

  @Prop({ type: MongooseSchema.Types.Array, default: [TaskPriority.Longest] })
  prioritization: TaskPriority[];

  @Prop()
  leaderId: string;

  @Prop()
  runners: number;

  @Prop({ default: false })
  runnerAffinity: boolean;

  @Prop({ default: false })
  failFast: boolean;

  close: () => RunDocument;

  complete: () => RunDocument;

  abort: () => RunDocument;

  fail: () => RunDocument;
}

export const RunSchema = SchemaFactory.createForClass(Run);

RunSchema.methods.close = function (): RunDocument {
  if (this.closed) {
    throw new Error(`Run has been already closed!`);
  }

  this.closed = true;
  return this;
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

RunSchema.methods.fail = function (): RunDocument {
  if (this.endedAt) {
    throw new Error(`Can't fail already ended run.`);
  }

  const endedAt = new Date();
  this.status = RunStatus.Failed;
  this.duration = DateUtil.getDuration(this.createdAt, endedAt);
  this.endedAt = endedAt;
  return this;
};
