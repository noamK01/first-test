import React, { useState, useEffect } from 'react';
import { Save, Trash2, Zap } from 'lucide-react';
import { AppSettings } from '../types';
import { storageService } from '../services/storageService';
import { integrationService } from '../services/integrationService';
import { Card } from './ui/Card';

export const Settings: React.FC = () => {
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
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    setTestStatus('loading');
    const success = await integrationService.sendTest(settings);
    setTestStatus(success ? 'success' : 'error');
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  const handleFactoryReset = () => {
    if (confirm('אזהרה חמורה: פעולה זו תמחק את כל ההגדרות וכל היסטוריית השיחות. האם להמשיך?')) {
      storageService.factoryReset();
    }
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto animate-fade-in pb-20">
      <Card title="הגדרות סוכן">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">שם סוכן (Agent Name)</label>
            <input
              type="text"
              value={settings.agentName}
              onChange={(e) => handleChange('agentName', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Israel Israeli"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Make.com Webhook URL</label>
            <input
              type="url"
              value={settings.webhookUrl}
              onChange={(e) => handleChange('webhookUrl', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none ltr"
              style={{ direction: 'ltr' }}
              placeholder="https://hook.us1.make.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">זמן דוח יומי (Daily Report Time)</label>
            <input
              type="time"
              value={settings.dailyReportTime}
              onChange={(e) => handleChange('dailyReportTime', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <Save size={20} />
            {isSaved ? 'נשמר!' : 'שמור הגדרות'}
          </button>
          
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'loading' || !settings.webhookUrl}
            className={`w-full py-3 border rounded-xl font-medium transition flex items-center justify-center gap-2 ${
                testStatus === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                testStatus === 'error' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Zap size={20} />
            {testStatus === 'loading' ? 'בודק...' : 
             testStatus === 'success' ? 'חיבור תקין!' : 
             testStatus === 'error' ? 'שגיאה בחיבור' : 'בדוק חיבור'}
          </button>
        </div>
      </Card>

      <div className="pt-8">
         <button
            onClick={handleFactoryReset}
            className="w-full py-3 text-rose-500 text-sm font-medium hover:text-rose-700 transition flex items-center justify-center gap-2 opacity-70 hover:opacity-100"
          >
            <Trash2 size={16} />
            איפוס הגדרות יצרן (Factory Reset)
          </button>
      </div>
    </div>
  );
};
