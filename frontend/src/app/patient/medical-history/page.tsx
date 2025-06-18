"use client";

import React from 'react';
import { FileText, Download, Search, Filter } from 'lucide-react';

export default function MedicalHistory() {
  // Sample medical records - in a real app, this would come from an API
  const medicalRecords = [
    {
      id: 1,
      title: 'Annual Physical Examination',
      doctor: 'Dr. Sarah Johnson',
      date: 'May 15, 2025',
      type: 'Examination',
      summary: 'Regular annual physical examination. All vitals normal. Recommended continued exercise and balanced diet.',
    },
    {
      id: 2,
      title: 'Blood Test Results',
      doctor: 'Dr. Michael Smith',
      date: 'April 22, 2025',
      type: 'Lab Results',
      summary: 'Complete blood count and metabolic panel. Cholesterol slightly elevated, other results within normal range.',
    },
    {
      id: 3,
      title: 'Cardiology Consultation',
      doctor: 'Dr. Emily Wilson',
      date: 'March 10, 2025',
      type: 'Consultation',
      summary: 'Consultation for occasional chest pain. ECG normal. Recommended stress test as precautionary measure.',
    },
    {
      id: 4,
      title: 'X-Ray Results',
      doctor: 'Dr. Robert Brown',
      date: 'February 5, 2025',
      type: 'Imaging',
      summary: 'Chest X-ray performed due to persistent cough. No abnormalities detected. Prescribed cough suppressant.',
    },
    {
      id: 5,
      title: 'Allergy Test Results',
      doctor: 'Dr. Lisa Adams',
      date: 'January 18, 2025',
      type: 'Lab Results',
      summary: 'Tested for common allergens. Mild allergic reaction to pollen and dust mites detected. Prescribed antihistamines.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Medical History</h1>
        <p className="text-gray-600">View your medical records and history</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search medical records..."
            />
          </div>
          <div className="flex space-x-2">
            <div className="relative inline-block text-left">
              <select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="">Filter by type</option>
                <option value="examination">Examination</option>
                <option value="lab">Lab Results</option>
                <option value="consultation">Consultation</option>
                <option value="imaging">Imaging</option>
              </select>
            </div>
            <div className="relative inline-block text-left">
              <select className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="">Sort by date</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Medical Records List */}
      <div className="space-y-4">
        {medicalRecords.map((record) => (
          <div key={record.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{record.title}</h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <span>{record.doctor}</span>
                    <span className="mx-2">•</span>
                    <span>{record.date}</span>
                    <span className="mx-2">•</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {record.type}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{record.summary}</p>
                </div>
              </div>
              <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                View Full Record
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Medical Records Button */}
      <div className="flex justify-center mt-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Upload New Medical Record
        </button>
      </div>
    </div>
  );
}
