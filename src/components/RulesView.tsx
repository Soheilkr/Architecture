import React from 'react';
import { StrategyMode, StrategySettings } from '../types';
import { BookOpen, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';

interface RulesViewProps {
  currentStrategy: StrategyMode;
  settings: StrategySettings;
  onProceedToTrade: () => void;
}

export const RulesView: React.FC<RulesViewProps> = ({
  currentStrategy,
  settings,
  onProceedToTrade
}) => {
  const getStrategyTitle = () => {
    switch (currentStrategy) {
      case 'btb': return 'قوانین استراتژی BTB (Breakout To Build)';
      case 'spike': return 'قوانین استراتژی اسپایک (Spike Momentum)';
      default: return 'قوانین استراتژی کانال (Channel Trend)';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4" dir="rtl">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-amber-950/80 p-3 rounded-2xl border border-amber-500/30 text-amber-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-100">{getStrategyTitle()}</h2>
            <p className="text-xs text-slate-400 mt-0.5">چک‌لیست الزامی قبل از ورود به هر پوزیشن معامله</p>
          </div>
        </div>

        <button
          onClick={onProceedToTrade}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <span>تایید قوانین و ورود به ثبت معامله</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Rules Checklist */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4 shadow-xl">
        <h3 className="text-sm font-black text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>شرایط الزامی ورود (Entry Requirements Checklist)</span>
        </h3>

        <div className="space-y-3 pt-2">
          {settings.rules.map((rule, idx) => (
            <div 
              key={idx}
              className="bg-slate-950/80 border border-slate-850 hover:border-indigo-500/30 rounded-2xl p-4 flex items-start gap-3 transition-colors"
            >
              <div className="bg-indigo-950 text-indigo-400 w-6 h-6 rounded-full flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5 border border-indigo-500/20">
                {idx + 1}
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {rule}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Limits Box */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-900/30 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-black text-rose-300 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>حدود مجاز ریسک مدیریت سرمایه</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850">
            <span className="text-[10px] text-slate-400 block font-bold">سقف معاملات روزانه</span>
            <span className="text-lg font-mono font-black text-slate-100 mt-1 block">{settings.maxTradesPerDay} معامله</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850">
            <span className="text-[10px] text-slate-400 block font-bold">حد زیان مجاز روزانه</span>
            <span className="text-lg font-mono font-black text-rose-400 mt-1 block">{settings.maxLossesPerDay} حد زیان</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850">
            <span className="text-[10px] text-slate-400 block font-bold">هدف وین‌ریت (Win Rate)</span>
            <span className="text-lg font-mono font-black text-emerald-400 mt-1 block">{settings.targetWinRate}%</span>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-850">
            <span className="text-[10px] text-slate-400 block font-bold">حداقل ریسک به ریوارد</span>
            <span className="text-lg font-mono font-black text-amber-400 mt-1 block">1:{settings.defaultRiskReward}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
