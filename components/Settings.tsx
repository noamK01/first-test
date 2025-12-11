import React, { useState } from 'react';
import { Save, Trash2, Zap, User, Link, Clock, AlertTriangle } from 'lucide-react';
import { AppSettings } from '../types';
import { storageService } from '../services/storageService';
import { integrationService } from '../services/integrationService';
import { Card } from './ui/Card';

interface SettingsProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Settings: React.FC<SettingsProps> = ({ showToast }) => {
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());
  const [isSaved, setIsSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (field: keyof AppSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleSave = () => {
    storageService.saveSettings(settings);
    setIsSaved(true);
    showToast('ההגדרות נשמרו בהצלחה', 'success');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!settings.webhookUrl) {
      showToast('נא להזין כתובת Webhook', 'error');
      return;
    }
    setTestStatus('loading');
    try {
      const success = await integrationService.sendTest(settings);
      if (success) {
        setTestStatus('success');
        showToast('החיבור למערכת תקין', 'success');
      } else {
        setTestStatus('error');
        showToast('שגיאה בחיבור ל-Make', 'error');
      }
    } catch (e) {
      setTestStatus('error');
    }
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  const handleFactoryReset = () => {
    if (confirm('פעולה זו תמחק את כל הנתונים מהאפליקציה לצמיתות. האם להמשיך?')) {
      storageService.factoryReset();
    }
  };

  return (
    <div className="space-y-6 animate-slide-up pb-safe-nav max-w-lg mx-auto">
      
      <Card title="פרופיל וחיבורים">
        <div className="space-y-5">
          <div className="relative group">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <User size={12} /> שם סוכן
            </label>
            <input
              type="text"
              value={settings.agentName}
              onChange={(e) => handleChange('agentName', e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
              placeholder="ישראל ישראלי"
            />
          </div>

          <div className="relative group">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <Link size={12} /> Make.com Webhook URL
            </label>
            <input
              type="url"
              value={settings.webhookUrl}
              onChange={(e) => handleChange('webhookUrl', e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm ltr text-left"
              style={{ direction: 'ltr' }}
              placeholder="https://hook.us1.make.com/..."
            />
          </div>

          <div className="relative group">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
              <Clock size={12} /> שעת דוח יומי אוטומטי
            </label>
            <input
              type="time"
              value={settings.dailyReportTime}
              onChange={(e) => handleChange('dailyReportTime', e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
            />
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
          >
            <Save size={18} />
            {isSaved ? 'נשמר' : 'שמור'}
          </button>
          
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'loading'}
            className={`
              flex-1 py-3.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border
              ${testStatus === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                testStatus === 'error' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}
            `}
          >
            {testStatus === 'loading' ? <Zap size={18} className="animate-pulse" /> : <Zap size={18} />}
            {testStatus === 'loading' ? 'בודק...' : 'בדיקה'}
          </button>
        </div>
      </Card>

      <div className="pt-4">
         <button
            onClick={handleFactoryReset}
            className="w-full py-4 text-rose-500 text-sm font-medium hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all flex items-center justify-center gap-2 group"
          >
            <AlertTriangle size={16} className="group-hover:animate-bounce" />
            איפוס הגדרות יצרן (Factory Reset)
          </button>
      </div>
    </div>
  );
};