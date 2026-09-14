"use client";

import React from "react";

export default function SettingsPage() {
  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Portal &amp; Institution Settings</h1>
          <p className="text-xs text-neutral-muted mt-1">Configure campus locations, academic sessions, WhatsApp automated bot, and staff permissions.</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm hover:bg-primary-dark transition-colors flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">save</span>
          Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-bold text-on-surface">Institution Details</h2>
          <div className="flex flex-col gap-3 text-xs">
            <div>
              <label className="font-bold text-neutral-muted">College Name</label>
              <input type="text" defaultValue="Apex Junior College" className="w-full mt-1 p-2 rounded-lg border border-border-input bg-surface-canvas"/>
            </div>
            <div>
              <label className="font-bold text-neutral-muted">Affiliation Code</label>
              <input type="text" defaultValue="TS-BIE-HYD-500081" className="w-full mt-1 p-2 rounded-lg border border-border-input bg-surface-canvas"/>
            </div>
            <div>
              <label className="font-bold text-neutral-muted">Main Campus City</label>
              <input type="text" defaultValue="Hyderabad, Telangana" className="w-full mt-1 p-2 rounded-lg border border-border-input bg-surface-canvas"/>
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col gap-4">
          <h2 className="text-base font-bold text-on-surface">WhatsApp &amp; Notifications</h2>
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-canvas border border-border-subtle">
              <div>
                <p className="font-bold text-on-surface">WhatsApp Automated Lead Responder</p>
                <p className="text-neutral-muted text-[11px]">Send prospectus automatically on student WhatsApp inquiry.</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary w-4 h-4"/>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-canvas border border-border-subtle">
              <div>
                <p className="font-bold text-on-surface">Daily Attendance SMS to Parents</p>
                <p className="text-neutral-muted text-[11px]">Auto trigger SMS at 10:00 AM for absent students.</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary w-4 h-4"/>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
