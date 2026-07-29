import { StrategySettings, GlobalSettings } from '../types';

export const DEFAULT_CHANNEL_SETTINGS: StrategySettings = {
  maxTradesPerDay: 4,
  maxLossesPerDay: 2,
  targetWinRate: 70,
  defaultRiskReward: 2.0,
  rules: [
    'تایید خط روند اصلی و جهت کانال قیمتی (Channel Trend Confirmation)',
    'برخورد سوم به کف یا سقف کانال همراه با کندل بازگشتی معتبر',
    'بررسی عدم وجود خبر مهم فورس‌ماژور قبل از ورود',
    'محاسبه دقیق حجم پوزیشن بر اساس حد زیان (최대 1%-2% کل سرمایه)',
    'تعیین مشخص حد سود (Take Profit) و حد زیان (Stop Loss) قبل از کلیک ورود'
  ]
};

export const DEFAULT_BTB_SETTINGS: StrategySettings = {
  maxTradesPerDay: 3,
  maxLossesPerDay: 1,
  targetWinRate: 75,
  defaultRiskReward: 2.5,
  rules: [
    'شناسایی الگوی BTB (Breakout To Build) در تایم‌فریم اصلی',
    'تایید شکست ساختار (Break of Structure) همراه با ولوم بالا',
    'پولبک تمیز به سطح شکسته‌شده یا منطقه اردربلاک',
    'عدم شتاب‌زدگی و انتظار برای تاییدیه کندل اکشن بازگشتی',
    'رعایت انضباط فردی و عدم ورود هیجانی (No FOMO)'
  ]
};

export const DEFAULT_SPIKE_SETTINGS: StrategySettings = {
  maxTradesPerDay: 5,
  maxLossesPerDay: 2,
  targetWinRate: 65,
  defaultRiskReward: 1.8,
  rules: [
    'تشخیص کندل اسپایک پرقدرت (Spike Momentum Candle)',
    'ورود در جهت اسپایک پس از تثبیت اولین کندل تایم‌پایین',
    'SP.pinbar',
    'توقف کامل معاملات اسپایک در صورت ۲ حد زیان متوالی',
    'استفاده از استپ‌لاس تنگ و مدیریت فعال پوزیشن'
  ]
};

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  alarmSound: true,
  alarmVolume: 80,
  watermarkText: '@Soheil_Keshtkar',
  voiceAlerts: true,
  screenshotFolder: '',
  autoScreenshot: true,
  showWinRateWhenDisabled: false
};
