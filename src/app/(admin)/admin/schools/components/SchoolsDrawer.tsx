import React, { useEffect, useState } from 'react';
import { X, ChevronDown, Lock, CheckCircle } from 'lucide-react';
import { PartnershipStatus, SchoolStatus } from '../hooks/useSchoolsMock';

export interface EditSchoolPayload {
  nameEn: string;
  nameTe: string;
  locationDisplay: string;
  partnership: PartnershipStatus;
  status: SchoolStatus;
}

interface SchoolsDrawerProps {
  state: 'closed' | 'add' | 'edit';
  onClose: () => void;
  editingSchool: EditSchoolPayload | null;
}

export function SchoolsDrawer({ state, onClose, editingSchool }: SchoolsDrawerProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Local state for Add School
  const [addState, setAddState] = useState('AP');
  const [addDistrict, setAddDistrict] = useState('Krishna');
  const [addMandal, setAddMandal] = useState('Vijayawada Urban');
  
  // Local state for Edit School
  const [editNameEn, setEditNameEn] = useState('');
  const [editNameTe, setEditNameTe] = useState('');
  const [editPartnership, setEditPartnership] = useState<PartnershipStatus>('Partner');
  const [editStatus, setEditStatus] = useState<SchoolStatus>('Active');

  useEffect(() => {
    if (state === 'edit' && editingSchool) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditNameEn(editingSchool.nameEn);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditNameTe(editingSchool.nameTe);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditPartnership(editingSchool.partnership);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditStatus(editingSchool.status);
    }
  }, [state, editingSchool]);

  const displayToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    displayToast('New school registered in catalog.');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    displayToast('School updates saved.');
  };

  if (state === 'closed') return (
    <>
      <Toast show={showToast} message={toastMessage} />
    </>
  );

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
            <form onSubmit={handleAddSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              
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
                      value={addState}
                      onChange={e => setAddState(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] text-brand-text cursor-pointer focus:outline-none focus:border-teal-600 transition"
                    >
                      <option value="AP">Andhra Pradesh</option>
                      <option value="TS">Telangana</option>
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
                      value={addDistrict}
                      onChange={e => setAddDistrict(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] text-brand-text cursor-pointer focus:outline-none focus:border-teal-600 transition"
                    >
                      <option value="Krishna">Krishna</option>
                      <option value="Guntur">Guntur</option>
                      <option value="Visakhapatnam">Visakhapatnam</option>
                      <option value="Srikakulam">Srikakulam</option>
                      <option value="Chittoor">Chittoor</option>
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
                      value={addMandal}
                      onChange={e => setAddMandal(e.target.value)}
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-[14px] text-brand-text cursor-pointer focus:outline-none focus:border-teal-600 transition"
                    >
                      <option value="Vijayawada Urban">Vijayawada Urban</option>
                      <option value="Vijayawada Rural">Vijayawada Rural</option>
                      <option value="Gannavaram">Gannavaram</option>
                      <option value="Machilipatnam">Machilipatnam</option>
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
                      className="w-full appearance-none px-3.5 py-2.5 bg-white border border-teal-600/40 rounded-lg text-[14px] text-brand-text cursor-pointer focus:outline-none focus:border-teal-600 ring-1 ring-teal-600/20 transition"
                    >
                      <option value="Moghalrajpuram">Moghalrajpuram</option>
                      <option value="Governorpet">Governorpet</option>
                      <option value="Benz Circle">Benz Circle Area</option>
                      <option value="Gunadala">Gunadala</option>
                      <option value="Patamata">Patamata</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                  </div>
                  <p className="text-[11px] text-brand-muted mt-1.5">
                    Selected: <span className="font-medium text-gray-700">{addState === 'AP' ? 'Andhra Pradesh' : 'Telangana'} &rarr; {addDistrict} &rarr; {addMandal} &rarr; Moghalrajpuram</span>
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
                      <input type="radio" name="add_partner" value="Partner" defaultChecked className="text-teal-600 focus:ring-teal-600" />
                      <span className="text-[13px] font-medium text-teal-700">Partner School</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input type="radio" name="add_partner" value="Non-partner" className="text-teal-600 focus:ring-teal-600" />
                      <span className="text-[13px] font-medium text-gray-700">Non-partner</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-brand-text mb-2">Catalog Status</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2 p-3 border border-gray-200 bg-white rounded-lg cursor-pointer">
                      <input type="radio" name="add_status" value="Active" defaultChecked className="text-teal-600 focus:ring-teal-600" />
                      <span className="text-[13px] font-medium text-emerald-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-gray-200 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input type="radio" name="add_status" value="Inactive" className="text-teal-600 focus:ring-teal-600" />
                      <span className="text-[13px] font-medium text-gray-600">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Actions */}
              <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-lg text-[14px] font-medium text-gray-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[14px] font-semibold shadow-xs transition cursor-pointer"
                >
                  Add School
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
            <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              
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
              <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-4 py-2.5 border border-gray-300 hover:bg-gray-50 rounded-lg text-[14px] font-medium text-gray-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[14px] font-semibold shadow-xs transition cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      <Toast show={showToast} message={toastMessage} />
    </div>
  );
}

function Toast({ show, message }: { show: boolean; message: string }) {
  return (
    <div 
      className={`fixed bottom-6 right-6 bg-app-text text-white px-4 py-3 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2.5 transition-all duration-300 z-50
      ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      <CheckCircle size={16} className="text-emerald-400" />
      <span>{message}</span>
    </div>
  );
}
