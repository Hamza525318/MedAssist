import { useState, useEffect } from 'react';
import { SlotFilters } from '@/types/slot';

interface SlotFilterBarProps {
  onFilterChange: (filters: SlotFilters) => void;
}

export default function SlotFilterBar({ onFilterChange }: SlotFilterBarProps) {
  const [filters, setFilters] = useState<SlotFilters>({});
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(filters);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof SlotFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  return (
    <div className="mb-6">
      {/* Mobile filter toggle */}
      <button
        onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        className="mb-4 w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:hidden"
      >
        {isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
      </button>

      {/* Filter form */}
      <div
        className={`grid gap-4 ${
          isMobileFiltersOpen ? 'block' : 'hidden'
        } md:block md:items-end`}
      >
        {/* Date filter */}
        <div className="flex-1">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={filters.date || ''}
            onChange={(e) => handleFilterChange('date', e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>
      </div>
    </div>
  );
}