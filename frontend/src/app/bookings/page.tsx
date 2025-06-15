"use client";

import React, { useState,useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import BookingFilters from '@/components/bookings/BookingFilters';
import BookingTable from '@/components/bookings/BookingTable';
import BookingDetailsModal from '@/components/bookings/BookingDetailsModal';
import { BookingData } from '@/types';

export default function BookingsPage() {
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Show success message for 3 seconds
    useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleBookingSelect = (booking: BookingData) => {
    setSelectedBooking(booking);
    setIsDetailsModalOpen(true);
  };

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

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Booking Management</h1>
          <p className="text-gray-600">Manage patient booking requests for your available slots</p>
        </div>

        <BookingFilters />

        <BookingTable 
          onBookingSelect={handleBookingSelect}
          setSuccessMessage={setSuccessMessage}
          setError={setError}
        />

        {selectedBooking && (
          <BookingDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            booking={selectedBooking}
            setSuccessMessage={setSuccessMessage}
            setError={setError}
          />
        )}
      </div>
    </DashboardLayout>
  );
} 