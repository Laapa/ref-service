import { IsString, IsNotEmpty, IsNumber, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TransactionEventDto {
  @ApiProperty({ description: 'ID транзакции' })
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({ description: 'ID пользователя' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Сумма транзакции' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Размер комиссии' })
  @IsNumber()
  commission: number;

  @ApiProperty({ description: 'Статус транзакции', enum: ['completed', 'failed', 'pending'] })
  @IsEnum(['completed', 'failed', 'pending'])
  status: 'completed' | 'failed' | 'pending';

  @ApiProperty({ description: 'Время создания транзакции' })
  @IsDateString()
  timestamp: string;

  @ApiProperty({ description: 'ID реферера (если есть)', required: false })
  @IsOptional()
  @IsString()
  referralBy?: string;
} 