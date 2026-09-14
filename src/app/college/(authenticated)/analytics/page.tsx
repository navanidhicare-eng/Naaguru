"use client";

import React from "react";

export default function AnalyticsPage() {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Admissions &amp; Campus Traffic Analytics</h1>
          <p className="text-xs text-neutral-muted mt-1">Feeder school patterns, GPA distributions, and lead conversion trends.</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-white border border-border-subtle shadow-sm text-xs font-bold hover:bg-surface-canvas transition-all flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-primary">download</span>
          Export Report (.PDF)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feeder Schools */}
        <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-bold text-on-surface">Top Feeder High Schools (Hyderabad &amp; RR Dist)</h2>
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Hyderabad Public School (Begumpet)</span>
                <span className="text-primary">84 Inquiries (32 Enrolled)</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "85%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Delhi Public School (Nacharam)</span>
                <span className="text-primary">68 Inquiries (28 Enrolled)</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "70%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>Bharatiya Vidya Bhavan</span>
                <span className="text-primary">54 Inquiries (21 Enrolled)</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: "55%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* 10th Marks Distribution */}
        <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-bold text-on-surface">10th Class GPA Distribution of Applicants</h2>
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>9.5 – 10.0 GPA (Scholarship Eligibility)</span>
                <span className="text-emerald-700">48% of applicants</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: "48%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>8.5 – 9.4 GPA</span>
                <span className="text-indigo-700">38% of applicants</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: "38%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span>7.5 – 8.4 GPA</span>
                <span className="text-amber-700">14% of applicants</span>
              </div>
              <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: "14%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
