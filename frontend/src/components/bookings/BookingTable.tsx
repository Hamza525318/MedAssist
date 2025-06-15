"use client";

import React, { useState } from 'react';
import { Check, X, UserCheck, CheckCircle, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { BookingData } from '@/types';

interface BookingTableProps {
  onBookingSelect: (booking: BookingData) => void;
  setSuccessMessage: (message: string | null) => void;
  setError: (error: string | null) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  onBookingSelect,
  setSuccessMessage,
  setError
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for development
  const mockBookings: BookingData[] = [
    {
      id: '1',
      patientName: 'John Doe',
      patientId: 'P001',
      slotDate: '2024-03-20',
      slotTime: '09:00 AM',
      status: 'Pending',
      reason: 'Regular checkup',
      contactNumber: '+1234567890',
      age: 35,
      gender: 'Male'
    },
    // Add more mock data as needed
  ];

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

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setIsLoading(true);
    try {
      // API call will be added here
      setSuccessMessage(`Booking status updated to ${newStatus}`);
    } catch (error) {
      setError('Failed to update booking status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockBookings.map((booking) => (
              <tr 
                key={booking.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onBookingSelect(booking)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.patientName}</div>
                  <div className="text-sm text-gray-500">#{booking.patientId}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.slotDate}</div>
                  <div className="text-sm text-gray-500">{booking.slotTime}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {booking.reason}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {booking.status === 'Pending' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(booking.id, 'accepted');
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Accept"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(booking.id, 'rejected');
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </>
                    )}
                    {booking.status === 'Accepted' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(booking.id, 'checkedIn');
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Check In"
                      >
                        <UserCheck size={18} />
                      </button>
                    )}
                    {booking.status === 'CheckedIn' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusUpdate(booking.id, 'completed');
                        }}
                        className="text-gray-600 hover:text-gray-900"
                        title="Complete"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookingSelect(booking);
                      }}
                      className="text-gray-600 hover:text-gray-900"
                      title="View Details"
                    >
                      <MoreVertical size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {mockBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onBookingSelect(booking)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{booking.patientName}</h3>
                <p className="text-sm text-gray-500">#{booking.patientId}</p>
              </div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <p>{booking.slotDate} at {booking.slotTime}</p>
              <p className="mt-1">{booking.reason}</p>
            </div>
            <div className="flex justify-end space-x-2">
              {booking.status === 'Pending' && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(booking.id, 'Accepted');
                    }}
                    className="text-green-600 hover:text-green-900"
                    title="Accept"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(booking.id, 'Rejected');
                    }}
                    className="text-red-600 hover:text-red-900"
                    title="Reject"
                  >
                    <X size={18} />
                  </button>
                </>
              )}
              {booking.status === 'Accepted' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(booking.id, 'CheckedIn');
                  }}
                  className="text-blue-600 hover:text-blue-900"
                  title="Check In"
                >
                  <UserCheck size={18} />
                </button>
              )}
              {booking.status === 'CheckedIn' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(booking.id, 'Completed');
                  }}
                  className="text-gray-600 hover:text-gray-900"
                  title="Complete"
                >
                  <CheckCircle size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center space-x-2">
          <button
            className="btn btn-outline p-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage}
          </span>
          <button
            className="btn btn-outline p-2"
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingTable; 