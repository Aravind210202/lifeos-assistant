/**
 * Google Sheets Live Sync Utility
 * Manages webhook-based synchronization of transactions to Google Sheets
 * One-way sync: LifeOS → Google Sheets
 */

export interface SheetsSyncConfig {
  webhookUrl: string;
  enabled: boolean;
}

/**
 * Load sync configuration from localStorage
 */
export function loadSheetsConfig(): SheetsSyncConfig {
  const stored = localStorage.getItem('lifeos_sheets_config');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { webhookUrl: '', enabled: false };
    }
  }
  return { webhookUrl: '', enabled: false };
}

/**
 * Save sync configuration to localStorage
 */
export function saveSheetsConfig(config: SheetsSyncConfig): void {
  localStorage.setItem('lifeos_sheets_config', JSON.stringify(config));
}

/**
 * Validate webhook URL format
 */
export function isValidWebhookUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Sync a new transaction to Google Sheets
 */
export async function syncAddTransaction(
  transaction: {
    id: string;
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    date: string;
  },
  webhookUrl?: string
): Promise<boolean> {
  const config = loadSheetsConfig();
  const url = webhookUrl || config.webhookUrl;

  if (!url || !config.enabled) {
    return false;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'ADD_TRANSACTION',
        transaction: {
          ...transaction,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to sync transaction to Google Sheets:', error);
    return false;
  }
}

/**
 * Sync transaction update to Google Sheets
 */
export async function syncUpdateTransaction(
  transaction: {
    id: string;
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    date: string;
  },
  webhookUrl?: string
): Promise<boolean> {
  const config = loadSheetsConfig();
  const url = webhookUrl || config.webhookUrl;

  if (!url || !config.enabled) {
    return false;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'UPDATE_TRANSACTION',
        transaction: {
          ...transaction,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to sync transaction update to Google Sheets:', error);
    return false;
  }
}

/**
 * Sync transaction deletion to Google Sheets
 */
export async function syncDeleteTransaction(
  transactionId: string,
  webhookUrl?: string
): Promise<boolean> {
  const config = loadSheetsConfig();
  const url = webhookUrl || config.webhookUrl;

  if (!url || !config.enabled) {
    return false;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'DELETE_TRANSACTION',
        transactionId,
        timestamp: new Date().toISOString(),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to sync transaction deletion to Google Sheets:', error);
    return false;
  }
}

/**
 * Sync all transactions to Google Sheets (bulk operation)
 */
export async function syncAllTransactions(
  transactions: Array<{
    id: string;
    description: string;
    amount: number;
    category: string;
    type: 'income' | 'expense';
    date: string;
  }>,
  webhookUrl?: string
): Promise<boolean> {
  const config = loadSheetsConfig();
  const url = webhookUrl || config.webhookUrl;

  if (!url || !config.enabled) {
    return false;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'SYNC_ALL_TRANSACTIONS',
        transactions,
        timestamp: new Date().toISOString(),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to sync all transactions to Google Sheets:', error);
    return false;
  }
}

/**
 * Test webhook connectivity
 */
export async function testWebhookConnection(webhookUrl: string): Promise<boolean> {
  if (!isValidWebhookUrl(webhookUrl)) {
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'TEST',
        timestamp: new Date().toISOString(),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Webhook connection test failed:', error);
    return false;
  }
}
