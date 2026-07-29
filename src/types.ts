export type StrategyMode = 'channel' | 'btb' | 'spike';

export type ViewMode = 
  | 'welcome' 
  | 'rules' 
  | 'dashboard' 
  | 'pre-trade-warning' 
  | 'pre-trade' 
  | 'post-trade' 
  | 'archive' 
  | 'history' 
  | 'settings' 
  | 'system-settings'
  | 'documenter';

export type TradeResult = 'TP' | 'SL' | 'BE';

export interface TradeRecord {
  id: string;
  date: string;
  time: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  result: TradeResult;
  entryPrice: number | string;
  exitPrice: number | string;
  pnl: number | string;
  pnlPercentage?: number | string;
  riskRewardRatio?: number | string;
  strategy: StrategyMode;
  rulesChecked?: string[];
  notes?: string;
  chartImage?: string;
  watermark?: string;
  timestamp: number;
}

export interface DailyState {
  date: string;
  trades: TradeRecord[];
  maxTrades: number;
  maxLosses: number;
  isLocked?: boolean;
}

export interface StrategySettings {
  maxTradesPerDay: number;
  maxLossesPerDay: number;
  targetWinRate: number;
  defaultRiskReward: number;
  rules: string[];
}

export interface GlobalSettings {
  alarmSound: boolean;
  alarmVolume: number;
  watermarkText: string;
  voiceAlerts: boolean;
  screenshotFolder?: string;
  autoScreenshot?: boolean;
  showWinRateWhenDisabled?: boolean;
}

declare global {
  interface Window {
    electronAPI?: {
      isElectron?: boolean;
      selectFolder: () => Promise<string | null>;
      takeScreenshot: (monitorIndex?: number) => Promise<string | { success: boolean; dataUrl?: string; error?: string } | null>;
      saveScreenshot: (dataUrl: string, folderPath?: string, filename?: string) => Promise<string | { success: boolean; filePath?: string; folderPath?: string; error?: string; warning?: string }>;
    };
  }
}

export interface AlarmNotification {
  time: string;
  type: string;
  ignoredAlarm?: string;
}
