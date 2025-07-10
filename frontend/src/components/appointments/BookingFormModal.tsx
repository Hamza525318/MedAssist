"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl?: string;
}

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: BookingFormData) => void;
  selectedSlot: {
    id: string;
    startTime: string;
    endTime?: string;
  } | null;
  selectedDoctor: Doctor | null;
  selectedDate: Date | null;
}

interface BookingFormData {
  reason: string;
  notes: string;
}

const BookingFormModal: React.FC<BookingFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  selectedSlot,
  selectedDoctor,
  selectedDate,
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    reason: '',
    notes: '',
  });
  const [errors, setErrors] = useState<{ reason?: string }>({});

  if (!isOpen || !selectedSlot || !selectedDoctor || !selectedDate) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (name === 'reason' && errors.reason) {
      setErrors((prev) => ({ ...prev, reason: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: { reason?: string } = {};
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for visit is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Book Appointment</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Appointment Details */}
          <div className="mb-4 p-3 bg-teal-50 rounded-md">
            <h3 className="font-medium text-teal-800 mb-2">Appointment Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-gray-500">Doctor</p>
                <p className="font-medium">{selectedDoctor.name}</p>
                <p className="text-xs text-gray-500">{selectedDoctor.specialty}</p>
              </div>
              <div>
                <p className="text-gray-500">Date & Time</p>
                <p className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</p>
                <p className="text-xs text-gray-500">{selectedSlot.startTime}</p>
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Reason for Visit */}
            <div className="mb-4">
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Visit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-1 focus:ring-teal-500`}
                placeholder="E.g., Annual checkup, Fever, etc."
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-500">{errors.reason}</p>
              )}
            </div>
            
            {/* Notes */}
            <div className="mb-4">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Any additional information you'd like to share with the doctor"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Confirm Booking
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingFormModal;
