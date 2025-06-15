"use client";

import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface BookingFiltersProps {
  onFilterChange?: (filters: any) => void;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({ onFilterChange }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    slot: '',
    search: ''
  });

  const handleFilterChange = (key: string, value: string | { start: string; end: string }) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  return (
    <div className="card mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by patient name,ID and phone number"
            className="input pl-10 w-full"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Filter Toggle Button (Mobile) */}
        <button
          className="btn btn-outline md:hidden"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <Filter size={18} className="mr-2" />
          Filters
        </button>

        {/* Filter Section */}
        <div className={`${isFilterOpen ? 'block' : 'hidden'} md:flex md:items-center md:space-x-4 flex-1`}>
          {/* Date Range */}
          <div className="flex flex-col md:flex-row gap-2">
            <input
              type="date"
              className="input"
              value={filters.dateRange.start}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
            />
            <input
              type="date"
              className="input"
              value={filters.dateRange.end}
              onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
            />
          </div>

          {/* Slot Filter */}
          <select
            className="input"
            value={filters.slot}
            onChange={(e) => handleFilterChange('slot', e.target.value)}
          >
            <option value="">All Slots</option>
            <option value="morning">Morning (9 AM - 12 PM)</option>
            <option value="afternoon">Afternoon (2 PM - 5 PM)</option>
            <option value="evening">Evening (6 PM - 9 PM)</option>
          </select>

          {/* Clear Filters Button */}
          <button
            className="btn btn-outline"
            onClick={() => {
              setFilters({
                dateRange: { start: '', end: '' },
                slot: '',
                search: ''
              });
              onFilterChange?.({
                dateRange: { start: '', end: '' },
                slot: '',
                search: ''
              });
            }}
          >
            <X size={18} className="mr-2" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingFilters; 