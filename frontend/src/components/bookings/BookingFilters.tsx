"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { getSlots } from '@/utils/api/slot';
import { Slot } from '@/types/slot';

interface BookingFiltersProps {
  onFilterChange?: (filters: BookingFilters) => void;
}

export interface BookingFilters {
  dateRange: { start: string; end: string };
  slot: string;
  search: string;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({ onFilterChange }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    slot: '',
    search: ''
  });
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const handleFilterChange = (key: string, value: string | { start: string; end: string }) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    console.log('Filter changed:', key, value);
    onFilterChange?.(newFilters);
  };

  const fetchSlots = async () => {
    try {
      setIsLoadingSlots(true);
      // Sort by most recent slots first
      const slotsData = await getSlots();
      // Only show slots that are in the future
      const currentDate = new Date();
      const futureSlots = slotsData.filter(slot => {
        const slotDate = new Date(slot.date);
        return slotDate >= currentDate;
      });
      setSlots(futureSlots);
      console.log('Fetched slots for filter:', futureSlots.length);
    } catch (error) {
      console.error('Error fetching slots for filter:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Fetch available slots for the filter
  useEffect(() => {
    
    fetchSlots();
  }, []);
  


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
            disabled={isLoadingSlots}
          >
            <option value="">All Slots</option>
            {isLoadingSlots ? (
              <option value="" disabled>Loading slots...</option>
            ) : (
              slots.map((slot) => (
                <option key={slot._id} value={slot._id}>
                  {new Date(slot.date).toLocaleDateString()} - {slot.startHour}:00 to {slot.endHour}:00 - {slot.location}
                </option>
              ))
            )}
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