'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  IconDashboard, 
  IconColleges, 
  IconStudents, 
  IconLeads, 
  IconAdmissions,
  IconLocations,
  IconSchools,
  IconPathways,
  IconCareerAreas,
  IconAssessments,
  IconVerification,
  IconDisputes,
  IconStaff,
  IconAnalytics,
  IconAuditLog,
  IconSettings,
  IconDotsVertical,
  IconChevronDown
} from './ui/AdminIcons';

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: {
    text: string;
    color: string;
  };
}

interface NavGroup {
  title: string;
  collapsible?: boolean;
  queueLabel?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/admin', icon: IconDashboard }
    ]
  },
  {
    title: 'Management',
    items: [
      { name: 'Colleges', path: '/admin/colleges', icon: IconColleges, badge: { text: '23 pend', color: 'amber' } },
      { name: 'Students', path: '/admin/students', icon: IconStudents, badge: { text: '12.4k', color: 'zinc' } },
      { name: 'Leads', path: '/admin/leads', icon: IconLeads, badge: { text: '342', color: 'zinc' } },
      { name: 'Admissions', path: '/admin/admissions', icon: IconAdmissions, badge: { text: '96', color: 'zinc' } }
    ]
  },
  {
    title: 'Catalog',
    collapsible: true,
    items: [
      { name: 'Locations', path: '/admin/locations', icon: IconLocations },
      { name: 'Schools', path: '/admin/schools', icon: IconSchools, badge: { text: '3,428', color: 'teal' } },
      { name: 'Pathways & Streams', path: '/admin/pathways', icon: IconPathways },
      { name: 'Career Areas', path: '/admin/career-areas', icon: IconCareerAreas }
    ]
  },
  {
    title: 'Assessments',
    items: [
      { name: 'Assessments Engine', path: '/admin/assessments', icon: IconAssessments, badge: { text: 'v2.1 live', color: 'emerald' } }
    ]
  },
  {
    title: 'Operations',
    queueLabel: 'Queue',
    items: [
      { name: 'Lead Queue', path: '/admin/lead-queue', icon: IconAssessments, badge: { text: '18 due', color: 'zinc' } },
      { name: 'Verification', path: '/admin/verification', icon: IconVerification, badge: { text: '7', color: 'amber-solid' } },
      { name: 'Attribution / Disputes', path: '/admin/disputes', icon: IconDisputes, badge: { text: '4', color: 'zinc' } }
    ]
  },
  {
    title: 'Organization',
    items: [
      { name: 'Staff & Telecallers', path: '/admin/staff', icon: IconStaff }
    ]
  },
  {
    title: 'Insights & System',
    items: [
      { name: 'Platform Analytics', path: '/admin/analytics', icon: IconAnalytics },
      { name: 'Audit Log', path: '/admin/audit', icon: IconAuditLog },
      { name: 'Platform Settings', path: '/admin/settings', icon: IconSettings }
    ]
  }
];

export function CompanyAdminSidebar() {
  const pathname = usePathname();

  const renderBadge = (badge: { text: string; color: string }) => {
    if (badge.color === 'amber') {
      return <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">{badge.text}</span>;
    }
    if (badge.color === 'emerald') {
      return <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded border border-emerald-200">{badge.text}</span>;
    }
    if (badge.color === 'amber-solid') {
      return <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{badge.text}</span>;
    }
    if (badge.color === 'teal') {
      return <span className="text-[10px] px-1.5 py-0.5 font-semibold bg-white text-brand-teal rounded-full shadow-sm border border-brand-teal/10">{badge.text}</span>;
    }
    return <span className="text-[10px] text-zinc-400 font-mono">{badge.text}</span>;
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-zinc-200 flex flex-col h-full z-20 select-none">
      
      <div className="h-16 px-5 border-b border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-brand-teal flex items-center justify-center text-white font-bold text-base tracking-tight shadow-sm">
            N
          </div>
          <div>
            <div className="font-bold text-zinc-900 text-sm tracking-tight leading-tight flex items-center gap-1.5">
              Naaguru
              <span className="text-[10px] px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded font-semibold border border-zinc-200">v1.2</span>
            </div>
            <div className="text-[11px] font-semibold text-brand-teal tracking-wide uppercase">
              Company Admin
            </div>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500" title="Platform Control Active"></div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-sm">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              <span>{group.title}</span>
              {group.collapsible && <IconChevronDown className="w-3 h-3 text-zinc-400" />}
              {group.queueLabel && <span className="text-[9px] font-medium text-zinc-400">{group.queueLabel}</span>}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link 
                    key={item.name}
                    href={item.path}
                    className={
                      isActive
                        ? "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md font-semibold text-xs transition-colors bg-brand-teal-light text-brand-teal"
                        : "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md font-medium text-xs text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className={isActive ? "w-4 h-4 text-brand-teal" : "w-4 h-4 text-zinc-500"} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && renderBadge(item.badge)}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-zinc-200 bg-zinc-50/70">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
              JP
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-zinc-900 truncate">J. Prabhakar</div>
              <div className="text-[11px] text-zinc-500 truncate">admin@naaguru.com</div>
            </div>
          </div>
          <button className="p-1 text-zinc-400 hover:text-zinc-600 rounded transition-colors" title="Account Menu">
            <IconDotsVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
