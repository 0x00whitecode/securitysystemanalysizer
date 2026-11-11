import { BellRing, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { VMSProvider } from './context/VMSContext';
import { AdminDashboard } from './pages/AdminDashboard';
import { HomePage } from './pages/HomePage';
import { HostDashboard } from './pages/HostDashboard';
import { LoginPage } from './pages/LoginPage';
import { SecurityDashboard } from './pages/SecurityDashboard';
import { VisitorPortal } from './pages/VisitorPortal';

const navItems = [
  { label: 'Home', value: 'home' },
  { label: 'Security', value: 'security' },
  { label: 'Host', value: 'host' },
  { label: 'Visitor', value: 'visitor' },
  { label: 'Admin', value: 'admin' },
];

function AppLayout() {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<'home' | 'security' | 'host' | 'visitor' | 'admin'>('home');

  const roleLabel = useMemo(() => user ? user.Access : 'Guest', [user]);

  const targetView = useMemo(() => {
    if (!user) return 'home';
    if (user.Access === 'Security') return 'security';
    if (user.Access === 'Staff') return 'host';
    if (user.Access === 'Visitor') return 'visitor';
    return 'admin';
  }, [user]);

  useEffect(() => {
    if (user) setActiveView(targetView);
  }, [targetView, user]);

  const renderContent = () => {
    if (!user) {
      if (activeView === 'visitor') return <VisitorPortal />;
      if (activeView === 'security' || activeView === 'host' || activeView === 'admin') {
        return <LoginPage onLogin={() => setActiveView('home')} />;
      }

      return (
        <HomePage
          onStartVisitorFlow={() => setActiveView('visitor')}
          onViewDashboards={() => setActiveView('security')}
        />
      );
    }

    switch (activeView) {
      case 'security':
        return (
          <ProtectedRoute user={user} role="Security">
            <SecurityDashboard />
          </ProtectedRoute>
        );
      case 'host':
        return (
          <ProtectedRoute user={user} role="Staff">
            <HostDashboard />
          </ProtectedRoute>
        );
      case 'visitor':
        return (
          <ProtectedRoute user={user} role="Visitor">
            <VisitorPortal />
          </ProtectedRoute>
        );
      case 'admin':
        return (
          <ProtectedRoute user={user} role="Admin">
            <AdminDashboard />
          </ProtectedRoute>
        );
      default:
        return <HomePage onStartVisitorFlow={() => setActiveView('visitor')} onViewDashboards={() => setActiveView('security')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-600 p-2.5 text-white shadow-md shadow-blue-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">MAU</p>
              <h1 className="text-lg font-bold text-slate-900">MAU SYSTEM</h1>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            {navItems
              .filter((item) => {
                if (!user) return item.value === 'home';
                if (user.Access === 'Admin') return true;
                if (user.Access === 'Security') return item.value === 'home' || item.value === 'security';
                if (user.Access === 'Staff') return item.value === 'home' || item.value === 'host';
                if (user.Access === 'Visitor') return item.value === 'home' || item.value === 'visitor';
                return false;
              })
              .map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setActiveView(item.value as 'home' | 'security' | 'host' | 'visitor' | 'admin')}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${activeView === item.value ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  {item.label}
                </button>
              ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
              {roleLabel}
            </div>
            {user ? (
              <button onClick={logout} type="button" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Log out
              </button>
            ) : (
              <button onClick={() => setActiveView('home')} type="button" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 lg:px-6">{renderContent()}</main>

      {!user && (
        <div className="mx-auto max-w-7xl px-4 pb-8 lg:px-6">
          <div className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
            <InfoCard icon={LayoutDashboard} title="Admin overview" description="Review access levels and audit logs." />
            <InfoCard icon={ShieldCheck} title="Security desk" description="Verify NIN credentials and approve access." />
            <InfoCard icon={BellRing} title="Host alerts" description="Receive real-time guards and visitor notices." />
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ icon: Icon, title, description }: { icon: typeof LayoutDashboard; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 inline-flex rounded-xl bg-blue-50 p-2 text-blue-700">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}

function AppShell() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!user) setShowLogin(true);
    else setShowLogin(false);
  }, [user]);

  if (showLogin) return <LoginPage onLogin={() => setShowLogin(false)} />;

  return <AppLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <VMSProvider>
        <AppShell />
      </VMSProvider>
    </AuthProvider>
  );
}
