"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "College Dashboard", href: "/college/dashboard", icon: "dashboard" },
    { name: "College Profile", href: "/college/profile", icon: "school" },
    { name: "Leads & Admissions", href: "/college/leads", icon: "group", badge: "28 New", badgeClass: "bg-amber-400/20 text-amber-300 border-amber-400/30" },
    { name: "Analytics", href: "/college/analytics", icon: "insights", isLive: true },
    { name: "Settings", href: "/college/settings", icon: "settings" },
  ];

  return (
    <aside className="w-64 shrink-0 h-full overflow-y-auto bg-primary-deep text-white z-50 flex flex-col justify-between p-5 border-r border-[#005144] shadow-lg select-none">
      <div className="flex flex-col gap-6">
        {/* Apex Brand */}
        <Link href="/college/dashboard" className="flex items-center gap-3 px-1 transition-opacity hover:opacity-90 w-full text-left">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
            <span className="material-symbols-outlined text-secondary-container text-[24px]">account_balance</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[17px] font-bold tracking-tight text-white leading-tight">Apex</span>
            <span className="text-[10px] uppercase font-bold tracking-widest text-secondary-container">JUNIOR COLLEGE</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex flex-col gap-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-on-primary-container/70 mb-2 px-3">Navigation</div>
          <nav className="flex flex-col gap-1.5" id="sidebarNav">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname === "/college" && item.href === "/college/dashboard");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`nav-item flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all text-sm ${
                    isActive
                      ? "bg-white text-primary font-bold shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
                    <span className="truncate">{item.name}</span>
                  </div>
                  {!isActive && item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0 border ${item.badgeClass}`}>
                      {item.badge}
                    </span>
                  )}
                  {!isActive && item.isLive && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold whitespace-nowrap shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Academic Session Footer */}
      <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-secondary-container text-[20px]">calendar_month</span>
          <div className="flex flex-col">
            <span className="text-[10px] text-white/70 font-medium">Academic Year</span>
            <span className="text-[12px] font-bold text-secondary-container leading-tight">2025–2026</span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
        </span>
      </div>
    </aside>
  );
}
