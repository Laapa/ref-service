import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CommissionHistoryDocument = CommissionHistory & Document;

@Schema({
  timestamps: true,
  collection: 'commission_history',
})
export class CommissionHistory {
  @Prop({ required: true })
  transactionId: string;

  @Prop({ required: true })
  referrerId: string;

  @Prop({ required: true })
  referredUserId: string;

  @Prop({ required: true })
  commissionAmount: number;

  @Prop({ required: true })
  originalTransactionAmount: number;

  @Prop({ required: true })
  commissionRate: number;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true, enum: ['pending', 'completed', 'failed'] })
  status: string;

  @Prop()
  processedAt?: Date;

  @Prop()
  failureReason?: string;
}

export const CommissionHistorySchema = SchemaFactory.createForClass(CommissionHistory);
