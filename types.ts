export type CallStatus = 'deal' | 'no-deal';

export enum RejectionReason {
  NO_MONEY = 'No Money',
  NO_CREDIT = 'No Credit',
  NOT_INTERESTED = 'Not Interested',
  OTHER = 'Other'
}

export interface CallRecord {
  id: string;
  timestamp: number; // Unix timestamp
  dateStr: string; // YYYY-MM-DD for easy filtering
  status: CallStatus;
  rejectionReason?: RejectionReason;
}

export interface AppSettings {
  agentName: string;
  webhookUrl: string;
  dailyReportTime: string; // Format "HH:mm"
}

export interface DailyStats {
  date: string;
  totalCalls: number;
  totalSales: number;
  failedTotal: number;
  conversionRate: string; // e.g., "25%"
  topRejectionReason: string;
  rejectionCounts: Record<string, number>;
}

// Flattened payload structure for Make.com / Google Sheets
export interface WebhookPayload {
  type: 'single_call' | 'daily_summary' | 'test';
  agent_name: string;
  timestamp?: string;
  date?: string;
  // Single Call fields
  call_status?: string;
  rejection_reason?: string;
  // Daily Summary fields
  total_calls?: number;
  total_sales?: number;
  failed_total?: number;
  conversion_rate?: string;
  top_rejection_reason?: string;
  // Flattened Rejection Counts
  count_no_money?: number;
  count_no_credit?: number;
  count_not_interested?: number;
  count_other?: number;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}