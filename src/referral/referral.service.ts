import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { ReferralRepository } from './repository/referral.repository';
import { CreateReferralLinkDto } from './dto/create-referral-link.dto';
import { TransactionEventDto } from './dto/transaction-event.dto';
import { ReferralHistoryResponseDto } from './dto/referral-history.dto';
import { BusinessException } from '@common/exceptions/business.exception';
import { ReferralConfig } from '@config/configuration';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);
  private readonly referralConfig: ReferralConfig;

  constructor(
    private readonly referralRepository: ReferralRepository,
    private readonly configService: ConfigService,
  ) {
    this.referralConfig = this.configService.get<ReferralConfig>('referral')!;
  }

  async createReferralLink(dto: CreateReferralLinkDto): Promise<{ code: string; link: string }> {
    const code = this.generateReferralCode();
    const expirationDays = dto.expirationDays || this.referralConfig.linkExpirationDays;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expirationDays);

    await this.referralRepository.createReferralLink({
      code,
      referrerId: dto.referrerId,
      createdAt: new Date(),
      expiresAt,
      isActive: true,
      usageCount: 0,
    });

    const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register?ref=${code}`;

    this.logger.log(`Created referral link for user ${dto.referrerId}: ${code}`);

    return { code, link };
  }

  async processTransactionEvent(dto: TransactionEventDto): Promise<void> {
    if (dto.status !== 'completed') {
      this.logger.debug(`Skipping transaction ${dto.transactionId} with status ${dto.status}`);
      return;
    }

    if (!dto.referralBy) {
      this.logger.debug(`Transaction ${dto.transactionId} has no referral`);
      return;
    }

    try {
      // Проверяем, существует ли реферальная связь
      const relationship = await this.referralRepository.findReferralRelationship(dto.userId);
      
      if (!relationship) {
        this.logger.warn(`No referral relationship found for user ${dto.userId}`);
        return;
      }

      // Вычисляем комиссию
      const commissionAmount = dto.amount * this.referralConfig.commissionRate;
      
      // Создаем запись в истории комиссий
      await this.referralRepository.createCommissionHistory({
        transactionId: dto.transactionId,
        referrerId: relationship.referrerId,
        referredUserId: dto.userId,
        commissionAmount,
        originalTransactionAmount: dto.amount,
        commissionRate: this.referralConfig.commissionRate,
        createdAt: new Date(),
        status: 'completed',
        processedAt: new Date(),
      });

      // Обновляем статистику реферальной связи
      await this.referralRepository.updateReferralRelationshipStats(
        relationship.referrerId,
        dto.userId,
        commissionAmount,
      );

      this.logger.log(
        `Processed referral commission for transaction ${dto.transactionId}: ${commissionAmount}`,
      );
    } catch (error) {
      this.logger.error(`Error processing referral commission: ${error.message}`, error.stack);
      
      // Создаем запись об ошибке
      const relationship = await this.referralRepository.findReferralRelationship(dto.userId);
      if (relationship) {
        await this.referralRepository.createCommissionHistory({
          transactionId: dto.transactionId,
          referrerId: relationship.referrerId,
          referredUserId: dto.userId,
          commissionAmount: 0,
          originalTransactionAmount: dto.amount,
          commissionRate: this.referralConfig.commissionRate,
          createdAt: new Date(),
          status: 'failed',
          failureReason: error.message,
        });
      }
    }
  }

  async getReferralHistory(
    referrerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ReferralHistoryResponseDto> {
    const { history, total } = await this.referralRepository.findCommissionHistory(
      referrerId,
      page,
      limit,
    );

    const totalEarned = await this.referralRepository.getTotalEarned(referrerId);

    return {
      history: history.map(item => ({
        id: item._id.toString(),
        transactionId: item.transactionId,
        referrerId: item.referrerId,
        referredUserId: item.referredUserId,
        commissionAmount: item.commissionAmount,
        originalTransactionAmount: item.originalTransactionAmount,
        commissionRate: item.commissionRate,
        createdAt: item.createdAt,
        status: item.status,
        processedAt: item.processedAt,
        failureReason: item.failureReason,
      })),
      total,
      page,
      limit,
      totalEarned,
    };
  }

  async validateAndUseReferralCode(code: string, userId: string): Promise<void> {
    const referralLink = await this.referralRepository.findReferralLinkByCode(code);
    
    if (!referralLink) {
      throw new BusinessException('Реферальный код не найден или неактивен');
    }

    if (referralLink.expiresAt < new Date()) {
      throw new BusinessException('Реферальный код истек');
    }

    if (referralLink.referrerId === userId) {
      throw new BusinessException('Нельзя использовать собственный реферальный код');
    }

    // Проверяем, не использовал ли уже пользователь реферальный код
    const existingRelationship = await this.referralRepository.findReferralRelationship(userId);
    if (existingRelationship) {
      throw new BusinessException('Пользователь уже участвует в реферальной программе');
    }

    // Создаем реферальную связь
    await this.referralRepository.createReferralRelationship({
      referrerId: referralLink.referrerId,
      referredUserId: userId,
      referralCode: code,
      joinedAt: new Date(),
      isActive: true,
      totalCommissionEarned: 0,
      transactionCount: 0,
    });

    // Обновляем использование реферальной ссылки
    await this.referralRepository.updateReferralLinkUsage(code, userId);

    this.logger.log(`User ${userId} joined via referral code ${code} from ${referralLink.referrerId}`);
  }

  private generateReferralCode(): string {
    return uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
  }
} 