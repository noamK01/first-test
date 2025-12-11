import React, { useEffect, useState } from 'react';
import { Phone, BarChart2, Settings as SettingsIcon, Hexagon } from 'lucide-react';
import { ReportForm } from './components/ReportForm';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { ToastContainer } from './components/ui/Toast';
import { storageService } from './services/storageService';
import { statsService } from './services/statsService';
import { integrationService } from './services/integrationService';
import { CallRecord, CallStatus, RejectionReason, ToastMessage, ToastType } from './types';

type Tab = 'report' | 'dashboard' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('report');
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // --- Toast System ---
  const showToast = (message: string, type: ToastType) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Data Loading ---
  useEffect(() => {
    setCalls(storageService.getCalls());
  }, []);

  // --- Daily Scheduler ---
  useEffect(() => {
    const checkSchedule = async () => {
      const settings = storageService.getSettings();
      if (!settings.webhookUrl || !settings.dailyReportTime) return;

      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const todayStr = now.toISOString().split('T')[0];
      const lastReport = storageService.getLastReportDate();

      // Trigger if time matches AND report hasn't been sent today
      if (currentTime === settings.dailyReportTime && lastReport !== todayStr) {
        console.log("Triggering Auto Daily Report...");
        const todaysCalls = storageService.getCallsByDate(todayStr);
        const stats = statsService.calculateDailyStats(todaysCalls, todayStr);
        const payload = statsService.createDailyPayload(settings, stats);
        
        try {
          const success = await integrationService.sendToWebhook(settings.webhookUrl, payload);
          if (success) {
            storageService.setLastReportDate(todayStr);
            showToast(`דוח יומי אוטומטי נשלח עבור ${todayStr}`, 'success');
          }
        } catch (e) {
          console.error("Auto report failed", e);
        }
      }
    };

    const interval = setInterval(checkSchedule, 60000);
    checkSchedule(); // Initial check
    return () => clearInterval(interval);
  }, []);

  // --- Handlers ---

  const handleSaveCall = async (status: CallStatus, reason?: RejectionReason) => {
    setIsProcessing(true);
    try {
      // 1. Save locally
      const newCall = storageService.saveCall(status, reason);
      setCalls(prev => [...prev, newCall]);

      // 2. Send webhook (Single Call)
      const settings = storageService.getSettings();
      
      // UX: Show success immediately for local save
      showToast(status === 'deal' ? 'כל הכבוד! מכירה נרשמה' : 'דיווח נרשם בהצלחה', 'success');
      
      if (settings.webhookUrl) {
        const payload = statsService.createSingleCallPayload(settings, newCall);
        // Fire and forget webhook
        integrationService.sendToWebhook(settings.webhookUrl, payload).catch(err => {
          console.error("Webhook fail", err);
          // Optional: silently fail or log, don't disturb user flow for background sync
        });
      }
    } catch (error) {
      console.error(error);
      showToast('שגיאה בשמירת הדיווח', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualReport = async () => {
    setIsProcessing(true);
    try {
      const settings = storageService.getSettings();
      if (!settings.webhookUrl) {
        showToast('יש להגדיר כתובת Webhook בהגדרות', 'error');
        setActiveTab('settings');
        return;
      }
      
      const todayStr = new Date().toISOString().split('T')[0];
      const todaysCalls = calls.filter(c => c.dateStr === todayStr);
      const stats = statsService.calculateDailyStats(todaysCalls, todayStr);
      const payload = statsService.createDailyPayload(settings, stats);

      const success = await integrationService.sendToWebhook(settings.webhookUrl, payload);
      if (success) {
        storageService.setLastReportDate(todayStr);
        showToast('דוח יומי נשלח בהצלחה', 'success');
      } else {
        showToast('שגיאה בשליחת הדוח', 'error');
      }
    } catch (e) {
      showToast('תקלה בלתי צפויה', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetData = () => {
    if (confirm('האם אתה בטוח? כל הנתונים של היום ימחקו.')) {
        storageService.clearCallsAndStats();
        window.location.reload();
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 flex flex-col">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Modern Header */}
      <header className="glass sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-white/50 shadow-sm shrink-0">
        <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
                <Hexagon size={20} fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-700">
                ניסיון 3
            </h1>
        </div>
        <div className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">v5.1</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 max-w-3xl mx-auto mt-2 w-full">
        {activeTab === 'report' && (
          <ReportForm onSave={handleSaveCall} isSaving={isProcessing} showToast={showToast} />
        )}
        {activeTab === 'dashboard' && (
          <Dashboard 
            calls={calls} 
            onManualReport={handleManualReport} 
            onReset={handleResetData}
            isSending={isProcessing}
          />
        )}
        {activeTab === 'settings' && (
          <Settings showToast={showToast} />
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-safe-nav">
        <div className="max-w-md mx-auto px-6 pointer-events-auto">
          <div className="glass-card rounded-2xl flex justify-around items-center h-16 shadow-2xl shadow-slate-200/50 border-t border-white/60 mb-4">
            <button
              onClick={() => setActiveTab('report')}
              className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 group ${
                activeTab === 'report' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'report' ? 'bg-indigo-50 translate-y-[-4px]' : ''}`}>
                 <Phone size={24} className={activeTab === 'report' ? 'fill-current' : ''} strokeWidth={activeTab === 'report' ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold mt-0.5 transition-all ${activeTab === 'report' ? 'text-indigo-600 translate-y-[-2px]' : 'opacity-0 scale-0'}`}>דיווח</span>
            </button>
            
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 group ${
                activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
               <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 translate-y-[-4px]' : ''}`}>
                 <BarChart2 size={24} className={activeTab === 'dashboard' ? 'fill-current' : ''} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-bold mt-0.5 transition-all ${activeTab === 'dashboard' ? 'text-indigo-600 translate-y-[-2px]' : 'opacity-0 scale-0'}`}>לוח בקרה</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`relative flex flex-col items-center justify-center w-full h-full transition-all duration-300 group ${
                activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
               <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-50 translate-y-[-4px]' : ''}`}>
                  <SettingsIcon size={24} className={activeTab === 'settings' ? 'fill-current' : ''} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
               </div>
              <span className={`text-[10px] font-bold mt-0.5 transition-all ${activeTab === 'settings' ? 'text-indigo-600 translate-y-[-2px]' : 'opacity-0 scale-0'}`}>הגדרות</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default App;