"use client";

import React, { useState } from 'react';
import { Clock, Calendar, Plus, Bell, Check, X, AlarmClock } from 'lucide-react';

export default function MedicineReminder() {
  // Sample medication data - in a real app, this would come from an API
  const [medications, setMedications] = useState([
    {
      id: 1,
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      time: '8:00 AM',
      startDate: '2025-06-01',
      endDate: '2025-12-01',
      instructions: 'Take with food',
      status: 'active',
      nextDose: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
      taken: false
    },
    {
      id: 2,
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      time: '9:00 AM, 9:00 PM',
      startDate: '2025-05-15',
      endDate: '2025-11-15',
      instructions: 'Take with meals',
      status: 'active',
      nextDose: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
      taken: true
    },
    {
      id: 3,
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily',
      time: '10:00 PM',
      startDate: '2025-06-10',
      endDate: '2025-12-10',
      instructions: 'Take at bedtime',
      status: 'active',
      nextDose: new Date(new Date().setHours(22, 0, 0, 0)).toISOString(),
      taken: false
    }
  ]);

  const markAsTaken = (id) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, taken: true } : med
    ));
  };

  // Get current time to determine upcoming medications
  const now = new Date();
  const upcomingMedications = medications.filter(med => {
    const nextDose = new Date(med.nextDose);
    return nextDose > now && !med.taken;
  }).sort((a, b) => new Date(a.nextDose) - new Date(b.nextDose));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-teal-700">Medicine Reminder</h1>
          <p className="text-gray-600">Track and manage your medications</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 transition-colors">
          <Plus className="h-4 w-4 mr-2" />
          Add New Medication
        </button>
      </div>

      {/* Today's Medications */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-teal-700 mb-4">Today's Medications</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {medications.map((med) => (
            <div key={med.id} className={`border rounded-lg p-4 ${med.taken ? 'bg-gray-50 border-gray-200' : 'border-teal-200'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-800">{med.name}</h3>
                  <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                </div>
                <div className={`p-2 rounded-full ${med.taken ? 'bg-green-100' : 'bg-teal-100'}`}>
                  {med.taken ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <Bell className="h-5 w-5 text-teal-700" />
                  )}
                </div>
              </div>
              
              <div className="mt-3 flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>{med.time}</span>
              </div>
              
              <div className="mt-1 text-xs text-gray-500">{med.instructions}</div>
              
              {!med.taken && (
                <button 
                  onClick={() => markAsTaken(med.id)}
                  className="mt-3 w-full py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-md hover:bg-teal-100 transition-colors text-sm font-medium flex items-center justify-center"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark as Taken
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Reminders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-teal-700 mb-4">Upcoming Reminders</h2>
        
        {upcomingMedications.length > 0 ? (
          <div className="space-y-4">
            {upcomingMedications.map((med) => {
              const nextDose = new Date(med.nextDose);
              const hours = nextDose.getHours();
              const minutes = nextDose.getMinutes();
              const timeString = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
              
              return (
                <div key={med.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <div className="p-2 bg-teal-100 rounded-full mr-3">
                      <AlarmClock className="h-5 w-5 text-teal-700" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{med.name} {med.dosage}</h3>
                      <p className="text-sm text-gray-500">{timeString}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 bg-teal-50 text-teal-700 rounded-md hover:bg-teal-100">
                      <Bell className="h-4 w-4" />
                    </button>
                    <button className="p-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming reminders for today.</p>
        )}
      </div>

      {/* Medication Schedule */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-teal-700 mb-4">Medication Schedule</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {medications.map((med) => (
                <tr key={med.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{med.name}</div>
                    <div className="text-sm text-gray-500">{med.instructions}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {med.dosage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {med.frequency}<br />
                    <span className="text-xs">{med.time}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(med.startDate).toLocaleDateString()} - {new Date(med.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {med.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
