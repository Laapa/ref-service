import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReferralRelationshipDocument = ReferralRelationship & Document;

@Schema({
  timestamps: true,
  collection: 'referral_relationships',
})
export class ReferralRelationship {
  @Prop({ required: true })
  referrerId: string;

  @Prop({ required: true })
  referredUserId: string;

  @Prop({ required: true })
  referralCode: string;

  @Prop({ required: true })
  joinedAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  totalCommissionEarned: number;

  @Prop({ default: 0 })
  transactionCount: number;
}

export const ReferralRelationshipSchema = SchemaFactory.createForClass(ReferralRelationship); 