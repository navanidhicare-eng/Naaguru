'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { IconSearch, IconBell, IconRefresh } from './ui/AdminIcons';

const getTitleFromPathname = (pathname: string) => {
  if (pathname === '/admin') return 'Dashboard';
  const parts = pathname.split('/');
  const lastPart = parts[parts.length - 1];
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace('-', ' ');
};

export function CompanyAdminHeader() {
  const pathname = usePathname();
  const title = getTitleFromPathname(pathname);

  return (
    <header className="h-16 px-8 bg-white border-b border-zinc-200 flex items-center justify-between flex-shrink-0 z-10">
      
      <div className="flex items-center gap-3">
        <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
          <span>Platform Control</span>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-700 font-semibold">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        
        <div className="relative w-80">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <IconSearch className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search Naaguru (Colleges, Students, Districts)..." 
            className="w-full pl-8 pr-8 py-1.5 bg-zinc-50 border border-zinc-200 rounded-md text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-brand-teal focus:bg-white transition-all" 
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
            <kbd className="text-[10px] font-mono text-zinc-400 border border-zinc-200 px-1 rounded bg-white">⌘K</kbd>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-zinc-200">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            AP & TS Production
          </span>

          <button className="relative p-1.5 text-zinc-500 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors" title="Pending Operational Alerts">
            <IconBell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
          </button>

          <button className="p-1.5 text-zinc-500 hover:text-zinc-700 rounded-md hover:bg-zinc-100 transition-colors" title="Refresh Live Data">
            <IconRefresh className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
