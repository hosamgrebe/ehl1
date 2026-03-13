export type FundType = 'SYP' | 'USD';
export type TransactionType = 'deposit' | 'withdrawal' | 'expense';

export interface Transaction {
  id: string;
  timestamp: string;
  fund: FundType;
  type: TransactionType;
  amount: number;
  note: string;
  balanceAfter: number;
}

export interface FundBalance {
  SYP: number;
  USD: number;
}

export const TRANSACTION_TYPES_LABELS: Record<TransactionType, string> = {
  deposit: 'إيداع',
  withdrawal: 'سحب',
  expense: 'مصروف',
};

export const FUND_LABELS: Record<FundType, string> = {
  SYP: 'الليرة السورية',
  USD: 'الدولار الأمريكي',
};
