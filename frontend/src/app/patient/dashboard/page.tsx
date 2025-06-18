"use client";

import React from 'react';
import { Calendar, ClipboardList, Pill, Award } from 'lucide-react';
import Link from 'next/link';

export default function PatientDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-teal-700">Patient Dashboard</h1>
        <p className="text-teal-600">Welcome to your healthcare dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Upcoming Appointments Card */}
        <Link href="/patient/appointments" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-teal-700">Appointments</h3>
              <p className="text-3xl font-bold text-teal-700 mt-2">2</p>
              <p className="text-sm text-teal-500 mt-1">Upcoming</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-teal-700" />
            </div>
          </div>
        </Link>

        {/* Medical History Card */}
        <Link href="/patient/medical-history" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-teal-700">Medical History</h3>
              <p className="text-3xl font-bold text-teal-700 mt-2">5</p>
              <p className="text-sm text-teal-500 mt-1">Records</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <ClipboardList className="h-6 w-6 text-teal-700" />
            </div>
          </div>
        </Link>

        {/* Medicine Reminders Card */}
        <Link href="/patient/medicine-reminder" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-teal-700">Medicine</h3>
              <p className="text-3xl font-bold text-teal-700 mt-2">3</p>
              <p className="text-sm text-teal-500 mt-1">Reminders</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <Pill className="h-6 w-6 text-teal-700" />
            </div>
          </div>
        </Link>

        {/* Weekly Challenges Card */}
        <Link href="/patient/weekly-challenges" className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-teal-700">Challenges</h3>
              <p className="text-3xl font-bold text-teal-700 mt-2">1</p>
              <p className="text-sm text-teal-500 mt-1">Active</p>
            </div>
            <div className="bg-teal-100 p-3 rounded-full">
              <Award className="h-6 w-6 text-teal-700" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-teal-700 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 pb-4 border-b">
            <div className="bg-teal-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <p className="font-medium">Appointment Confirmed</p>
              <p className="text-sm text-gray-600">Your appointment with Dr. Smith is confirmed for June 20, 2025</p>
              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 pb-4 border-b">
            <div className="bg-teal-100 p-2 rounded-full">
              <Pill className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <p className="font-medium">New Prescription Added</p>
              <p className="text-sm text-gray-600">Dr. Johnson added a new prescription to your profile</p>
              <p className="text-xs text-gray-500 mt-1">Yesterday</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="bg-teal-100 p-2 rounded-full">
              <Award className="h-5 w-5 text-teal-700" />
            </div>
            <div>
              <p className="font-medium">Challenge Completed</p>
              <p className="text-sm text-gray-600">You completed the &quot;Daily Walk&quot; challenge</p>
              <p className="text-xs text-gray-500 mt-1">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
