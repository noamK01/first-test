import React, { useState } from 'react';
import { Check, X, Save, Loader2, DollarSign, CreditCard, UserX, HelpCircle, ArrowRight } from 'lucide-react';
import { Card } from './ui/Card';
import { CallStatus, RejectionReason } from '../types';

interface ReportFormProps {
  onSave: (status: CallStatus, reason?: RejectionReason) => Promise<void>;
  isSaving: boolean;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSave, isSaving, showToast }) => {
  const [status, setStatus] = useState<CallStatus | null>(null);
  const [reason, setReason] = useState<RejectionReason | null>(null);

  const handleSubmit = async () => {
    if (!status) return;
    if (status === 'no-deal' && !reason) {
      showToast('נא לבחור סיבת דחייה', 'error');
      return;
    }
    
    await onSave(status, reason || undefined);
    setStatus(null);
    setReason(null);
  };

  const rejectionOptions = [
    { label: 'אין לי כסף', sub: 'No Money', value: RejectionReason.NO_MONEY, icon: <DollarSign size={20} /> },
    { label: 'אין אשראי', sub: 'No Credit', value: RejectionReason.NO_CREDIT, icon: <CreditCard size={20} /> },
    { label: 'לא מעוניין', sub: 'Not Interested', value: RejectionReason.NOT_INTERESTED, icon: <UserX size={20} /> },
    { label: 'אחר', sub: 'Other', value: RejectionReason.OTHER, icon: <HelpCircle size={20} /> },
  ];

  return (
    <div className="space-y-6 animate-slide-up pb-32 max-w-lg mx-auto relative">
      
      {/* Main Status Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => { setStatus('deal'); setReason(null); }}
          className={`
            group relative overflow-hidden rounded-3xl p-4 h-44 flex flex-col items-center justify-center gap-3 transition-all duration-300
            ${status === 'deal' 
              ? 'ring-4 ring-emerald-400 ring-offset-2 scale-[0.98]' 
              : 'hover:scale-[1.02] hover:shadow-xl shadow-lg'}
          `}
        >
          {/* Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 transition-opacity duration-300 ${status === 'deal' ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'}`} />
          
          <div className="relative z-10 bg-white/20 p-3 rounded-full backdrop-blur-sm text-white">
            <Check size={32} strokeWidth={3} />
          </div>
          <div className="relative z-10 text-center text-white">
            <span className="block text-xl font-bold">סגירה</span>
            <span className="text-xs opacity-90 font-medium tracking-wide">Deal Closed</span>
          </div>
        </button>

        <button
          onClick={() => setStatus('no-deal')}
          className={`
            group relative overflow-hidden rounded-3xl p-4 h-44 flex flex-col items-center justify-center gap-3 transition-all duration-300
            ${status === 'no-deal' 
              ? 'ring-4 ring-rose-400 ring-offset-2 scale-[0.98]' 
              : 'hover:scale-[1.02] hover:shadow-xl shadow-lg'}
          `}
        >
          {/* Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br from-rose-500 to-red-600 transition-opacity duration-300 ${status === 'no-deal' ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'}`} />
          
          <div className="relative z-10 bg-white/20 p-3 rounded-full backdrop-blur-sm text-white">
            <X size={32} strokeWidth={3} />
          </div>
          <div className="relative z-10 text-center text-white">
            <span className="block text-xl font-bold">לא נסגר</span>
            <span className="text-xs opacity-90 font-medium tracking-wide">No Deal</span>
          </div>
        </button>
      </div>

      {/* Rejection Reasons Section */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${status === 'no-deal' ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <Card title="מדוע העסקה לא נסגרה?" className="bg-rose-50/60 border-rose-100">
          <div className="grid grid-cols-2 gap-3">
            {rejectionOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setReason(opt.value)}
                className={`
                  flex flex-col items-center p-3 rounded-xl transition-all duration-200 border relative
                  ${reason === opt.value
                    ? 'bg-white border-rose-500 text-rose-600 shadow-md ring-1 ring-rose-500 scale-[1.02]'
                    : 'bg-white/80 border-transparent text-slate-600 hover:bg-white hover:shadow-sm'}
                `}
              >
                <div className={`mb-2 p-2 rounded-full transition-colors ${reason === opt.value ? 'bg-rose-100' : 'bg-slate-100'}`}>
                  {opt.icon}
                </div>
                <span className="font-bold text-sm">{opt.label}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-60 mt-0.5">{opt.sub}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Submit Button - Fixed at bottom but above nav */}
      <div className={`
        fixed left-0 right-0 p-4 transition-all duration-300 z-30
        bottom-[calc(4rem+var(--safe-bottom))] 
      `}>
        <div className="max-w-2xl mx-auto">
          <button
            disabled={!status || (status === 'no-deal' && !reason) || isSaving}
            onClick={handleSubmit}
            className={`
              w-full py-4 rounded-2xl text-xl font-bold text-white flex items-center justify-center gap-3 shadow-xl transition-all duration-300 backdrop-blur-md
              ${!status || (status === 'no-deal' && !reason)
                ? 'translate-y-20 opacity-0 pointer-events-none' // Hide completely when not ready
                : isSaving
                ? 'bg-indigo-500/90 cursor-wait'
                : 'bg-indigo-600/95 hover:bg-indigo-700 hover:scale-[1.02] hover:shadow-2xl shadow-indigo-500/20'}
            `}
          >
            {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
            <span>{isSaving ? 'שומר דיווח...' : 'שמור דיווח'}</span>
            {!isSaving && <ArrowRight size={24} className="opacity-50" />}
          </button>
        </div>
      </div>
    </div>
  );
};