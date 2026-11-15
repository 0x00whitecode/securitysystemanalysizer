import { AlertCircle, CheckCircle2, Clock3, ShieldCheck, UserPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { VisitorBadge } from '../components/VisitorBadge';
import { WebcamCapture } from '../components/WebcamCapture';
import { useVMS } from '../context/VMSContext';
import type { Registration } from '../types/vms';

export function SecurityDashboard() {
  const { registrations, createRegistration, submitSecurityDecision, captures, addCapture, requestStaffApproval, updateRegistrationHostApproval, staff } = useVMS();
  const [search, setSearch] = useState('');
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<number | null>(null);
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [form, setForm] = useState({
    Name: '',
    Phone: '',
    Email: '',
    Sex: 'Female',
    Purpose: 'Official',
    Staff_No: '',
    ID_Type: 'NIN',
    ID_Number: '',
  });
  const [visitorImage, setVisitorImage] = useState<string | null>(null);
  const [captureSuccess, setCaptureSuccess] = useState<{ photo: string; name: string; time: string } | null>(null);
  const [isSummaryHighlighted, setIsSummaryHighlighted] = useState(false);
  const [checklist, setChecklist] = useState({
    idVerified: false,
    purposeConfirmed: false,
    hostContacted: false,
    photoCaptured: false,
  });

  const filtered = useMemo(
    () =>
      registrations.filter((record) =>
        [record.Name, record.Phone, record.Email, record.Staff_No].join(' ').toLowerCase().includes(search.toLowerCase()),
      ),
    [registrations, search],
  );

  const summary = useMemo(
    () => ({
      pending: registrations.filter((record) => record.Host_Approval_Status === 'Pending' || (record.Host_Approval_Status === 'Approved' && !record.Verified)).length,
      approved: registrations.filter((record) => record.Verified === true).length,
      rejected: registrations.filter((record) => record.Verified === false && !!record.Name && record.Host_Approval_Status === 'Rejected').length,
      expired: registrations.filter((record) => record.Host_Approval_Status === 'Expired').length,
    }),
    [registrations],
  );

  const selectedRegistration =
    filtered.find((record) => record.R_id === selectedRegistrationId) ?? filtered[0] ?? null;
  const selectedStaff = staff.find((member) => member.Staff_No === selectedRegistration?.Staff_No) ?? null;
  const badgeReady = Boolean(selectedRegistration && selectedRegistration.Host_Approval_Status === 'Approved' && selectedRegistration.Verified);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      registrations.forEach((record) => {
        if (record.Host_Approval_Status !== 'Pending' || !record.Host_Request_At) return;
        const elapsed = Date.now() - new Date(record.Host_Request_At).getTime();
        if (elapsed > 1000 * 60 * 3) {
          updateRegistrationHostApproval(record.R_id, 'Expired', record.Staff_No);
        }
      });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [registrations, updateRegistrationHostApproval]);

  const handleCaptureSuccess = (photo: string) => {
    setVisitorImage(photo);
    setChecklist((current) => ({ ...current, photoCaptured: true }));
    setCaptureSuccess({
      photo,
      name: form.Name || selectedRegistration?.Name || 'Visitor',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setIsCaptureOpen(false);
  };

  const openSummary = () => {
    setCaptureSuccess(null);
    setIsSummaryHighlighted(true);
    document.getElementById('visitor-summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => setIsSummaryHighlighted(false), 2200);
  };

  const submitVisitor = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.Name || !form.Phone || !form.Email || !form.Staff_No || !form.ID_Number) {
      return;
    }

    const newRegistration: Registration = {
      R_id: Date.now(),
      Name: form.Name,
      Dated: new Date().toISOString().slice(0, 10),
      Vtime: new Date().toTimeString().slice(0, 5),
      Purpose: form.Purpose,
      Staff_No: form.Staff_No,
      Phone: form.Phone,
      Email: form.Email,
      Sex: form.Sex,
      Host_Approval_Status: 'Pending',
      Verified: false,
    };

    createRegistration(newRegistration);

    if (visitorImage) {
      addCapture({
        Capture_ID: Date.now() + 1,
        R_id: newRegistration.R_id,
        Photo_Path: visitorImage,
        Captured_At: new Date().toISOString(),
      });
    }

    setSelectedRegistrationId(newRegistration.R_id);
    setForm({ ...form, Name: '', Phone: '', Email: '', Staff_No: '', ID_Number: '' });
    setVisitorImage(null);
    setChecklist((current) => ({ ...current, photoCaptured: !!visitorImage }));
  };

  const handleRequestStaffApproval = () => {
    if (!selectedRegistration) return;

    const staffMember = staff.find((member) => member.Staff_No === selectedRegistration.Staff_No);
    if (!staffMember) {
      return;
    }

    requestStaffApproval(selectedRegistration.R_id, staffMember.Staff_No);
    setChecklist((current) => ({ ...current, hostContacted: true }));
  };

  const sendWhatsAppToStaff = () => {
    if (!selectedStaff?.Phone_No) return;

    const number = selectedStaff.Phone_No.replace(/\D/g, '');
    if (!number) return;

    const message = encodeURIComponent(
      `Hello ${selectedStaff.Name}, a visitor named ${selectedRegistration?.Name ?? 'this visitor'} is waiting for your approval. Please respond so security can verify access.`,
    );

    window.open(`https://wa.me/${number}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const handleDecision = (status: 'Approved' | 'Rejected') => {
    if (!selectedRegistration || selectedRegistration.Host_Approval_Status !== 'Approved') return;

    const isChecklistReady = Object.values(checklist).every(Boolean);

    submitSecurityDecision({
      R_id: selectedRegistration.R_id,
      Staff_No: 'SEC-001',
      Host_Staff_No: selectedRegistration.Staff_No,
      Visitor_Status: status,
      ID_Type: form.ID_Type,
      ID_Number: form.ID_Number || selectedRegistration.Phone,
      Security_Action:
        status === 'Approved'
          ? isChecklistReady
            ? 'Granted visitor access after full verification'
            : 'Granted visitor access with manual review'
          : 'Rejected invalid credentials',
      Remarks:
        status === 'Approved'
          ? `Checklist complete: ${Object.entries(checklist)
              .filter(([, active]) => active)
              .map(([key]) => key)
              .join(', ') || 'manual review'}`
          : 'Validation did not match the recorded identity details.',
      Alert_Status: 'Sent',
    });
  };


  return (
    <div className="space-y-6 p-4 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Security gatekeeper</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Visitor verification workstation</h1>
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Search visitor name or phone" />
      </div>


      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Pending checks</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{summary.pending}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Approved</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{summary.approved}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Rejected</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{summary.rejected}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={submitVisitor} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-2 text-blue-700">
              <UserPlus className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Visitor enrolment</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
              <input value={form.Name} onChange={(e) => setForm({ ...form, Name: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Phone</span>
              <input value={form.Phone} onChange={(e) => setForm({ ...form, Phone: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input value={form.Email} onChange={(e) => setForm({ ...form, Email: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Sex</span>
              <select value={form.Sex} onChange={(e) => setForm({ ...form, Sex: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option>Female</option>
                <option>Male</option>
                <option>Prefer not to say</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Purpose</span>
              <select value={form.Purpose} onChange={(e) => setForm({ ...form, Purpose: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option>Official</option>
                <option>Personal</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Staff to visit</span>
              <select
                value={form.Staff_No}
                onChange={(e) => setForm({ ...form, Staff_No: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select staff</option>
                {staff.map((member) => (
                  <option key={member.Staff_No} value={member.Staff_No}>
                    {member.Name} ({member.POS})
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">ID Type</span>
              <select value={form.ID_Type} onChange={(e) => setForm({ ...form, ID_Type: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option>NIN</option>
                <option>Passport</option>
                <option>Drivers License</option>
                <option>Voters Card</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">ID Number</span>
              <input value={form.ID_Number} onChange={(e) => setForm({ ...form, ID_Number: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => setIsCaptureOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100">
              <ShieldCheck className="h-4 w-4" />
              Capture media
            </button>
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
              Save registration
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="mb-3 text-sm font-semibold text-blue-900">Verification checklist</p>
            <div className="space-y-2 text-sm text-blue-900">
              {Object.entries(checklist).map(([key, active]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => setChecklist((current) => ({ ...current, [key]: !current[key as keyof typeof current] }))}
                  />
                  <span>{key === 'idVerified' ? 'Identity verified' : key === 'purposeConfirmed' ? 'Purpose confirmed' : key === 'hostContacted' ? 'Host notified' : 'Photo captured and attached'}</span>
                </label>
              ))}
            </div>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Decision centre</h2>
          </div>

          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                No visitors are currently waiting for verification.
              </div>
            )}

            {filtered.slice(0, 5).map((registration) => (
              <button
                type="button"
                key={registration.R_id}
                onClick={() => setSelectedRegistrationId(registration.R_id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${selectedRegistration?.R_id === registration.R_id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-800">{registration.Name}</p>
                    <p className="text-sm text-slate-500">{registration.Purpose} visit • {registration.Phone}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${registration.Host_Approval_Status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : registration.Host_Approval_Status === 'Rejected' ? 'bg-red-100 text-red-800' : registration.Host_Approval_Status === 'Expired' ? 'bg-amber-100 text-amber-800' : 'bg-amber-100 text-amber-800'}`}>
                    {registration.Host_Approval_Status ?? 'Pending'}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  {registration.Dated} • {registration.Vtime}
                </div>
              </button>
            ))}
          </div>

          {selectedRegistration && (
            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Staff approval status</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{selectedRegistration.Host_Approval_Status ?? 'Pending'}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedStaff ? `${selectedStaff.Name} (${selectedStaff.POS})` : 'No staff profile found for this visit.'}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedStaff?.isAvailable === false
                    ? 'Selected staff member is currently offline.'
                    : selectedStaff
                      ? 'Selected staff member is online and available.'
                      : 'No staff profile found for this visit.'}
                </p>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={handleRequestStaffApproval} className="flex-1 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500">
                  Request staff approval
                </button>
                <button type="button" onClick={() => setSelectedRegistrationId(selectedRegistration.R_id)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
                  Retry
                </button>
              </div>

              {selectedStaff && selectedStaff.isAvailable === false && (
                <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  <p>
                    Staff is offline. Use an alternative or retry later. Badge printing remains locked until a valid staff approval is received.
                  </p>
                  <button
                    type="button"
                    onClick={sendWhatsAppToStaff}
                    className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-200"
                  >
                    Send WhatsApp message
                  </button>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => handleDecision('Approved')} disabled={selectedRegistration.Host_Approval_Status !== 'Approved'} className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-white ${selectedRegistration.Host_Approval_Status === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-500' : 'cursor-not-allowed bg-slate-300'}`}>
                  Approve
                </button>
                <button type="button" onClick={() => handleDecision('Rejected')} disabled={selectedRegistration.Host_Approval_Status !== 'Approved'} className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-white ${selectedRegistration.Host_Approval_Status === 'Approved' ? 'bg-red-600 hover:bg-red-500' : 'cursor-not-allowed bg-slate-300'}`}>
                  Reject
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <p>Security action logs are stored locally and can be reviewed from the admin audit panel.</p>
            </div>
          </div>
        </div>
      </div>

      {selectedRegistration && (
        <div
          id="visitor-summary"
          className={`rounded-3xl border bg-white p-5 shadow-sm transition-all duration-500 ${isSummaryHighlighted ? 'border-emerald-400 ring-4 ring-emerald-100' : 'border-slate-200'}`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Printable badge preview</h2>
            <button
              type="button"
              onClick={() => badgeReady && window.print()}
              disabled={!badgeReady}
              className={`rounded-xl px-3 py-2 text-sm font-semibold text-white ${badgeReady ? 'bg-slate-900 hover:bg-slate-800' : 'cursor-not-allowed bg-slate-300'}`}
            >
              {badgeReady ? 'Print badge' : 'Waiting for staff approval'}
            </button>
          </div>
          {!badgeReady && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Badge printing is locked until the host approves this visitor and security completes verification.
            </div>
          )}
          <div className="flex justify-center">
            <VisitorBadge
              registration={selectedRegistration}
              securityRecord={null as never}
              photo={visitorImage ?? captures.find((capture) => capture.R_id === selectedRegistration.R_id)?.Photo_Path}
            />
          </div>
        </div>
      )}

      {captureSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 text-white shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-500/15 p-2 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Capture complete</p>
                <h3 className="mt-1 text-2xl font-semibold">Visitor verified</h3>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 p-2">
              <img src={captureSuccess.photo} alt="Captured visitor" className="h-52 w-full rounded-xl object-cover" />
            </div>

            <div className="mt-4 rounded-2xl bg-slate-800 p-4">
              <p className="text-sm text-slate-300">Name</p>
              <p className="mt-1 text-lg font-semibold text-white">{captureSuccess.name}</p>
              <p className="mt-3 text-sm text-slate-300">Captured at {captureSuccess.time}</p>
            </div>

            <div className="mt-5 flex gap-3">
              <button type="button" onClick={openSummary} className="flex-1 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400">
                View summary
              </button>
              <button type="button" onClick={() => setCaptureSuccess(null)} className="flex-1 rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-100 hover:bg-slate-800">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <WebcamCapture isOpen={isCaptureOpen} onClose={() => setIsCaptureOpen(false)} onCapture={handleCaptureSuccess} />
    </div>
  );
}
