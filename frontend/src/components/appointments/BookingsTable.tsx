"use client";

import React, { useState } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Booking {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Checked In' | 'Completed' | 'Cancelled';
}

interface BookingsTableProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
  onRescheduleBooking: (bookingId: string) => void;
}

type StatusTab = 'All' | 'Upcoming' | 'Checked In' | 'Completed' | 'Cancelled';

const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  onCancelBooking,
  onRescheduleBooking,
}) => {
  const [activeTab, setActiveTab] = useState<StatusTab>('All');

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Upcoming') return booking.status === 'Pending' || booking.status === 'Confirmed';
    return booking.status === activeTab;
  });

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case 'Checked In':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const isActionAllowed = (status: string, action: 'cancel' | 'reschedule') => {
    if (action === 'cancel') {
      return status === 'Pending' || status === 'Confirmed';
    }
    if (action === 'reschedule') {
      return status === 'Pending' || status === 'Confirmed';
    }
    return false;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Tabs */}
      <div className="border-b">
        <div className="flex overflow-x-auto">
          {(['All', 'Upcoming', 'Checked In', 'Completed', 'Cancelled'] as StatusTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-2 border-teal-700 text-teal-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        {filteredBookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-teal-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{booking.doctorName}</div>
                        <div className="text-sm text-gray-500">{booking.doctorSpecialty}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        {booking.date}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        {booking.time}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderStatusBadge(booking.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-teal-600 hover:text-teal-900 mr-3">
                      View Details
                    </button>
                    {isActionAllowed(booking.status, 'reschedule') && (
                      <button 
                        onClick={() => onRescheduleBooking(booking.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Reschedule
                      </button>
                    )}
                    {isActionAllowed(booking.status, 'cancel') && (
                      <button 
                        onClick={() => onCancelBooking(booking.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BookingsTable;
