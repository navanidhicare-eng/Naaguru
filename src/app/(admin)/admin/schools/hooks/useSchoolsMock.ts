import { useState, useMemo } from 'react';

export type SchoolStatus = 'Active' | 'Inactive';
export type PartnershipStatus = 'Partner' | 'Non-partner';

export interface MockSchool {
  id: string;
  nameEn: string;
  nameTe: string;
  locality: string;
  district: string;
  mandal: string;
  state: string;
  partnership: PartnershipStatus;
  status: SchoolStatus;
  lastUpdated: string;
}

const MOCK_SCHOOLS: MockSchool[] = [
  {
    id: '1',
    nameEn: 'Sri Chaitanya Techno School',
    nameTe: 'శ్రీ చైతన్య టెక్నో స్కూల్',
    locality: 'Moghalrajpuram',
    mandal: 'Vijayawada Urban',
    district: 'Krishna',
    state: 'AP',
    partnership: 'Partner',
    status: 'Active',
    lastUpdated: '2 hours ago',
  },
  {
    id: '2',
    nameEn: 'Zilla Parishad High School',
    nameTe: 'ZP హైస్కూల్ - తెనాలి',
    locality: 'Morrispet Ward 4',
    mandal: 'Tenali',
    district: 'Guntur',
    state: 'AP',
    partnership: 'Non-partner',
    status: 'Active',
    lastUpdated: '1 day ago',
  },
  {
    id: '3',
    nameEn: 'Narayana Olympiad School',
    nameTe: 'నారాయణ ఒలింపియాడ్ స్కూల్',
    locality: 'MVP Colony Sector 3',
    mandal: 'Visakhapatnam Urban',
    district: 'Visakhapatnam',
    state: 'AP',
    partnership: 'Partner',
    status: 'Active',
    lastUpdated: '3 days ago',
  },
  {
    id: '4',
    nameEn: 'Govt Model High School',
    nameTe: 'ప్రభుత్వ మోడల్ హైస్కూల్ - టెక్కలి',
    locality: 'Tekkali Main Locality',
    mandal: 'Tekkali',
    district: 'Srikakulam',
    state: 'AP',
    partnership: 'Non-partner',
    status: 'Active',
    lastUpdated: '5 days ago',
  },
  {
    id: '5',
    nameEn: 'Municipal Corporation High School',
    nameTe: 'మున్సిపల్ కార్పొరేషన్ హైస్కూల్',
    locality: 'Korlagunta',
    mandal: 'Tirupati Urban',
    district: 'Chittoor',
    state: 'AP',
    partnership: 'Non-partner',
    status: 'Inactive',
    lastUpdated: '2 weeks ago',
  },
  {
    id: '6',
    nameEn: 'Little Angels English Medium School',
    nameTe: 'లిటిల్ ఏంజిల్స్ ఇంగ్లీష్ మీడియం స్కూల్',
    locality: 'Old Gajuwaka',
    mandal: 'Gajuwaka',
    district: 'Visakhapatnam',
    state: 'AP',
    partnership: 'Partner',
    status: 'Active',
    lastUpdated: '3 weeks ago',
  },
];

export function useSchoolsMock() {
  const [schools, setSchools] = useState<MockSchool[]>(MOCK_SCHOOLS);
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState('all');
  const [filterDistrict, setFilterDistrict] = useState('all');
  const [filterMandal, setFilterMandal] = useState('all');
  const [filterLocality, setFilterLocality] = useState('all');
  const [filterPartner, setFilterPartner] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      const matchSearch = school.nameEn.toLowerCase().includes(search.toLowerCase()) || 
                          school.nameTe.toLowerCase().includes(search.toLowerCase());
      const matchState = filterState === 'all' || school.state === filterState;
      const matchDistrict = filterDistrict === 'all' || school.district === filterDistrict;
      const matchMandal = filterMandal === 'all' || school.mandal === filterMandal;
      const matchLocality = filterLocality === 'all' || school.locality === filterLocality;
      const matchPartner = filterPartner === 'all' || school.partnership === filterPartner;
      const matchStatus = filterStatus === 'all' || school.status === filterStatus;

      return matchSearch && matchState && matchDistrict && matchMandal && matchLocality && matchPartner && matchStatus;
    });
  }, [schools, search, filterState, filterDistrict, filterMandal, filterLocality, filterPartner, filterStatus]);

  const resetFilters = () => {
    setSearch('');
    setFilterState('all'); 
    setFilterDistrict('all');
    setFilterMandal('all');
    setFilterLocality('all');
    setFilterPartner('all');
    setFilterStatus('all');
  };

  const handleDeactivate = (id: string) => {
    setSchools(prev => prev.map(s => s.id === id ? { ...s, status: 'Inactive' } : s));
  };
  
  const handleActivate = (id: string) => {
    setSchools(prev => prev.map(s => s.id === id ? { ...s, status: 'Active' } : s));
  };

  return {
    schools: filteredSchools,
    totalSchools: 3428,
    search,
    setSearch,
    filterState, setFilterState,
    filterDistrict, setFilterDistrict,
    filterMandal, setFilterMandal,
    filterLocality, setFilterLocality,
    filterPartner, setFilterPartner,
    filterStatus, setFilterStatus,
    resetFilters,
    handleDeactivate,
    handleActivate
  };
}
