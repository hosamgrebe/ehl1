import { useTransactions } from '../hooks/useTransactions';
import { Wallet, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { TRANSACTION_TYPES_LABELS, FUND_LABELS } from '../types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion } from 'motion/react';

export default function Dashboard() {
  const { transactions, balances, loading } = useTransactions();

  const recentTransactions = transactions.slice(0, 5);
  const todayTransactions = transactions.filter(t => 
    new Date(t.timestamp).toDateString() === new Date().toDateString()
  );

  if (loading) return <div className="flex h-64 items-center justify-center">جاري التحميل...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-slate-800">لوحة التحكم</h2>
        <p className="text-slate-500">مرحباً بك، إليك ملخص الصناديق المالية اليوم.</p>
      </header>

      {/* Balance Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <BalanceCard 
          label={FUND_LABELS.SYP} 
          amount={balances.SYP} 
          currency="ل.س" 
          color="bg-emerald-600"
          icon={Wallet}
        />
        <BalanceCard 
          label={FUND_LABELS.USD} 
          amount={balances.USD} 
          currency="$" 
          color="bg-blue-600"
          icon={Wallet}
        />
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          label="عمليات اليوم" 
          value={todayTransactions.length} 
          icon={Clock} 
          color="text-amber-600" 
        />
        <StatCard 
          label="إجمالي الإيداعات (اليوم)" 
          value={todayTransactions.filter(t => t.type === 'deposit').length} 
          icon={TrendingUp} 
          color="text-emerald-600" 
        />
        <StatCard 
          label="إجمالي المصاريف (اليوم)" 
          value={todayTransactions.filter(t => t.type !== 'deposit').length} 
          icon={TrendingDown} 
          color="text-rose-600" 
        />
      </div>

      {/* Recent Transactions */}
      <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <h3 className="mb-4 text-lg font-bold text-slate-800">آخر العمليات</h3>
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {tx.type === 'deposit' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{tx.note}</p>
                    <p className="text-xs text-slate-400">
                      {format(new Date(tx.timestamp), 'p - dd MMMM', { locale: ar })}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`font-bold ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()} {tx.fund}
                  </p>
                  <p className="text-[10px] text-slate-400">الرصيد: {tx.balanceAfter.toLocaleString()}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400 py-4">لا توجد عمليات مسجلة بعد.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function BalanceCard({ label, amount, currency, color, icon: Icon }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${color} relative overflow-hidden rounded-3xl p-8 text-white shadow-xl`}
    >
      <div className="relative z-10">
        <p className="text-white/80 font-medium">{label}</p>
        <h3 className="mt-2 text-4xl font-black tracking-tight">
          {amount.toLocaleString()} <span className="text-xl font-normal opacity-80">{currency}</span>
        </h3>
      </div>
      <Icon className="absolute -bottom-4 -left-4 h-32 w-32 text-white/10" />
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
