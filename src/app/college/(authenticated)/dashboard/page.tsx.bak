export default function CollegeDashboardPage() {
  return (
    <>
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-deep via-[#005144] to-[#087f6c] p-7 text-white shadow-md">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit text-xs font-semibold text-secondary-container">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Campus Command Center • Academic Session 2025–26
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">Apex Junior College Command Hub</h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Real-time campus pulse, admissions progress, faculty schedules, and departmental metrics across MPC, BiPC, MEC &amp; CEC.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="px-4 py-2.5 rounded-xl bg-white text-primary font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">edit_document</span>
              Edit Profile Studio
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">analytics</span>
              View Analytics
            </button>
            <button className="px-4 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container font-bold text-xs hover:brightness-105 transition-all flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">campaign</span>
              Post Notice
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Admissions */}
        <div className="bg-surface-card rounded-2xl p-5 border border-border-subtle shadow-sm card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-muted uppercase tracking-wider">Admissions Filled</span>
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-on-surface">528</span>
              <span className="text-xs font-medium text-neutral-muted">/ 600 Seats</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: '88%' }}></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border-subtle">
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[16px]">trending_up</span> 88% Target
            </span>
            <span className="text-neutral-muted">72 Seats Left</span>
          </div>
        </div>

        {/* 2. Active Inquiries */}
        <div className="bg-surface-card rounded-2xl p-5 border border-border-subtle shadow-sm card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-muted uppercase tracking-wider">Active Inquiries</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">contact_support</span>
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-on-surface">184</span>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">+28 Today</span>
            </div>
            <p className="text-xs text-neutral-muted mt-2">Counselor callbacks scheduled: 42</p>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border-subtle">
            <button className="text-primary font-bold hover:underline flex items-center gap-1">
              Open Pipeline <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
            <span className="text-neutral-muted">67% Hot Leads</span>
          </div>
        </div>

        {/* 3. Attendance */}
        <div className="bg-surface-card rounded-2xl p-5 border border-border-subtle shadow-sm card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-muted uppercase tracking-wider">Today&apos;s Attendance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-on-surface">96.4%</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Normal</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96.4%' }}></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border-subtle">
            <span className="text-neutral-muted">1,368 / 1,420 Present</span>
            <span className="text-rose-500 font-semibold">52 Absent</span>
          </div>
        </div>

        {/* 4. Fee Collections */}
        <div className="bg-surface-card rounded-2xl p-5 border border-border-subtle shadow-sm card-hover flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-muted uppercase tracking-wider">Fee Collections</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="my-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-on-surface">₹1.84 Cr</span>
              <span className="text-xs font-medium text-neutral-muted">of ₹2.20 Cr</span>
            </div>
            <div className="w-full bg-surface-container h-2 rounded-full mt-2.5 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: '83.6%' }}></div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs pt-2 border-t border-border-subtle">
            <span className="text-indigo-600 font-bold">83.6% Realized</span>
            <span className="text-neutral-muted">₹36L Pending</span>
          </div>
        </div>
      </div>

      {/* Main Operational Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Streams Capacity */}
          <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-on-surface">Stream-wise Seat Allotment Status</h2>
                <p className="text-xs text-neutral-muted">Intermediate 1st &amp; 2nd Year Batch Allocations</p>
              </div>
              <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Manage Seats <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-surface-canvas border border-border-subtle flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-primary">MPC</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">95% Full</span>
                </div>
                <p className="text-[11px] text-neutral-muted">IIT-JEE Focus Batch</p>
                <div className="flex items-baseline justify-between text-xs pt-2 border-t border-border-subtle">
                  <span className="font-bold text-on-surface">228 / 240</span>
                  <span className="text-rose-600 font-semibold">12 Left</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-canvas border border-border-subtle flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-primary">BiPC</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">90% Full</span>
                </div>
                <p className="text-[11px] text-neutral-muted">NEET Special Batch</p>
                <div className="flex items-baseline justify-between text-xs pt-2 border-t border-border-subtle">
                  <span className="font-bold text-on-surface">144 / 160</span>
                  <span className="text-rose-600 font-semibold">16 Left</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-canvas border border-border-subtle flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-primary">MEC</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">81% Full</span>
                </div>
                <p className="text-[11px] text-neutral-muted">CA Foundation Prep</p>
                <div className="flex items-baseline justify-between text-xs pt-2 border-t border-border-subtle">
                  <span className="font-bold text-on-surface">98 / 120</span>
                  <span className="text-amber-700 font-semibold">22 Left</span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-canvas border border-border-subtle flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-primary">CEC</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary-light text-primary font-bold">72% Full</span>
                </div>
                <p className="text-[11px] text-neutral-muted">Civils / CLAT Track</p>
                <div className="flex items-baseline justify-between text-xs pt-2 border-t border-border-subtle">
                  <span className="font-bold text-on-surface">58 / 80</span>
                  <span className="text-neutral-muted font-semibold">22 Left</span>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Tracker */}
          <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">schedule</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-on-surface">Today&apos;s Academic Session Tracker</h2>
                  <p className="text-xs text-neutral-muted">Current Period • 10:30 AM - 11:30 AM</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> In Progress
              </span>
            </div>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-neutral-muted font-semibold uppercase">
                  <th className="pb-3">Stream / Section</th>
                  <th className="pb-3">Subject</th>
                  <th className="pb-3">Faculty In-Charge</th>
                  <th className="pb-3">Room / Lab</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                <tr>
                  <td className="py-3 font-bold text-on-surface">MPC - Section A1 (Jr)</td>
                  <td className="py-3 text-primary font-semibold">Physics (Rotational Dynamics)</td>
                  <td className="py-3 text-neutral-muted">Dr. K. Srinivas Rao (IITM)</td>
                  <td className="py-3 font-medium">Room 204 (Smart Lab)</td>
                  <td className="py-3 text-right"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">Ongoing</span></td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-on-surface">BiPC - Section B1 (Sr)</td>
                  <td className="py-3 text-primary font-semibold">Botany (Plant Physiology)</td>
                  <td className="py-3 text-neutral-muted">Mrs. Sujatha Reddy</td>
                  <td className="py-3 font-medium">Bio Research Lab</td>
                  <td className="py-3 text-right"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">Ongoing</span></td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-on-surface">MEC - Section C (Jr)</td>
                  <td className="py-3 text-primary font-semibold">Economics (National Income)</td>
                  <td className="py-3 text-neutral-muted">Mr. V. Ramanathan</td>
                  <td className="py-3 font-medium">Room 102</td>
                  <td className="py-3 text-right"><span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">Ongoing</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col gap-4">
            <h2 className="text-base font-bold text-on-surface">Campus Calendar</h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-canvas border-l-4 border-primary">
                <div className="flex flex-col items-center min-w-10 text-center">
                  <span className="text-xs font-bold text-neutral-muted">SEP</span>
                  <span className="text-lg font-black text-primary">14</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-on-surface">JEE Advanced Mock Test #3</h3>
                  <p className="text-[11px] text-neutral-muted">All MPC Senior Batches</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-canvas border-l-4 border-secondary-container">
                <div className="flex flex-col items-center min-w-10 text-center">
                  <span className="text-xs font-bold text-neutral-muted">SEP</span>
                  <span className="text-lg font-black text-[#7c5800]">18</span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-on-surface">Parent-Teacher Orientation</h3>
                  <p className="text-[11px] text-neutral-muted">Auditorium Hall • 10 AM</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-primary-light to-surface-container border border-primary/20 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
              <span>Apex Admissions Hotline</span>
            </div>
            <p className="text-xs text-neutral-muted leading-relaxed">
              WhatsApp Integration active on <strong>+91 98765 43210</strong>.
            </p>
            <button className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold transition-colors">
              Send Parent Broadcast
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
