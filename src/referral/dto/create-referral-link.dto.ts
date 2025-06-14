import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReferralLinkDto {
  @ApiProperty({ description: 'ID пользователя, создающего реферальную ссылку' })
  @IsString()
  @IsNotEmpty()
  referrerId: string;

  @ApiProperty({ description: 'Срок действия ссылки в днях', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  expirationDays?: number;
}
