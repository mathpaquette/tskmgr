import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Schema as MongooseSchema } from 'mongoose';
import { Run } from '../../runs/schemas/run.schema';
import { PullRequest as PullRequest_ } from '@tskmgr/common';

export type PullRequestDocument = PullRequest & Document;

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class PullRequest implements PullRequest_ {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Run' }] })
  runs: Run[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const PullRequestSchema = SchemaFactory.createForClass(PullRequest);
