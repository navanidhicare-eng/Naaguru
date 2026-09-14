"use client";

import React, { useState } from "react";

export default function CollegeProfilePage() {
  const [activeTab, setActiveTab] = useState("media");

  return (
    <>
      {/* Profile Header Hero Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-card p-6 rounded-2xl border border-border-subtle shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-deep via-primary to-primary-container text-secondary-container flex items-center justify-center shadow-md shrink-0">
            <span className="material-symbols-outlined text-[34px]">account_balance</span>
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-black text-on-surface tracking-tight">Apex Junior College - Profile Studio</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                TSBIE Affiliated (TS-HYD-500081)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200">
                ⭐ NAAC Grade &apos;A+&apos;
              </span>
            </div>
            <p className="text-xs text-neutral-muted mt-1">
              Master Profile Manager • Knowledge City Road, Madhapur, Hyderabad • Integrated IIT-JEE, NEET &amp; CA Coaching
            </p>
          </div>
        </div>

        {/* Action Tools */}
        <div className="flex items-center gap-2.5">
          <button className="px-3.5 py-2 rounded-xl bg-surface-canvas hover:bg-slate-100 border border-border-subtle text-xs font-bold text-on-surface flex items-center gap-1.5 transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-primary">share</span>
            Share Public URL
          </button>
          <button className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
            Publish All Changes
          </button>
        </div>
      </div>

      {/* 7 HORIZONTAL TAB SWITCHER (Top Navigation) */}
      <div className="bg-surface-card p-2 rounded-2xl border border-border-subtle shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {[
            { id: "media", icon: "photo_library", label: "1. Media & Tours" },
            { id: "streams", icon: "menu_book", label: "2. Streams & Batches" },
            { id: "halloffame", icon: "workspace_premium", label: "3. Hall of Fame" },
            { id: "hostel", icon: "hotel", label: "4. Hostel & Living" },
            { id: "routine", icon: "restaurant", label: "5. Daily Routine & Food" },
            { id: "faculty", icon: "badge", label: "6. Faculty & Mentors" },
            { id: "testimonials", icon: "verified", label: "7. Testimonials & Trust" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-surface-container-low text-primary shadow-sm"
                  : "text-neutral-muted hover:bg-surface-canvas"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* WORKSPACE 2-COLUMN GRID (Left: 7-Tab Modules / Right: Live Sync Rail) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

        {/* LEFT WORKSPACE COLUMN (8 Cols) */}
        <div className="xl:col-span-8 flex flex-col gap-6">

          {/* TAB 1: MEDIA & TOURS */}
          {activeTab === "media" && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-on-surface">Campus Photo Gallery &amp; Banners</h2>
                    <p className="text-xs text-neutral-muted">High resolution campus imagery displayed in the student mobile app</p>
                  </div>
                  <button className="px-3.5 py-1.5 rounded-xl bg-primary text-white hover:bg-primary-dark text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                    + Add New Photo
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="rounded-xl overflow-hidden border border-border-subtle bg-surface-canvas flex flex-col card-hover">
                    <div className="h-36 bg-gradient-to-tr from-primary-deep to-primary flex items-center justify-center text-white relative">
                      <span className="material-symbols-outlined text-[44px] opacity-90">account_balance</span>
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white">Main Entrance</span>
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-md text-[9px] text-white">1920x1080</span>
                    </div>
                    <div className="p-3.5 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-on-surface">Administrative Tower</h4>
                        <p className="text-[10px] text-neutral-muted">Front campus facade</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1 rounded text-neutral-muted hover:text-primary"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                        <button className="p-1 rounded text-neutral-muted hover:text-rose-600"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-border-subtle bg-surface-canvas flex flex-col card-hover">
                    <div className="h-36 bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white relative">
                      <span className="material-symbols-outlined text-[44px] opacity-90">science</span>
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white">Laboratories</span>
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-md text-[9px] text-white">4K UHD</span>
                    </div>
                    <div className="p-3.5 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-on-surface">Robotics &amp; Physics Lab</h4>
                        <p className="text-[10px] text-neutral-muted">Equipment zone</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1 rounded text-neutral-muted hover:text-primary"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                        <button className="p-1 rounded text-neutral-muted hover:text-rose-600"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-border-subtle bg-surface-canvas flex flex-col card-hover">
                    <div className="h-36 bg-gradient-to-tr from-amber-700 to-amber-500 flex items-center justify-center text-white relative">
                      <span className="material-symbols-outlined text-[44px] opacity-90">local_library</span>
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-white">Digital Library</span>
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-white/20 backdrop-blur-md text-[9px] text-white">1920x1080</span>
                    </div>
                    <div className="p-3.5 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-on-surface">Central Reading Hall</h4>
                        <p className="text-[10px] text-neutral-muted">Reference division</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="p-1 rounded text-neutral-muted hover:text-primary"><span className="material-symbols-outlined text-[16px]">edit</span></button>
                        <button className="p-1 rounded text-neutral-muted hover:text-rose-600"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 360 Tour */}
              <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-on-surface">360° Interactive Campus Virtual Walkthrough</h2>
                    <p className="text-xs text-neutral-muted">Matterport 3D Tour or YouTube 360° Drone link</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    3D Tour Active
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-neutral-muted text-[18px]">360</span>
                    <input type="text" defaultValue="https://matterport.com/discover/space/apex-junior-college-hyderabad" className="w-full bg-surface-canvas text-xs pl-9 pr-3 py-2.5 rounded-xl border border-border-input focus:outline-none focus:border-primary font-mono text-neutral-muted"/>
                  </div>
                  <button className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors shrink-0 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    Update Tour Link
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STREAMS & BATCHES */}
          {activeTab === "streams" && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-on-surface">Offered Intermediate Streams &amp; Elite Batches</h2>
                    <p className="text-xs text-neutral-muted">Manage intake, annual fee structure, and competitive exam tracks</p>
                  </div>
                  <button className="px-3.5 py-1.5 rounded-xl bg-primary text-white hover:bg-primary-dark text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                    + Add New Stream
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-primary/20 bg-primary-light/30 flex flex-col gap-3 card-hover">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-primary text-white font-black text-xs">MPC Stream</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Open</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-on-surface">Mathematics, Physics, Chemistry</h3>
                      <p className="text-xs text-neutral-muted mt-0.5">Integrated IIT-JEE Main + Advanced, BITSAT &amp; EAPCET Coaching.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-primary/10">
                      <div><span className="text-neutral-muted">Intake:</span> <strong className="text-on-surface">240 Seats (4 Batches)</strong></div>
                      <div><span className="text-neutral-muted">Annual Fee:</span> <strong className="text-primary font-bold">₹1,10,000 / yr</strong></div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-50/40 flex flex-col gap-3 card-hover">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-emerald-700 text-white font-black text-xs">BiPC Stream</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Open</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-on-surface">Biology, Physics, Chemistry</h3>
                      <p className="text-xs text-neutral-muted mt-0.5">Integrated NEET (UG) &amp; AIIMS Medical training with daily anatomy labs.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-emerald-500/10">
                      <div><span className="text-neutral-muted">Intake:</span> <strong className="text-on-surface">180 Seats (3 Batches)</strong></div>
                      <div><span className="text-neutral-muted">Annual Fee:</span> <strong className="text-emerald-800 font-bold">₹1,15,000 / yr</strong></div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-amber-500/20 bg-amber-50/40 flex flex-col gap-3 card-hover">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-amber-600 text-white font-black text-xs">MEC Stream</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">Filling Fast</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-on-surface">Mathematics, Economics, Commerce</h3>
                      <p className="text-xs text-neutral-muted mt-0.5">Integrated CA-Foundation &amp; CMA coaching by Chartered Accountants.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-amber-500/10">
                      <div><span className="text-neutral-muted">Intake:</span> <strong className="text-on-surface">120 Seats (2 Batches)</strong></div>
                      <div><span className="text-neutral-muted">Annual Fee:</span> <strong className="text-amber-700 font-bold">₹85,000 / yr</strong></div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-300 bg-surface-canvas flex flex-col gap-3 card-hover">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-700 text-white font-black text-xs">CEC Stream</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px]">Open</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-on-surface">Civics, Economics, Commerce</h3>
                      <p className="text-xs text-neutral-muted mt-0.5">Civil Services (UPSC) &amp; CLAT Law Foundation track.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200">
                      <div><span className="text-neutral-muted">Intake:</span> <strong className="text-on-surface">60 Seats (1 Batch)</strong></div>
                      <div><span className="text-neutral-muted">Annual Fee:</span> <strong className="text-slate-800 font-bold">₹75,000 / yr</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HALL OF FAME */}
          {activeTab === "halloffame" && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-on-surface">Hall of Fame - Top National Rankers</h2>
                    <p className="text-xs text-neutral-muted">Display stellar academic achievements, All India Ranks, and college allotments</p>
                  </div>
                  <button className="px-3.5 py-1.5 rounded-xl bg-primary text-white hover:bg-primary-dark text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">military_tech</span>
                    + Add New Ranker
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl border border-amber-400/30 bg-gradient-to-b from-amber-50/50 to-white flex flex-col gap-3 card-hover shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black text-base flex items-center justify-center shadow-md">AS</div>
                      <div>
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-extrabold">AIR 42</span>
                        <h3 className="font-bold text-sm text-on-surface mt-1">Ananya Sharma</h3>
                        <p className="text-[11px] text-neutral-muted">JEE Advanced 2024</p>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-xs">
                      <span className="text-neutral-muted block text-[10px]">Allotted College</span>
                      <strong className="text-primary font-bold">IIT Bombay (CSE)</strong>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-emerald-400/30 bg-gradient-to-b from-emerald-50/50 to-white flex flex-col gap-3 card-hover shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-base flex items-center justify-center shadow-md">KV</div>
                      <div>
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-extrabold">AIR 18</span>
                        <h3 className="font-bold text-sm text-on-surface mt-1">K. Varun Reddy</h3>
                        <p className="text-[11px] text-neutral-muted">NEET (UG) 2024</p>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-xs">
                      <span className="text-neutral-muted block text-[10px]">Allotted College</span>
                      <strong className="text-emerald-800 font-bold">AIIMS New Delhi (MBBS)</strong>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-indigo-400/30 bg-gradient-to-b from-indigo-50/50 to-white flex flex-col gap-3 card-hover shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md">PS</div>
                      <div>
                        <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-extrabold">AIR 08</span>
                        <h3 className="font-bold text-sm text-on-surface mt-1">Pooja Sundaram</h3>
                        <p className="text-[11px] text-neutral-muted">CA Foundation 2024</p>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-surface-canvas border border-border-subtle text-xs">
                      <span className="text-neutral-muted block text-[10px]">Allotted College</span>
                      <strong className="text-indigo-800 font-bold">National Top 10 Merit</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HOSTEL & LIVING */}
          {activeTab === "hostel" && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-on-surface">Hostel Amenities &amp; Residential Life</h2>
                    <p className="text-xs text-neutral-muted">AC/Non-AC Rooms, Wi-Fi, 24/7 Security, In-House Doctor &amp; Laundry</p>
                  </div>
                  <button className="px-3.5 py-1.5 rounded-xl bg-primary text-white hover:bg-primary-dark text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">add_home</span>
                    + Add New Amenity
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-border-subtle bg-surface-canvas flex flex-col gap-2 card-hover">
                    <span className="material-symbols-outlined text-primary text-2xl">ac_unit</span>
                    <h3 className="font-bold text-xs">AC / Non-AC Rooms</h3>
                    <p className="text-[11px] text-neutral-muted">2 &amp; 3 sharing with attached bath &amp; study desks.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border-subtle bg-surface-canvas flex flex-col gap-2 card-hover">
                    <span className="material-symbols-outlined text-emerald-800 text-2xl">security</span>
                    <h3 className="font-bold text-xs">24/7 Biometric Security</h3>
                    <p className="text-[11px] text-neutral-muted">Wardens, 128 CCTV cameras, RFID access.</p>
                  </div>
                  <div className="p-4 rounded-xl border border-border-subtle bg-surface-canvas flex flex-col gap-2 card-hover">
                    <span className="material-symbols-outlined text-indigo-800 text-2xl">wifi</span>
                    <h3 className="font-bold text-xs">Gigabit Wi-Fi</h3>
                    <p className="text-[11px] text-neutral-muted">Fiber broadband in study halls for lectures.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DAILY ROUTINE & FOOD */}
          {activeTab === "routine" && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col gap-4">
                <h2 className="text-base font-bold text-on-surface">Campus Academic Routine &amp; Mess Menu</h2>
                <div className="flex flex-col divide-y divide-border-subtle text-xs">
                  <div className="py-2.5 flex items-center justify-between"><span className="font-bold text-primary w-40">06:00 AM – 07:00 AM</span><span>Morning Fitness &amp; Yoga</span></div>
                  <div className="py-2.5 flex items-center justify-between"><span className="font-bold text-amber-600 w-40">07:30 AM – 08:30 AM</span><span>Nutritious South Indian Breakfast</span></div>
                  <div className="py-2.5 flex items-center justify-between"><span className="font-bold text-primary w-40">08:30 AM – 11:30 AM</span><span>Core Lectures (Physics / Chemistry / Maths)</span></div>
                  <div className="py-2.5 flex items-center justify-between"><span className="font-bold text-emerald-600 w-40">11:30 AM – 01:30 PM</span><span>Practical Laboratory Sessions</span></div>
                  <div className="py-2.5 flex items-center justify-between"><span className="font-bold text-amber-600 w-40">01:30 PM – 02:15 PM</span><span>Hot Lunch Buffet</span></div>
                  <div className="py-2.5 flex items-center justify-between"><span className="font-bold text-primary w-40">02:15 PM – 05:00 PM</span><span>Daily Practice Tests &amp; Doubt Clearing</span></div>
                  <div className="py-2.5 flex items-center justify-between"><span className="font-bold text-indigo-600 w-40">05:00 PM – 06:00 PM</span><span>Sports Recreation &amp; Milk</span></div>
                  <div className="py-2.5 flex items-center justify-between"><span className="font-bold text-amber-600 w-40">08:30 PM – 09:15 PM</span><span>Dinner &amp; Bedtime Milk</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FACULTY & MENTORS */}
          {activeTab === "faculty" && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-on-surface">Faculty &amp; Subject Mentors</h2>
                    <p className="text-xs text-neutral-muted">Ex-IITians, AIIMS Doctors &amp; Senior HODs</p>
                  </div>
                  <button className="px-3.5 py-1.5 rounded-xl bg-primary text-white hover:bg-primary-dark text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">person_add</span>
                    + Add New Faculty
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border-subtle bg-surface-canvas flex items-start gap-3.5 card-hover">
                    <div className="w-12 h-12 rounded-xl bg-primary text-white font-black text-base flex items-center justify-center shrink-0">KR</div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <h3 className="font-bold text-xs text-on-surface">Prof. R. Krishna Rao</h3>
                      <span className="text-[11px] text-neutral-muted">Physics HOD • Ex-IIT Madras</span>
                      <p className="text-[11px] text-emerald-800 font-semibold mt-1">22+ Yrs JEE Advanced Experience</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border-subtle bg-surface-canvas flex items-start gap-3.5 card-hover">
                    <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white font-black text-base flex items-center justify-center shrink-0">SL</div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <h3 className="font-bold text-xs text-on-surface">Dr. Sunita Lakshmi</h3>
                      <span className="text-[11px] text-neutral-muted">Zoology Dean • AIIMS Mentor</span>
                      <p className="text-[11px] text-emerald-800 font-semibold mt-1">18+ Yrs NEET UG Experience</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border-subtle bg-surface-canvas flex items-start gap-3.5 card-hover">
                    <div className="w-12 h-12 rounded-xl bg-amber-600 text-white font-black text-base flex items-center justify-center shrink-0">VN</div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <h3 className="font-bold text-xs text-on-surface">V. Narayana Murthy</h3>
                      <span className="text-[11px] text-neutral-muted">Maths Specialist • IIT Roorkee</span>
                      <p className="text-[11px] text-amber-800 font-semibold mt-1">15+ Yrs Olympiad Experience</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border-subtle bg-surface-canvas flex items-start gap-3.5 card-hover">
                    <div className="w-12 h-12 rounded-xl bg-indigo-700 text-white font-black text-base flex items-center justify-center shrink-0">MB</div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <h3 className="font-bold text-xs text-on-surface">Dr. Meera Banerjee</h3>
                      <span className="text-[11px] text-neutral-muted">Organic Chemistry Head • Ph.D OU</span>
                      <p className="text-[11px] text-indigo-800 font-semibold mt-1">16+ Yrs JEE Experience</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: TESTIMONIALS & TRUST */}
          {activeTab === "testimonials" && (
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-surface-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col gap-4">
                <h2 className="text-base font-bold text-on-surface">Accreditations &amp; Verified Reviews</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border-subtle bg-surface-canvas flex flex-col gap-2 card-hover">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-500 font-bold text-xs">★★★★★ 5.0</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Verified Parent</span>
                    </div>
                    <p className="text-xs text-neutral-muted italic">&quot;Exceptional mentorship by Physics faculty. My son secured AIR 42 in JEE Advanced.&quot;</p>
                    <strong className="font-bold text-xs text-on-surface block mt-1">K. Ramakrishna Rao</strong>
                  </div>

                  <div className="p-4 rounded-xl border border-border-subtle bg-surface-canvas flex flex-col gap-2 card-hover">
                    <div className="flex items-center justify-between">
                      <span className="text-amber-500 font-bold text-xs">★★★★★ 5.0</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Alumnus</span>
                    </div>
                    <p className="text-xs text-neutral-muted italic">&quot;The daily NCERT line-by-line test series at Apex gave me rank 18 in NEET.&quot;</p>
                    <strong className="font-bold text-xs text-on-surface block mt-1">K. Varun Reddy (AIIMS)</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT LIVE SYNC RAIL (4 Cols) */}
        <div className="xl:col-span-4 flex flex-col gap-6 sticky top-20">
          {/* Profile Strength */}
          <div className="bg-surface-card rounded-2xl p-5 border border-border-subtle shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-muted uppercase tracking-wider">Profile Strength</span>
              <span className="text-sm font-black text-primary">100% Complete</span>
            </div>
            <div className="w-full h-2.5 bg-surface-canvas rounded-full overflow-hidden border border-border-subtle">
              <div className="h-full bg-gradient-to-r from-primary via-primary-container to-emerald-500 rounded-full" style={{ width: "100%" }}></div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold"><span className="material-symbols-outlined text-emerald-600 text-[15px]">check_circle</span> 1. Media &amp; Tours</div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold"><span className="material-symbols-outlined text-emerald-600 text-[15px]">check_circle</span> 2. Streams (4)</div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold"><span className="material-symbols-outlined text-emerald-600 text-[15px]">check_circle</span> 3. Hall of Fame</div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold"><span className="material-symbols-outlined text-emerald-600 text-[15px]">check_circle</span> 4. Hostel Living</div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold"><span className="material-symbols-outlined text-emerald-600 text-[15px]">check_circle</span> 5. Daily Routine</div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold"><span className="material-symbols-outlined text-emerald-600 text-[15px]">check_circle</span> 6. Faculty (4)</div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold col-span-2"><span className="material-symbols-outlined text-emerald-600 text-[15px]">check_circle</span> 7. Testimonials &amp; Trust</div>
            </div>
          </div>

          {/* Live App Preview */}
          <div className="w-full max-w-[320px] bg-slate-950 p-3 rounded-[38px] shadow-2xl border-4 border-slate-700 text-white flex flex-col gap-2.5 mx-auto">
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mt-1 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
            </div>
            <div className="bg-surface-card text-on-surface rounded-3xl overflow-hidden flex flex-col h-[480px] shadow-inner text-xs">
              <div className="bg-primary-deep text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary-container">account_balance</span>
                  <span className="font-extrabold text-xs">Apex Junior College</span>
                </div>
                <span className="material-symbols-outlined text-[16px]">share</span>
              </div>
              <div className="overflow-y-auto flex-1 p-3 flex flex-col gap-3">
                <div className="p-2 rounded-xl bg-primary-light text-primary text-[11px] font-bold">
                  📱 Live Preview: Media &amp; Tours
                </div>
                <div className="rounded-xl overflow-hidden bg-gradient-to-tr from-primary to-primary-container text-white p-3 flex flex-col gap-1 shadow-sm">
                  <span className="text-[9px] font-bold text-secondary-container">TSBIE Approved Campus</span>
                  <h4 className="font-black text-sm">Admissions Open 2025–26</h4>
                  <p className="text-[10px] text-white/90">IIT-JEE • NEET • CA-Foundation</p>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[11px]">Offered Streams:</span>
                  <div className="flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded bg-primary text-white text-[9px] font-bold">MPC (240)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-700 text-white text-[9px] font-bold">BiPC (180)</span>
                    <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[9px] font-bold">MEC (120)</span>
                    <span className="px-2 py-0.5 rounded bg-slate-700 text-white text-[9px] font-bold">CEC (60)</span>
                  </div>
                </div>
                <button className="w-full mt-auto py-2.5 bg-primary text-white font-extrabold rounded-xl text-xs shadow-md">
                  Download Prospectus
                </button>
              </div>
            </div>
            <div className="w-24 h-1 bg-slate-700 rounded-full mx-auto my-1"></div>
          </div>
        </div>
      </div>
    </>
  );
}
