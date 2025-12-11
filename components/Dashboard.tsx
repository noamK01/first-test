import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Send, RefreshCw, Phone, TrendingUp, XOctagon, AlertCircle } from 'lucide-react';
import { CallRecord, RejectionReason } from '../types';
import { statsService } from '../services/statsService';
import { Card } from './ui/Card';

interface DashboardProps {
  calls: CallRecord[];
  onManualReport: () => void;
  onReset: () => void;
  isSending: boolean;
}

// Modern palette matching the app theme
const COLORS = {
  [RejectionReason.NO_MONEY]: '#f59e0b', // Amber
  [RejectionReason.NO_CREDIT]: '#ec4899', // Pink
  [RejectionReason.NOT_INTERESTED]: '#6366f1', // Indigo
  [RejectionReason.OTHER]: '#94a3b8', // Slate
};

const CHART_COLORS = Object.values(COLORS);

export const Dashboard: React.FC<DashboardProps> = ({ calls, onManualReport, onReset, isSending }) => {
  const today = new Date().toISOString().split('T')[0];
  
  const stats = useMemo(() => {
    const todaysCalls = calls.filter(c => c.dateStr === today);
    return statsService.calculateDailyStats(todaysCalls, today);
  }, [calls, today]);

  const pieData = [
    { name: 'No Money', label: 'אין כסף', value: stats.rejectionCounts[RejectionReason.NO_MONEY] || 0, fill: COLORS[RejectionReason.NO_MONEY] },
    { name: 'No Credit', label: 'אין אשראי', value: stats.rejectionCounts[RejectionReason.NO_CREDIT] || 0, fill: COLORS[RejectionReason.NO_CREDIT] },
    { name: 'Not Interested', label: 'לא מעוניין', value: stats.rejectionCounts[RejectionReason.NOT_INTERESTED] || 0, fill: COLORS[RejectionReason.NOT_INTERESTED] },
    { name: 'Other', label: 'אחר', value: stats.rejectionCounts[RejectionReason.OTHER] || 0, fill: COLORS[RejectionReason.OTHER] },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-slide-up pb-safe-nav">
      
      {/* Date Header */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-2xl font-bold text-slate-800">סיכום יומי</h2>
        <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-slate-500 border border-slate-200">
          {today}
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
          <div className="flex items-center gap-2 opacity-80 mb-2">
            <Phone size={18} />
            <span className="text-xs font-medium">סה"כ שיחות</span>
          </div>
          <div className="text-4xl font-bold tracking-tight">{stats.totalCalls}</div>
          <div className="mt-2 text-xs bg-white/20 inline-block px-2 py-0.5 rounded-lg backdrop-blur-sm">
             {stats.totalSales} סגירות
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-100 border border-slate-100">
          <div className="flex items-center gap-2 text-emerald-600 mb-2">
            <TrendingUp size={18} />
            <span className="text-xs font-bold uppercase">אחוז המרה</span>
          </div>
          <div className="text-4xl font-bold text-slate-800 tracking-tight">{stats.conversionRate}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-100 border border-slate-100">
           <div className="flex items-center gap-2 text-rose-500 mb-2">
            <XOctagon size={18} />
            <span className="text-xs font-bold uppercase">לא נסגרו</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.failedTotal}</div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-100 border border-slate-100">
           <div className="flex items-center gap-2 text-amber-500 mb-2">
            <AlertCircle size={18} />
            <span className="text-xs font-bold uppercase">התנגדות מובילה</span>
          </div>
          <div className="text-lg font-bold text-slate-800 leading-tight">
            {stats.topRejectionReason === 'N/A' ? '-' : stats.topRejectionReason}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <Card title="התפלגות התנגדויות" className="min-h-[340px]">
        {pieData.length > 0 ? (
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value: number, name: string, props: any) => [value, props.payload.label]} 
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value, entry: any) => <span className="text-xs text-slate-600 mr-1">{entry.payload.label}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
              <span className="text-2xl font-bold text-slate-300 opacity-50">{stats.failedTotal}</span>
            </div>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <PieChart size={48} className="mb-3 opacity-20" />
            <p className="font-medium">טרם נרשמו נתוני דחייה היום</p>
          </div>
        )}
      </Card>

      {/* Actions */}
      <Card title="פעולות ניהול" className="pb-4">
         <div className="flex flex-col gap-3">
           <button
             onClick={onManualReport}
             disabled={isSending}
             className="flex items-center justify-center gap-3 w-full bg-slate-800 text-white py-3.5 rounded-xl font-medium hover:bg-slate-900 transition-all disabled:opacity-70 shadow-lg shadow-slate-200"
           >
             <Send size={18} />
             {isSending ? 'מעבד נתונים...' : 'שלח דוח יומי עכשיו'}
           </button>

           <button
             onClick={onReset}
             className="flex items-center justify-center gap-3 w-full bg-white text-rose-600 py-3.5 rounded-xl font-medium hover:bg-rose-50 transition-colors border border-rose-100"
           >
             <RefreshCw size={18} />
             איפוס נתונים (מחיקה מקומית)
           </button>
         </div>
      </Card>
    </div>
  );
};