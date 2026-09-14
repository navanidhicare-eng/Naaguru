import { useState, useEffect, useCallback } from 'react';
import { SchoolDto } from '@/shared/catalog';

export function useSchools() {
  const [schools, setSchools] = useState<SchoolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [filterPartner, setFilterPartner] = useState(''); // 'PARTNER' or ''
  const [filterStatus, setFilterStatus] = useState(''); // 'ACTIVE' or 'INACTIVE'
  const [filterLocationId, setFilterLocationId] = useState('');

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const url = new URL('/api/v1/admin/schools', window.location.origin);
      if (search) url.searchParams.set('search', search);
      if (filterPartner === 'PARTNER') url.searchParams.set('partnershipStatus', 'PARTNER');
      if (filterPartner === 'Non-partner') url.searchParams.set('partnershipStatus', 'null'); // wait, backend handles 'null' as null.
      if (filterStatus) url.searchParams.set('status', filterStatus.toUpperCase());
      if (filterLocationId) url.searchParams.set('locationId', filterLocationId);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch schools');
      const data = await res.json();
      setSchools(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, filterPartner, filterStatus, filterLocationId]);

  useEffect(() => {
    // Basic debounce for search
    const handler = setTimeout(() => {
      fetchSchools();
    }, 300);
    return () => clearTimeout(handler);
  }, [fetchSchools]);

  return {
    schools,
    loading,
    error,
    search, setSearch,
    filterPartner, setFilterPartner,
    filterStatus, setFilterStatus,
    filterLocationId, setFilterLocationId,
    refresh: fetchSchools
  };
}
