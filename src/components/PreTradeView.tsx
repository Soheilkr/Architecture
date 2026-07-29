import React, { useState } from 'react';
import { StrategyMode, StrategySettings, ViewMode } from '../types';
import { ArrowLeft, AlertCircle, ShieldCheck, Play, Crosshair } from 'lucide-react';

interface PreTradeViewProps {
  currentStrategy: StrategyMode;
  settings: StrategySettings;
  setActiveView: (view: ViewMode) => void;
  onConfirmPreTrade: (tradeData: {
    symbol: string;
    direction: 'LONG' | 'SHORT';
    entryPrice: string;
    rulesChecked: string[];
  }) => void;
}

export const PreTradeView: React.FC<PreTradeViewProps> = ({
  currentStrategy,
  settings,
  setActiveView,
  onConfirmPreTrade
}) => {
  const [symbol, setSymbol] = useState('BTC/USDT');
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [entryPrice, setEntryPrice] = useState('');
  const [checkedRules, setCheckedRules] = useState<string[]>([]);

  const handleToggleRule = (rule: string) => {
    if (checkedRules.includes(rule)) {
      setCheckedRules(checkedRules.filter(r => r !== rule));
    } else {
      setCheckedRules([...checkedRules, rule]);
    }
  };

  const isFormValid = symbol && entryPrice && checkedRules.length === settings.rules.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    onConfirmPreTrade({
      symbol,
      direction,
      entryPrice,
      rulesChecked: checkedRules
    });
    setActiveView('post-trade');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4" dir="rtl">
      
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-500/30 px-2.5 py-0.5 rounded-full uppercase">
            مرحله اول: ورود به پوزیشن
          </span>
          <h2 className="text-lg font-black text-slate-100 mt-1">چک‌لیست و ثبت پارامترهای ورود</h2>
        </div>

        <button
          onClick={() => setActiveView('welcome')}
          className="text-xs text-slate-400 hover:text-slate-200"
        >
          انصراف
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Symbol & Direction */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-xs font-black text-slate-300">مشخصات معامله</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-bold">نماد معاملاتی (Symbol)</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="مثلاً BTC/USDT یا XAU/USD"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono dir-ltr text-right"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-bold">جهت پوزیشن (Direction)</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('LONG')}
                  className={`py-3 rounded-xl font-mono font-black text-xs transition-all cursor-pointer ${
                    direction === 'LONG'
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  🟢 LONG
                </button>

                <button
                  type="button"
                  onClick={() => setDirection('SHORT')}
                  className={`py-3 rounded-xl font-mono font-black text-xs transition-all cursor-pointer ${
                    direction === 'SHORT'
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  🔴 SHORT
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-bold">قیمت نقطه ورود (Entry Price)</label>
            <input
              type="text"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="مثلاً 64,250"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 font-mono dir-ltr text-right placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
        </div>

        {/* Mandatory Rules Verification */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-200">چک‌لیست تایید قوانین قبل از ورود</h3>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-500/30">
              {checkedRules.length} از {settings.rules.length} مورداجرا شد
            </span>
          </div>

          <div className="space-y-2.5">
            {settings.rules.map((rule, idx) => {
              const isChecked = checkedRules.includes(rule);
              return (
                <div
                  key={idx}
                  onClick={() => handleToggleRule(rule)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    isChecked
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-850 hover:border-slate-750 text-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="w-4 h-4 mt-0.5 accent-emerald-500 rounded cursor-pointer pointer-events-none"
                  />
                  <span className="text-xs font-medium leading-relaxed">{rule}</span>
                </div>
              );
            })}
          </div>

          {!isFormValid && (
            <p className="text-[11px] text-amber-400 bg-amber-950/40 border border-amber-500/20 p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>برای فعال‌شدن کلید ورود، تمامی تیک‌های قوانین و اطلاعات قیمت را تکمیل کنید.</span>
            </p>
          )}
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={!isFormValid}
          className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-40 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-950/50 transition-all cursor-pointer active:scale-98"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>تایید ورود به معامله و انتقال به مرحله خروج / ژورنال</span>
        </button>

      </form>

    </div>
  );
};
