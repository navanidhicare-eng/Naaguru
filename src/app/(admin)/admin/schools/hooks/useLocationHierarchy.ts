import { useState, useEffect } from 'react';

export interface LocationItem {
  id: string;
  nameEn: string;
}

export function useLocationHierarchy() {
  const [states, setStates] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [mandals, setMandals] = useState<LocationItem[]>([]);
  const [localities, setLocalities] = useState<LocationItem[]>([]);

  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('');

  const fetchLocations = async (type: string, parentId?: string): Promise<LocationItem[]> => {
    try {
      const url = new URL('/api/v1/admin/locations', window.location.origin);
      url.searchParams.set('type', type);
      if (parentId) url.searchParams.set('parentId', parentId);
      const res = await fetch(url.toString());
      if (!res.ok) return [];
      return await res.json();
    } catch {
      return [];
    }
  };

  useEffect(() => {
    fetchLocations('STATE').then(setStates);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setDistricts([]);
      setMandals([]);
      setLocalities([]);
    }, 0);
    if (selectedState) {
      fetchLocations('DISTRICT', selectedState).then(setDistricts);
    }
  }, [selectedState]);

  useEffect(() => {
    setTimeout(() => {
      setMandals([]);
      setLocalities([]);
    }, 0);
    if (selectedDistrict) {
      fetchLocations('MANDAL', selectedDistrict).then(setMandals);
    }
  }, [selectedDistrict]);

  useEffect(() => {
    setTimeout(() => {
      setLocalities([]);
    }, 0);
    if (selectedMandal) {
      fetchLocations('LOCALITY', selectedMandal).then(setLocalities);
    }
  }, [selectedMandal]);

  const resetLocations = () => {
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedMandal('');
    setSelectedLocality('');
  };

  return {
    states, districts, mandals, localities,
    selectedState, setSelectedState,
    selectedDistrict, setSelectedDistrict,
    selectedMandal, setSelectedMandal,
    selectedLocality, setSelectedLocality,
    resetLocations
  };
}
