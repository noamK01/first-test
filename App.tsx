import React, { useEffect, useState } from 'react';
import { Phone, BarChart2, Settings as SettingsIcon } from 'lucide-react';
import { ReportForm } from './components/ReportForm';
import { Dashboard } from './components/Dashboard';
import { Settings } from './components/Settings';
import { storageService } from './services/storageService';
import { statsService } from './services/statsService';
import { integrationService } from './services/integrationService';
import { CallRecord, CallStatus, RejectionReason } from './types';

type Tab = 'report' | 'dashboard' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('report');
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load calls on mount
  useEffect(() => {
    setCalls(storageService.getCalls());
  }, []);

  // Scheduler for Daily Report
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
        
        const success = await integrationService.sendToWebhook(settings.webhookUrl, payload);
        if (success) {
          storageService.setLastReportDate(todayStr);
          alert(`דוח יומי נשלח אוטומטית ל-Make עבור ${todayStr}`);
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkSchedule, 60000);
    // Initial check
    checkSchedule();

    return () => clearInterval(interval);
  }, []);

  const handleSaveCall = async (status: CallStatus, reason?: RejectionReason) => {
    setIsProcessing(true);
    try {
      // 1. Save locally
      const newCall = storageService.saveCall(status, reason);
      setCalls(prev => [...prev, newCall]);

      // 2. Send webhook (Single Call)
      const settings = storageService.getSettings();
      if (settings.webhookUrl) {
        const payload = statsService.createSingleCallPayload(settings, newCall);
        // Fire and forget (don't block UI for webhook unless error critical)
        integrationService.sendToWebhook(settings.webhookUrl, payload).catch(err => console.error(err));
      }
      
      // Optional: Give UI feedback
      // alert('דיווח נשמר בהצלחה'); 
    } catch (error) {
      console.error(error);
      alert('שגיאה בשמירת הדיווח');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualReport = async () => {
    setIsProcessing(true);
    try {
      const settings = storageService.getSettings();
      if (!settings.webhookUrl) {
        alert('נא להגדיר כתובת Webhook בהגדרות');
        return;
      }
      
      const todayStr = new Date().toISOString().split('T')[0];
      const todaysCalls = calls.filter(c => c.dateStr === todayStr);
      const stats = statsService.calculateDailyStats(todaysCalls, todayStr);
      const payload = statsService.createDailyPayload(settings, stats);

      const success = await integrationService.sendToWebhook(settings.webhookUrl, payload);
      if (success) {
        storageService.setLastReportDate(todayStr);
        alert('דוח נשלח בהצלחה');
      } else {
        alert('שגיאה בשליחת הדוח');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetData = () => {
    storageService.clearCallsAndStats();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Top Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10 px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-indigo-700">ניסיון 3</h1>
        <div className="text-xs text-slate-500">v5.1</div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 max-w-2xl mx-auto mt-4">
        {activeTab === 'report' && (
          <ReportForm onSave={handleSaveCall} isSaving={isProcessing} />
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
          <Settings />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-20 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              activeTab === 'report' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Phone size={24} className={activeTab === 'report' ? 'fill-current' : ''} />
            <span className="text-xs mt-1 font-medium">דיווח</span>
          </button>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BarChart2 size={24} className={activeTab === 'dashboard' ? 'fill-current' : ''} />
            <span className="text-xs mt-1 font-medium">לוח בקרה</span>
          </button>


          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
              activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <SettingsIcon size={24} className={activeTab === 'settings' ? 'fill-current' : ''} />
            <span className="text-xs mt-1 font-medium">הגדרות</span>
          </button>
        </div>
      </nav>
      <style>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}

export default App;
