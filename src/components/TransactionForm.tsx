import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { FundType, TransactionType, FUND_LABELS, TRANSACTION_TYPES_LABELS } from '../types';
import { Save, X, ArrowRightLeft, DollarSign, FileText } from 'lucide-react';

export default function TransactionForm() {
  const navigate = useNavigate();
  const { addTransaction } = useTransactions();
  
  const [fund, setFund] = useState<FundType>('SYP');
  const [type, setType] = useState<TransactionType>('deposit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    await addTransaction({
      fund,
      type,
      amount: parseFloat(amount),
      note: note || (type === 'deposit' ? 'إيداع نقدي' : 'عملية سحب'),
      timestamp: new Date().toISOString(),
    });
    
    setIsSubmitting(false);
    navigate('/');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إضافة عملية جديدة</h2>
          <p className="text-slate-500">قم بتسجيل عملية إيداع أو سحب جديدة في الصناديق.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white p-8 shadow-sm border border-slate-100">
        {/* Fund Selection */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <DollarSign size={16} className="text-emerald-600" />
            اختر الصندوق
          </label>
          <div className="grid grid-cols-2 gap-4">
            {(['SYP', 'USD'] as FundType[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFund(f)}
                className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                  fund === f 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                    : 'border-slate-100 bg-white text-slate-500 hover:border-emerald-200'
                }`}
              >
                <span className="text-lg font-bold">{f}</span>
                <span className="text-xs">{FUND_LABELS[f]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Type */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <ArrowRightLeft size={16} className="text-emerald-600" />
            نوع العملية
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['deposit', 'withdrawal', 'expense'] as TransactionType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-xl border py-3 text-sm font-medium transition-all ${
                  type === t 
                    ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {TRANSACTION_TYPES_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <DollarSign size={16} className="text-emerald-600" />
            المبلغ
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-2xl font-bold text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
              {fund}
            </span>
          </div>
        </div>

        {/* Note */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <FileText size={16} className="text-emerald-600" />
            البيان / الملاحظات
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="مثلاً: دفعة من زبون، شراء قرطاسية..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
          >
            <Save size={20} />
            {isSubmitting ? 'جاري الحفظ...' : 'حفظ العملية'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-4 font-bold text-slate-600 transition-all hover:bg-slate-200"
          >
            <X size={20} />
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
