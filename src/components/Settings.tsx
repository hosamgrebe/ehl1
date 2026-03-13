import { useState } from 'react';
import { Settings as SettingsIcon, Database, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import { auth } from '../firebase';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'telegram' | 'backup'>('telegram');
  const [telegramToken, setTelegramToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSaveTelegram = () => {
    setSaveStatus('saving');
    // In a real app, this would save to Firestore user profile
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">الإعدادات</h2>
        <p className="text-slate-500">تخصيص التطبيق وإدارة التنبيهات والنسخ الاحتياطي.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Tabs */}
        <div className="flex flex-col gap-2 lg:col-span-1">
          <button
            onClick={() => setActiveTab('telegram')}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all",
              activeTab === 'telegram' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <Send size={18} />
            تنبيهات تليجرام
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all",
              activeTab === 'backup' ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <ShieldCheck size={18} />
            الأمان والنسخ
          </button>
        </div>

        {/* Content */}
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-slate-100 lg:col-span-3">
          {activeTab === 'telegram' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
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
                  {saveStatus === 'saving' ? 'جاري الحفظ...' : saveStatus === 'saved' ? 'تم الحفظ بنجاح!' : 'حفظ الإعدادات'}
                </button>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4 flex gap-3">
                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                <p className="text-xs text-amber-700 leading-relaxed">
                  للحصول على هذه المعلومات، قم بإنشاء بوت عبر @BotFather في تليجرام، ثم احصل على معرف الدردشة عبر @userinfobot.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" />
                النسخ الاحتياطي والأمان
              </h3>
              <p className="text-sm text-slate-500">
                بياناتك محفوظة تلقائياً في السحابة (Firebase) بشكل آمن ومرتبطة بحساب جوجل الخاص بك.
              </p>
              
              <div className="grid gap-4">
                <button className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition-all text-right">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">تحميل نسخة JSON</p>
                    <p className="text-xs text-slate-400">تنزيل كافة العمليات المسجلة على جهازك</p>
                  </div>
                  <Database size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="mt-8 border-t border-slate-100 pt-8">
                <div className="rounded-2xl bg-slate-50 p-4 mb-6">
                  <p className="text-xs text-slate-500 text-center">
                    أنت مسجل دخول كـ: <span className="font-bold text-slate-700">{auth.currentUser?.email}</span>
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
