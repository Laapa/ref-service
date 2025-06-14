export interface TransactionEvent {
  transactionId: string;
  userId: string;
  amount: number;
  commission: number;
  status: 'completed' | 'failed' | 'pending';
  timestamp: Date;
  referralBy?: string;
}

export interface ReferralCommissionEvent {
  transactionId: string;
  referrerId: string;
  referredUserId: string;
  commissionAmount: number;
  originalAmount: number;
  timestamp: Date;
} 