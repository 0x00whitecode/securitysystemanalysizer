import { ArrowRight, CheckCircle2, ShieldCheck, UserRound } from 'lucide-react';

interface HomePageProps {
  onStartVisitorFlow: () => void;
  onViewDashboards: () => void;
}

export function HomePage({ onStartVisitorFlow, onViewDashboards }: HomePageProps) {
  return (
    <div className="space-y-8 p-4 lg:p-8">
      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-8 text-white shadow-xl lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-50">
              MAU SYSTEM
            </p>
            <h1 className="max-w-xl text-4xl font-bold tracking-tight lg:text-6xl">Secure campus access for Modibbo Adama University, Yola.</h1>
            <p className="mt-5 max-w-xl text-base text-blue-50/90 lg:text-lg">
              Manage visitor enrolment, identity verification, host notifications, and printable campus access passes from one modern university dashboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onStartVisitorFlow}
                className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Start visitor flow
              </button>
              <button
                type="button"
                onClick={onViewDashboards}
                className="rounded-xl border border-white/30 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View dashboards
              </button>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/20 bg-slate-950/10 p-5 backdrop-blur-sm">
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="mb-3 flex items-center justify-between text-sm text-blue-50/90">
                <span>Live operations</span>
                <span className="rounded-full bg-emerald-400/20 px-2 py-1 text-xs font-semibold text-emerald-100">Online</span>
              </div>
              <div className="space-y-3">
                {[
                  ['Approved visitors', '24'],
                  ['Pending security checks', '7'],
                  ['Active host alerts', '3'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl bg-white/5 px-3 py-2">
                    <span className="text-sm text-blue-50/80">{label}</span>
                    <span className="text-lg font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {[
          {
            title: 'Fast enrolment',
            icon: UserRound,
            description: 'Collect guest data, identify the target host, and verify purpose of visit in minutes.',
          },
          {
            title: 'Identity checks',
            icon: ShieldCheck,
            description: 'Support NIN, passport, driver’s license, and voter card verification before approval.',
          },
          {
            title: 'Real-time alerts',
            icon: CheckCircle2,
            description: 'Notify staff instantly with on-screen toasts and browser-based notifications.',
          },
        ].map(({ title, icon: Icon, description }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-700">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">System Flow</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">From registration to badge printing</h2>
          </div>
          <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {['Register visitor', 'Capture media', 'Verify NIN', 'Approve + print pass'].map((step, index) => (
            <div key={step} className="rounded-2xl bg-slate-50 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {index + 1}
              </div>
              <p className="text-sm font-semibold text-slate-800">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
