"use client";

import React, { useState } from 'react';
import { Check, X, UserCheck, CheckCircle, MoreVertical, ChevronLeft, ChevronRight, Edit, Eye} from 'lucide-react';
import { BookingResponse } from '@/types';

interface BookingTableProps {
  bookings: BookingResponse[];
  onViewDetails: (booking: BookingResponse) => void;
  onEdit: (booking: BookingResponse) => void;
  onDelete: (booking: BookingResponse) => void;
  activeStatus: string;
  isLoading?: boolean;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  onPageChange?: (page: number) => void;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  onViewDetails,
  onEdit,
  onDelete,
  activeStatus,
  isLoading = false,
  pagination,
  onPageChange
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'checkedin':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  };

  if (isLoading) {
    return (
      <div className="card p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Appointment
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reason
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bookings.map((booking) => (
              <tr 
                key={booking._id}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.patientId.name}</div>
                      <div className="text-sm text-gray-500">#{booking.patientId.patientId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(booking.slotId.date)}</div>
                  <div className="text-sm text-gray-500">{formatTime(booking.slotId.startHour, booking.slotId.endHour)}</div>
                  <div className="text-sm text-gray-500">{booking.slotId.location}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 truncate max-w-xs">{booking.reason}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onViewDetails(booking)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {booking.status === 'Pending' && (
                      <button
                        onClick={() => onEdit(booking)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                    )}
                    {(booking.status === 'Pending' || booking.status === 'Accepted') && (
                      <button
                        onClick={() => onDelete(booking)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewDetails(booking)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{booking.patientId.name}</h3>
                <p className="text-sm text-gray-500">#{booking.patientId.patientId}</p>
              </div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <p>{formatDate(booking.slotId.date)} at {formatTime(booking.slotId.startHour, booking.slotId.endHour)}</p>
              <p className="mt-1">{booking.slotId.location}</p>
              <p className="mt-1">{booking.reason}</p>
            </div>
            <div className="flex justify-end space-x-2">
              {(booking.status === 'Pending' || booking.status === 'Accepted') && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(booking);
                  }}
                  className="text-red-600 hover:text-red-900"
                  title="Delete"
                >
                  <X size={18} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(booking);
                }}
                className="text-teal-600 hover:text-teal-900"
                title="View Details"
              >
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center space-x-2">
            <button
              className="btn btn-outline p-2"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {pagination.pages}
            </span>
            <button
              className="btn btn-outline p-2"
              disabled={currentPage === pagination.pages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingTable; 