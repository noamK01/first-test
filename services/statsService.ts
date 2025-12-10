import { CallRecord, DailyStats, RejectionReason, WebhookPayload, AppSettings } from '../types';

export const statsService = {
  calculateDailyStats(calls: CallRecord[], dateStr: string): DailyStats {
    const totalCalls = calls.length;
    const sales = calls.filter(c => c.status === 'deal').length;
    const failed = totalCalls - sales;
    
    // Calculate Rejection Counts
    const rejectionCounts: Record<string, number> = {
      [RejectionReason.NO_MONEY]: 0,
      [RejectionReason.NO_CREDIT]: 0,
      [RejectionReason.NOT_INTERESTED]: 0,
      [RejectionReason.OTHER]: 0
    };

    calls.filter(c => c.status === 'no-deal' && c.rejectionReason).forEach(c => {
      if (c.rejectionReason && rejectionCounts[c.rejectionReason] !== undefined) {
        rejectionCounts[c.rejectionReason]++;
      }
    });

    // Determine Top Rejection Reason
    let topRejectionReason = 'N/A';
    let maxCount = -1;
    
    if (failed > 0) {
      Object.entries(rejectionCounts).forEach(([reason, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topRejectionReason = reason;
        } else if (count === maxCount && maxCount > 0) {
            // Tie-breaker logic or keep existing
        }
      });
      if (maxCount === 0) topRejectionReason = 'None';
    }

    const conversionRate = totalCalls > 0 
      ? `${((sales / totalCalls) * 100).toFixed(1)}%` 
      : '0%';

    return {
      date: dateStr,
      totalCalls,
      totalSales: sales,
      failedTotal: failed,
      conversionRate,
      topRejectionReason,
      rejectionCounts
    };
  },

  createDailyPayload(settings: AppSettings, stats: DailyStats): WebhookPayload {
    return {
      type: 'daily_summary',
      agent_name: settings.agentName,
      date: stats.date,
      total_calls: stats.totalCalls,
      total_sales: stats.totalSales,
      failed_total: stats.failedTotal,
      conversion_rate: stats.conversionRate,
      top_rejection_reason: stats.topRejectionReason,
      // FLATTENED FIELDS (Critical for Google Sheets via Make)
      count_no_money: stats.rejectionCounts[RejectionReason.NO_MONEY] || 0,
      count_no_credit: stats.rejectionCounts[RejectionReason.NO_CREDIT] || 0,
      count_not_interested: stats.rejectionCounts[RejectionReason.NOT_INTERESTED] || 0,
      count_other: stats.rejectionCounts[RejectionReason.OTHER] || 0
    };
  },

  createSingleCallPayload(settings: AppSettings, call: CallRecord): WebhookPayload {
    return {
      type: 'single_call',
      agent_name: settings.agentName,
      timestamp: new Date(call.timestamp).toISOString(),
      call_status: call.status,
      rejection_reason: call.rejectionReason || ''
    };
  }
};
