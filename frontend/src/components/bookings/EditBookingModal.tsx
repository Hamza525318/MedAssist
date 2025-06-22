"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BookingData } from '@/types/booking';
import { getSlots } from '@/utils/api/slot';
import { Slot } from '@/types/slot';
import { updateBooking } from '@/utils/api/booking';

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingUpdated: () => void;
  booking: BookingData;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({
  isOpen,
  onClose,
  onBookingUpdated,
  booking
}) => {
  const [formData, setFormData] = useState<{
    status: string;
    reason: string;
    slotId: string;
  }>({
    status: '',
    reason: '',
    slotId: ''
  });

  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data when booking changes
  useEffect(() => {
    if (booking) {
      setFormData({
        status: booking.status,
        reason: booking.reason,
        slotId: booking.slotId._id
      });
    }
  }, [booking]);

  // Fetch available slots when modal opens
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setIsLoading(true);
        const availableSlots = await getSlots();
        setSlots(availableSlots);
      } catch (error) {
        setError('Failed to fetch available slots');
        console.error('Error fetching slots:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchSlots();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);

      if (!formData.status || !formData.slotId || !formData.reason) {
        throw new Error('Please fill in all required fields');
      }

      // Only update the fields that can be edited
      const updateData = {
        status: formData.status,
        slotId: formData.slotId,
        reason: formData.reason
      };

      await updateBooking(booking._id, updateData);
      
      onBookingUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating booking:', error);
      setError(error instanceof Error ? error.message : 'Failed to update booking');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center pb-3 border-b">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Booking Details</h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mt-3 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Patient Information (Read-only) */}
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="text-md font-medium text-gray-700 mb-2">Patient Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{booking?.patientId?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Patient ID</label>
                    <p className="mt-1 text-sm text-gray-900">#{booking?.patientId?.patientId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Contact</label>
                    <p className="mt-1 text-sm text-gray-900">{booking?.patientId?.contactNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Gender</label>
                    <p className="mt-1 text-sm text-gray-900">{booking?.patientId?.gender}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Age</label>
                    <p className="mt-1 text-sm text-gray-900">{booking?.patientId?.age}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="mt-1 text-sm text-gray-900">{new Date(booking?.patientId?.dob).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Editable Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="CheckedIn">Checked In</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Appointment Slot</label>
                <select
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.slotId}
                  onChange={(e) => setFormData({ ...formData, slotId: e.target.value })}
                  required
                >
                  <option value="">Select a Slot</option>
                  {slots.map((slot) => (
                    <option key={slot._id} value={slot._id}>
                      {new Date(slot.date).toLocaleDateString()} - {slot.startHour}:00 to {slot.endHour}:00
                      ({slot.bookedCount}/{slot.capacity} booked) - {slot.location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
                <textarea
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Booking'}
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBookingModal;