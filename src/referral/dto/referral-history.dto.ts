import { ApiProperty } from '@nestjs/swagger';

export class ReferralHistoryDto {
  @ApiProperty({ description: 'ID записи истории' })
  id: string;

  @ApiProperty({ description: 'ID транзакции' })
  transactionId: string;

  @ApiProperty({ description: 'ID реферера' })
  referrerId: string;

  @ApiProperty({ description: 'ID приглашенного пользователя' })
  referredUserId: string;

  @ApiProperty({ description: 'Размер комиссии' })
  commissionAmount: number;

  @ApiProperty({ description: 'Первоначальная сумма транзакции' })
  originalTransactionAmount: number;

  @ApiProperty({ description: 'Процент комиссии' })
  commissionRate: number;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Статус начисления', enum: ['pending', 'completed', 'failed'] })
  status: string;

  @ApiProperty({ description: 'Дата обработки', required: false })
  processedAt?: Date;

  @ApiProperty({ description: 'Причина неудачи', required: false })
  failureReason?: string;
}

export class ReferralHistoryResponseDto {
  @ApiProperty({ description: 'Список записей истории', type: [ReferralHistoryDto] })
  history: ReferralHistoryDto[];

  @ApiProperty({ description: 'Общее количество записей' })
  total: number;

  @ApiProperty({ description: 'Текущая страница' })
  page: number;

  @ApiProperty({ description: 'Размер страницы' })
  limit: number;

  @ApiProperty({ description: 'Общая сумма заработанных комиссий' })
  totalEarned: number;
}
