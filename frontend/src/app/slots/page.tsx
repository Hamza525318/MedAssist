'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Slot, SlotFilters } from '@/types/slot';
import { getSlots, createSlot, updateSlot, deleteSlot } from '@/utils/api/slot';
import CreateSlotModal from '@/components/slots/CreateSlotModal';
import SlotFilterBar from '@/components/slots/SlotFilterBar';
import SlotTable from '@/components/slots/SlotTable';
import DashboardLayout from '@/components/layout/DashboardLayout';

// Available locations - this could be fetched from an API
const LOCATIONS = ['Main Clinic', 'Branch 1', 'Branch 2'];

export default function SlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [filters, setFilters] = useState<SlotFilters>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Show success message for 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch slots
  const fetchSlots = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSlots(filters);
      setSlots(data);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setError('Failed to fetch slots');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [filters]);

  // Handle slot creation
  const handleCreateSlot = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      await createSlot(data);
      setSuccessMessage('Slot created successfully');
      fetchSlots();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating slot:', error);
      setError('Failed to create slot');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle slot update
  const handleUpdateSlot = async (slot: Slot) => {
    try {
      setIsLoading(true);
      setError(null);
      await updateSlot(slot._id, {
        date: slot.date,
        startHour: slot.startHour,
        endHour: slot.endHour,
        capacity: slot.capacity,
        location: slot.location
      });
      setSuccessMessage('Slot updated successfully');
      fetchSlots();
    } catch (error) {
      console.error('Error updating slot:', error);
      setError('Failed to update slot');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle slot deletion
  const handleDeleteSlot = async (slot: Slot) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
      setIsLoading(true);
      setError(null);
      await deleteSlot(slot._id);
      setSuccessMessage('Slot deleted successfully');
      fetchSlots();
    } catch (error) {
      console.error('Error deleting slot:', error);
      setError('Failed to delete slot');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-64px)] overflow-y-auto">
        <div className="mx-auto px-4 py-8">
          {/* Success message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
              <div className="mr-2 bg-green-200 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              {successMessage}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
              <div className="mr-2 bg-red-200 rounded-full p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              {error}
            </div>
          )}

          {/* Header */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Slot Management</h1>
              <p className="text-gray-600">Manage your appointment slots</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary mt-4 sm:mt-0"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Slot
            </button>
          </div>

          {/* Filters */}
          <SlotFilterBar onFilterChange={setFilters} locations={LOCATIONS} />

          {/* Loading state */}
          {isLoading ? (
            <div className="mt-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-teal-600 border-r-transparent"></div>
              <p className="mt-2 text-gray-500">Loading slots...</p>
            </div>
          ) : (
            <SlotTable
              slots={slots}
              onEdit={setSelectedSlot}
              onDelete={handleDeleteSlot}
            />
          )}

          {/* Create/Edit Modal */}
          <CreateSlotModal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedSlot(null);
            }}
            onSubmit={handleCreateSlot}
          />
        </div>
      </div>
    </DashboardLayout>
  );
} 