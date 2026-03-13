import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { FundType, TransactionType, FUND_LABELS, TRANSACTION_TYPES_LABELS } from '../types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Search, Filter, Download } from 'lucide-react';

export default function TransactionHistory() {
  const { transactions, loading } = useTransactions();
  const [filterFund, setFilterFund] = useState<FundType | 'ALL'>('ALL');
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(tx => {
    const matchesFund = filterFund === 'ALL' || tx.fund === filterFund;
    const matchesType = filterType === 'ALL' || tx.type === filterType;
    const matchesSearch = tx.note.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFund && matchesType && matchesSearch;
  });

  if (loading) return <div className="flex h-64 items-center justify-center">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">سجل العمليات</h2>
          <p className="text-slate-500">عرض وتصفية جميع العمليات المالية المسجلة.</p>
        </div>
        <button className="flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          <Download size={18} />
          تصدير البيانات
        </button>
      </header>

      {/* Filters */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث في البيان..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pr-10 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterFund}
            onChange={(e) => setFilterFund(e.target.value as any)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">جميع الصناديق</option>
            <option value="SYP">الليرة السورية</option>
            <option value="USD">الدولار الأمريكي</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">جميع الأنواع</option>
            <option value="deposit">إيداع</option>
            <option value="withdrawal">سحب</option>
            <option value="expense">مصروف</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">التاريخ والوقت</th>
                <th className="px-6 py-4">الصندوق</th>
                <th className="px-6 py-4">النوع</th>
                <th className="px-6 py-4">البيان</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">الرصيد</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                    {format(new Date(tx.timestamp), 'p - dd/MM/yyyy', { locale: ar })}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                      tx.fund === 'SYP' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {FUND_LABELS[tx.fund]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      tx.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {TRANSACTION_TYPES_LABELS[tx.type]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">
                    {tx.note}
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold ${
                    tx.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700">
                    {tx.balanceAfter.toLocaleString()}
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    لا توجد نتائج تطابق البحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
