import { CalendarClock, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useVMS } from '../context/VMSContext';

export function VisitorPortal() {
  const { staff, createRegistration } = useVMS();
  const [form, setForm] = useState({
    Name: '',
    Phone: '',
    Email: '',
    Purpose: 'Official',
    Staff_No: staff[0]?.Staff_No ?? '',
    Sex: 'Female',
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.Name || !form.Phone || !form.Email || !form.Staff_No) {
      return;
    }

    createRegistration({
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
    });

    setForm({ Name: '', Phone: '', Email: '', Purpose: 'Official', Staff_No: staff[0]?.Staff_No ?? '', Sex: 'Female' });
  };

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Visitor portal</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Book your visit</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Full name</span>
              <input value={form.Name} onChange={(event) => setForm({ ...form, Name: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Phone</span>
              <input value={form.Phone} onChange={(event) => setForm({ ...form, Phone: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input value={form.Email} onChange={(event) => setForm({ ...form, Email: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Sex</span>
              <select value={form.Sex} onChange={(event) => setForm({ ...form, Sex: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option>Female</option>
                <option>Male</option>
                <option>Prefer not to say</option>
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Staff to visit</span>
              <select
                value={form.Staff_No}
                onChange={(event) => setForm({ ...form, Staff_No: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select a staff member</option>
                {staff.map((member) => (
                  <option key={member.Staff_No} value={member.Staff_No}>
                    {member.Name} ({member.POS})
                  </option>
                ))}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-700">Purpose</span>
              <select value={form.Purpose} onChange={(event) => setForm({ ...form, Purpose: event.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option>Official</option>
                <option>Personal</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Check staff availability before submitting your request.
            </div>
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
              Submit request
            </button>
          </div>
        </form>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
              <UserRound className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Available staff</h2>
          </div>

          <div className="space-y-3">
            {staff.map((member) => (
              <button
                type="button"
                key={member.Staff_No}
                onClick={() => setForm((current) => ({ ...current, Staff_No: member.Staff_No }))}
                className={`w-full rounded-2xl border p-3 text-left transition ${form.Staff_No === member.Staff_No ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800">{member.Name}</p>
                    <p className="text-xs text-slate-500">{member.POS}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
                    {member.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
