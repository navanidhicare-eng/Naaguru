"use client";

import React from "react";

export default function LeadsPage() {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Admissions &amp; Lead Management Pipeline</h1>
          <p className="text-xs text-neutral-muted mt-1">Track student inquiries, counselor follow-ups, fee confirmation, and batch allotments.</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary-dark transition-colors flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">add</span>
          + Add New Lead
        </button>
      </div>

      {/* Leads Table */}
      <div className="bg-surface-card rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-surface-canvas border-b border-border-subtle text-neutral-muted font-semibold uppercase">
            <tr>
              <th className="p-4">Student Name</th>
              <th className="p-4">Stream / Course</th>
              <th className="p-4">10th GPA</th>
              <th className="p-4">Contact Phone</th>
              <th className="p-4">Assigned Counselor</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            <tr className="hover:bg-surface-canvas">
              <td className="p-4 font-bold text-on-surface">Rohan Sharma</td>
              <td className="p-4"><span className="px-2 py-0.5 rounded bg-primary-light text-primary font-bold">MPC (IIT-JEE)</span></td>
              <td className="p-4 font-bold text-emerald-700">9.8 GPA</td>
              <td className="p-4 text-neutral-muted">+91 98490 12345</td>
              <td className="p-4 font-medium">Mrs. Anitha Rao</td>
              <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">Callback Req</span></td>
              <td className="p-4 text-right">
                <button className="p-1 text-primary hover:bg-primary/10 rounded">
                  <span className="material-symbols-outlined text-[18px]">call</span>
                </button>
              </td>
            </tr>
            <tr className="hover:bg-surface-canvas">
              <td className="p-4 font-bold text-on-surface">Ananya Kulkarni</td>
              <td className="p-4"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">BiPC (NEET)</span></td>
              <td className="p-4 font-bold text-emerald-700">10.0 GPA</td>
              <td className="p-4 text-neutral-muted">+91 94401 67890</td>
              <td className="p-4 font-medium">Mr. Rajesh Kumar</td>
              <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Seat Confirmed</span></td>
              <td className="p-4 text-right">
                <button className="p-1 text-primary hover:bg-primary/10 rounded">
                  <span className="material-symbols-outlined text-[18px]">description</span>
                </button>
              </td>
            </tr>
            <tr className="hover:bg-surface-canvas">
              <td className="p-4 font-bold text-on-surface">Varun Reddy</td>
              <td className="p-4"><span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">MEC (CA Track)</span></td>
              <td className="p-4 font-bold text-emerald-700">9.4 GPA</td>
              <td className="p-4 text-neutral-muted">+91 99887 54321</td>
              <td className="p-4 font-medium">Mrs. Anitha Rao</td>
              <td className="p-4"><span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">Campus Visit</span></td>
              <td className="p-4 text-right">
                <button className="p-1 text-primary hover:bg-primary/10 rounded">
                  <span className="material-symbols-outlined text-[18px]">event</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
