import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { FundType, FUND_LABELS } from '../types';
import { format, isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns';
import { Calendar, PieChart, ArrowUpCircle, ArrowDownCircle, Banknote, FileDown, Send, MessageCircle, Filter } from 'lucide-react';

export default function Reports() {
  const { transactions, loading } = useTransactions();
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  if (loading) return <div className="flex h-64 items-center justify-center">جاري التحميل...</div>;

  const filteredTxs = transactions.filter(t => {
    const txDate = parseISO(t.timestamp);
    return isWithinInterval(txDate, { 
      start: startOfDay(parseISO(startDate)), 
      end: endOfDay(parseISO(endDate)) 
    });
  });

  const calculateStats = (fund: FundType) => {
    const fundTxs = filteredTxs.filter(t => t.fund === fund);
    const deposits = fundTxs.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0);
    const withdrawals = fundTxs.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0);
    const expenses = fundTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { deposits, withdrawals, expenses, totalOut: withdrawals + expenses };
  };

  const sypStats = calculateStats('SYP');
  const usdStats = calculateStats('USD');

  const exportPDF = () => {
    window.print();
  };

  const shareTelegram = () => {
    const text = `📊 *تقرير مالي من صندوقي*\n` +
      `📅 الفترة: من ${startDate} إلى ${endDate}\n\n` +
      `🇸🇾 *صندوق الليرة السورية:*\n` +
      `➕ إيداعات: ${sypStats.deposits.toLocaleString()}\n` +
      `➖ مصاريف: ${sypStats.totalOut.toLocaleString()}\n` +
      `💎 الصافي: ${(sypStats.deposits - sypStats.totalOut).toLocaleString()}\n\n` +
      `🇺🇸 *صندوق الدولار الأمريكي:*\n` +
      `➕ إيداعات: ${usdStats.deposits.toLocaleString()}\n` +
      `➖ مصاريف: ${usdStats.totalOut.toLocaleString()}\n` +
      `💎 الصافي: ${(usdStats.deposits - usdStats.totalOut).toLocaleString()}`;
    
    const url = `https://t.me/share/url?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareWhatsApp = () => {
    const text = `📊 *تقرير مالي من صندوقي*\n` +
      `📅 الفترة: من ${startDate} إلى ${endDate}\n\n` +
      `🇸🇾 *صندوق الليرة السورية:*\n` +
      `➕ إيداعات: ${sypStats.deposits.toLocaleString()}\n` +
      `➖ مصاريف: ${sypStats.totalOut.toLocaleString()}\n` +
      `💎 الصافي: ${(sypStats.deposits - sypStats.totalOut).toLocaleString()}\n\n` +
      `🇺🇸 *صندوق الدولار الأمريكي:*\n` +
      `➕ إيداعات: ${usdStats.deposits.toLocaleString()}\n` +
      `➖ مصاريف: ${usdStats.totalOut.toLocaleString()}\n` +
      `💎 الصافي: ${(usdStats.deposits - usdStats.totalOut).toLocaleString()}`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">التقارير المالية</h2>
          <p className="text-slate-500">تحليل الإيرادات والمصاريف لفترات زمنية محددة.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={exportPDF} 
            className="flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-900 active:scale-95"
          >
            <FileDown size={18} />
            تصدير PDF
          </button>
          <button onClick={shareTelegram} className="flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-600 active:scale-95">
            <Send size={18} />
            تليجرام
          </button>
          <button onClick={shareWhatsApp} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-600 active:scale-95">
            <MessageCircle size={18} />
            واتساب
          </button>
        </div>
      </header>

      {/* Date Filters */}
      <section className="rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
              <Calendar size={14} />
              من تاريخ
            </label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-slate-500 flex items-center gap-2">
              <Calendar size={14} />
              إلى تاريخ
            </label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <div className="md:w-auto">
            <div className="flex h-[42px] items-center gap-2 rounded-xl bg-emerald-50 px-4 text-emerald-700 text-xs font-bold">
              <Filter size={14} />
              {filteredTxs.length} عملية
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        <FundReport fund="SYP" stats={sypStats} />
        <FundReport fund="USD" stats={usdStats} />
      </div>

      {/* Printable Report Template (Visible only during print) */}
      <div className="hidden print:block fixed inset-0 bg-white p-12 text-right" dir="rtl">
        <div className="text-center mb-10 border-b-2 border-slate-800 pb-6">
          <h1 className="text-3xl font-black text-slate-800 mb-2">التقرير المالي - صندوقي</h1>
          <p className="text-lg text-slate-500">الفترة من {startDate} إلى {endDate}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold mb-4 text-emerald-700 border-b pb-2">صندوق الليرة السورية (SYP)</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>إجمالي الإيداعات:</span> <span className="font-bold">{sypStats.deposits.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>إجمالي السحوبات:</span> <span className="font-bold">{sypStats.withdrawals.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>إجمالي المصروفات:</span> <span className="font-bold">{sypStats.expenses.toLocaleString()}</span></div>
              <div className="flex justify-between pt-2 border-t font-black text-lg"><span>صافي الحركة:</span> <span>{(sypStats.deposits - sypStats.totalOut).toLocaleString()}</span></div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold mb-4 text-blue-700 border-b pb-2">صندوق الدولار الأمريكي (USD)</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>إجمالي الإيداعات:</span> <span className="font-bold">{usdStats.deposits.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>إجمالي السحوبات:</span> <span className="font-bold">{usdStats.withdrawals.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>إجمالي المصروفات:</span> <span className="font-bold">{usdStats.expenses.toLocaleString()}</span></div>
              <div className="flex justify-between pt-2 border-t font-black text-lg"><span>صافي الحركة:</span> <span>{(usdStats.deposits - usdStats.totalOut).toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4 text-slate-800">تفاصيل العمليات</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-200">
              <th className="p-3 text-right">التاريخ</th>
              <th className="p-3 text-right">الصندوق</th>
              <th className="p-3 text-right">النوع</th>
              <th className="p-3 text-right">المبلغ</th>
              <th className="p-3 text-right">البيان</th>
            </tr>
          </thead>
          <tbody>
            {filteredTxs.map((t, i) => (
              <tr key={i} className="border-b border-slate-100">
                <td className="p-3 whitespace-nowrap">{format(parseISO(t.timestamp), 'yyyy-MM-dd HH:mm')}</td>
                <td className="p-3 font-bold">{t.fund}</td>
                <td className="p-3">{t.type === 'deposit' ? 'إيداع' : t.type === 'withdrawal' ? 'سحب' : 'مصروف'}</td>
                <td className="p-3 font-bold">{t.amount.toLocaleString()}</td>
                <td className="p-3 text-slate-600">{t.note}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-20 pt-8 border-t text-center">
          <p className="text-sm font-bold text-slate-600">
            جميع الحقوق محفوظة حسام غريبي | التطبيق مقدم هدية لـ أحلام
          </p>
        </div>
      </div>
    </div>
  );
}

function FundReport({ fund, stats }: { fund: FundType; stats: any }) {
  return (
    <div className="space-y-6 rounded-3xl bg-white p-8 shadow-sm border border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${fund === 'SYP' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
          <PieChart size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">{FUND_LABELS[fund]}</h3>
      </div>

      <div className="grid gap-4">
        <ReportItem 
          label="إجمالي الإيداعات" 
          amount={stats.deposits} 
          icon={ArrowUpCircle} 
          color="text-emerald-600" 
          bg="bg-emerald-50"
          fund={fund}
        />
        <ReportItem 
          label="إجمالي السحوبات" 
          amount={stats.withdrawals} 
          icon={ArrowDownCircle} 
          color="text-amber-600" 
          bg="bg-amber-50"
          fund={fund}
        />
        <ReportItem 
          label="إجمالي المصروفات" 
          amount={stats.expenses} 
          icon={Banknote} 
          color="text-rose-600" 
          bg="bg-rose-50"
          fund={fund}
        />
      </div>

      <div className="mt-6 border-t border-slate-50 pt-6">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-500">صافي الحركة</span>
          <span className={`text-2xl font-black ${(stats.deposits - stats.totalOut) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {(stats.deposits - stats.totalOut).toLocaleString()} {fund}
          </span>
        </div>
      </div>
    </div>
  );
}

function ReportItem({ label, amount, icon: Icon, color, bg, fund }: any) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-50 p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color}`}>
          <Icon size={20} />
        </div>
        <span className="text-sm font-bold text-slate-600">{label}</span>
      </div>
      <span className={`font-bold ${color}`}>{amount.toLocaleString()} {fund}</span>
    </div>
  );
}
