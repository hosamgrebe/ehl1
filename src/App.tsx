import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, FileText, Settings as SettingsIcon, Wallet, LogIn } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle } from './firebase';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionHistory from './components/TransactionHistory';
import Reports from './components/Reports';
import Settings from './components/Settings';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

function NavItem({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center gap-1 p-2 transition-colors",
        isActive ? "text-emerald-600" : "text-slate-500 hover:text-emerald-500"
      )}
    >
      <Icon size={24} />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-2xl shadow-emerald-200">
          <Wallet size={40} />
        </div>
        <h1 className="mb-2 text-3xl font-black text-slate-800">مرحباً بك في صندوقي</h1>
        <p className="mb-8 max-w-xs text-slate-500">يرجى تسجيل الدخول باستخدام حساب جوجل للوصول إلى بياناتك المالية بأمان.</p>
        <button
          onClick={loginWithGoogle}
          className="flex items-center gap-3 rounded-2xl bg-white px-8 py-4 font-bold text-slate-700 shadow-lg transition-all hover:bg-slate-50 active:scale-95"
        >
          <LogIn size={20} className="text-emerald-600" />
          تسجيل الدخول عبر Google
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col pb-20 md:pb-0 md:pr-64">
        {/* Desktop Sidebar */}
        <aside className="fixed right-0 top-0 hidden h-full w-64 border-l border-slate-200 bg-white p-6 md:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200">
              <Wallet size={24} />
            </div>
            <h1 className="text-xl font-bold text-slate-800">صندوقي</h1>
          </div>
          
          <nav className="space-y-2">
            <SidebarLink to="/" icon={LayoutDashboard} label="اللوحة الرئيسية" />
            <SidebarLink to="/new" icon={PlusCircle} label="إضافة عملية" />
            <SidebarLink to="/history" icon={History} label="سجل العمليات" />
            <SidebarLink to="/reports" icon={FileText} label="التقارير" />
            <SidebarLink to="/settings" icon={SettingsIcon} label="الإعدادات" />
          </nav>

          <div className="absolute bottom-6 left-6 right-6 text-center">
            <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
              جميع الحقوق محفوظة حسام غريبي<br />
              التطبيق مقدم هدية لـ أحلام
            </p>
          </div>
        </aside>

        {/* Header (Mobile) */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md md:hidden">
          <div className="flex items-center gap-2">
            <Wallet className="text-emerald-600" size={24} />
            <span className="text-lg font-bold">صندوقي</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<TransactionForm />} />
            <Route path="/history" element={<TransactionHistory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 flex w-full items-center justify-around border-t border-slate-200 bg-white py-2 md:hidden">
          <NavItem to="/" icon={LayoutDashboard} label="الرئيسية" />
          <NavItem to="/new" icon={PlusCircle} label="إضافة" />
          <NavItem to="/history" icon={History} label="السجل" />
          <NavItem to="/reports" icon={FileText} label="التقارير" />
          <NavItem to="/settings" icon={SettingsIcon} label="الإعدادات" />
        </nav>

        {/* Mobile Footer */}
        <div className="bg-slate-50 p-4 text-center md:hidden">
          <p className="text-[10px] text-slate-500 font-bold">
            جميع الحقوق محفوظة حسام غريبي | التطبيق مقدم هدية لـ أحلام
          </p>
        </div>
      </div>
    </Router>
  );
}

function SidebarLink({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 transition-all",
        isActive 
          ? "bg-emerald-50 text-emerald-700 font-semibold" 
          : "text-slate-600 hover:bg-slate-50 hover:text-emerald-600"
      )}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
}
