"use client";

import React, { useState, useEffect } from 'react';
import { ChevronsUp, Plus,Calendar } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BookingFilters, { BookingFilters as BookingFiltersType } from '@/components/bookings/BookingFilters';
import BookingTable from '@/components/bookings/BookingTable';
import BookingDetailsModal from '@/components/bookings/BookingDetailsModal';
import CreateBookingModal from '@/components/bookings/CreateBookingModal';
import StatusTabs from '@/components/bookings/StatusTabs';
import { BookingData, BookingResponse } from '@/types';
import { getBookings, deleteBooking,updateBooking } from '@/utils/api/booking';
import ConfirmationModal from '@/components/bookings/ConfirmationModal';
import EditBookingModal from '@/components/bookings/EditBookingModal';
import BulkRescheduleModal from '@/components/bookings/BulkRescheduleModal';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isBulkRescheduleModalOpen, setIsBulkRescheduleModalOpen] = useState(false);
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
  const [statusChangeConfirmation, setStatusChangeConfirmation] = useState<{
    isOpen: boolean;
    booking: BookingData | null;
    newStatus: string;
  }>({
    isOpen: false,
    booking: null,
    newStatus: ''
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

  const handleViewDetails = (booking: BookingData) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleBookingUpdated = async () => {
    try {
      setIsLoading(true);
      await fetchBookings(pagination.page);
      setSuccessMessage("Booking updated successfully");
    } catch (error) {
      console.error('Error updating booking:', error);
      setError('Failed to update booking');
    } finally {
      setIsLoading(false);
    }
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
      if(!booking._id){
        return;
      }
      await deleteBooking(booking._id);
      setSuccessMessage('Booking deleted successfully');
      fetchBookings();
    } catch (error) {
      setError('Failed to delete booking',error?.message);
    }
  };

  const handleStatusChange = (status: string) => {
    setActiveStatus(status);
  };

  const handleBookingRequestStatusChange = (booking: BookingResponse, status: string)=>{
      // Open confirmation modal with booking and new status
    setStatusChangeConfirmation({
      isOpen: true,
      booking,
      newStatus: status
    });
  }

  const handleConfirmStatusChange = async () => {
    if (!statusChangeConfirmation.booking || !statusChangeConfirmation.newStatus) return;
    
    setIsLoading(true);
    try {

      const { booking, newStatus } = statusChangeConfirmation;
      console.log("Booking Status Change",booking,newStatus);
      if(booking._id){
        await updateBooking(booking._id, { status: newStatus });
      }
      setSuccessMessage(`Booking status updated to ${newStatus} successfully`);
      fetchBookings(pagination.page);
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Failed to update booking status');
    } finally {
      setIsLoading(false);
      // Close confirmation modal
      setStatusChangeConfirmation({
        isOpen: false,
        booking: null,
        newStatus: ''
      });
    }
  };

  const handleCancelStatusChange = () => {
    // Close confirmation modal without taking action
    setStatusChangeConfirmation({
      isOpen: false,
      booking: null,
      newStatus: ''
    });
  };

  const getConfirmationModalType = (status: string) => {
    switch (status) {
      case 'Accepted':
      case 'Completed':
      case 'CheckedIn':
        return 'success';
      case 'Rejected':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const getStatusChangeMessage = (currentStatus: string, newStatus: string) => {
    return `Are you sure you want to change the booking status from "${currentStatus}" to "${newStatus}"?`;
  };

  const handleBulkReschedule = () => {
    setIsBulkRescheduleModalOpen(true);
  };

  const handleBulkRescheduleComplete = async () => {
    try {
      setIsLoading(true);
      await fetchBookings(pagination.page);
      setSuccessMessage("Bookings rescheduled successfully");
    } catch (error) {
      console.error('Error after rescheduling bookings:', error);
      setError('Failed to refresh bookings after rescheduling');
    } finally {
      setIsLoading(false);
    }
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
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            <button 
              className="btn btn-secondary"
              onClick={handleBulkReschedule}
            >
              <Calendar size={18} className="mr-2" />
              Reschedule Bulk Booking
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleCreateBooking}
            >
              <Plus size={18} className="mr-2" />
              Create Booking Request
            </button>
          </div>
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
          handleBookingRequestStatusChange={handleBookingRequestStatusChange}
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

        {statusChangeConfirmation.isOpen && statusChangeConfirmation.booking && (
          <ConfirmationModal
            isOpen={statusChangeConfirmation.isOpen}
            onClose={handleCancelStatusChange}
            onConfirm={handleConfirmStatusChange}
            title={`Change Booking Status`}
            message={getStatusChangeMessage(statusChangeConfirmation.booking.status, statusChangeConfirmation.newStatus)}
            confirmText={`Yes, Change Status`}
            cancelText="Cancel"
            type={getConfirmationModalType(statusChangeConfirmation.newStatus)}
          />
        )}
         
         
        {selectedBooking && (
          <EditBookingModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onBookingUpdated={handleBookingUpdated}
            booking={selectedBooking}
          />
        )}

        <BulkRescheduleModal
          isOpen={isBulkRescheduleModalOpen}
          onClose={() => setIsBulkRescheduleModalOpen(false)}
          onRescheduleComplete={handleBulkRescheduleComplete}
        />
      </div>
    </DashboardLayout>
  );
} 