"use client";

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Calendar, 
  Clock,
  AlertCircle,
  UserPlus,
  UserCheck
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getDashboardStats, getTopBookingsForToday } from '@/utils/api/dashboard';
import type { DashboardStats, TopBooking } from '@/utils/api/dashboard';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topBookings, setTopBookings] = useState<TopBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, bookingsData] = await Promise.all([
          getDashboardStats(),
          getTopBookingsForToday()
        ]);
        
        setStats(statsData);
        setTopBookings(bookingsData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Get status color based on booking status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Accepted':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'CheckedIn':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Define stats cards data
  const statsCards = [
    { 
      name: 'Total Patients', 
      value: stats?.totalPatients || 0, 
      icon: Users, 
      color: 'bg-blue-500'
    },
    { 
      name: 'Pending Bookings', 
      value: stats?.pendingBookings || 0, 
      icon: AlertCircle, 
      color: 'bg-yellow-500'
    },
    { 
      name: 'Today\'s Bookings', 
      value: stats?.todayBookings || 0, 
      icon: Calendar, 
      color: 'bg-green-600'
    },
    { 
      name: 'Weekly Follow-ups', 
      value: stats?.followUpPatients || 0, 
      icon: UserCheck, 
      color: 'bg-purple-600'
    },
    { 
      name: 'New Patients (Month)', 
      value: stats?.newMonthlyPatients || 0, 
      icon: UserPlus, 
      color: 'bg-teal-700'
    },
  ];
    
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back, here&apos;s an overview of your practice</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-200 rounded-lg text-red-700">
          <p className="flex items-center">
            <AlertCircle className="mr-2" size={18} />
            {error}
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-700"></div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statsCards.map((stat, index) => (
              <div key={index} className="card border-t-4 border-t-teal-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-medium text-gray-500">{stat.name}</div>
                  <div className={`p-2 rounded-full ${stat.color} text-white`}>
                    <stat.icon size={20} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
              </div>
            ))}
          </div>

          {/* Today's Appointments */}
          <div className="mt-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Today&apos;s Appointments</h2>
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              
              {topBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Patient
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topBookings.map((booking) => (
                        <tr key={booking.bookingId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{booking.patientName}</div>
                            <div className="text-xs text-gray-500">#{booking.patientId}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {booking.contactNumber}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {booking.time}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {booking.location}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                            {booking.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center p-6 text-gray-500">
                  <Calendar className="mr-2" />
                  <span>No appointments scheduled for today</span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}