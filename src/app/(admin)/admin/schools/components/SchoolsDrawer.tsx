import React, { useEffect, useState } from 'react';
import { X, ChevronDown, CheckCircle, Lock } from 'lucide-react';

export interface EditSchoolPayload {
  id: string;
  nameEn: string;
  nameTe: string;
  locationDisplay: string;
  partnership: 'Partner' | 'Non-partner';
  status: 'Active' | 'Inactive' | 'Coming Soon';
}

interface SchoolsDrawerProps {
  state: 'closed' | 'add' | 'edit';
  onClose: () => void;
  editingSchool: EditSchoolPayload | null;
  refreshSchools: () => void;
}

import { useLocationHierarchy } from '../hooks/useLocationHierarchy';

export function SchoolsDrawer({ state, onClose, editingSchool, refreshSchools }: SchoolsDrawerProps) {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local state for Add School
  const [addNameEn, setAddNameEn] = useState('');
  const [addNameTe, setAddNameTe] = useState('');
  const [addPartnership, setAddPartnership] = useState('Partner');
  const [addStatus, setAddStatus] = useState('Active');
  
  const {
    states, districts, mandals, localities,
    selectedState, setSelectedState,
    selectedDistrict, setSelectedDistrict,
    selectedMandal, setSelectedMandal,
    selectedLocality, setSelectedLocality,
    resetLocations
  } = useLocationHierarchy();
  
  // Local state for Edit School
  const [editNameEn, setEditNameEn] = useState('');
  const [editNameTe, setEditNameTe] = useState('');
  const [editPartnership, setEditPartnership] = useState<'Partner'|'Non-partner'>('Partner');
  const [editStatus, setEditStatus] = useState<'Active'|'Inactive'|'Coming Soon'>('Active');

  useEffect(() => {
    if (state === 'edit' && editingSchool) {
      setTimeout(() => {
        setEditNameEn(editingSchool.nameEn);
        setEditNameTe(editingSchool.nameTe);
        setEditPartnership(editingSchool.partnership);
        setEditStatus(editingSchool.status);
      }, 0);
    }
  }, [state, editingSchool]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocality) {
      setErrorMessage('Please select a valid locality.');
      return;
    }
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationId: selectedLocality,
          nameEn: addNameEn,
          nameTe: addNameTe,
          partnershipStatus: addPartnership === 'Partner' ? 'PARTNER' : null,
          status: addStatus.toUpperCase()
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create school');
      }
      setSuccessMessage('School successfully added.');
      refreshSchools();
      setTimeout(() => {
        setSuccessMessage('');
        resetLocations();
        setAddNameEn('');
        setAddNameTe('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/admin/schools/${editingSchool.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameEn: editNameEn,
          nameTe: editNameTe,
          partnershipStatus: editPartnership === 'Partner' ? 'PARTNER' : null,
          status: editStatus.toUpperCase()
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update school');
      }
      setSuccessMessage('School updates saved.');
      refreshSchools();
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (state === 'closed') return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-[2px] transition-opacity cursor-pointer"
      ></div>

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        
        {/* ADD SCHOOL DRAWER */}
        {state === 'add' && (
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition ease-in-out duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-brand-text">Add School</h2>
                <p className="text-[13px] text-brand-muted mt-0.5">Register a school in the canonical education catalog.</p>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Drawer Form Body */}
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 relative">
              {successMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg mb-4 flex items-center gap-2">
                  <CheckCircle size={16} /> {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg mb-4">
                  {errorMessage}
                </div>
              )}
              
              {/* Section 1: School Names */}
              <div className="space-y-4">
                <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">School Information</div>
                
                <div>
                  <label className="block text-[13px] font-medium text-brand-text mb-1.5">
                    School Name <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={addNameEn}
                    onChange={(e) => setAddNameEn(e.target.value)}
                    placeholder="e.g. Kendriya Vidyalaya Steel Plant" 
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] text-brand-text placeholder:text-gray-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-brand-text mb-1.5">
                    School Name in Telugu <span className="text-brand-muted font-normal text-xs">(optional)</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={addNameTe}
                    onChange={(e) => setAddNameTe(e.target.value)}
                    placeholder="ఉదా: కేంద్రీయ విద్యాలయ స్టీల్ ప్లాంట్" 
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] font-telugu text-brand-text placeholder:text-gray-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition"
                  />
                </div>
              </div>

              <div className="h-px bg-zinc-200"></div>

              {/* Section 2: Canonical Location Hierarchy */}
              <div className="space-y-4">
                <div>
                  <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Canonical Location</div>
                  <p className="text-[12px] text-brand-muted mt-0.5">
                    State &rarr; District &rarr; Mandal &rarr; Locality. A school must attach to a verified active locality.
                  </p>
                </div>

                {/* State Selector */}
                <div>
                  <label className="block text-[13px] font-medium text-brand-text mb-1.5">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedState}
                      onChange={e => setSelectedState(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] text-brand-text cursor-pointer focus:outline-none focus:border-teal-600 transition"
                    >
                      <option value="">Select State</option>
                      {states.map(s => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* District Selector */}
                <div>
                  <label className="block text-[13px] font-medium text-brand-text mb-1.5">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedDistrict}
                      onChange={e => setSelectedDistrict(e.target.value)}
                      disabled={!selectedState}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] text-brand-text cursor-pointer focus:outline-none focus:border-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select District</option>
                      {districts.map(d => <option key={d.id} value={d.id}>{d.nameEn}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Mandal Selector */}
                <div>
                  <label className="block text-[13px] font-medium text-brand-text mb-1.5">
                    Mandal <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={selectedMandal}
                      onChange={e => setSelectedMandal(e.target.value)}
                      disabled={!selectedDistrict}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] text-brand-text cursor-pointer focus:outline-none focus:border-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Mandal</option>
                      {mandals.map(m => <option key={m.id} value={m.id}>{m.nameEn}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  </div>
                </div>

                {/* Locality Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[13px] font-medium text-brand-text">
                      Locality <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded">Active Locality Required</span>
                  </div>
                  <div className="relative">
                    <select 
                      required
                      value={selectedLocality}
                      onChange={e => setSelectedLocality(e.target.value)}
                      disabled={!selectedMandal}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-teal-600/40 rounded-lg text-[14px] text-brand-text cursor-pointer focus:outline-none focus:border-teal-600 ring-1 ring-teal-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Locality</option>
                      {localities.map(l => <option key={l.id} value={l.id}>{l.nameEn}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  </div>
                  <p className="text-[11px] text-brand-muted mt-1.5">
                    Select a fully qualified locality hierarchy above.
                  </p>
                </div>

              </div>

              <div className="h-px bg-zinc-200"></div>

              {/* Section 3: Status & Partnership */}
              <div className="space-y-4">
                <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Classification</div>

                <div>
                  <label className="block text-[13px] font-medium text-brand-text mb-2">Partnership Designation</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-3 border border-teal-600/40 bg-teal-50/50 rounded-lg cursor-pointer">
                      <input type="radio" name="add_partner" value="Partner" checked={addPartnership === 'Partner'} onChange={() => setAddPartnership('Partner')} className="text-teal-600 focus:ring-teal-600" />
                      <span className="text-[13px] font-medium text-teal-700">Partner School</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input type="radio" name="add_partner" value="Non-partner" checked={addPartnership === 'Non-partner'} onChange={() => setAddPartnership('Non-partner')} className="text-teal-600 focus:ring-teal-600" />
                      <span className="text-[13px] font-medium text-gray-700">Non-partner</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-brand-text mb-2">Catalog Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-3 border border-gray-200 bg-white rounded-lg cursor-pointer">
                      <input type="radio" name="add_status" value="Active" checked={addStatus === 'Active'} onChange={() => setAddStatus('Active')} className="text-teal-600 focus:ring-teal-600" />
                      <span className="text-[13px] font-medium text-emerald-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-gray-200 bg-white rounded-lg cursor-pointer">
                      <input type="radio" name="add_status" value="Inactive" checked={addStatus === 'Inactive'} onChange={() => setAddStatus('Inactive')} className="text-teal-600 focus:ring-teal-600" />
                      <span className="text-[13px] font-medium text-gray-500">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="p-6 border-t border-zinc-200 bg-gray-50 flex gap-3 justify-end">
                <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg border border-gray-300 text-[14px] font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-medium shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? 'Saving...' : 'Add School'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* EDIT SCHOOL DRAWER */}
        {state === 'edit' && editingSchool && (
          <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition ease-in-out duration-300">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-bold text-brand-text">Edit School</h2>
                <p className="text-[13px] text-brand-muted mt-0.5">Update school details and operational classification.</p>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Drawer Form Body */}
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 relative">
              {successMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg mb-4 flex items-center gap-2">
                  <CheckCircle size={16} /> {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg mb-4">
                  {errorMessage}
                </div>
              )}
              
              {/* School Names */}
              <div className="space-y-4">
                <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">School Information</div>
                
                <div>
                  <label className="block text-[13px] font-medium text-brand-text mb-1.5">
                    School Name <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={editNameEn}
                    onChange={e => setEditNameEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] text-brand-text focus:outline-none focus:border-teal-600 transition"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-brand-text mb-1.5">
                    School Name in Telugu
                  </label>
                  <input 
                    type="text" 
                    value={editNameTe}
                    onChange={e => setEditNameTe(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] font-telugu text-brand-text focus:outline-none focus:border-teal-600 transition"
                  />
                </div>
              </div>

              <div className="h-px bg-zinc-200"></div>

              {/* Locked Canonical Location (Read-Only) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Canonical Location</div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                    <Lock size={12} /> Locked in V1
                  </span>
                </div>
                
                <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
                  <div className="text-[13px] font-semibold text-brand-text">
                    {editingSchool.locationDisplay}
                  </div>
                  <p className="text-[11px] text-brand-muted leading-relaxed">
                    Canonical location is locked to protect student cohort mapping. To alter territorial bounds, contact the systems registry lead.
                  </p>
                </div>
              </div>

              <div className="h-px bg-zinc-200"></div>

              {/* Classification */}
              <div className="space-y-4">
                <div className="text-[12px] font-semibold text-gray-400 uppercase tracking-wider">Classification</div>

                <div>
                  <label className="block text-[13px] font-medium text-brand-text mb-2">Partnership Designation</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${editPartnership === 'Partner' ? 'border-teal-600/40 bg-teal-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="edit_partner" 
                        value="Partner" 
                        checked={editPartnership === 'Partner'}
                        onChange={() => setEditPartnership('Partner')}
                        className="text-teal-600 focus:ring-teal-600" 
                      />
                      <span className={`text-[13px] font-medium ${editPartnership === 'Partner' ? 'text-teal-700' : 'text-gray-700'}`}>Partner</span>
                    </label>
                    <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${editPartnership === 'Non-partner' ? 'border-teal-600/40 bg-teal-50/50' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <input 
                        type="radio" 
                        name="edit_partner" 
                        value="Non-partner" 
                        checked={editPartnership === 'Non-partner'}
                        onChange={() => setEditPartnership('Non-partner')}
                        className="text-teal-600 focus:ring-teal-600" 
                      />
                      <span className={`text-[13px] font-medium ${editPartnership === 'Non-partner' ? 'text-teal-700' : 'text-gray-700'}`}>Non-partner</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-brand-text mb-2">Catalog Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${editStatus === 'Active' ? 'bg-white' : 'hover:bg-gray-50 border-gray-200'}`}>
                      <input 
                        type="radio" 
                        name="edit_status" 
                        value="Active" 
                        checked={editStatus === 'Active'}
                        onChange={() => setEditStatus('Active')}
                        className="text-teal-600 focus:ring-teal-600" 
                      />
                      <span className="text-[13px] font-medium text-emerald-700">Active</span>
                    </label>
                    <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer ${editStatus === 'Inactive' ? 'bg-white' : 'hover:bg-gray-50 border-gray-200'}`}>
                      <input 
                        type="radio" 
                        name="edit_status" 
                        value="Inactive" 
                        checked={editStatus === 'Inactive'}
                        onChange={() => setEditStatus('Inactive')}
                        className="text-teal-600 focus:ring-teal-600" 
                      />
                      <span className="text-[13px] font-medium text-gray-600">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="p-6 border-t border-zinc-200 bg-gray-50 flex gap-3 justify-end">
                <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 rounded-lg border border-gray-300 text-[14px] font-medium text-gray-700 hover:bg-gray-100 transition cursor-pointer disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[14px] font-medium shadow-sm transition active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
