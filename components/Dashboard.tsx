import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Send, RefreshCw, AlertCircle } from 'lucide-react';
import { CallRecord, RejectionReason } from '../types';
import { statsService } from '../services/statsService';
import { Card } from './ui/Card';

interface DashboardProps {
  calls: CallRecord[];
  onManualReport: () => void;
  onReset: () => void;
  isSending: boolean;
}

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6']; // Tailwind-ish colors

export const Dashboard: React.FC<DashboardProps> = ({ calls, onManualReport, onReset, isSending }) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Memoize stats calculation
  const stats = useMemo(() => {
    // We filter calls by today's date for the dashboard to show daily progress
    const todaysCalls = calls.filter(c => c.dateStr === today);
    return statsService.calculateDailyStats(todaysCalls, today);
  }, [calls, today]);

  // Data for Pie Chart
  const pieData = [
    { name: 'No Money', value: stats.rejectionCounts[RejectionReason.NO_MONEY] || 0 },
    { name: 'No Credit', value: stats.rejectionCounts[RejectionReason.NO_CREDIT] || 0 },
    { name: 'Not Interested', value: stats.rejectionCounts[RejectionReason.NOT_INTERESTED] || 0 },
    { name: 'Other', value: stats.rejectionCounts[RejectionReason.OTHER] || 0 },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <span className="text-3xl font-bold">{stats.totalCalls}</span>
          <span className="text-sm opacity-90">סה"כ שיחות</span>
        </Card>
        <Card className="flex flex-col items-center justify-center p-4 bg-white text-emerald-600">
          <span className="text-3xl font-bold">{stats.conversionRate}</span>
          <span className="text-sm text-slate-500">המרה</span>
        </Card>
        <Card className="flex flex-col items-center justify-center p-4 bg-white text-rose-600">
          <span className="text-3xl font-bold">{stats.failedTotal}</span>
          <span className="text-sm text-slate-500">לא נסגרו</span>
        </Card>
        <Card className="flex flex-col items-center justify-center p-4 bg-white text-amber-600">
          <span className="text-lg font-bold text-center break-words w-full leading-tight">
             {stats.topRejectionReason === 'N/A' ? '-' : stats.topRejectionReason}
          </span>
          <span className="text-xs text-slate-500 mt-1">סיבה מובילה</span>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="התפלגות סיבות דחייה" className="min-h-[300px] flex flex-col">
          {pieData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, 'כמות']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <AlertCircle size={48} className="mb-2 opacity-50" />
              <p>אין נתונים להציג היום</p>
            </div>
          )}
        </Card>

        {/* Actions */}
        <Card title="פעולות מהירות" className="flex flex-col gap-4 justify-center">
           <p className="text-sm text-slate-500 mb-2">
             הדוח היומי נשלח אוטומטית. השתמש בלחצנים אלה רק במידת הצורך.
           </p>
           
           <button
             onClick={onManualReport}
             disabled={isSending}
             className="flex items-center justify-center gap-2 w-full bg-slate-800 text-white py-3 rounded-xl hover:bg-slate-900 transition-colors disabled:opacity-50"
           >
             <Send size={18} />
             {isSending ? 'שולח...' : 'שלח דוח יומי ידני'}
           </button>

           <div className="h-px bg-slate-100 my-2"></div>

           <button
             onClick={() => {
               if (window.confirm('האם אתה בטוח שברצונך למחוק את נתוני השיחות וליצור טעינה מחדש?')) {
                 onReset();
               }
             }}
             className="flex items-center justify-center gap-2 w-full bg-rose-50 text-rose-600 py-3 rounded-xl hover:bg-rose-100 transition-colors border border-rose-200"
           >
             <RefreshCw size={18} />
             איפוס נתונים וטעינה מחדש
           </button>
        </Card>
      </div>
    </div>
  );
};
