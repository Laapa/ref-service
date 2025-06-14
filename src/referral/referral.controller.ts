import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ReferralService } from './referral.service';
import { CreateReferralLinkDto } from './dto/create-referral-link.dto';
import { TransactionEventDto } from './dto/transaction-event.dto';
import { ReferralHistoryResponseDto } from './dto/referral-history.dto';

@ApiTags('Referral')
@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post('referral-link')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать реферальную ссылку' })
  @ApiResponse({
    status: 201,
    description: 'Реферальная ссылка создана успешно',
    schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Реферальный код' },
        link: { type: 'string', description: 'Полная реферальная ссылка' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Неверные данные запроса' })
  async createReferralLink(
    @Body(ValidationPipe) dto: CreateReferralLinkDto,
  ): Promise<{ code: string; link: string }> {
    return this.referralService.createReferralLink(dto);
  }

  @Post('transaction-event')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обработать событие транзакции' })
  @ApiResponse({ status: 200, description: 'Событие обработано успешно' })
  @ApiResponse({ status: 400, description: 'Неверные данные события' })
  async processTransactionEvent(
    @Body(ValidationPipe) dto: TransactionEventDto,
  ): Promise<{ message: string }> {
    await this.referralService.processTransactionEvent(dto);
    return { message: 'Transaction event processed successfully' };
  }

  @Get('referral-history')
  @ApiOperation({ summary: 'Получить историю начислений реферальных комиссий' })
  @ApiQuery({ name: 'referrerId', description: 'ID реферера', type: 'string' })
  @ApiQuery({ name: 'page', description: 'Номер страницы', type: 'number', required: false })
  @ApiQuery({ name: 'limit', description: 'Количество записей на странице', type: 'number', required: false })
  @ApiResponse({
    status: 200,
    description: 'История начислений получена успешно',
    type: ReferralHistoryResponseDto,
  })
  async getReferralHistory(
    @Query('referrerId') referrerId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<ReferralHistoryResponseDto> {
    return this.referralService.getReferralHistory(
      referrerId,
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 10,
    );
  }

  // Kafka message handler
  @MessagePattern('transaction.completed')
  async handleTransactionCompleted(@Payload() data: TransactionEventDto): Promise<void> {
    await this.referralService.processTransactionEvent(data);
  }

  // Additional endpoint for validating referral codes (for integration with registration)
  @Post('validate-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Валидировать и использовать реферальный код' })
  @ApiResponse({ status: 200, description: 'Реферальный код валиден и использован' })
  @ApiResponse({ status: 400, description: 'Реферальный код недействителен' })
  async validateReferralCode(
    @Body() body: { code: string; userId: string },
  ): Promise<{ message: string }> {
    await this.referralService.validateAndUseReferralCode(body.code, body.userId);
    return { message: 'Referral code validated and used successfully' };
  }
} 