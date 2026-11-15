import { BellRing, CheckCircle2, Clock3, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { AlertToast } from '../components/AlertToast';
import { useAuth } from '../context/AuthContext';
import { useVMS } from '../context/VMSContext';

export function HostDashboard() {
  const { user } = useAuth();
  const { alerts, acknowledgeAlert, registrations, updateRegistrationHostApproval } = useVMS();
  const hostStaffId = user?.Staff_No ?? '';
  const [dismissedAlertIds, setDismissedAlertIds] = useState<number[]>([]);

  const hostAlerts = useMemo(
    () => alerts.filter((alert) => alert.Staff_No === hostStaffId),
    [alerts, hostStaffId],
  );

  const visibleAlert = useMemo(
    () =>
      [...hostAlerts]
        .sort((a, b) => new Date(b.Alert_Date + 'T' + b.Alert_Time).getTime() - new Date(a.Alert_Date + 'T' + a.Alert_Time).getTime())
        .find((alert) => !dismissedAlertIds.includes(alert.Alert_ID)) ?? null,
    [dismissedAlertIds, hostAlerts],
  );

  useEffect(() => {
    if (!visibleAlert || typeof window === 'undefined') return;

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Visitor Arrival', {
        body: visibleAlert.Alert_Message,
        tag: `visitor-alert-${visibleAlert.Alert_ID}`,
      });
    }

    if ('Notification' in window && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
  }, [visibleAlert]);

  const pendingVisitors = registrations.filter((record) => record.Staff_No === hostStaffId);
  const todayVisitors = pendingVisitors.length;
  const acknowledgedAlerts = hostAlerts.filter((alert) => alert.Response_Status === 'Acknowledged').length;

  const dismissAlert = (alertId: number) => {
    setDismissedAlertIds((current) => (current.includes(alertId) ? current : [...current, alertId]));
  };

  const handleHostApproval = (registrationId: number, status: 'Approved' | 'Rejected') => {
    updateRegistrationHostApproval(registrationId, status, hostStaffId);
  };

  const sendWhatsAppMessage = (visitor: { Name: string; Phone: string }) => {
    const number = visitor.Phone.replace(/\D/g, '');
    const message = encodeURIComponent(`Hello ${visitor.Name}, your visit request is being processed. Please wait for security verification.`);
    const whatsappUrl = `https://wa.me/${number}?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Host desk</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Arrival notifications</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
          <BellRing className="h-4 w-4" />
          {hostAlerts.length} live alerts
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Today’s visitors</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{todayVisitors}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Alerts</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{hostAlerts.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Acknowledged</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{acknowledgedAlerts}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Visitor queue</h2>
          <div className="mt-5 space-y-4">
            {pendingVisitors.map((visitor) => (
              <div key={visitor.R_id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{visitor.Name}</p>
                    <p className="text-sm text-slate-500">{visitor.Purpose} • {visitor.Dated}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
                    {visitor.Host_Approval_Status ?? 'Pending'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleHostApproval(visitor.R_id, 'Approved')}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleHostApproval(visitor.R_id, 'Rejected')}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => sendWhatsAppMessage(visitor)}
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700"
                  >
                    WhatsApp
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Recent notices</h2>
          <div className="mt-5 space-y-3">
            {hostAlerts.map((alert) => (
              <div key={alert.Alert_ID} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{alert.Alert_Type}</p>
                    <p className="mt-1 text-sm text-slate-600">{alert.Alert_Message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => acknowledgeAlert(alert.Alert_ID, 'Resolved')}
                    className="rounded-full bg-emerald-100 p-1.5 text-emerald-700"
                    aria-label="Resolve alert"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    {alert.Alert_Date} • {alert.Alert_Time}
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-blue-700">
                    {alert.Response_Status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {visibleAlert && (
        <AlertToast
          alert={visibleAlert}
          onDismiss={() => dismissAlert(visibleAlert.Alert_ID)}
          onAcknowledge={() => {
            acknowledgeAlert(visibleAlert.Alert_ID, 'Acknowledged');
            dismissAlert(visibleAlert.Alert_ID);
          }}
        />
      )}
    </div>
  );
}
