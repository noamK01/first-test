import React, { useState } from 'react';
import { CheckCircle, XCircle, Save, Loader2 } from 'lucide-react';
import { Card } from './ui/Card';
import { CallStatus, RejectionReason } from '../types';

interface ReportFormProps {
  onSave: (status: CallStatus, reason?: RejectionReason) => Promise<void>;
  isSaving: boolean;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSave, isSaving }) => {
  const [status, setStatus] = useState<CallStatus | null>(null);
  const [reason, setReason] = useState<RejectionReason | null>(null);

  const handleSubmit = () => {
    if (!status) return;
    if (status === 'no-deal' && !reason) return;
    onSave(status, reason || undefined);
    // Reset form after save trigger (actual processing happens in parent)
    setStatus(null);
    setReason(null);
  };

  const rejectionOptions = [
    { label: 'אין לי כסף (No Money)', value: RejectionReason.NO_MONEY },
    { label: 'אין אשראי (No Credit)', value: RejectionReason.NO_CREDIT },
    { label: 'לא מעוניין (Not Interested)', value: RejectionReason.NOT_INTERESTED },
    { label: 'אחר (Other)', value: RejectionReason.OTHER },
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto animate-fade-in pb-20">
      <div className="grid grid-cols-2 gap-4 h-40">
        <button
          onClick={() => { setStatus('deal'); setReason(null); }}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-4 transition-all duration-300 ${
            status === 'deal'
              ? 'bg-emerald-100 border-emerald-500 text-emerald-800 shadow-inner scale-95'
              : 'bg-white border-transparent shadow-lg hover:bg-emerald-50 text-slate-600'
          }`}
        >
          <CheckCircle size={48} className={status === 'deal' ? 'text-emerald-600' : 'text-slate-300'} />
          <span className="mt-2 font-bold text-xl">סגירה (Deal)</span>
        </button>

        <button
          onClick={() => setStatus('no-deal')}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-4 transition-all duration-300 ${
            status === 'no-deal'
              ? 'bg-rose-100 border-rose-500 text-rose-800 shadow-inner scale-95'
              : 'bg-white border-transparent shadow-lg hover:bg-rose-50 text-slate-600'
          }`}
        >
          <XCircle size={48} className={status === 'no-deal' ? 'text-rose-600' : 'text-slate-300'} />
          <span className="mt-2 font-bold text-xl">לא נסגר (No Deal)</span>
        </button>
      </div>

      {status === 'no-deal' && (
        <Card className="animate-fade-in bg-rose-50 border border-rose-100">
          <h4 className="text-center font-semibold text-rose-800 mb-4">סיבת דחייה (Reason)</h4>
          <div className="grid grid-cols-1 gap-3">
            {rejectionOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setReason(opt.value)}
                className={`p-3 rounded-xl font-medium transition-all ${
                  reason === opt.value
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-white text-rose-700 hover:bg-rose-200 shadow-sm'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Card>
      )}

      <button
        disabled={!status || (status === 'no-deal' && !reason) || isSaving}
        onClick={handleSubmit}
        className={`w-full py-5 rounded-2xl text-2xl font-bold text-white flex items-center justify-center gap-3 transition-all shadow-xl ${
          !status || (status === 'no-deal' && !reason)
            ? 'bg-slate-300 cursor-not-allowed'
            : isSaving
            ? 'bg-indigo-400 cursor-wait'
            : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02]'
        }`}
      >
        {isSaving ? <Loader2 className="animate-spin" size={32} /> : <Save size={32} />}
        {isSaving ? 'שומר...' : 'שמור דיווח'}
      </button>
    </div>
  );
};
