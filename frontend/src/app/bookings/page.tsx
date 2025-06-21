"use client";

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BookingFilters, { BookingFilters as BookingFiltersType } from '@/components/bookings/BookingFilters';
import BookingTable from '@/components/bookings/BookingTable';
import BookingDetailsModal from '@/components/bookings/BookingDetailsModal';
import CreateBookingModal from '@/components/bookings/CreateBookingModal';
import StatusTabs from '@/components/bookings/StatusTabs';
import { BookingData } from '@/types';
import { getBookings, deleteBooking } from '@/utils/api/booking';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState('Pending');
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<BookingFiltersType>({
    dateRange: { start: '', end: '' },
    slot: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });

  console.log("BOOKINGS PAGE RENDERED");
  const fetchBookings = async (page = 1) => {
    try {
      setIsLoading(true);
      console.log('Fetching bookings with filters:', {
        status: activeStatus,
        page,
        limit: pagination.limit,
        slotId: filters.slot,
        search: filters.search,
        startDate: filters.dateRange.start || undefined,
        endDate: filters.dateRange.end || undefined
      });
      
      const response = await getBookings({
        status: activeStatus,
        page,
        limit: pagination.limit,
        slotId: filters.slot || undefined,
        search: filters.search || undefined,
        startDate: filters.dateRange.start || undefined,
        endDate: filters.dateRange.end || undefined
      });
      
      console.log('Bookings response:', response);
      setBookings(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeStatus, filters.slot, filters.search, filters.dateRange.start, filters.dateRange.end]);

  const handleBookingSelect = (booking: BookingData) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleEditBooking = (booking: BookingData) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (bookingData: Partial<BookingData>) => {
    try {
      // TODO: Implement API call
      console.log('Edit booking:', bookingData);
      setSuccessMessage('Booking request updated successfully');
      setIsEditModalOpen(false);
      fetchBookings();
    } catch (error) {
      setError('Failed to update booking request');
    }
  };

  const handleCreateBooking = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (bookingData: Partial<BookingData>) => {
    try {
      // TODO: Implement API call
      console.log('Create booking:', bookingData);
      setSuccessMessage('Booking request created successfully');
      setIsCreateModalOpen(false);
      fetchBookings();
    } catch (error) {
      setError('Failed to create booking request');
    }
  };

  const handleDeleteBooking = async (booking: BookingData) => {
    try {
      await deleteBooking(booking._id);
      setSuccessMessage('Booking deleted successfully');
      fetchBookings();
    } catch (error) {
      setError('Failed to delete booking');
    }
  };

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
  };

  // Show success message for 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <DashboardLayout>
      <div className="overflow-y-auto max-h-[calc(100vh-6rem)]">
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

        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Booking Management</h1>
            <p className="text-gray-600">Manage patient booking requests for your available slots</p>
          </div>
          <button 
            className="btn btn-primary mt-4 sm:mt-0"
            onClick={handleCreateBooking}
          >
            <Plus size={18} className="mr-2" />
            Create Booking Request
          </button>
        </div>

        <BookingFilters 
          onFilterChange={(newFilters) => {
            console.log('Filters updated:', newFilters);
            setFilters(newFilters);
          }}
        />

        <div className="mb-6">
          <StatusTabs 
            activeStatus={activeStatus}
            onStatusChange={handleStatusChange}
          />
        </div>

        <BookingTable 
          bookings={bookings}
          onViewDetails={handleBookingSelect}
          onEdit={handleEditBooking}
          onDelete={handleDeleteBooking}
          activeStatus={activeStatus}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={fetchBookings}
        />

        {selectedBooking && (
          <BookingDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            booking={selectedBooking}
            setSuccessMessage={setSuccessMessage}
            setError={setError}
            onEdit={() => {
              setIsDetailsModalOpen(false);
              setIsEditModalOpen(true);
            }}
          />
        )}

        <CreateBookingModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
        />

        <CreateBookingModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          booking={selectedBooking || undefined}
          isEditing={true}
        />
      </div>
    </DashboardLayout>
  );
} 