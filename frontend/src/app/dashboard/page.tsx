"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  Calendar, 
  Clock 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/utils/api/auth';
import { getAuthToken } from '@/utils/api/auth';
import { useAuth } from '@/contexts/AuthContext';

// Sample data for dashboard
const stats = [
  { 
    name: 'Total Patients', 
    value: '248', 
    icon: Users, 
    change: '+12% from last month',
    color: 'bg-blue-500'
  },
  { 
    name: 'Lab Reports', 
    value: '86', 
    icon: FileText, 
    change: '+8% from last month',
    color: 'bg-emerald-600'
  },
  { 
    name: 'Recent Chats', 
    value: '24', 
    icon: MessageSquare, 
    change: '+18% from last month',
    color: 'bg-teal-700'
  },
];

const recentPatients = [
  { id: '10023', name: 'Jane Doe', gender: 'Female', age: 42, lastVisit: '2025-05-31' },
  { id: '10024', name: 'John Smith', gender: 'Male', age: 35, lastVisit: '2025-05-30' },
  { id: '10025', name: 'Emily Johnson', gender: 'Female', age: 28, lastVisit: '2025-05-29' },
  { id: '10026', name: 'Michael Brown', gender: 'Male', age: 54, lastVisit: '2025-05-28' },
];

const recentChats = [
  { 
    id: 1, 
    patient: 'Jane Doe', 
    patientId: '10023',
    preview: 'Blood test from 2025-05-31 showed elevated WBC. Suggest follow-up.',
    time: '2 hours ago' 
  },
  { 
    id: 2, 
    patient: 'John Smith', 
    patientId: '10024',
    preview: 'Patient history shows allergic reaction to penicillin. Consider alternative antibiotics.',
    time: '1 day ago' 
  },
  { 
    id: 3, 
    patient: 'Emily Johnson', 
    patientId: '10025',
    preview: 'Recent lab results are normal. No further action needed at this time.',
    time: '2 days ago' 
  },
];

export default function DashboardPage() {

    
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back, here&apos;s an overview of your practice</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card border-t-4 border-t-teal-700">
            <div className="flex items-center justify-between mb-4">
              <div className="font-medium text-gray-500">{stat.name}</div>
              <div className={`p-2 rounded-full ${stat.color} text-white`}>
                <stat.icon size={20} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
            <div className="text-sm text-green-600">{stat.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent Patients</h2>
            <Link href="/patients" className="text-sm text-teal-700 hover:text-teal-800">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      #{patient.id}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {patient.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {patient.gender}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {patient.age}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {patient.lastVisit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent AI Chats */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Recent AI Chats</h2>
            <Link href="/chat" className="text-sm text-teal-700 hover:text-teal-800">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {recentChats.map((chat) => (
              <div key={chat.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-gray-800">
                    {chat.patient} <span className="text-gray-500 text-sm">#{chat.patientId}</span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock size={12} className="mr-1" />
                    {chat.time}
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{chat.preview}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Appointments (Optional) */}
      <div className="mt-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Today&apos;s Schedule</h2>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          <div className="flex items-center justify-center p-6 text-gray-500">
            <Calendar className="mr-2" />
            <span>No appointments scheduled for today</span>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
