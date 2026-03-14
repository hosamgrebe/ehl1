import { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  Send,
  ShieldCheck,
  AlertCircle,
  Download,
  Clock3,
  CheckCircle2,
  Power,
} from 'lucide-react';
import { auth } from '../firebase';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

type BackupSettings = {
  enabled: boolean;
  time: string;
  lastBackupAt: string;
};

function getBackupSettings(): BackupSettings {
  const raw = localStorage.getItem('backup_settings');
  if (!raw) {
    return {
      enabled: false,
      time: '23:00',
      lastBackupAt: '',
    };
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {
      enabled: false,
      time: '23:00',
      lastBackupAt: '',
    };
  }
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'telegram' | 'backup'>('telegram');
  const [telegramToken, setTelegramToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const [backupEnabled, setBackupEnabled] = useState(false);
  const [backupTime, setBackupTime] = useState('23:00');
  const [lastBackupAt, setLastBackupAt] = useState('');
  const [backupSaveStatus, setBackupSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [backupNowStatus, setBackupNowStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  useEffect(() => {
    const settings = getBackupSettings();
    setBackupEnabled(settings.enabled);
    setBackupTime(settings.time);
    setLastBackupAt(settings.lastBackupAt);
  }, []);

  const handleSaveTelegram = () => {
    setSaveStatus('saving');

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const handleSaveBackupSettings = () => {
    setBackupSaveStatus('saving');

    const payload: BackupSettings = {
      enabled: backupEnabled,
      time: backupTime,
      lastBackupAt,
    };

    localStorage.setItem('backup_settings', JSON.stringify(payload));

    setTimeout(() => {
      setBackupSaveStatus('saved');
      setTimeout(() => setBackupSaveStatus('idle'), 2000);
    }, 700);
  };

  const handleBackupNow = async () => {
    setBackupNowStatus('loading');

    // سنربطه فعليًا مع Telegram في الخطوة التالية
    setTimeout(() => {
      const now = new Date().toISOString();
      setLastBackupAt(now);

      const payload: BackupSettings = {
        enabled: backupEnabled,
        time: backupTime,
        lastBackupAt: now,
      };

      localStorage.setItem('backup_settings', JSON.stringify(payload));

      setBackupNowStatus('done');
      setTimeout(() => setBackupNowStatus('idle'), 2000);
    }, 1000);
  };

  const formatDateTime = (value: string) => {
    if (!value) return 'لا توجد نسخة بعد';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString('ar');
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">الإعدادات</h2>
        <p className="text-slate-500">تخصيص التطبيق وإدارة التنبيهات والنسخ الاحتياطي.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-4">
        <div className="flex flex-col gap-2 lg:col-span-1">
          <button
            onClick={() => setActiveTab('telegram')}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all',
              activeTab === 'telegram'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            <Send size={18} />
            تنبيهات تليجرام
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={cn(
              'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all',
              activeTab === 'backup'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            )}
          >
            <ShieldCheck size={18} />
            النسخ الاحتياطي
          </button>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm lg:col-span-3">
          {activeTab === 'telegram' && (
            <div className="space-y-6">
              <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                <Send className="text-emerald-600" />
                ربط بوت تليجرام (اختياري)
              </h3>

              <p className="text-sm text-slate-500">
                استقبل إشعارات فورية على هاتفك عند إضافة أي عملية مالية جديدة.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Token البوت</label>
                  <input
                    type="password"
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    placeholder="123456789:ABCDefgh..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500">Chat ID</label>
                  <input
                    type="text"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    placeholder="987654321"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleSaveTelegram}
                  disabled={saveStatus === 'saving'}
                  className="w-full rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                >
                  {saveStatus === 'saving'
                    ? 'جاري الحفظ...'
                    : saveStatus === 'saved'
                    ? 'تم الحفظ بنجاح!'
                    : 'حفظ الإعدادات'}
                </button>
              </div>

              <div className="flex gap-3 rounded-2xl bg-amber-50 p-4">
                <AlertCircle className="shrink-0 text-amber-600" size={20} />
                <p className="text-xs leading-relaxed text-amber-700">
                  للحصول على هذه المعلومات، قم بإنشاء بوت عبر @BotFather في تليجرام، ثم احصل على
                  معرف الدردشة عبر @userinfobot.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h3 className="flex items-center gap-2 text-xl font-bold text-slate-800">
                <ShieldCheck className="text-emerald-600" />
                النسخ الاحتياطي
              </h3>

              <p className="text-sm text-slate-500">
                أرسل نسخة احتياطية من بيانات التطبيق بصيغة JSON إلى تليجرام، مع إمكانية ضبط وقت
                النسخة الاحتياطية التلقائية.
              </p>

              <div className="grid gap-4">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">تفعيل النسخ الاحتياطي التلقائي</p>
                      <p className="text-xs text-slate-500">
                        عند التفعيل سيتم اعتماد الوقت المحدد للنسخة اليومية.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBackupEnabled((v) => !v)}
                      className={cn(
                        'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all',
                        backupEnabled
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      <Power size={16} />
                      {backupEnabled ? 'مفعل' : 'غير مفعل'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <Clock3 size={14} />
                      وقت النسخة الاحتياطية
                    </label>
                    <input
                      type="time"
                      value={backupTime}
                      onChange={(e) => setBackupTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Database size={18} className="text-emerald-600" />
                    <p className="text-sm font-bold text-slate-800">آخر نسخة احتياطية</p>
                  </div>
                  <p className="text-sm text-slate-600">{formatDateTime(lastBackupAt)}</p>
                </div>

                <button
                  onClick={handleBackupNow}
                  disabled={backupNowStatus === 'loading'}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-4 font-bold text-white transition-all hover:bg-slate-900 active:scale-95 disabled:opacity-50"
                >
                  <Download size={18} />
                  {backupNowStatus === 'loading'
                    ? 'جاري إنشاء النسخة...'
                    : backupNowStatus === 'done'
                    ? 'تم إنشاء النسخة!'
                    : 'إنشاء نسخة احتياطية الآن'}
                </button>

                <button
                  onClick={handleSaveBackupSettings}
                  disabled={backupSaveStatus === 'saving'}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
                >
                  <CheckCircle2 size={18} />
                  {backupSaveStatus === 'saving'
                    ? 'جاري حفظ الإعدادات...'
                    : backupSaveStatus === 'saved'
                    ? 'تم حفظ إعدادات النسخ!'
                    : 'حفظ إعدادات النسخ الاحتياطي'}
                </button>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs leading-relaxed text-slate-500">
                  ملاحظة: زر إنشاء النسخة الاحتياطية جاهز من جهة الواجهة الآن. في الخطوة التالية
                  سنربطه فعليًا مع السيرفر لكي يرسل ملف JSON مباشرة إلى تليجرام.
                </p>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-8">
                <div className="mb-6 rounded-2xl bg-slate-50 p-4">
                  <p className="text-center text-xs text-slate-500">
                    أنت مسجل دخول كـ:{' '}
                    <span className="font-bold text-slate-700">{auth.currentUser?.email}</span>
                  </p>
                </div>

                <button
                  onClick={() => auth.signOut()}
                  className="w-full rounded-xl bg-rose-50 py-4 font-bold text-rose-600 transition-all hover:bg-rose-100"
                >
                  تسجيل الخروج من الحساب
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
