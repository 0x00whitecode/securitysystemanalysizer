import { useState } from 'react';
import { ArrowRight, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onLogin: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = await login(username, password);
    if (!user) {
      setError('Invalid username or password. Use a registered system account.');
      return;
    }

    setError('');
    onLogin();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 p-8 text-white lg:p-10">
          <div className="flex items-center gap-3 text-lg font-semibold">
            <ShieldCheck className="h-8 w-8" />
            Visitor Management Access Portal
          </div>
          <h1 className="mt-12 text-4xl font-bold tracking-tight">Secure Entry Management</h1>
          <p className="mt-4 max-w-md text-blue-50/90">
            Sign in to manage approvals, track visitor movement, and protect campus access across the university community.
          </p>
        </div>

        <div className="p-8 lg:p-10">
          <div className="mb-6 flex items-center gap-3 text-slate-800">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Welcome back</p>
              <h2 className="text-2xl font-bold">Member login</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            {error && <p className="text-sm font-medium text-red-600">{error}</p>}

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Sign in <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
