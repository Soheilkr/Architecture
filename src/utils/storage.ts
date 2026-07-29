import { TradeRecord, StrategyMode, StrategySettings, GlobalSettings, DailyState } from '../types';
import { DEFAULT_CHANNEL_SETTINGS, DEFAULT_BTB_SETTINGS, DEFAULT_SPIKE_SETTINGS, DEFAULT_GLOBAL_SETTINGS } from '../data/defaultSettings';

export const getTodayString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const loadStrategySettings = (mode: StrategyMode): StrategySettings => {
  try {
    const key = `trading_settings_${mode}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const settings: StrategySettings = JSON.parse(saved);
      if (mode === 'spike' && settings.rules) {
        settings.rules = settings.rules.map(r => (r.toLowerCase().includes('break') ? 'SP.pinbar' : r));
      }
      return settings;
    }
  } catch (e) {
    console.error(`Error loading settings for ${mode}:`, e);
  }
  if (mode === 'btb') return DEFAULT_BTB_SETTINGS;
  if (mode === 'spike') return DEFAULT_SPIKE_SETTINGS;
  return DEFAULT_CHANNEL_SETTINGS;
};

export const saveStrategySettings = (mode: StrategyMode, settings: StrategySettings): void => {
  try {
    localStorage.setItem(`trading_settings_${mode}`, JSON.stringify(settings));
  } catch (e) {
    console.error(`Error saving settings for ${mode}:`, e);
  }
};

export const loadGlobalSettings = (): GlobalSettings => {
  try {
    const saved = localStorage.getItem('trading_global_settings');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error loading global settings:', e);
  }
  return DEFAULT_GLOBAL_SETTINGS;
};

export const saveGlobalSettings = (settings: GlobalSettings): void => {
  try {
    localStorage.setItem('trading_global_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving global settings:', e);
  }
};

export const loadTradeHistory = (mode?: StrategyMode): TradeRecord[] => {
  try {
    if (mode) {
      const saved = localStorage.getItem(`trading_history_${mode}`);
      if (saved) return JSON.parse(saved);
      return [];
    }
    // Aggregate from all modes
    const channelTrades: TradeRecord[] = JSON.parse(localStorage.getItem('trading_history_channel') || '[]');
    const btbTrades: TradeRecord[] = JSON.parse(localStorage.getItem('trading_history_btb') || '[]');
    const spikeTrades: TradeRecord[] = JSON.parse(localStorage.getItem('trading_history_spike') || '[]');
    return [...channelTrades, ...btbTrades, ...spikeTrades].sort((a, b) => b.timestamp - a.timestamp);
  } catch (e) {
    console.error('Error loading trade history:', e);
    return [];
  }
};

export const saveTradeRecord = (trade: TradeRecord): void => {
  try {
    const key = `trading_history_${trade.strategy}`;
    const existing: TradeRecord[] = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = [trade, ...existing.filter(t => t.id !== trade.id)];
    localStorage.setItem(key, JSON.stringify(updated));

    // Also update daily state
    const today = getTodayString();
    const dailyKey = `trading_daily_state_${trade.strategy}`;
    const settings = loadStrategySettings(trade.strategy);
    let dailyState: DailyState = JSON.parse(localStorage.getItem(dailyKey) || JSON.stringify({
      date: today,
      trades: [],
      maxTrades: settings.maxTradesPerDay,
      maxLosses: settings.maxLossesPerDay
    }));

    if (dailyState.date !== today) {
      dailyState = {
        date: today,
        trades: [],
        maxTrades: settings.maxTradesPerDay,
        maxLosses: settings.maxLossesPerDay
      };
    }

    const existingDailyIdx = dailyState.trades.findIndex(t => t.id === trade.id);
    if (existingDailyIdx >= 0) {
      dailyState.trades[existingDailyIdx] = trade;
    } else {
      dailyState.trades.push(trade);
    }

    localStorage.setItem(dailyKey, JSON.stringify(dailyState));
  } catch (e) {
    console.error('Error saving trade record:', e);
  }
};

export const deleteTradeRecord = (id: string, strategy: StrategyMode): void => {
  try {
    const key = `trading_history_${strategy}`;
    const existing: TradeRecord[] = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = existing.filter(t => t.id !== id);
    localStorage.setItem(key, JSON.stringify(updated));

    // Update daily state
    const dailyKey = `trading_daily_state_${strategy}`;
    const dailySaved = localStorage.getItem(dailyKey);
    if (dailySaved) {
      const dailyState: DailyState = JSON.parse(dailySaved);
      dailyState.trades = dailyState.trades.filter(t => t.id !== id);
      localStorage.setItem(dailyKey, JSON.stringify(dailyState));
    }
  } catch (e) {
    console.error('Error deleting trade record:', e);
  }
};

export const exportTradesToCSV = (trades: TradeRecord[], filename = 'Soheil_Trading_Archive.csv'): void => {
  if (!trades || trades.length === 0) {
    alert('هیچ معامله‌ای جهت خروجی یافت نشد.');
    return;
  }

  const headers = ['شناسه', 'تاریخ', 'زمان', 'نماد', 'استراتژی', 'جهت', 'نتیجه', 'قیمت ورود', 'قیمت خروج', 'سود/زیان', 'واترمارک', 'توضیحات'];
  const rows = trades.map(t => [
    t.id,
    t.date,
    t.time,
    `"${String(t.symbol || '').replace(/"/g, '""')}"`,
    t.strategy.toUpperCase(),
    t.direction,
    t.result,
    `"${String(t.entryPrice ?? '').replace(/"/g, '""')}"`,
    `"${String(t.exitPrice ?? '').replace(/"/g, '""')}"`,
    `"${String(t.pnl ?? '').replace(/"/g, '""')}"`,
    `"${String(t.watermark || '@Soheil_Keshtkar').replace(/"/g, '""')}"`,
    `"${String(t.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportFullBackupJSON = (): void => {
  const backup = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    globalSettings: loadGlobalSettings(),
    settings: {
      channel: loadStrategySettings('channel'),
      btb: loadStrategySettings('btb'),
      spike: loadStrategySettings('spike')
    },
    history: {
      channel: loadTradeHistory('channel'),
      btb: loadTradeHistory('btb'),
      spike: loadTradeHistory('spike')
    }
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `Trading_Desk_Backup_${getTodayString()}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importFullBackupJSON = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString);
    if (data.globalSettings) saveGlobalSettings(data.globalSettings);
    if (data.settings) {
      if (data.settings.channel) saveStrategySettings('channel', data.settings.channel);
      if (data.settings.btb) saveStrategySettings('btb', data.settings.btb);
      if (data.settings.spike) saveStrategySettings('spike', data.settings.spike);
    }
    if (data.history) {
      if (data.history.channel) localStorage.setItem('trading_history_channel', JSON.stringify(data.history.channel));
      if (data.history.btb) localStorage.setItem('trading_history_btb', JSON.stringify(data.history.btb));
      if (data.history.spike) localStorage.setItem('trading_history_spike', JSON.stringify(data.history.spike));
    }
    return true;
  } catch (e) {
    console.error('Error importing backup JSON:', e);
    return false;
  }
};
