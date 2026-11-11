import type { ReactNode } from 'react';
import type { User } from '../types/vms';

interface ProtectedRouteProps {
  user: User | null;
  role: 'Admin' | 'Security' | 'Staff' | 'Visitor';
  children: ReactNode;
}

export function ProtectedRoute({ user, role, children }: ProtectedRouteProps) {
  if (!user) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Please sign in to access this dashboard.
      </div>
    );
  }

  if (user.Access !== role) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
        This dashboard is restricted to {role} accounts.
      </div>
    );
  }

  return <>{children}</>;
}
