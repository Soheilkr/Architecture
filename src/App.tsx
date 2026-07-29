import React, { useState, useEffect } from 'react';
import { StrategyMode, ViewMode, TradeRecord, StrategySettings, GlobalSettings } from './types';
import { Header } from './components/Header';
import { WelcomeView } from './components/WelcomeView';
import { RulesView } from './components/RulesView';
import { DashboardView } from './components/DashboardView';
import { PreTradeView } from './components/PreTradeView';
import { PostTradeView } from './components/PostTradeView';
import { ArchiveView } from './components/ArchiveView';
import { SystemSettingsView } from './components/SystemSettingsView';
import { DocumenterView } from './components/DocumenterView';
import { 
  loadStrategySettings, 
  saveStrategySettings, 
  loadGlobalSettings, 
  saveGlobalSettings, 
  loadTradeHistory,
  getTodayString 
} from './utils/storage';
import { WifiOff, AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentStrategy, setCurrentStrategy] = useState<StrategyMode>('channel');
  const [activeView, setActiveView] = useState<ViewMode>('welcome');
  
  // Settings & Storage State
  const [strategySettings, setStrategySettings] = useState<StrategySettings>(() => loadStrategySettings(currentStrategy));
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(() => loadGlobalSettings());
  const [tradeHistory, setTradeHistory] = useState<TradeRecord[]>(() => loadTradeHistory());

  // Offline Status
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Pre-Trade Session Data Transfer
  const [preTradeData, setPreTradeData] = useState<{
    symbol: string;
    direction: 'LONG' | 'SHORT';
    entryPrice: string;
    rulesChecked: string[];
  } | undefined>(undefined);

  // Reload Strategy Settings on Strategy Change
  useEffect(() => {
    setStrategySettings(loadStrategySettings(currentStrategy));
  }, [currentStrategy]);

  // Offline Listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefreshTrades = () => {
    setTradeHistory(loadTradeHistory());
  };

  const handleSaveStrategySettings = (mode: StrategyMode, settings: StrategySettings) => {
    saveStrategySettings(mode, settings);
    if (mode === currentStrategy) {
      setStrategySettings(settings);
    }
  };

  const handleSaveGlobalSettings = (settings: GlobalSettings) => {
    saveGlobalSettings(settings);
    setGlobalSettings(settings);
  };

  // Filter Today Trades
  const todayStr = getTodayString();
  const todayTrades = tradeHistory.filter(t => t.date === todayStr && t.strategy === currentStrategy);
  const channelTodayTrades = tradeHistory.filter(t => t.date === todayStr && t.strategy === 'channel');
  const btbTodayTrades = tradeHistory.filter(t => t.date === todayStr && t.strategy === 'btb');
  const spikeTodayTrades = tradeHistory.filter(t => t.date === todayStr && t.strategy === 'spike');

  const channelSettings = loadStrategySettings('channel');
  const btbSettings = loadStrategySettings('btb');
  const spikeSettings = loadStrategySettings('spike');

  return (
    <div className="min-h-screen bg-[#070b13] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 overflow-x-hidden" dir="rtl">
      
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-rose-600 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 shadow-lg z-50">
          <WifiOff className="w-4 h-4" />
          <span>شما آفلاین هستید. تمامی اطلاعات و معاملات شما به صورت محلی (Local) ذخیره می‌شوند.</span>
        </div>
      )}

      {/* Main Header */}
      <Header
        currentStrategy={currentStrategy}
        setCurrentStrategy={setCurrentStrategy}
        activeView={activeView}
        setActiveView={setActiveView}
        todayTradeCount={todayTrades.length}
        maxDailyTrades={strategySettings.maxTradesPerDay}
      />

      {/* View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        
        {activeView === 'welcome' && (
          <WelcomeView
            currentStrategy={currentStrategy}
            setCurrentStrategy={setCurrentStrategy}
            setActiveView={setActiveView}
            channelTrades={channelTodayTrades}
            btbTrades={btbTodayTrades}
            spikeTrades={spikeTodayTrades}
            maxChannelTrades={channelSettings.maxTradesPerDay}
            maxBtbTrades={btbSettings.maxTradesPerDay}
            maxSpikeTrades={spikeSettings.maxTradesPerDay}
          />
        )}

        {activeView === 'rules' && (
          <RulesView
            currentStrategy={currentStrategy}
            settings={strategySettings}
            onProceedToTrade={() => setActiveView('pre-trade')}
          />
        )}

        {activeView === 'dashboard' && (
          <DashboardView
            allTrades={tradeHistory}
            currentStrategy={currentStrategy}
          />
        )}

        {activeView === 'pre-trade-warning' && (
          <div className="max-w-xl mx-auto py-8 space-y-6 text-center" dir="rtl">
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-8 space-y-4 shadow-2xl">
              <div className="bg-amber-950/80 text-amber-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-100">تعهدنامه ورود به جلسه معامله جدید</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                آیا قبل از شروع معامله از آمادگی روانی کامل، عدم خستگی و پایبندی به قوانین حد زیان اطمینان دارید؟
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setActiveView('welcome')}
                  className="flex-1 bg-slate-950 text-slate-400 text-xs font-bold py-3 rounded-2xl border border-slate-800"
                >
                  انصراف
                </button>
                <button
                  onClick={() => setActiveView('pre-trade')}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black py-3 rounded-2xl shadow-lg shadow-indigo-950/50"
                >
                  تایید و شروع معامله
                </button>
              </div>
            </div>
          </div>
        )}

        {activeView === 'pre-trade' && (
          <PreTradeView
            currentStrategy={currentStrategy}
            settings={strategySettings}
            setActiveView={setActiveView}
            onConfirmPreTrade={(data) => setPreTradeData(data)}
          />
        )}

        {activeView === 'post-trade' && (
          <PostTradeView
            currentStrategy={currentStrategy}
            preTradeData={preTradeData}
            setActiveView={(view) => {
              handleRefreshTrades();
              setActiveView(view);
            }}
            watermarkTag={globalSettings.watermarkText}
          />
        )}

        {activeView === 'archive' && (
          <ArchiveView
            trades={tradeHistory}
            onRefreshTrades={handleRefreshTrades}
            globalSettings={globalSettings}
            onSaveGlobalSettings={handleSaveGlobalSettings}
          />
        )}

        {activeView === 'system-settings' && (
          <SystemSettingsView
            currentStrategy={currentStrategy}
            strategySettings={strategySettings}
            onSaveStrategySettings={handleSaveStrategySettings}
            globalSettings={globalSettings}
            onSaveGlobalSettings={handleSaveGlobalSettings}
            onRefreshData={handleRefreshTrades}
          />
        )}

        {activeView === 'documenter' && (
          <DocumenterView
            trades={tradeHistory}
            watermarkTag={globalSettings.watermarkText}
            screenshotFolder={globalSettings.screenshotFolder}
            onRefreshTrades={handleRefreshTrades}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-4 px-6 text-center text-[11px] text-slate-500 font-mono">
        Trading Desk Engine & Journal • Designed & Developed by Soheil Keshtkar
      </footer>

    </div>
  );
}
