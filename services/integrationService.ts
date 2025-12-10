import { AppSettings, WebhookPayload } from '../types';

export const integrationService = {
  async sendToWebhook(url: string, payload: WebhookPayload): Promise<boolean> {
    if (!url || !url.startsWith('http')) {
      console.warn('Invalid Webhook URL');
      return false;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Webhook sending failed:', error);
      return false;
    }
  },

  async sendTest(settings: AppSettings): Promise<boolean> {
    const payload: WebhookPayload = {
      type: 'test',
      agent_name: settings.agentName,
      timestamp: new Date().toISOString()
    };
    return this.sendToWebhook(settings.webhookUrl, payload);
  }
};
