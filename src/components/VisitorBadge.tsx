import { Clock3, MapPin, ShieldCheck, UserRound } from 'lucide-react';
import type { Registration, SecurityRecord } from '../types/vms';

interface VisitorBadgeProps {
  registration: Registration;
  securityRecord?: SecurityRecord;
  photo?: string;
}

export function VisitorBadge({ registration, securityRecord, photo }: VisitorBadgeProps) {
  const validUntil = new Date();
  validUntil.setHours(validUntil.getHours() + 4);

  return (
    <div
      id="printable-visitor-badge"
      className="relative w-full max-w-[440px] overflow-hidden rounded-[30px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white shadow-[0_20px_60px_rgba(15,23,42,0.18)]"
    >
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <ShieldCheck className="h-48 w-48 text-white" />
      </div>

      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-100">Official Visitor Pass</p>
            <p className="mt-1 text-lg font-semibold tracking-wide">Northgate University</p>
          </div>
          <div className="rounded-2xl bg-white/15 p-2.5 ring-1 ring-white/20 backdrop-blur-sm">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>

      <div className="relative px-5 pb-5 pt-4">
        <div className="grid grid-cols-[120px_1fr] gap-4">
          <div className="overflow-hidden rounded-[22px] border border-white/10 bg-slate-100 shadow-inner">
            {photo ? (
              <img src={photo} alt={registration.Name} className="h-[136px] w-[120px] object-cover" />
            ) : (
              <div className="flex h-[136px] w-[120px] items-center justify-center bg-slate-200 text-slate-500">
                <UserRound className="h-10 w-10" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">Visitor</p>
            <h3 className="mt-1 text-2xl font-bold leading-tight text-white">{registration.Name}</h3>
            <p className="mt-2 text-sm text-slate-200">Purpose: {registration.Purpose}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-400/20 px-2.5 py-1 ring-1 ring-emerald-300/40 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              {securityRecord?.Visitor_Status ?? 'Approved'}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-100">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-300">Host</p>
            <p className="mt-1 font-semibold text-white">{registration.Staff_No}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-300">ID</p>
            <p className="mt-1 font-semibold text-white">{securityRecord?.ID_Type ?? 'NIN'} Verified</p>
          </div>
        </div>

        <div className="mt-4 space-y-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-100">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-cyan-300" />
            <span>Issued: {registration.Dated} @ {registration.Vtime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-cyan-300" />
            <span>Valid until: {validUntil.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-4 rounded-[22px] border border-dashed border-cyan-300/40 bg-slate-950/30 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-lg font-black text-slate-900">
              QR
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-[0.18em] text-slate-300">Pass ID</p>
              <p className="mt-1 text-lg font-bold text-white">#{registration.R_id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
