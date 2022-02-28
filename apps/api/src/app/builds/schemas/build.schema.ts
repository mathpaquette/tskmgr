import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { PullRequest } from '../../pull-requests/schemas/pull-request.schema';
import { BuildStatus, TaskPriority, Build as Build_, DateUtil } from '@tskmgr/common';

export type BuildDocument = Build & Document;

@Schema()
export class Build implements Build_ {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PullRequest' })
  pullRequest: PullRequest;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  type: string;

  @Prop({ enum: BuildStatus, default: BuildStatus.Created })
  status: string;

  @Prop({ default: () => new Date() })
  createdAt: Date;

  @Prop()
  endedAt: Date;

  @Prop()
  duration: number;

  @Prop({ enum: TaskPriority, default: TaskPriority.Longest })
  priority: string;

  close: (hasAllTasksCompleted: boolean) => BuildDocument;

  complete: () => BuildDocument;

  abort: () => BuildDocument;
}

export const BuildSchema = SchemaFactory.createForClass(Build);

BuildSchema.methods.close = function (hasAllTasksCompleted: boolean): BuildDocument {
  if (hasAllTasksCompleted) {
    this.complete();
    return this;
  }

  if (this.status === BuildStatus.Created || this.status === BuildStatus.Started) {
    this.status = BuildStatus.Closed;
    return this;
  }
  throw new Error(`Build with ${this.status} status can't move to ${BuildStatus.Closed}`);
};

BuildSchema.methods.complete = function (): BuildDocument {
  const endedAt = new Date();
  this.status = BuildStatus.Completed;
  this.duration = DateUtil.getDuration(this.createdAt, endedAt);
  this.endedAt = endedAt;
  return this;
};

BuildSchema.methods.abort = function (): BuildDocument {
  const endedAt = new Date();
  this.status = BuildStatus.Aborted;
  this.duration = DateUtil.getDuration(this.createdAt, endedAt);
  this.endedAt = endedAt;
  return this;
};
