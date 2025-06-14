import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReferralLinkDocument = ReferralLink & Document;

@Schema({
  timestamps: true,
  collection: 'referral_links',
})
export class ReferralLink {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  referrerId: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  usageCount: number;

  @Prop({ default: null })
  usedBy?: string;

  @Prop({ default: null })
  usedAt?: Date;
}

export const ReferralLinkSchema = SchemaFactory.createForClass(ReferralLink);
