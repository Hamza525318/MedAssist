"use client";

import React, { useState } from 'react';
import { Check, X, UserCheck, CheckCircle, MoreVertical, ChevronLeft, ChevronRight, Edit, Eye} from 'lucide-react';
import { BookingData } from '@/types';

interface BookingTableProps {
  bookings: BookingData[];
  onViewDetails: (booking: BookingData) => void;
  onEdit: (booking: BookingData) => void;
  onDelete: (booking: BookingData) => void;
  activeStatus: string;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings,
  onViewDetails,
  onEdit,
  onDelete,
  activeStatus
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: BookingData['status']) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = (bookingId: string, newStatus: BookingData['status']) => {
    // TODO: Implement status update logic
    console.log(`Updating booking ${bookingId} to ${newStatus}`);
  };

  const handleViewDetails = (booking: BookingData) => {
    onViewDetails(booking);
  };

  const handleEdit = (booking: BookingData) => {
    onEdit(booking);
  };

  const handleDelete = (booking: BookingData) => {
    onDelete(booking);
  };

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
            {bookings.map((booking, index) => (
              <tr 
                key={index}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.patientName}</div>
                      <div className="text-sm text-gray-500">{booking.patientId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.dob}</div>
                  <div className="text-sm text-gray-500">{booking.slotTime}</div>
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
                      onClick={() => handleViewDetails(booking)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {booking.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleEdit(booking)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(booking)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <X size={18} />
                        </button>
                      </>
                    )}
                    {booking.status === 'Pending' && (
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'Confirmed')}
                        className="text-green-600 hover:text-green-900"
                        title="Confirm"
                      >
                        <Check size={18} />
                      </button>
                    )}
                    {booking.status === 'Confirmed' && (
                      <button
                        onClick={() => handleStatusUpdate(booking._id, 'Completed')}
                        className="text-green-600 hover:text-green-900"
                        title="Complete"
                      >
                        <CheckCircle size={18} />
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
            onClick={() => handleViewDetails(booking)}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{booking.patientName}</h3>
                <p className="text-sm text-gray-500">#{booking.patientId}</p>
              </div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>
            <div className="text-sm text-gray-500 mb-2">
              <p>{booking.dob} at {booking.slotTime}</p>
              <p className="mt-1">{booking.reason}</p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(booking);
                }}
                className="text-blue-600 hover:text-blue-900"
                title="Edit"
              >
                <Edit size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(booking);
                }}
                className="text-red-600 hover:text-red-900"
                title="Delete"
              >
                <X size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(booking);
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