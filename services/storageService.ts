import { AppSettings, CallRecord, CallStatus, RejectionReason } from '../types';

const KEYS = {
  CALLS: 'app_calls_v5',
  SETTINGS: 'app_settings_v5',
  LAST_REPORT_DATE: 'app_last_report_date_v5'
};

const DEFAULT_SETTINGS: AppSettings = {
  agentName: '',
  webhookUrl: '',
  dailyReportTime: '18:00'
};

export const storageService = {
  // Settings
  getSettings(): AppSettings {
    const stored = localStorage.getItem(KEYS.SETTINGS);
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Calls
  getCalls(): CallRecord[] {
    const stored = localStorage.getItem(KEYS.CALLS);
    return stored ? JSON.parse(stored) : [];
  },

  saveCall(status: CallStatus, rejectionReason?: RejectionReason): CallRecord {
    const calls = this.getCalls();
    const now = new Date();
    
    const newCall: CallRecord = {
      id: crypto.randomUUID(),
      timestamp: now.getTime(),
      dateStr: now.toISOString().split('T')[0],
      status,
      rejectionReason
    };

    calls.push(newCall);
    localStorage.setItem(KEYS.CALLS, JSON.stringify(calls));
    return newCall;
  },

  getCallsByDate(dateStr: string): CallRecord[] {
    const calls = this.getCalls();
    return calls.filter(c => c.dateStr === dateStr);
  },

  // Daily Report Tracking
  getLastReportDate(): string | null {
    return localStorage.getItem(KEYS.LAST_REPORT_DATE);
  },

  setLastReportDate(dateStr: string): void {
    localStorage.setItem(KEYS.LAST_REPORT_DATE, dateStr);
  },

  // Maintenance
  clearCallsAndStats(): void {
    localStorage.removeItem(KEYS.CALLS);
    localStorage.removeItem(KEYS.LAST_REPORT_DATE);
  },

  factoryReset(): void {
    localStorage.clear();
    window.location.reload();
  }
};
