"use client";

import React from 'react';
import Link from 'next/link';

export default function CollegeDashboardPage() {
  return (
    <div className="w-screen h-screen bg-[#EEF2F6] p-3 sm:p-4 flex overflow-hidden font-sans text-slate-800 antialiased selection:bg-emerald-600 selection:text-white">
      {/* Dashboard Shell with Rounded Borders & Clean Perimeter Margin */}
      <div className="w-full h-full bg-[#F8FAFC] rounded-2xl border border-slate-300/80 shadow-sm flex flex-row overflow-hidden">
        
        {/* ========================================================================= */}
        {/* COLUMN 1: LEFT SIDEBAR                                                    */}
        {/* ========================================================================= */}
        <aside className="w-72 min-w-72 h-full bg-[#064E3B] flex flex-col justify-between p-5 border-r border-emerald-950/20 text-white shrink-0 overflow-y-auto z-20">
          <div className="flex flex-col gap-7">
            
            {/* Brand Header */}
            <div className="flex items-center gap-3.5 px-2 pt-1">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner shrink-0 text-[#fec24a]">
                <span className="material-symbols-outlined text-[26px]">school</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-extrabold tracking-tight text-white leading-tight truncate">Apex</span>
                <span className="text-[11px] uppercase font-black tracking-widest text-[#fec24a]">JUNIOR COLLEGE</span>
              </div>
            </div>

            <div className="h-px bg-white/10 w-full" />

            {/* Navigation Menu */}
            <div className="flex flex-col gap-2.5">
              <div className="text-[11px] font-black uppercase tracking-wider text-emerald-200/70 px-2">Navigation</div>
              <nav className="flex flex-col gap-1.5">
                <Link 
                  href="/college/dashboard"
                  className="flex items-center gap-3.5 px-4 py-3 rounded-xl bg-white/15 text-white font-bold border border-white/20 shadow-xs text-sm w-full transition-all"
                >
                  <span className="material-symbols-outlined text-[20px] text-emerald-200">dashboard</span>
                  <span className="truncate">Dashboard</span>
                </Link>

                <Link 
                  href="/college/profile"
                  className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-emerald-100/90 hover:bg-white/10 hover:text-white transition-all text-sm font-semibold w-full"
                >
                  <span className="material-symbols-outlined text-[20px] text-emerald-300/80">account_balance</span>
                  <span className="truncate">College Profile</span>
                </Link>

                <Link 
                  href="/college/dashboard" 
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-emerald-100/90 hover:bg-white/10 hover:text-white transition-all text-sm font-semibold w-full"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="material-symbols-outlined text-[20px] text-emerald-300/80">groups</span>
                    <span className="truncate">Admissions</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#fec24a] text-slate-950 text-[11px] font-black shrink-0 shadow-xs">
                    28 New
                  </span>
                </Link>

                <Link 
                  href="/college/dashboard" 
                  className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-emerald-100/90 hover:bg-white/10 hover:text-white transition-all text-sm font-semibold w-full"
                >
                  <span className="material-symbols-outlined text-[20px] text-emerald-300/80">insights</span>
                  <span className="truncate">Analytics</span>
                </Link>

                <Link 
                  href="#" 
                  className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-emerald-100/90 hover:bg-white/10 hover:text-white transition-all text-sm font-semibold w-full"
                >
                  <span className="material-symbols-outlined text-[20px] text-emerald-300/80">settings</span>
                  <span className="truncate">Settings</span>
                </Link>
              </nav>
            </div>
          </div>

          {/* Sidebar Bottom Footer */}
          <div className="mt-auto flex flex-col gap-3 pt-5 border-t border-white/10 shrink-0">
            <div className="flex items-center gap-3.5 px-3 py-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="w-9 h-9 rounded-full bg-[#004D40] border border-emerald-300/40 flex items-center justify-center text-[#fec24a] font-black text-sm shadow-xs shrink-0">
                VR
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-bold text-white truncate">Dr. V. Rao</span>
                <span className="text-xs text-emerald-200/80 font-medium truncate">Principal & Admin</span>
              </div>
            </div>

            <div className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#fec24a] text-[18px]">calendar_month</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/70 font-medium uppercase tracking-wider">Session</span>
                  <span className="text-xs font-bold text-[#fec24a] leading-tight">2025–2026</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
              </span>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* COLUMN 2: MAIN WORKSPACE CONTAINER                                        */}
        {/* ========================================================================= */}
        <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
          
          {/* Top Header Bar */}
          <header className="w-full h-16 bg-white border-b border-slate-200/90 px-6 sm:px-8 py-3 flex items-center justify-between shrink-0 shadow-2xs gap-4">
            <div className="flex items-center gap-2.5 text-sm font-medium text-slate-500 min-w-0">
              <span className="text-slate-600 font-semibold shrink-0">Apex Admin</span>
              <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">chevron_right</span>
              <span className="font-semibold text-emerald-800 shrink-0">Executive Dashboard</span>
            </div>

            <div className="flex items-center gap-3.5 shrink-0">
              <Link 
                href="/college/profile"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">edit_note</span>
                <span>Edit Profile</span>
              </Link>

              <button className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
                <span className="material-symbols-outlined text-[20px]">help_outline</span>
              </button>

              <button className="relative w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500" />
              </button>

              <div className="h-6 w-px bg-slate-200" />

              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-sm shadow-2xs">
                VR
              </div>
            </div>
          </header>

          {/* Main Dashboard Workspace Content */}
          <main className="flex-1 min-w-0 h-full overflow-y-auto px-6 sm:px-8 py-8 bg-[#F8FAFC] flex flex-col gap-10 scroll-smooth pb-16">
            
            {/* ========================================================================= */}
            {/* 4 HARMONIOUS COLOR-THEMED ANALYTICS CARDS                                 */}
            {/* ========================================================================= */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              
              {/* Card 1: Total Profile Views (Emerald Harmonized Theme) */}
              <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white rounded-2xl p-6 border border-emerald-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all group cursor-pointer flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[26px]">visibility</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 font-bold text-xs border border-emerald-300/60">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span>
                      +18.4%
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-4xl font-black text-emerald-950 tracking-tight leading-tight">28,450</p>
                    <p className="text-sm font-bold text-emerald-800 uppercase tracking-wider mt-1">Total Profile Views</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-emerald-100/80 flex items-center justify-between text-xs text-emerald-700 font-medium">
                  <span>Naaguru student network</span>
                  <span className="font-bold text-emerald-800">Active</span>
                </div>
              </div>

              {/* Card 2: Student Inquiries & Leads (Blue Harmonized Theme) */}
              <div className="bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-white rounded-2xl p-6 border border-blue-200/80 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all group cursor-pointer flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[26px]">groups</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300/60">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      32 New Today
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-4xl font-black text-blue-950 tracking-tight leading-tight">1,420</p>
                    <p className="text-sm font-bold text-blue-800 uppercase tracking-wider mt-1">Admissions & Inquiries</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-blue-100/80 flex items-center justify-between text-xs text-blue-700 font-medium">
                  <span>Parent inquiry pipeline</span>
                  <span className="font-bold text-blue-800">Real-time</span>
                </div>
              </div>

              {/* Card 3: Prospectus Downloads (Amber Harmonized Theme) */}
              <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/30 to-white rounded-2xl p-6 border border-amber-200/80 shadow-xs hover:shadow-lg hover:border-amber-300 transition-all group cursor-pointer flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[26px]">download</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-900 font-bold text-xs border border-amber-300/60">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span>
                      +24.1%
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-4xl font-black text-amber-950 tracking-tight leading-tight">3,890</p>
                    <p className="text-sm font-bold text-amber-900 uppercase tracking-wider mt-1">Prospectus Downloads</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-amber-100/80 flex items-center justify-between text-xs text-amber-800 font-medium">
                  <span>Brochure v2025-26</span>
                  <span className="font-bold text-amber-900">PDF active</span>
                </div>
              </div>

              {/* Card 4: Confirmed Seat Enrollments (Indigo Harmonized Theme) */}
              <div className="bg-gradient-to-br from-indigo-50/90 via-purple-50/30 to-white rounded-2xl p-6 border border-indigo-200/80 shadow-xs hover:shadow-lg hover:border-indigo-300 transition-all group cursor-pointer flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-xl bg-indigo-700 text-white flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined text-[26px]">verified</span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs border border-emerald-300/60">
                      94% Filled
                    </span>
                  </div>

                  <div className="mt-5">
                    <p className="text-4xl font-black text-indigo-950 tracking-tight leading-tight">480 / 510</p>
                    <p className="text-sm font-bold text-indigo-900 uppercase tracking-wider mt-1">Seat Occupancy</p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-indigo-100/80 flex items-center justify-between text-xs text-indigo-800 font-medium">
                  <span>30 seats remaining</span>
                  <span className="font-bold text-indigo-900">MPC & BiPC</span>
                </div>
              </div>

            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
