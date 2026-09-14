import React, { useState, useEffect } from 'react';
import { MoreVertical, Pencil, Ban, CheckCircle } from 'lucide-react';
import { SchoolDto } from '@/shared/catalog';
import { ConfirmDialog } from '../../../../../components/ui/confirm-dialog';

interface SchoolsTableProps {
  schools: SchoolDto[];
  totalSchools: number;
  onEdit: (school: SchoolDto) => void;
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
}

export function SchoolsTable({ schools, totalSchools, onEdit, onDeactivate, onActivate }: SchoolsTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'activate' | 'deactivate', schoolId: string, schoolName: string } | null>(null);

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
                  <div className="text-brand-text font-medium text-[13px]">{school.locationName || 'Unknown Locality'}</div>
                  <div className="text-[12px] text-brand-muted mt-0.5">{school.districtName || 'Unknown'} &middot; {school.mandalName || 'Unknown'}</div>
                </td>
                <td className="py-4 px-4">
                  {school.partnershipStatus === 'PARTNER' ? (
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
                  {school.status === 'ACTIVE' ? (
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
                      {school.status === 'ACTIVE' ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'deactivate', schoolId: school.id, schoolName: school.nameEn }); setOpenMenuId(null); }} 
                          className="w-full px-3 py-1.5 text-[13px] text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Ban size={14} /> Deactivate
                        </button>
                      ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setConfirmAction({ type: 'activate', schoolId: school.id, schoolName: school.nameEn }); setOpenMenuId(null); }} 
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
      </div>
      
      <ConfirmDialog
        isOpen={confirmAction !== null}
        title={confirmAction?.type === 'deactivate' ? 'Deactivate School' : 'Activate School'}
        description={
          confirmAction?.type === 'deactivate'
            ? <>Are you sure you want to deactivate <strong>{confirmAction?.schoolName}</strong>? This will hide it from active catalogs but preserve historical data.</>
            : <>Are you sure you want to activate <strong>{confirmAction?.schoolName}</strong>? This will make it visible in active catalogs.</>
        }
        confirmText={confirmAction?.type === 'deactivate' ? 'Deactivate' : 'Activate'}
        variant={confirmAction?.type === 'deactivate' ? 'danger' : 'success'}
        onConfirm={() => {
          if (confirmAction?.type === 'deactivate') {
            onDeactivate(confirmAction.schoolId);
          } else if (confirmAction?.type === 'activate') {
            onActivate(confirmAction.schoolId);
          }
          setConfirmAction(null);
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
