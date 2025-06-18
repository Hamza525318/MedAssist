"use client";

import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Edit } from 'lucide-react';

export default function PatientProfile() {
  // Sample patient data - in a real app, this would come from an API
  const [patientData, setPatientData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    dob: 'January 15, 1985',
    gender: 'Male',
    bloodGroup: 'O+',
    address: '123 Main Street, Anytown, CA 12345',
    emergencyContact: 'Jane Doe (Wife) - +1 (555) 987-6543',
    allergies: ['Penicillin', 'Peanuts'],
    chronicConditions: ['Hypertension'],
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-teal-700">My Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>
        <button 
          onClick={handleEdit}
          className="flex items-center px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 transition-colors"
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Profile Header */}
        <div className="bg-teal-700 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-teal-700 text-3xl font-bold">
              {patientData.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{patientData.name}</h2>
              <p className="text-teal-100">Patient ID: PT-10012345</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-teal-700 border-b pb-2">Personal Information</h3>
              
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="font-medium">{patientData.email}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{patientData.phone}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{patientData.dob}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{patientData.gender}</p>
                </div>
              </div>
            </div>
            
            {/* Medical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-teal-700 border-b pb-2">Medical Information</h3>
              
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="font-medium">{patientData.bloodGroup}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Allergies</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patientData.allergies.map((allergy, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {allergy}
                    </span>
                  ))}
                  {patientData.allergies.length === 0 && (
                    <p className="text-gray-500 text-sm">No known allergies</p>
                  )}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Chronic Conditions</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patientData.chronicConditions.map((condition, index) => (
                    <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      {condition}
                    </span>
                  ))}
                  {patientData.chronicConditions.length === 0 && (
                    <p className="text-gray-500 text-sm">No chronic conditions</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Information */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold text-teal-700 mb-4">Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{patientData.address}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Emergency Contact</p>
                  <p className="font-medium">{patientData.emergencyContact}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
