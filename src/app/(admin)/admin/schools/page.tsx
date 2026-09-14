'use client';

import React, { useState, useEffect } from 'react';
import { useSchools } from './hooks/useSchools';
import { useLocationHierarchy } from './hooks/useLocationHierarchy';
import { SchoolDto } from '@/shared/catalog';
import { SchoolsTable } from './components/SchoolsTable';
import { SchoolsDrawer, EditSchoolPayload } from './components/SchoolsDrawer';
import { Search, ChevronDown, RotateCcw, Plus } from 'lucide-react';

export default function SchoolsPage() {
  const {
    schools,
    loading,
    error,
    search,
    setSearch,
    filterPartner,
    setFilterPartner,
    filterStatus,
    setFilterStatus,
    setFilterLocationId,
    refresh
  } = useSchools();

  const {
    states, districts, mandals, localities,
    selectedState, setSelectedState,
    selectedDistrict, setSelectedDistrict,
    selectedMandal, setSelectedMandal,
    selectedLocality, setSelectedLocality,
    resetLocations
  } = useLocationHierarchy();

  // Sync selected locality to the school fetcher
  useEffect(() => {
    setFilterLocationId(selectedLocality);
  }, [selectedLocality, setFilterLocationId]);

  const resetFilters = () => {
    setSearch('');
    setFilterPartner('');
    setFilterStatus('');
    resetLocations();
  };

  const handleDeactivate = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/schools/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'INACTIVE' })
      });
      if (res.ok) refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/admin/schools/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' })
      });
      if (res.ok) refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const [drawerState, setDrawerState] = useState<'closed' | 'add' | 'edit'>('closed');
  const [editingSchool, setEditingSchool] = useState<EditSchoolPayload | null>(null);

  const openAddDrawer = () => setDrawerState('add');
  const openEditDrawer = (school: SchoolDto) => {
    setEditingSchool({
      id: school.id,
      nameEn: school.nameEn,
      nameTe: school.nameTe,
      locationDisplay: `${school.districtName} · ${school.mandalName} · ${school.locationName}`,
      partnership: school.partnershipStatus === 'PARTNER' ? 'Partner' : 'Non-partner',
      status: school.status as 'Active' | 'Inactive' | 'Coming Soon',
    });
    setDrawerState('edit');
  };
  const closeDrawer = () => {
    setDrawerState('closed');
    setEditingSchool(null);
  };

  return (
    <div className="flex-1 h-full w-full space-y-6">
        
        {/* PAGE TITLE & PRIMARY ACTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-bold text-brand-text tracking-tight">Schools</h1>
            <p className="text-[14px] text-brand-muted mt-1">
              Manage canonical schools, regulatory mapping, and partner designations in Naaguru&apos;s education catalog.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right hidden md:block">
              <div className="text-[13px] font-semibold text-brand-text">{schools.length.toLocaleString()} schools</div>
              <div className="text-[12px] text-brand-muted">
                Showing {schools.length > 0 ? '1' : '0'}–{Math.min(schools.length, 8)} of {schools.length.toLocaleString()}
              </div>
            </div>
            <button 
              onClick={openAddDrawer}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[14px] font-semibold shadow-xs transition active:scale-[0.99] cursor-pointer"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Add School</span>
            </button>
          </div>
        </div>

        {/* HORIZONTAL FILTER / SEARCH TOOLBAR */}
        <div className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Primary Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search schools by English or Telugu name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F8FAF9] border border-gray-200 rounded-lg text-[13px] text-brand-text placeholder:text-gray-400 focus:bg-white focus:outline-none focus:border-teal-600 transition"
              />
            </div>

            {/* Cascading Location & Status Filter Selectors */}
            <div className="flex flex-wrap items-center gap-2.5">
              <FilterSelect value={selectedState} onChange={setSelectedState} options={states.map(s => ({ value: s.id, label: s.nameEn }))} defaultOption="All States" />
              <FilterSelect value={selectedDistrict} onChange={setSelectedDistrict} options={districts.map(d => ({ value: d.id, label: d.nameEn }))} defaultOption="All Districts" />
              <FilterSelect value={selectedMandal} onChange={setSelectedMandal} options={mandals.map(m => ({ value: m.id, label: m.nameEn }))} defaultOption="All Mandals" />
              <FilterSelect value={selectedLocality} onChange={setSelectedLocality} options={localities.map(l => ({ value: l.id, label: l.nameEn }))} defaultOption="All Localities" />
              <FilterSelect value={filterPartner} onChange={setFilterPartner} options={[{value: 'PARTNER', label: 'Partner'}, {value: 'Non-partner', label: 'Non-partner'}]} defaultOption="All Partnerships" />
              <FilterSelect value={filterStatus} onChange={setFilterStatus} options={[{value: 'ACTIVE', label: 'Active'}, {value: 'INACTIVE', label: 'Inactive'}]} defaultOption="All Status" />

              <button 
                onClick={resetFilters} 
                className="text-[13px] font-medium text-brand-muted hover:text-brand-text px-2 py-1.5 transition flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* MAIN TABLE or EMPTY STATE */}
        {loading ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-16 text-center shadow-sm">
            <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-[15px] font-medium text-brand-text">Loading schools...</h3>
          </div>
        ) : error ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-16 text-center shadow-sm">
            <h3 className="text-[17px] font-semibold text-red-600">Failed to load</h3>
            <p className="text-[14px] text-brand-muted mt-1.5">{error}</p>
          </div>
        ) : schools.length > 0 ? (
          <SchoolsTable 
            schools={schools}
            totalSchools={schools.length}
            onEdit={openEditDrawer}
            onDeactivate={handleDeactivate}
            onActivate={handleActivate}
          />
        ) : (
          <div className="bg-white border border-zinc-200 rounded-xl p-16 text-center shadow-sm">
            <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200/80 mx-auto flex items-center justify-center text-gray-400 text-2xl mb-4">
              <Search size={24} />
            </div>
            <h3 className="text-[17px] font-semibold text-brand-text">No schools found</h3>
            <p className="text-[14px] text-brand-muted mt-1.5 max-w-md mx-auto">
              We couldn&apos;t find any school records matching your current filter criteria or search keyword.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={resetFilters} className="px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-[13px] font-medium text-brand-text transition cursor-pointer">
                Clear filters
              </button>
              <button onClick={openAddDrawer} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[13px] font-medium transition cursor-pointer">
                + Add School
              </button>
            </div>
          </div>
        )}

      <SchoolsDrawer 
        state={drawerState} 
        onClose={closeDrawer} 
        editingSchool={editingSchool} 
        refreshSchools={refresh}
      />
    </div>
  );
}

function FilterSelect({ value, onChange, options, defaultOption }: { value: string, onChange: (val: string) => void, options: {value: string, label: string}[], defaultOption: string }) {
  return (
    <div className="relative">
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[#F8FAF9] hover:bg-gray-100 border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-[13px] font-medium text-gray-700 cursor-pointer focus:outline-none focus:border-teal-600 transition"
      >
        <option value="all">{defaultOption}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
    </div>
  );
}
