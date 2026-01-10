export type PaymentMethod = 'cash' | 'mobile_money' | 'bank_transfer' | 'card';

export interface FinancialTransaction {
  id: string;
  type: 'revenue' | 'expense' | 'refund' | 'maintenance' | 'insurance';
  amount: number;
  description: string;
  reference: string; // Booking ID, Maintenance ID, etc.
  paymentMethod: PaymentMethod;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  recordedBy: string; // Staff ID
}

export interface DailySummary {
  date: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  bookingsCount: number;
  refundsCount: number;
}