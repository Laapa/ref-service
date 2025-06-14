import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';
import { ReferralRepository } from './repository/referral.repository';
import { ReferralLink, ReferralLinkSchema } from './schemas/referral-link.schema';
import { ReferralRelationship, ReferralRelationshipSchema } from './schemas/referral-relationship.schema';
import { CommissionHistory, CommissionHistorySchema } from './schemas/commission-history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReferralLink.name, schema: ReferralLinkSchema },
      { name: ReferralRelationship.name, schema: ReferralRelationshipSchema },
      { name: CommissionHistory.name, schema: CommissionHistorySchema },
    ]),
  ],
  controllers: [ReferralController],
  providers: [ReferralService, ReferralRepository],
  exports: [ReferralService],
})
export class ReferralModule {} 