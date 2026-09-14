"use client"
import React, { useState, useEffect } from 'react';

type LocationType = 'STATE' | 'DISTRICT' | 'MANDAL' | 'LOCALITY';

interface Location {
  id: string;
  type: LocationType;
  parentId: string | null;
  nameEn: string;
  nameTe: string;
  status: 'ACTIVE' | 'INACTIVE';
}

const UI_LEVELS: { type: LocationType, label: string }[] = [
  { type: 'STATE', label: '1. States' },
  { type: 'DISTRICT', label: '2. Districts' },
  { type: 'MANDAL', label: '3. Mandals' },
  { type: 'LOCALITY', label: '4. Habitations & Wards' },
];

export default function LocationsPage() {
  const [level, setLevel] = useState<number>(0);
  const [parents, setParents] = useState<Location[]>([]); 
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [addNameEn, setAddNameEn] = useState('');
  const [addNameTe, setAddNameTe] = useState('');
  const [addError, setAddError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentLevelType = UI_LEVELS[level].type;
  const currentParentId = level > 0 ? parents[level - 1].id : undefined;

  const fetchLocations = async () => {
    setLoading(true);
    setError('');
    try {
      const url = new URL('/api/v1/admin/locations', window.location.origin);
      url.searchParams.set('type', currentLevelType);
      if (currentParentId) {
        url.searchParams.set('parentId', currentParentId);
      }
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch locations');
      
      const data = await res.json();
      setLocations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [level, currentParentId]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/v1/admin/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: currentLevelType,
          parentId: currentParentId,
          nameEn: addNameEn,
          nameTe: addNameTe,
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add location');
      
      setIsAdding(false);
      setAddNameEn('');
      setAddNameTe('');
      fetchLocations();
    } catch (err: any) {
      setAddError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (loc: Location) => {
    const newStatus = loc.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/v1/admin/locations/${loc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
         const data = await res.json();
         throw new Error(data.error || 'Failed to update status');
      }
      fetchLocations();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDrillDown = (loc: Location) => {
    if (level < UI_LEVELS.length - 1) {
      const newParents = [...parents];
      newParents[level] = loc;
      setParents(newParents);
      setLevel(level + 1);
      setIsAdding(false);
    }
  };

  const handleBreadcrumbClick = (targetLevel: number) => {
    if (targetLevel < level) {
      setLevel(targetLevel);
      setParents(parents.slice(0, targetLevel));
      setIsAdding(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold text-zinc-900 tracking-tight leading-tight">Canonical Location Catalog</h1>
          <p className="text-xs text-brand-muted mt-0.5">Hierarchical master data governing State → District → Mandal → Habitation mapping across AP & Telangana.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-1.5 bg-brand-teal hover:bg-brand-teal-dark text-white text-xs font-semibold rounded-md shadow-sm transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            <span>+ Add Location Node</span>
          </button>
        )}
      </div>

      {/* Hierarchy Breadcrumb Selector Tabs */}
      {!isAdding && (
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto">
          {UI_LEVELS.map((uiLevel, idx) => {
            const isActive = idx === level;
            const isClickable = idx < level;
            const isFuture = idx > level;
            
            let btnClass = "px-3 py-1.5 text-xs font-medium rounded-md shrink-0 transition-colors ";
            if (isActive) {
              btnClass += "bg-brand-teal-light text-brand-teal font-semibold";
            } else if (isClickable) {
              btnClass += "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 cursor-pointer";
            } else {
              btnClass += "bg-zinc-50 text-zinc-400 cursor-default";
            }

            return (
              <React.Fragment key={uiLevel.type}>
                <button 
                  className={btnClass}
                  onClick={() => isClickable ? handleBreadcrumbClick(idx) : undefined}
                >
                  {uiLevel.label}
                  {idx < level && parents[idx] ? ` (${parents[idx].nameEn})` : ''}
                </button>
                {idx < UI_LEVELS.length - 1 && (
                  <span className="text-zinc-300">›</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      {isAdding ? (
        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm max-w-2xl">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">Add {currentLevelType}</h2>
          {addError && <div className="mb-4 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100">{addError}</div>}
          <form onSubmit={handleAddSubmit} className="space-y-4">
             {level > 0 && (
               <div>
                 <label className="block text-xs font-medium text-zinc-700 mb-1">Parent {UI_LEVELS[level-1].type}</label>
                 <div className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded text-sm text-zinc-600 font-medium">
                   {parents[level - 1]?.nameEn}
                 </div>
               </div>
             )}
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Name (English) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={addNameEn}
                onChange={e => setAddNameEn(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded focus:ring-1 focus:ring-brand-teal focus:border-brand-teal text-sm" 
                required 
                maxLength={150}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Name (Telugu) <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={addNameTe}
                onChange={e => setAddNameTe(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 rounded focus:ring-1 focus:ring-brand-teal focus:border-brand-teal text-sm" 
                required 
                maxLength={150}
              />
            </div>
            <div className="pt-2 flex gap-2">
              <button 
                type="button" 
                onClick={() => { setIsAdding(false); setAddError(''); }}
                className="px-4 py-2 bg-white border border-zinc-300 rounded text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-4 py-2 bg-brand-teal text-white rounded text-sm font-medium hover:bg-brand-teal-dark disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save Location'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900 mb-4">
             Active {UI_LEVELS[level].type} Boundaries {level > 0 && `in ${parents[level-1].nameEn}`}
          </h2>
          
          {loading ? (
            <div className="py-8 text-center text-sm text-zinc-500">Loading...</div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-red-500">{error}</div>
          ) : locations.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500 border border-dashed border-zinc-200 rounded-lg">
              No locations found at this level. Click "+ Add Location Node" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map(loc => (
                <div key={loc.id} className="p-4 border border-zinc-200 rounded-lg hover:border-brand-teal transition-colors group">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-zinc-900">{loc.nameEn}</span>
                    <button 
                      onClick={() => toggleStatus(loc)}
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded border cursor-pointer hover:opacity-80 transition-opacity ${
                        loc.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                      }`}
                    >
                      {loc.status}
                    </button>
                  </div>
                  <div className="text-xs text-zinc-500 mt-2">{loc.nameTe}</div>
                  
                  {level < UI_LEVELS.length - 1 && (
                    <div className="mt-3 flex items-center gap-2">
                      <button 
                        onClick={() => handleDrillDown(loc)}
                        className="text-xs text-brand-teal font-semibold hover:underline"
                      >
                        Explore {UI_LEVELS[level + 1].type.toLowerCase()}s →
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
