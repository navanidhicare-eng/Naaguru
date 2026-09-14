import React, { useState, useEffect } from 'react';
import { MoreVertical, Pencil, Ban, CheckCircle } from 'lucide-react';
import { MockSchool } from '../hooks/useSchoolsMock';

interface SchoolsTableProps {
  schools: MockSchool[];
  totalSchools: number;
  onEdit: (school: MockSchool) => void;
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
}

export function SchoolsTable({ schools, totalSchools, onEdit, onDeactivate, onActivate }: SchoolsTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 bg-[#FAFCFB] text-[12px] font-semibold text-brand-muted uppercase tracking-wider">
              <th scope="col" className="py-3.5 pl-6 pr-4 font-semibold w-[32%]">School</th>
              <th scope="col" className="py-3.5 px-4 font-semibold w-[30%]">Canonical Location</th>
              <th scope="col" className="py-3.5 px-4 font-semibold w-[14%]">Partnership</th>
              <th scope="col" className="py-3.5 px-4 font-semibold w-[12%]">Status</th>
              <th scope="col" className="py-3.5 px-4 font-semibold w-[12%]">Last Updated</th>
              <th scope="col" className="py-3.5 pl-4 pr-6 text-right font-semibold w-[4%]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-[13px]">
            {schools.map(school => (
              <tr key={school.id} className="hover:bg-gray-50/70 transition duration-150 group">
                <td className="py-4 pl-6 pr-4">
                  <div className="font-semibold text-[14px] text-brand-text group-hover:text-teal-600 transition">{school.nameEn}</div>
                  <div className="font-telugu text-[13px] text-brand-muted mt-0.5">{school.nameTe}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-brand-text font-medium text-[13px]">{school.locality}</div>
                  <div className="text-[12px] text-brand-muted mt-0.5">{school.district} &middot; {school.mandal}</div>
                </td>
                <td className="py-4 px-4">
                  {school.partnership === 'Partner' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                      Partner
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                      Non-partner
                    </span>
                  )}
                </td>
                <td className="py-4 px-4">
                  {school.status === 'Active' ? (
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-700">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-500">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      Inactive
                    </span>
                  )}
                </td>
                <td className="py-4 px-4 text-brand-muted text-[13px]">
                  {school.lastUpdated}
                </td>
                <td className="py-4 pl-4 pr-6 text-right relative">
                  <button 
                    onClick={(e) => toggleMenu(e, school.id)} 
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {openMenuId === school.id && (
                    <div className="absolute right-6 top-10 mt-1 w-36 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-30 text-left">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(school); setOpenMenuId(null); }} 
                        className="w-full px-3 py-1.5 text-[13px] text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      >
                        <Pencil size={14} className="text-gray-500" /> Edit
                      </button>
                      {school.status === 'Active' ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeactivate(school.id); setOpenMenuId(null); }} 
                          className="w-full px-3 py-1.5 text-[13px] text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Ban size={14} /> Deactivate
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onActivate(school.id); setOpenMenuId(null); }} 
                          className="w-full px-3 py-1.5 text-[13px] text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 cursor-pointer"
                        >
                          <CheckCircle size={14} /> Activate
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-zinc-200 bg-[#FAFCFB] flex items-center justify-between text-[13px] text-brand-muted">
        <div>
          Showing <span className="font-medium text-brand-text">1–{Math.min(schools.length, 6)}</span> of <span className="font-medium text-brand-text">{totalSchools.toLocaleString()}</span> schools
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-400 bg-white cursor-not-allowed text-xs font-medium" disabled>
            Previous
          </button>
          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded-md bg-teal-600 text-white text-xs font-semibold cursor-pointer">1</button>
            <button className="w-7 h-7 rounded-md hover:bg-gray-100 text-gray-700 text-xs font-medium transition cursor-pointer">2</button>
            <button className="w-7 h-7 rounded-md hover:bg-gray-100 text-gray-700 text-xs font-medium transition cursor-pointer">3</button>
            <span className="text-gray-400 px-1">...</span>
            <button className="w-7 h-7 rounded-md hover:bg-gray-100 text-gray-700 text-xs font-medium transition cursor-pointer">572</button>
          </div>
          <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 bg-white hover:bg-gray-50 text-xs font-medium transition cursor-pointer">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
