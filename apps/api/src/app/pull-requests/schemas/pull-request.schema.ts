import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { Build } from '../../builds/schemas/build.schema';
import { PullRequest as PullRequest_ } from '@tskmgr/common';

export type PullRequestDocument = PullRequest & Document;

@Schema()
export class PullRequest implements PullRequest_ {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Build' }] })
  builds: Build[];

  @Prop({ default: () => new Date() })
  createdAt: Date;
}

export const PullRequestSchema = SchemaFactory.createForClass(PullRequest);
