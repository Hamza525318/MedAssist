import React from 'react';
import { X } from 'lucide-react';
import { BookingResponse } from '@/types';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking: BookingResponse | null;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  booking,
  isDeleting
}) => {
  if (!isOpen || !booking) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (startHour: number, endHour: number) => {
    const formatHour = (hour: number) => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:00 ${period}`;
    };
    return `${formatHour(startHour)} - ${formatHour(endHour)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          disabled={isDeleting}
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-4 text-xl font-semibold text-gray-900">Delete Booking</h2>
        
        <div className="mb-6">
          <p className="text-gray-700">Are you sure you want to delete this booking?</p>
          
          <div className="mt-4 rounded-md bg-gray-50 p-4">
            <div className="mb-2">
              <span className="font-medium text-gray-700">Patient: </span>
              <span className="text-gray-600">{booking.patientId.name}</span>
            </div>
            <div className="mb-2">
              <span className="font-medium text-gray-700">Date: </span>
              <span className="text-gray-600">
                {booking.slotId && formatDate(booking.slotId.date)}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-medium text-gray-700">Time: </span>
              <span className="text-gray-600">
                {booking.slotId && formatTime(booking.slotId.startHour, booking.slotId.endHour)}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Status: </span>
              <span className="text-gray-600">{booking.status}</span>
            </div>
          </div>
          
          <p className="mt-4 text-sm text-red-600">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;