"use client";

import { useEffect, useState } from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { StorageFacilityCard } from '@/components/storage/storage-facility-card';
import { FilterSidebarStorage } from '@/components/storage/filter-sidebar-storage';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { PlusCircle } from 'lucide-react';
import type { StorageFacility } from '@/lib/types';
import { useTranslations } from 'next-intl';

export interface StorageFilters {
  searchName: string;
  location: string;
  storageType: string;
  availability: string;
  maxPrice: number;
  features: string[];
}

export default function StorageFacilitiesPage() {
  const [allFacilities, setAllFacilities] = useState<StorageFacility[] | null>(null);
  const [filteredFacilities, setFilteredFacilities] = useState<StorageFacility[] | null>(null);
  const t = useTranslations();

  const [filters, setFilters] = useState<StorageFilters>({
    searchName: '',
    location: 'All',
    storageType: 'All',
    availability: 'All',
    maxPrice: 2000,
    features: [],
  });

  // Load facilities from API
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/storage');
        if (!res.ok) {
          setAllFacilities([]);
          setFilteredFacilities([]);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllFacilities(data as StorageFacility[]);
          setFilteredFacilities(data as StorageFacility[]);
        } else {
          setAllFacilities([]);
          setFilteredFacilities([]);
        }
      } catch (err) {
        console.error('Failed to fetch storage facilities', err);
        setAllFacilities([]);
        setFilteredFacilities([]);
      }
    })();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    if (!allFacilities) return;

    let filtered = [...allFacilities];

    // Filter by search name
    if (filters.searchName) {
      filtered = filtered.filter(f =>
        f.name.toLowerCase().includes(filters.searchName.toLowerCase())
      );
    }

    // Filter by location
    if (filters.location && filters.location !== 'All') {
      filtered = filtered.filter(f => f.location === filters.location);
    }

    // Filter by storage type
    if (filters.storageType && filters.storageType !== 'All') {
      filtered = filtered.filter(f => f.storageType === filters.storageType);
    }

    // Filter by availability
    if (filters.availability && filters.availability !== 'All') {
      filtered = filtered.filter(f => f.availability === filters.availability);
    }

    // Filter by max price
    filtered = filtered.filter(f => f.pricePerUnitPerMonth <= filters.maxPrice);

    // Filter by features
    if (filters.features.length > 0) {
      filtered = filtered.filter(f =>
        filters.features.every(feature => f.features.includes(feature))
      );
    }

    setFilteredFacilities(filtered);
  }, [filters, allFacilities]);

  const handleFilterChange = (newFilters: Partial<StorageFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <>
      <PageTitle
        title={t('storage.title')}
        description={t('storage.description')}
      >
        <Button asChild>
          <Link href="/join?tab=storage_provider">
            <PlusCircle className="mr-2 h-4 w-4" /> {t('storage.list_your_storage')}
          </Link>
        </Button>
      </PageTitle>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FilterSidebarStorage
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFacilities === null ? (
            <p className="text-muted-foreground md:col-span-2 text-center py-10">{t('storage.loading')}</p>
          ) : filteredFacilities.length === 0 ? (
            <div className="md:col-span-2 text-center py-10">
              <p className="text-muted-foreground">{t('storage.no_facilities')}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters to see more results
              </p>
            </div>
          ) : (
            <>
              <div className="md:col-span-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredFacilities.length} of {allFacilities?.length || 0} facilities
                </p>
              </div>
              {filteredFacilities.map((facility) => (
                <StorageFacilityCard key={facility.id} facility={facility} />
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
