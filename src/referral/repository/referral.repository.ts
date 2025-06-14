import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ReferralLink,
  ReferralLinkDocument,
} from '../schemas/referral-link.schema';
import {
  ReferralRelationship,
  ReferralRelationshipDocument,
} from '../schemas/referral-relationship.schema';
import {
  CommissionHistory,
  CommissionHistoryDocument,
} from '../schemas/commission-history.schema';

@Injectable()
export class ReferralRepository {
  constructor(
    @InjectModel(ReferralLink.name)
    private referralLinkModel: Model<ReferralLinkDocument>,
    @InjectModel(ReferralRelationship.name)
    private referralRelationshipModel: Model<ReferralRelationshipDocument>,
    @InjectModel(CommissionHistory.name)
    private commissionHistoryModel: Model<CommissionHistoryDocument>,
  ) {}

  async createReferralLink(data: Partial<ReferralLink>): Promise<ReferralLinkDocument> {
    const referralLink = new this.referralLinkModel(data);
    return referralLink.save();
  }

  async findReferralLinkByCode(code: string): Promise<ReferralLinkDocument | null> {
    return this.referralLinkModel.findOne({ code, isActive: true }).exec();
  }

  async findReferralLinksByReferrer(referrerId: string): Promise<ReferralLinkDocument[]> {
    return this.referralLinkModel.find({ referrerId }).exec();
  }

  async updateReferralLinkUsage(
    code: string,
    usedBy: string,
  ): Promise<ReferralLinkDocument | null> {
    return this.referralLinkModel
      .findOneAndUpdate(
        { code },
        {
          $inc: { usageCount: 1 },
          $set: { usedBy, usedAt: new Date() },
        },
        { new: true },
      )
      .exec();
  }

  async createReferralRelationship(
    data: Partial<ReferralRelationship>,
  ): Promise<ReferralRelationshipDocument> {
    const relationship = new this.referralRelationshipModel(data);
    return relationship.save();
  }

  async findReferralRelationship(
    referredUserId: string,
  ): Promise<ReferralRelationshipDocument | null> {
    return this.referralRelationshipModel.findOne({ referredUserId }).exec();
  }

  async updateReferralRelationshipStats(
    referrerId: string,
    referredUserId: string,
    commissionAmount: number,
  ): Promise<void> {
    await this.referralRelationshipModel
      .updateOne(
        { referrerId, referredUserId },
        {
          $inc: {
            totalCommissionEarned: commissionAmount,
            transactionCount: 1,
          },
        },
      )
      .exec();
  }

  async createCommissionHistory(
    data: Partial<CommissionHistory>,
  ): Promise<CommissionHistoryDocument> {
    const history = new this.commissionHistoryModel(data);
    return history.save();
  }

  async findCommissionHistory(
    referrerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ history: CommissionHistoryDocument[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [history, total] = await Promise.all([
      this.commissionHistoryModel
        .find({ referrerId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.commissionHistoryModel.countDocuments({ referrerId }).exec(),
    ]);

    return { history, total };
  }

  async getTotalEarned(referrerId: string): Promise<number> {
    const result = await this.commissionHistoryModel
      .aggregate([
        { $match: { referrerId, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$commissionAmount' } } },
      ])
      .exec();

    return result.length > 0 ? result[0].total : 0;
  }

  async updateCommissionStatus(
    transactionId: string,
    status: string,
    processedAt?: Date,
    failureReason?: string,
  ): Promise<void> {
    const updateData: any = { status };
    
    if (processedAt) {
      updateData.processedAt = processedAt;
    }
    
    if (failureReason) {
      updateData.failureReason = failureReason;
    }

    await this.commissionHistoryModel
      .updateOne({ transactionId }, updateData)
      .exec();
  }
} 