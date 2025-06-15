"use client";

import React from 'react';
import { X, Check, UserCheck, CheckCircle } from 'lucide-react';
import { BookingData } from '@/types';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingData;
  setSuccessMessage: (message: string | null) => void;
  setError: (error: string | null) => void;
  onEdit: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  setSuccessMessage,
  setError,
  onEdit
}) => {
  if (!isOpen) return null;

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      // API call will be added here
      setSuccessMessage(`Booking status updated to ${newStatus}`);
      onClose();
    } catch (error) {
      setError('Failed to update booking status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'checkedIn':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900">Booking Details</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Patient Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-500">Patient Information</h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-sm font-medium text-gray-900">{booking.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">ID</p>
                    <p className="text-sm font-medium text-gray-900">#{booking.patientId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="text-sm font-medium text-gray-900">{booking.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="text-sm font-medium text-gray-900">{booking.gender}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="text-sm font-medium text-gray-900">{booking.contactNumber}</p>
                  </div>
                </div>
              </div>

              {/* Appointment Information */}
              <div>
                <h4 className="text-sm font-medium text-gray-500">Appointment Information</h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="text-sm font-medium text-gray-900">{booking.dob}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="text-sm font-medium text-gray-900">{booking.slotTime}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Reason</p>
                    <p className="text-sm font-medium text-gray-900">{booking.reason}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            {booking.status === 'Pending' && (
              <>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleStatusUpdate('accepted')}
                >
                  <Check className="mr-2 h-5 w-5" />
                  Accept
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-red-600 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleStatusUpdate('rejected')}
                >
                  <X className="mr-2 h-5 w-5" />
                  Reject
                </button>
              </>
            )}
            {booking.status === 'Accepted' && (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => handleStatusUpdate('checkedIn')}
              >
                <UserCheck className="mr-2 h-5 w-5" />
                Check In
              </button>
            )}
            {booking.status === 'CheckedIn' && (
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-600 text-base font-medium text-white hover:bg-gray-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => handleStatusUpdate('completed')}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Complete
              </button>
            )}
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal; 