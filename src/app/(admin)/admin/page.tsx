import React from 'react';
import Link from 'next/link';
import { AdminCard } from './components/ui/AdminCard';
import { AdminBadge } from './components/ui/AdminBadge';
import { AdminButton } from './components/ui/AdminButton';
import { 
  IconPlus, 
  IconStaff, 
  IconColleges, 
  IconSearch, 
  IconAdmissions
} from './components/ui/AdminIcons';

export default function CompanyAdminDashboardPage() {
  return (
    <div className="space-y-7">
      
      {/* Top Title & Operational Health Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-zinc-900 tracking-tight leading-tight">Platform Control Dashboard</h1>
          <p className="text-xs text-brand-muted mt-0.5">Real-time operational health, institutional verification queues, and admission funnel.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="inline-flex items-center text-xs text-zinc-500 bg-white border border-zinc-200 px-2.5 py-1.5 rounded-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
            Live Sync: Today, 11:42 IST
          </div>
          <Link href="/admin/colleges">
            <AdminButton variant="primary">
              <IconPlus className="w-3.5 h-3.5" />
              <span>Verify Colleges (23)</span>
            </AdminButton>
          </Link>
        </div>
      </div>

      {/* TOP KPI ROW: 5 Clean Compact Operational Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        
        <AdminCard className="p-3.5 hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium mb-1">
            <span>Total Students</span>
            <IconStaff className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 tracking-tight">12,480</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px]">
            <span className="text-emerald-700 font-medium">+8.4%</span>
            <span className="text-zinc-400">vs last 30 days</span>
          </div>
        </AdminCard>

        <AdminCard className="p-3.5 hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium mb-1">
            <span>Active Colleges</span>
            <IconColleges className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 tracking-tight">184</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px]">
            <span className="text-zinc-600 font-medium">across 26 districts</span>
          </div>
        </AdminCard>

        <div className="bg-white border border-amber-300/80 bg-amber-50/20 rounded-lg p-3.5 shadow-card hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between text-xs text-amber-800 font-medium mb-1">
            <span>Pending Verification</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          </div>
          <div className="text-2xl font-bold text-amber-900 tracking-tight">23</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px]">
            <span className="text-amber-800 font-semibold">Requires BIEAP audit</span>
          </div>
        </div>

        <AdminCard className="p-3.5 hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium mb-1">
            <span>New Enquiries</span>
            <IconSearch className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 tracking-tight">342</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px]">
            <span className="text-emerald-700 font-medium">94% routed &lt;2 hrs</span>
          </div>
        </AdminCard>

        <AdminCard className="p-3.5 hover:border-zinc-300 transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-medium mb-1">
            <span>Confirmed Admissions</span>
            <IconAdmissions className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 tracking-tight">96</div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px]">
            <span className="text-zinc-600 font-medium">AY 2024-25 Batch</span>
          </div>
        </AdminCard>

      </div>

      {/* OPERATIONAL ATTENTION QUEUE */}
      <AdminCard className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <h2 className="text-sm font-semibold text-zinc-900">Needs Attention</h2>
            <span className="text-[11px] text-zinc-500">Platform queues requiring administrative intervention</span>
          </div>
          <span className="text-xs text-brand-teal font-medium hover:underline cursor-pointer">View All Tasks (52)</span>
        </div>

        <div className="divide-y divide-zinc-100 text-xs">
          
          <div className="px-5 py-3 flex items-center justify-between hover:bg-zinc-50/80 transition-colors">
            <div className="flex items-center gap-3">
              <AdminBadge variant="amber">VERIFICATION</AdminBadge>
              <span className="font-medium text-zinc-900">23 colleges awaiting profile & accreditation verification</span>
              <span className="text-zinc-400">· Includes 6 Govt Jr Colleges & 17 Private Aided</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 font-mono">Oldest: 4.2 hrs ago</span>
              <Link href="/admin/colleges">
                <AdminButton variant="minimal">Review Queue →</AdminButton>
              </Link>
            </div>
          </div>

          <div className="px-5 py-3 flex items-center justify-between hover:bg-zinc-50/80 transition-colors">
            <div className="flex items-center gap-3">
              <AdminBadge variant="rose">TELECALLER</AdminBadge>
              <span className="font-medium text-zinc-900">18 enquiries without initial college contact &gt;24h</span>
              <span className="text-zinc-400">· Visakhapatnam & Vijayawada districts</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 font-mono">Oldest: 28 hrs ago</span>
              <AdminButton variant="minimal">Assign Telecaller</AdminButton>
            </div>
          </div>

          <div className="px-5 py-3 flex items-center justify-between hover:bg-zinc-50/80 transition-colors">
            <div className="flex items-center gap-3">
              <AdminBadge variant="blue">ADMISSIONS</AdminBadge>
              <span className="font-medium text-zinc-900">7 admission confirmation slips submitted for verification</span>
              <span className="text-zinc-400">· Student hall ticket match required</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 font-mono">Oldest: 1.5 hrs ago</span>
              <AdminButton variant="minimal">Audit Slips</AdminButton>
            </div>
          </div>

          <div className="px-5 py-3 flex items-center justify-between hover:bg-zinc-50/80 transition-colors">
            <div className="flex items-center gap-3">
              <AdminBadge variant="purple">ATTRIBUTION</AdminBadge>
              <span className="font-medium text-zinc-900">4 college attribution disputes filed</span>
              <span className="text-zinc-400">· Overlapping lead claims (direct vs platform enquiry)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-zinc-400 font-mono">Oldest: 6.1 hrs ago</span>
              <AdminButton variant="minimal">Open Case</AdminButton>
            </div>
          </div>

        </div>
      </AdminCard>

      {/* PLATFORM BUSINESS FUNNEL */}
      <AdminCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">Naaguru Operational Admission Funnel</h2>
            <p className="text-xs text-zinc-500">Student lifecycle conversion through assessment, discovery, inquiry, and enrollment</p>
          </div>
          <span className="text-xs font-medium text-zinc-500">AP & TS Aggregate</span>
        </div>

        <div className="grid grid-cols-5 gap-3 relative">
          
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">1. Students</div>
            <div className="text-xl font-bold text-zinc-900 mt-1">12,480</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Verified Class 10</div>
            <div className="mt-2 text-[10px] text-emerald-700 font-medium">100% Top of Funnel</div>
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">2. Assessments</div>
            <div className="text-xl font-bold text-zinc-900 mt-1">9,842</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Completed 40-Q test</div>
            <div className="mt-2 text-[10px] text-zinc-600 font-medium">78.8% Assessment Rate</div>
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">3. Enquiries</div>
            <div className="text-xl font-bold text-zinc-900 mt-1">3,420</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Sent to Colleges</div>
            <div className="mt-2 text-[10px] text-zinc-600 font-medium">34.7% of Assessed</div>
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-md">
            <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">4. Applications</div>
            <div className="text-xl font-bold text-zinc-900 mt-1">612</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Campus forms filed</div>
            <div className="mt-2 text-[10px] text-zinc-600 font-medium">17.9% of Enquiries</div>
          </div>

          <div className="p-3 bg-brand-teal-light/50 border border-brand-teal/30 rounded-md">
            <div className="text-[11px] font-semibold text-brand-teal uppercase tracking-wider">5. Admissions</div>
            <div className="text-xl font-bold text-brand-teal-dark mt-1">96</div>
            <div className="text-[11px] text-zinc-600 mt-0.5">Verified Enrollments</div>
            <div className="mt-2 text-[10px] text-brand-teal-dark font-semibold">15.7% Closed Ratio</div>
          </div>

        </div>
      </AdminCard>

      {/* RECENT ACTIVITY TABLE */}
      <AdminCard className="overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-200 bg-zinc-50/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Recent Platform Operations Activity</h2>
          <Link href="/admin/audit" className="text-xs text-brand-teal font-medium hover:underline">
            View Forensic Audit Log →
          </Link>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-500 font-semibold uppercase text-[11px] tracking-wider">
              <th className="py-2.5 px-5">Timestamp</th>
              <th className="py-2.5 px-4">Activity</th>
              <th className="py-2.5 px-4">Entity</th>
              <th className="py-2.5 px-4">Actor</th>
              <th className="py-2.5 px-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 text-zinc-700">
            
            <tr className="hover:bg-zinc-50/60 transition-colors">
              <td className="py-2.5 px-5 font-mono text-zinc-400">11:38 IST</td>
              <td className="py-2.5 px-4 font-medium text-zinc-900">College Accreditation Verified</td>
              <td className="py-2.5 px-4 text-zinc-600 font-mono">Aditya Jr College (MVP Colony)</td>
              <td className="py-2.5 px-4 text-zinc-500">J. Prabhakar (Admin)</td>
              <td className="py-2.5 px-5 text-right">
                <AdminBadge variant="emerald">Verified</AdminBadge>
              </td>
            </tr>

            <tr className="hover:bg-zinc-50/60 transition-colors">
              <td className="py-2.5 px-5 font-mono text-zinc-400">11:15 IST</td>
              <td className="py-2.5 px-4 font-medium text-zinc-900">Student Enquiry Routed</td>
              <td className="py-2.5 px-4 text-zinc-600">Kiran Kumar M. → Sri Chaitanya</td>
              <td className="py-2.5 px-4 text-zinc-500">System (Auto-Dispatch)</td>
              <td className="py-2.5 px-5 text-right">
                <AdminBadge variant="zinc">Delivered</AdminBadge>
              </td>
            </tr>

            <tr className="hover:bg-zinc-50/60 transition-colors">
              <td className="py-2.5 px-5 font-mono text-zinc-400">10:50 IST</td>
              <td className="py-2.5 px-4 font-medium text-zinc-900">Catalog School Canonicalized</td>
              <td className="py-2.5 px-4 text-zinc-600">ZPHS Anandapuram (#BSE-5302)</td>
              <td className="py-2.5 px-4 text-zinc-500">R. Varma (Ops)</td>
              <td className="py-2.5 px-5 text-right">
                <AdminBadge variant="emerald">Published</AdminBadge>
              </td>
            </tr>

            <tr className="hover:bg-zinc-50/60 transition-colors">
              <td className="py-2.5 px-5 font-mono text-zinc-400">10:22 IST</td>
              <td className="py-2.5 px-4 font-medium text-zinc-900">Assessment Version v2.1 Activated</td>
              <td className="py-2.5 px-4 text-zinc-600 font-mono">Bilingual Class 10 RIASEC</td>
              <td className="py-2.5 px-4 text-zinc-500">S. Anusha (Curriculum)</td>
              <td className="py-2.5 px-5 text-right">
                <AdminBadge variant="emerald">Active</AdminBadge>
              </td>
            </tr>

          </tbody>
        </table>
      </AdminCard>

    </div>
  );
}
