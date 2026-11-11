import { BellRing, Check, X } from 'lucide-react';
import type { Alert } from '../types/vms';

interface AlertToastProps {
  alert: Alert;
  onDismiss: () => void;
  onAcknowledge: () => void;
}

export function AlertToast({ alert, onDismiss, onAcknowledge }: AlertToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-4 text-white shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-blue-500/20 p-2 text-blue-300">
          <BellRing className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Visitor Alert</p>
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss alert"
              className="rounded-lg p-1 text-slate-300 hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-100">{alert.Alert_Message}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
            <span className="rounded-full bg-blue-500/20 px-2 py-1 text-blue-200">{alert.Alert_Type}</span>
            <span>{alert.Alert_Time}</span>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={onAcknowledge}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              <Check className="h-3.5 w-3.5" />
              Acknowledge
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
