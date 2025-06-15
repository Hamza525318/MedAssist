"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { BookingData } from '@/types';
import { getSlots } from '@/utils/api/slot';
import { getPatients } from '@/utils/api/patient';
import { createBooking } from '@/utils/api/booking';
import { Slot } from '@/types/slot';
import { PatientData } from '@/types/patient';

interface CreateBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: Partial<BookingData>) => Promise<void>;
  booking?: BookingData;
  isEditing?: boolean;
}

const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  booking,
  isEditing = false
}) => {
  const [formData, setFormData] = useState<Partial<BookingData>>({
    patientName: '',
    patientId: '',
    dob: '',
    slotTime: '',
    status: 'Pending',
    reason: '',
    contactNumber: '',
    age: undefined,
    gender: ''
  });

  const [isNewPatient, setIsNewPatient] = useState(true);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (booking) {
      setFormData(booking);
    }
  }, [booking]);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const availableSlots = await getSlots();
        console.log("Available Slots",availableSlots);
        setSlots(availableSlots);
      } catch (error) {
        setError('Failed to fetch available slots');
      }
    };

    if (isOpen) {
      fetchSlots();
    }
  }, [isOpen]);

  const handlePatientSearch = async (value: string) => {
    if (!value) return;

    try {
      setIsLoading(true);
      const params: any = {};
      
      if (value.length === 5) {
        params.patientId = value;
      } else if (value.length === 10) {
        params.contactNumber = value;
      }

      if (Object.keys(params).length > 0) {
        const response = await getPatients(params);
        console.log("RESPONSE FOR PATIENT SEARCH",response);
        if (response.data && response.data.length > 0) {
          const patient = response.data[0];
          setFormData({
            ...formData,
            patientName: patient.name,
            patientId: patient.patientId,
            contactNumber: patient.contactNumber,
            age: patient.age || 0,
            gender: patient.gender,
            dob: patient.dob
          });
        }
      }
    } catch (error) {
      setError('Failed to fetch patient details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);

      if (!formData.patientName || !formData.contactNumber || !formData.gender || !formData.dob || !selectedSlot || !formData.reason) {
        throw new Error('Please fill in all required fields');
      }

      const bookingData = {
        slotId: selectedSlot,
        reason: formData.reason,
        ...(isNewPatient ? {
          patientData: {
            name: formData.patientName,
            contactNumber: formData.contactNumber,
            age: formData.age || 0,
            gender: formData.gender,
            dob: formData.dob
          }
        } : {
          patientId: formData.patientId
        })
      };

      await createBooking(bookingData);
      await onSubmit(formData);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900">
                {isEditing ? 'Edit Booking Request' : 'Create Booking Request'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Patient Type Selection */}
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    checked={isNewPatient}
                    onChange={() => setIsNewPatient(true)}
                  />
                  <span className="ml-2">New Patient</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    checked={!isNewPatient}
                    onChange={() => setIsNewPatient(false)}
                  />
                  <span className="ml-2">Existing Patient</span>
                </label>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-2 gap-4">
                {!isNewPatient && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Patient ID or Phone Number
                    </label>
                    <input
                      type="text"
                      className="input mt-1"
                      placeholder="Enter 5-digit ID or 10-digit phone number"
                      onChange={(e) => handlePatientSearch(e.target.value)}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                  <input
                    type="text"
                    required
                    className="input mt-1"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                  />
                </div>
                {isNewPatient && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Patient ID</label>
                    <input
                      type="text"
                      required
                      className="input mt-1"
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                  <input
                    type="tel"
                    required
                    className="input mt-1"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    required
                    className="input mt-1"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    required
                    className="input mt-1"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Appointment Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    required
                    className="input mt-1"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Available Slots</label>
                  <select
                    required
                    className="input mt-1"
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                  >
                    <option value="">Select a Slot</option>
                    {slots.map((slot) => (
                      <option key={slot._id} value={slot._id}>
                        {new Date(slot.date).toLocaleDateString()} - {slot.startHour}:00 to {slot.endHour}:00
                        ({slot.bookedCount}/{slot.capacity} booked)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason for Visit</label>
                <textarea
                  required
                  className="input mt-1"
                  rows={3}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              {/* Submit Button */}
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : (isEditing ? 'Update Booking' : 'Create Booking')}
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

export default CreateBookingModal; 