import React from 'react';
import { StrategyMode, ViewMode } from '../types';
import { 
  TrendingUp, 
  Zap, 
  Crosshair, 
  Home, 
  BookOpen, 
  BarChart2, 
  FileSpreadsheet, 
  Settings, 
  Clock,
  Camera
} from 'lucide-react';

interface HeaderProps {
  currentStrategy: StrategyMode;
  setCurrentStrategy: (mode: StrategyMode) => void;
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  todayTradeCount: number;
  maxDailyTrades: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentStrategy,
  setCurrentStrategy,
  activeView,
  setActiveView,
  todayTradeCount,
  maxDailyTrades
}) => {
  const getStrategyBadge = () => {
    switch (currentStrategy) {
      case 'btb':
        return { label: 'BTB Strategy (Breakout)', color: 'bg-indigo-950/80 text-indigo-400 border-indigo-500/30' };
      case 'spike':
        return { label: 'Spike Mode (Momentum)', color: 'bg-amber-950/80 text-amber-400 border-amber-500/30' };
      default:
        return { label: 'Channel Mode (Trend)', color: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30' };
    }
  };

  const badge = getStrategyBadge();

  return (
    <header className="bg-slate-950/90 border-b border-slate-850 backdrop-blur-md sticky top-0 z-40 px-4 py-3 shadow-2xl" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Strategy Info */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-600 via-red-600 to-amber-500 p-2.5 rounded-2xl shadow-lg shadow-indigo-950/50">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
                Trading Desk
              </h1>
              <span className="text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                سهیل کشتکار
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>مدیریت هوشمند معاملات و انضباط معامله‌گری</span>
            </p>
          </div>
        </div>

        {/* Strategy Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs shadow-inner">
          <button
            onClick={() => setCurrentStrategy('channel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              currentStrategy === 'channel'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>کانال</span>
          </button>

          <button
            onClick={() => setCurrentStrategy('btb')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              currentStrategy === 'btb'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>BTB</span>
          </button>

          <button
            onClick={() => setCurrentStrategy('spike')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              currentStrategy === 'spike'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>اسپایک</span>
          </button>
        </div>

        {/* Navigation Tabs & Session Stats */}
        <div className="flex flex-wrap items-center gap-2">
          
          <div className={`hidden lg:flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs font-mono font-bold ${badge.color}`}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            <span>{badge.label}</span>
            <span className="border-r border-current/30 pr-2 mr-1">
              معاملات امروز: {todayTradeCount} / {maxDailyTrades}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveView('welcome')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                activeView === 'welcome' ? 'bg-slate-800 text-slate-100 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="صفحه اصلی (Welcome)"
            >
              <Home className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveView('rules')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeView === 'rules' ? 'bg-slate-800 text-amber-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">قوانین</span>
            </button>

            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeView === 'dashboard' ? 'bg-slate-800 text-indigo-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">داشبورد</span>
            </button>

            <button
              onClick={() => setActiveView('archive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeView === 'archive' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>آرشیو</span>
            </button>

            <button
              onClick={() => setActiveView('documenter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeView === 'documenter' ? 'bg-slate-800 text-sky-400 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="اسکرین‌شات و گزارش‌ساز"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">گزارش‌ساز</span>
            </button>

            <button
              onClick={() => setActiveView('system-settings')}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                activeView === 'system-settings' ? 'bg-slate-800 text-slate-100 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="تنظیمات سیستم"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
