"use client";

import React, { useState } from 'react';
import Link from 'next/link';

type TabKey = 
  | 'media' 
  | 'facilities' 
  | 'faculty' 
  | 'courses' 
  | 'routine' 
  | 'location' 
  | 'testimonials' 
  | 'campus-life' 
  | 'awards';

export default function CollegeProfilePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('media');
  const [isFocusedView, setIsFocusedView] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2500);
  };

  const isSectionVisible = (tabKey: TabKey) => {
    if (!isFocusedView) return true;
    return activeTab === tabKey;
  };

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'media', label: 'Media & Tours', icon: 'photo_library' },
    { key: 'facilities', label: 'Facilities', icon: 'apartment' },
    { key: 'faculty', label: 'Faculty Mentors', icon: 'school' },
    { key: 'courses', label: 'Course Streams', icon: 'layers' },
    { key: 'routine', label: 'Routine & Food', icon: 'schedule' },
    { key: 'location', label: 'Location & Map', icon: 'location_on' },
    { key: 'testimonials', label: 'Testimonials', icon: 'star' },
    { key: 'campus-life', label: 'Campus Life & Fests', icon: 'celebration' },
    { key: 'awards', label: 'Awards', icon: 'military_tech' },
  ];

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
                  href="/college/profile"
                  className="flex items-center gap-3.5 px-4 py-3 rounded-xl bg-white/15 text-white font-bold border border-white/20 shadow-xs text-sm w-full transition-all"
                >
                  <span className="material-symbols-outlined text-[20px] text-emerald-200">account_balance</span>
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

          {/* Sidebar Bottom Footer: Admin Profile & Academic Session */}
          <div className="mt-auto flex flex-col gap-3 pt-5 border-t border-white/10 shrink-0">
            {/* Admin Profile Block */}
            <div className="flex items-center gap-3.5 px-3 py-2.5 bg-white/5 rounded-xl border border-white/10">
              <div className="w-9 h-9 rounded-full bg-[#004D40] border border-emerald-300/40 flex items-center justify-center text-[#fec24a] font-black text-sm shadow-xs shrink-0">
                VR
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-bold text-white truncate">Dr. V. Rao</span>
                <span className="text-xs text-emerald-200/80 font-medium truncate">Principal & Admin</span>
              </div>
            </div>

            {/* Academic Session Badge */}
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
              <span className="font-semibold text-emerald-800 shrink-0">College Profile</span>
              <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0">chevron_right</span>
              <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 shrink-0">
                Setup Studio
              </span>
            </div>

            <div className="flex items-center gap-3.5 shrink-0">
              <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-900 text-sm font-semibold border border-amber-200">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                Draft Mode
              </div>

              <button className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
                <span className="material-symbols-outlined text-[20px]">help_outline</span>
              </button>

              <button className="relative w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500" />
              </button>

              <button 
                onClick={() => notify('Profile configuration draft saved successfully!')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Save Profile</span>
              </button>

              <div className="h-6 w-px bg-slate-200" />

              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-sm shadow-2xs">
                AD
              </div>
            </div>
          </header>

          {/* Sub-Tabs Navigation Bar */}
          <div className="w-full bg-white border-b border-slate-200/90 px-6 sm:px-8 py-2.5 flex items-center justify-between gap-4 shrink-0 overflow-x-auto scrollbar-none shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key);
                      notify(`Switched tab to: ${tab.label}`);
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/90 shadow-2xs' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* View Switcher Segmented Control */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/90 shrink-0 gap-0.5">
              <button 
                onClick={() => {
                  setIsFocusedView(true);
                  notify('Focused View: Viewing current tab only');
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isFocusedView 
                    ? 'bg-white text-emerald-900 shadow-2xs border border-slate-200/80 font-bold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className={`material-symbols-outlined text-[17px] ${isFocusedView ? 'text-emerald-700' : 'text-slate-400'}`}>tab</span>
                <span>Focused View</span>
              </button>

              <button 
                onClick={() => {
                  setIsFocusedView(false);
                  notify('Show All: Viewing all sections expanded');
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  !isFocusedView 
                    ? 'bg-white text-emerald-900 shadow-2xs border border-slate-200/80 font-bold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <span className={`material-symbols-outlined text-[17px] ${!isFocusedView ? 'text-emerald-700' : 'text-slate-400'}`}>view_agenda</span>
                <span>Show All</span>
              </button>
            </div>
          </div>

          {/* Main Content Scroll Area */}
          <main className="flex-1 min-w-0 h-full overflow-y-auto px-6 sm:px-8 py-6 bg-[#F8FAFC] flex flex-col gap-8 scroll-smooth pb-16">
            {/* ========================================================================= */}
            {/* SECTION: MEDIA & TOURS                                                    */}
            {/* ========================================================================= */}
            {isSectionVisible('media') && (
                <section className="flex flex-col gap-8">
                  {/* Section Title Bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 border border-emerald-200/80">
                        <span className="material-symbols-outlined text-[22px]">photo_library</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Campus Photos & Video Tours</h2>
                        <p className="text-sm text-slate-500">High-resolution photography and 360° virtual lab walkthroughs</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => notify('+ Add Media modal opened')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-sm font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                      <span>Add Media</span>
                    </button>
                  </div>

                  {/* 4 Cards Per Row Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {/* Media Card 1 */}
                    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
                      <div className="h-52 relative overflow-hidden bg-slate-900">
                        <img 
                          src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80" 
                          alt="Academic Wing & Quadrangle"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold border border-white/10 shadow-xs">
                          Campus Block
                        </span>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <p className="text-sm font-bold leading-snug drop-shadow-sm truncate">Academic Wing</p>
                          <p className="text-[11px] text-emerald-300 font-medium leading-tight truncate">4K exterior tour</p>
                        </div>
                      </div>
                      <div className="px-3.5 py-3 flex items-center justify-between bg-white text-xs font-semibold text-slate-600 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 text-emerald-800 text-[11px]">
                          <span className="material-symbols-outlined text-[16px]">photo_camera</span> 12 Photos
                        </span>
                        <button onClick={() => notify('Editing Academic Wing photos')} className="hover:text-emerald-800 text-[11px] font-bold text-slate-700 cursor-pointer">
                          Edit →
                        </button>
                      </div>
                    </div>

                    {/* Media Card 2 */}
                    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
                      <div className="h-44 relative overflow-hidden bg-slate-900">
                        <img 
                          src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80" 
                          alt="Digital Reference & Study Hall"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold border border-white/10 shadow-xs">
                          Library
                        </span>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <p className="text-sm font-bold leading-snug drop-shadow-sm truncate">Digital Study Hall</p>
                          <p className="text-[11px] text-emerald-300 font-medium leading-tight truncate">Silent reading zone</p>
                        </div>
                      </div>
                      <div className="px-3.5 py-3 flex items-center justify-between bg-white text-xs font-semibold text-slate-600 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 text-emerald-800 text-[11px]">
                          <span className="material-symbols-outlined text-[16px]">local_library</span> 8 Photos
                        </span>
                        <button onClick={() => notify('Editing Library photos')} className="hover:text-emerald-800 text-[11px] font-bold text-slate-700 cursor-pointer">
                          Edit →
                        </button>
                      </div>
                    </div>

                    {/* Media Card 3 */}
                    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
                      <div className="h-44 relative overflow-hidden bg-slate-900">
                        <img 
                          src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80" 
                          alt="Advanced Physics & AI Lab"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold border border-white/10 shadow-xs">
                          Labs
                        </span>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <p className="text-sm font-bold leading-snug drop-shadow-sm truncate">Physics & AI Lab</p>
                          <p className="text-[11px] text-emerald-300 font-medium leading-tight truncate">Hands-on desk</p>
                        </div>
                      </div>
                      <div className="px-3.5 py-3 flex items-center justify-between bg-white text-xs font-semibold text-slate-600 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 text-emerald-800 text-[11px]">
                          <span className="material-symbols-outlined text-[16px]">science</span> 15 Photos
                        </span>
                        <button onClick={() => notify('Editing Lab photos')} className="hover:text-emerald-800 text-[11px] font-bold text-slate-700 cursor-pointer">
                          Edit →
                        </button>
                      </div>
                    </div>

                    {/* Media Card 4 */}
                    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
                      <div className="h-44 relative overflow-hidden bg-slate-900">
                        <img 
                          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80" 
                          alt="Sports Arena & Olympic Grounds"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold border border-white/10 shadow-xs">
                          Sports
                        </span>
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <p className="text-sm font-bold leading-snug drop-shadow-sm truncate">Sports & Athletic Complex</p>
                          <p className="text-[11px] text-emerald-300 font-medium leading-tight truncate">Courts & arena</p>
                        </div>
                      </div>
                      <div className="px-3.5 py-3 flex items-center justify-between bg-white text-xs font-semibold text-slate-600 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 text-emerald-800 text-[11px]">
                          <span className="material-symbols-outlined text-[16px]">sports_cricket</span> 10 Photos
                        </span>
                        <button onClick={() => notify('Editing Sports photos')} className="hover:text-emerald-800 text-[11px] font-bold text-slate-700 cursor-pointer">
                          Edit →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section A: Top National Rankers */}
                  <div className="flex flex-col gap-5 pt-4">
                    <div className="flex items-center justify-between border-t border-slate-200/90 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-800 border border-amber-200/80">
                          <span className="material-symbols-outlined text-[20px]">military_tech</span>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900">Top National Rankers (2024–2025)</h2>
                          <p className="text-xs text-slate-500">Hall of fame selections in IIT-JEE Advanced & NEET UG</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => notify('+ Add Ranker modal opened')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        <span>Add Ranker</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Ranker 1 */}
                      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group">
                        <button 
                          onClick={() => notify('Editing K. Sai Pranav details')}
                          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-emerald-800 transition-colors p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <div className="flex items-center gap-3.5">
                          <img 
                            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80" 
                            alt="K. Sai Pranav"
                            className="w-12 h-12 rounded-xl object-cover border-2 border-amber-300 shadow-2xs shrink-0"
                          />
                          <div className="min-w-0 pr-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200/80">
                              🏆 AIR 42
                            </span>
                            <h3 className="text-xs font-bold text-slate-900 mt-1 truncate">K. Sai Pranav</h3>
                            <p className="text-[11px] text-slate-500 font-medium truncate">IIT-JEE Adv 2024</p>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600 text-[11px]">MPC Super-60</span>
                          <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[10px]">
                            IIT Bombay
                          </span>
                        </div>
                      </div>

                      {/* Ranker 2 */}
                      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group">
                        <button 
                          onClick={() => notify('Editing M. Sneha Latha details')}
                          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-emerald-800 transition-colors p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <div className="flex items-center gap-3.5">
                          <img 
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" 
                            alt="M. Sneha Latha"
                            className="w-12 h-12 rounded-xl object-cover border-2 border-amber-300 shadow-2xs shrink-0"
                          />
                          <div className="min-w-0 pr-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200/80">
                              🩺 AIR 89
                            </span>
                            <h3 className="text-xs font-bold text-slate-900 mt-1 truncate">M. Sneha Latha</h3>
                            <p className="text-[11px] text-slate-500 font-medium truncate">NEET UG 2024</p>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600 text-[11px]">BiPC Achievers</span>
                          <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[10px]">
                            AIIMS Delhi
                          </span>
                        </div>
                      </div>

                      {/* Ranker 3 */}
                      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group">
                        <button 
                          onClick={() => notify('Editing R. Vikram Reddy details')}
                          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-emerald-800 transition-colors p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <div className="flex items-center gap-3.5">
                          <img 
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" 
                            alt="R. Vikram Reddy"
                            className="w-12 h-12 rounded-xl object-cover border-2 border-amber-300 shadow-2xs shrink-0"
                          />
                          <div className="min-w-0 pr-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200/80">
                              ⭐ AIR 156
                            </span>
                            <h3 className="text-xs font-bold text-slate-900 mt-1 truncate">R. Vikram Reddy</h3>
                            <p className="text-[11px] text-slate-500 font-medium truncate">IIT-JEE Mains</p>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600 text-[11px]">MPC Super-60</span>
                          <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[10px]">
                            NIT Warangal
                          </span>
                        </div>
                      </div>

                      {/* Ranker 4 */}
                      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group">
                        <button 
                          onClick={() => notify('Editing A. Divya Teja details')}
                          className="absolute top-3.5 right-3.5 text-slate-400 hover:text-emerald-800 transition-colors p-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>
                        <div className="flex items-center gap-3.5">
                          <img 
                            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80" 
                            alt="A. Divya Teja"
                            className="w-12 h-12 rounded-xl object-cover border-2 border-amber-300 shadow-2xs shrink-0"
                          />
                          <div className="min-w-0 pr-4">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-200/80">
                              ⚡ AIR 204
                            </span>
                            <h3 className="text-xs font-bold text-slate-900 mt-1 truncate">A. Divya Teja</h3>
                            <p className="text-[11px] text-slate-500 font-medium truncate">IIT-JEE Adv 2024</p>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-600 text-[11px]">MPC Super-60</span>
                          <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[10px]">
                            IIT Madras
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section B: Hostel & Dining Summary */}
                  <div className="flex flex-col gap-5 pt-4">
                    <div className="flex items-center justify-between border-t border-slate-200/90 pt-6">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 border border-emerald-200/80">
                          <span className="material-symbols-outlined text-[20px]">bed</span>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900">Hostel & Dining Summary</h2>
                          <p className="text-xs text-slate-500">2-Column overview of residential comforts and nutritious meal plans</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => notify('Edit Hostel & Dining modal opened')}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:border-emerald-300 shadow-2xs transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                        <span>Manage Hostel</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Hostel Amenities Card */}
                      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-emerald-700">hotel</span> 
                            <span>Residential Amenities</span>
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/80">
                            AC & Non-AC
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="material-symbols-outlined text-emerald-700 text-[18px]">security</span>
                            <span className="font-semibold text-slate-700">24/7 Security & CCTV</span>
                          </div>
                          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="material-symbols-outlined text-emerald-700 text-[18px]">ac_unit</span>
                            <span className="font-semibold text-slate-700">AC Suites (3-Sharing)</span>
                          </div>
                          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="material-symbols-outlined text-emerald-700 text-[18px]">desk</span>
                            <span className="font-semibold text-slate-700">Individual Study Desk</span>
                          </div>
                          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="material-symbols-outlined text-emerald-700 text-[18px]">wifi</span>
                            <span className="font-semibold text-slate-700">High-Speed Wi-Fi</span>
                          </div>
                          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="material-symbols-outlined text-emerald-700 text-[18px]">local_laundry_service</span>
                            <span className="font-semibold text-slate-700">Laundry & Linen Service</span>
                          </div>
                          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="material-symbols-outlined text-emerald-700 text-[18px]">shower</span>
                            <span className="font-semibold text-slate-700">Solar Hot Water</span>
                          </div>
                        </div>
                      </div>

                      {/* Today's Mess Menu Card */}
                      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-amber-600">restaurant</span> 
                            <span>Today's Mess Menu</span>
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[10px] font-bold border border-amber-200/80">
                            FSSAI Certified
                          </span>
                        </div>

                        <div className="space-y-2.5 text-xs">
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                            <span className="font-bold text-amber-900 min-w-20">Breakfast:</span>
                            <span className="text-slate-700 font-medium">Steamed Idli, Mysuru Bonda, Coconut Chutney & Fresh Milk</span>
                          </div>
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                            <span className="font-bold text-amber-900 min-w-20">Lunch:</span>
                            <span className="text-slate-700 font-medium">Phulkas, Dal Tadka, Shahi Paneer, Jeera Rice & Sweet Curd</span>
                          </div>
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                            <span className="font-bold text-amber-900 min-w-20">Snacks:</span>
                            <span className="text-slate-700 font-medium">Butter Sweet Corn Chaat & Cardamom Tea</span>
                          </div>
                          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                            <span className="font-bold text-amber-900 min-w-20">Dinner:</span>
                            <span className="text-slate-700 font-medium">Mixed Veg Curry, Sambar Rice, Papad & Season Fruit Bowl</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ========================================================================= */}
              {/* SECTION: FACILITIES                                                       */}
              {/* ========================================================================= */}
              {isSectionVisible('facilities') && (
                <section className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 border border-emerald-200/80">
                        <span className="material-symbols-outlined text-[20px]">apartment</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">College Facilities & Infrastructure</h2>
                        <p className="text-xs text-slate-500">Hostel suites, dining nutrition, sports complex and STEM labs</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => notify('+ Add Facility modal opened')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span>Add Facility</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center text-white shrink-0 shadow-xs">
                        <span className="material-symbols-outlined text-3xl">biotech</span>
                      </div>
                      <div className="flex flex-col justify-between flex-1 space-y-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-bold text-slate-900">STEM Laboratories</h3>
                            <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>Active
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">Equipped workstations for Physics, Chemistry and CS algorithms.</p>
                        </div>
                        <button 
                          onClick={() => notify('Editing STEM Laboratories details')}
                          className="text-xs text-emerald-800 font-bold hover:underline self-start cursor-pointer"
                        >
                          Edit Facility Details →
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-700 to-teal-950 flex items-center justify-center text-white shrink-0 shadow-xs">
                        <span className="material-symbols-outlined text-3xl">hotel</span>
                      </div>
                      <div className="flex flex-col justify-between flex-1 space-y-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-sm font-bold text-slate-900">Premium AC Hostels</h3>
                            <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              <span className="material-symbols-outlined text-[14px]">check_circle</span>Active
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">Attached washrooms, dedicated study cubicles & 24/7 security.</p>
                        </div>
                        <button 
                          onClick={() => notify('Editing Hostel details')}
                          className="text-xs text-emerald-800 font-bold hover:underline self-start cursor-pointer"
                        >
                          Edit Facility Details →
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ========================================================================= */}
              {/* SECTION: FACULTY MENTORS                                                  */}
              {/* ========================================================================= */}
              {isSectionVisible('faculty') && (
                <section className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 border border-emerald-200/80">
                        <span className="material-symbols-outlined text-[20px]">school</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Distinguished Faculty Mentors</h2>
                        <p className="text-xs text-slate-500">Senior IIT-JEE & NEET medical coaching specialists</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => notify('+ Add Faculty modal opened')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span>Add Faculty</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col items-center text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-[#064E3B] text-white flex items-center justify-center font-bold text-xl mb-1 shadow-xs border-2 border-emerald-300/40">
                        KR
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Dr. K. Radhakrishnan</h3>
                        <span className="inline-block text-[11px] text-amber-900 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80 mt-1">
                          IIT-JEE Physics • 22+ Yrs
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed pt-1">Ex-IIT Madras alumni. Mentored 450+ IITians into top ranks.</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col items-center text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-xl mb-1 shadow-xs border-2 border-teal-300/40">
                        SV
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Prof. Sunitha Varma</h3>
                        <span className="inline-block text-[11px] text-amber-900 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80 mt-1">
                          NEET Botany & Zoo • 18+ Yrs
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed pt-1">Guided 320+ MBBS aspirants to AIIMS New Delhi.</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col items-center text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-emerald-900 text-white flex items-center justify-center font-bold text-xl mb-1 shadow-xs border-2 border-emerald-300/40">
                        NR
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Dr. V. Narayana Rao</h3>
                        <span className="inline-block text-[11px] text-amber-900 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200/80 mt-1">
                          Dean & Chemistry • 25+ Yrs
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed pt-1">Author of 4 competitive handbooks. State Topper coach.</p>
                    </div>
                  </div>
                </section>
              )}

              {/* ========================================================================= */}
              {/* SECTION: COURSE STREAMS                                                   */}
              {/* ========================================================================= */}
              {isSectionVisible('courses') && (
                <section className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 border border-emerald-200/80">
                        <span className="material-symbols-outlined text-[20px]">layers</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Academic Streams & Batches</h2>
                        <p className="text-xs text-slate-500">2-Year intermediate tracks with integrated coaching</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => notify('+ Add Stream modal opened')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span>Add Stream</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
                      <div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200/80">Engineering</span>
                        <h3 className="text-lg font-bold text-slate-900 mt-3">MPC Super-60</h3>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">IIT-JEE Advanced Focus</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-600">120 Seats</span>
                        <button onClick={() => notify('Edit MPC Super-60')} className="text-emerald-800 hover:underline font-bold cursor-pointer">Edit →</button>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
                      <div>
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 font-bold text-[11px] border border-amber-200/80">Medical</span>
                        <h3 className="text-lg font-bold text-slate-900 mt-3">BiPC Achievers</h3>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">NEET Medical Focus</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-600">90 Seats</span>
                        <button onClick={() => notify('Edit BiPC Achievers')} className="text-emerald-800 hover:underline font-bold cursor-pointer">Edit →</button>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
                      <div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] border border-emerald-200/80">Commerce</span>
                        <h3 className="text-lg font-bold text-slate-900 mt-3">MEC CA-Foundation</h3>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Corporate Finance & Law</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-600">60 Seats</span>
                        <button onClick={() => notify('Edit MEC CA-Foundation')} className="text-emerald-800 hover:underline font-bold cursor-pointer">Edit →</button>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
                      <div>
                        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 font-bold text-[11px] border border-amber-200/80">Civils Track</span>
                        <h3 className="text-lg font-bold text-slate-900 mt-3">CEC Civils Track</h3>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">UPSC & Law Entrance</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-600">45 Seats</span>
                        <button onClick={() => notify('Edit CEC Civils Track')} className="text-emerald-800 hover:underline font-bold cursor-pointer">Edit →</button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ========================================================================= */}
              {/* SECTION: ROUTINE & FOOD                                                   */}
              {/* ========================================================================= */}
              {isSectionVisible('routine') && (
                <section className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 border border-emerald-200/80">
                        <span className="material-symbols-outlined text-[20px]">schedule</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Daily Routine & Hostel Mess Menu</h2>
                        <p className="text-xs text-slate-500">16-hour structured schedule & FSSAI-certified nutritious diet</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => notify('Edit Routine modal opened')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:border-emerald-300 shadow-2xs transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                      <span>Edit Routine</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                      <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Study & Campus Hours</h3>
                      <div className="text-xs space-y-2">
                        <div className="flex justify-between p-3 bg-emerald-50/70 rounded-xl border border-emerald-100"><span className="font-bold text-emerald-900">05:30 - 06:30 AM</span><span className="font-semibold text-slate-700">Yoga & Fitness</span></div>
                        <div className="flex justify-between p-3 bg-emerald-50/70 rounded-xl border border-emerald-100"><span className="font-bold text-emerald-900">08:30 - 01:15 PM</span><span className="font-semibold text-slate-700">Core Lectures (IIT/NEET)</span></div>
                        <div className="flex justify-between p-3 bg-emerald-50/70 rounded-xl border border-emerald-100"><span className="font-bold text-emerald-900">02:00 - 05:00 PM</span><span className="font-semibold text-slate-700">DPP & Doubt Sessions</span></div>
                        <div className="flex justify-between p-3 bg-emerald-50/70 rounded-xl border border-emerald-100"><span className="font-bold text-emerald-900">06:00 - 08:30 PM</span><span className="font-semibold text-slate-700">Supervised Study Hours</span></div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
                      <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Healthy Dining Schedule</h3>
                      <div className="text-xs space-y-2">
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100"><strong className="text-amber-950">Breakfast:</strong> Idli, Poha, Fresh Cow Milk</div>
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100"><strong className="text-amber-950">Lunch:</strong> Dal Tadka, Paneer Masala, Curd, Rice</div>
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100"><strong className="text-amber-950">Snacks:</strong> Sweet Corn Chaat & Masala Chai</div>
                        <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100"><strong className="text-amber-950">Dinner:</strong> Phulkas, Mixed Veg, Jeera Rice</div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ========================================================================= */}
              {/* SECTION: LOCATION & MAP                                                   */}
              {/* ========================================================================= */}
              {isSectionVisible('location') && (
                <section className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 border border-emerald-200/80">
                        <span className="material-symbols-outlined text-[20px]">location_on</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Location & Campus Map Coordinates</h2>
                        <p className="text-xs text-slate-500">Configure visitor gate addresses and interactive GPS maps</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => notify('Edit Location modal opened')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:border-emerald-300 shadow-2xs transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit_location</span>
                      <span>Edit Location</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Main Campus Address</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200/80">Primary</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 leading-relaxed">
                          Survey No. 142/A, Outer Ring Road Service Road, Gandipet / Gachibowli, Hyderabad – 500075.
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          <strong className="text-emerald-800">Landmark:</strong> Opposite State Biodiversity Forest Park (5 mins from ORR Exit 18).
                        </p>
                      </div>
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-emerald-700">call</span> +91 98480 12345</span>
                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-emerald-700">mail</span> info@apexjrcollege.edu.in</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Geo Navigation</span>
                        <span className="text-xs font-mono font-bold text-slate-500">17.3850° N, 78.4867° E</span>
                      </div>
                      <div className="h-36 rounded-xl bg-gradient-to-br from-emerald-800 to-slate-900 border border-slate-200 flex items-center justify-center text-white relative overflow-hidden">
                        <div className="text-center space-y-1">
                          <span className="material-symbols-outlined text-3xl text-amber-400">pin_drop</span>
                          <p className="text-xs font-bold">Apex Junior College Campus</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => notify('Opening Driving Directions')} className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center shadow-xs cursor-pointer">Get Driving Directions</button>
                        <button onClick={() => notify('Coordinates copied to clipboard')} className="px-4 py-2 rounded-xl border border-slate-200/90 bg-white text-xs text-slate-600 hover:text-emerald-800 font-bold cursor-pointer">Copy Coordinates</button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ========================================================================= */}
              {/* SECTION: TESTIMONIALS                                                     */}
              {/* ========================================================================= */}
              {isSectionVisible('testimonials') && (
                <section className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 border border-emerald-200/80">
                        <span className="material-symbols-outlined text-[20px]">reviews</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Student & Parent Testimonials</h2>
                        <p className="text-xs text-slate-500">Verified reviews from state rankers and alumni guardians</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => notify('+ Add Review modal opened')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">add_comment</span>
                      <span>Add Review</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex text-amber-500 gap-0.5 mb-2">
                          <span className="material-symbols-outlined text-[18px]">star</span>
                          <span className="material-symbols-outlined text-[18px]">star</span>
                          <span className="material-symbols-outlined text-[18px]">star</span>
                          <span className="material-symbols-outlined text-[18px]">star</span>
                          <span className="material-symbols-outlined text-[18px]">star</span>
                        </div>
                        <p className="text-xs text-slate-600 italic leading-relaxed">“The rigorous study hours and personal faculty mentorship guided my son to IIT Bombay with AIR 42.”</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-900">Dr. M. Venkateshwar Rao</p>
                        <p className="text-[11px] text-amber-800 font-bold">Parent of K. Sai Pranav (IIT-B)</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex text-amber-500 gap-0.5 mb-2">
                          <span className="material-symbols-outlined text-[18px]">star</span>
                          <span className="material-symbols-outlined text-[18px]">star</span>
                          <span className="material-symbols-outlined text-[18px]">star</span>
                          <span className="material-symbols-outlined text-[18px]">star</span>
                          <span className="material-symbols-outlined text-[18px]">star</span>
                        </div>
                        <p className="text-xs text-slate-600 italic leading-relaxed">“NCERT daily drills and simulated NEET tests were game changers for my AIIMS qualification.”</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-900">M. Sneha Latha</p>
                        <p className="text-[11px] text-amber-800 font-bold">NEET AIR 89 • AIIMS New Delhi</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex text-amber-500 gap-0.5 mb-2">
                          <span className="material-symbols-outlined text-[18px]">star</span>
                          <span className="material-symbols-outlined text-[18px]">star</span>
                          <span className="material-symbols-outlined text-[18px]">star</span>
                          <span className="material-symbols-outlined text-[18px]">star</span>
                          <span className="material-symbols-outlined text-[18px]">star</span>
                        </div>
                        <p className="text-xs text-slate-600 italic leading-relaxed">“Exceptional campus discipline, healthy hostel food and transparent mobile updates for parents.”</p>
                      </div>
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-900">Smt. Anuradha</p>
                        <p className="text-[11px] text-amber-800 font-bold">Parent of T. Rajesh (State 1st)</p>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ========================================================================= */}
              {/* SECTION: CAMPUS LIFE & FESTS                                              */}
              {/* ========================================================================= */}
              {isSectionVisible('campus-life') && (
                <section className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 border border-emerald-200/80">
                        <span className="material-symbols-outlined text-[20px]">celebration</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Campus Life, Cultural Activities & Fests</h2>
                        <p className="text-xs text-slate-500">Annual day fests, inter-collegiate arts festivals and clubs</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => notify('+ Add Fest modal opened')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span>Add Fest</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white shrink-0 shadow-xs">
                        <span className="material-symbols-outlined text-3xl">celebration</span>
                      </div>
                      <div className="flex flex-col justify-between flex-1 space-y-1">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 font-bold text-[10px] border border-amber-200/80">Annual Fiesta</span>
                          <h3 className="text-sm font-bold text-slate-900 mt-1">Sanskriti - Inter-College Cultural Gala</h3>
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">Classical dance fusions, rock bands and student excellence awards.</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-800">1,500+ Student Participants</span>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shrink-0 shadow-xs">
                        <span className="material-symbols-outlined text-3xl">music_note</span>
                      </div>
                      <div className="flex flex-col justify-between flex-1 space-y-1">
                        <div>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 font-bold text-[10px] border border-amber-200/80">Music & Arts</span>
                          <h3 className="text-sm font-bold text-slate-900 mt-1">Umang - Youth Rock & Symphony Fest</h3>
                          <p className="text-xs text-slate-500 leading-relaxed mt-0.5">Acoustic rhythms, student choir and guitar solo competitions.</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-800">16 College Bands Competing</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* ========================================================================= */}
              {/* SECTION: AWARDS & ACCREDITATIONS                                          */}
              {/* ========================================================================= */}
              {isSectionVisible('awards') && (
                <section className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-800 border border-emerald-200/80">
                        <span className="material-symbols-outlined text-[20px]">military_tech</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Institutional Awards & Recognitions</h2>
                        <p className="text-xs text-slate-500">Government affiliations, quality certifications and rank citations</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => notify('+ Add Award modal opened')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span>Add Award</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1 border border-amber-200/80">
                          <span className="material-symbols-outlined text-[12px]">workspace_premium</span> State Rank #1
                        </span>
                        <span className="text-xs font-bold text-slate-500">2024</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Best Intermediate College</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">Conferred by Telangana State Education Excellence Council.</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1 border border-amber-200/80">
                          <span className="material-symbols-outlined text-[12px]">star</span> National Honor
                        </span>
                        <span className="text-xs font-bold text-slate-500">2023</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">Outstanding STEM Mentorship</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">Recognized for record 100+ selections into IITs and AIIMS.</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold flex items-center gap-1 border border-emerald-200/80">
                          <span className="material-symbols-outlined text-[12px]">verified</span> Affiliated
                        </span>
                        <span className="text-xs font-bold text-slate-500">BIE</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">100% Academic Pass Trophy</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">Official state intermediate board commendation for toppers.</p>
                    </div>
                  </div>
                </section>
              )}
          </main>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-xl text-xs font-bold flex items-center gap-2 transition-all duration-300 z-50 border border-slate-700">
          <span className="material-symbols-outlined text-[#fec24a] text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
