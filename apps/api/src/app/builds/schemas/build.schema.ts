import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { PullRequest } from './pull-request.schema';
import { Util } from '../../common/util';

export type BuildDocument = Build & Document;

export enum BuildStatus {
  Created = 'CREATED', // newly created build without tasks
  Started = 'STARTED', // tasks have been added, ready to pick up
  Closed = 'CLOSED', // all tasks created, waiting for completion
  Aborted = 'ABORTED', // one task failed
  Completed = 'COMPLETED', // all tasks completed successfully
}

@Schema()
export class Build extends Document {
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

  close: () => Build;

  complete: () => Build;

  abort: () => Build;
}

export const BuildSchema = SchemaFactory.createForClass(Build);

BuildSchema.methods.close = function (): Build {
  if (this.status === BuildStatus.Created || this.status === BuildStatus.Started) {
    this.status = BuildStatus.Closed;
    return this;
  }
  throw new Error(`Build with ${this.status} status can't move to ${BuildStatus.Closed}`);
};

BuildSchema.methods.complete = function (): Build {
  const endedAt = new Date();
  this.status = BuildStatus.Completed;
  this.duration = Util.getDuration(this.createdAt, endedAt);
  this.endedAt = endedAt;
  return this;
};

BuildSchema.methods.abort = function (): Build {
  const endedAt = new Date();
  this.status = BuildStatus.Aborted;
  this.duration = Util.getDuration(this.createdAt, endedAt);
  this.endedAt = endedAt;
  return this;
};
