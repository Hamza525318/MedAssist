"use client";

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Edit, X, Check, Loader2 } from 'lucide-react';
import { usePatientAuth } from '@/contexts/PatientAuthContext';
import { PatientProfile as PatientProfileType } from '@/utils/api/users/auth';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientData: PatientProfileType | null;
  onSave: (data: Partial<PatientProfileType>) => Promise<PatientProfileType | null>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, patientData, onSave }) => {
  const [formData, setFormData] = useState<Partial<PatientProfileType>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (patientData && isOpen) {
      // Format date for the date input
      let formattedDob = patientData.dob;
      if (patientData.dob) {
        try {
          const date = new Date(patientData.dob);
          formattedDob = format(date, 'yyyy-MM-dd');
        } catch (error) {
          console.error('Error formatting date:', error);
        }
      }

      setFormData({
        name: patientData.name,
        email: patientData.email,
        dob: formattedDob,
        gender: patientData.gender,
        contactNumber: patientData.contactNumber,
        address: patientData.address,
      });
      setErrors({});
    }
  }, [patientData, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (formData.name && formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.contactNumber && !/^\+?[0-9\s\-\(\)]{8,20}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const updatedProfile = await onSave(formData);
      if (updatedProfile) {
        toast.success('Profile updated successfully');
        onClose();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating your profile');
      console.error('Profile update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-teal-700">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email || ''}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isSubmitting}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender || ''}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isSubmitting}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber || ''}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'}`}
              disabled={isSubmitting}
            />
            {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function PatientProfile() {
  const { patient, updateProfile } = usePatientAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formattedDob, setFormattedDob] = useState<string>('');

  useEffect(() => {
    if (patient?.dob) {
      try {
        const date = new Date(patient.dob);
        setFormattedDob(format(date, 'MMMM d, yyyy'));
      } catch {
        // If date parsing fails, use the raw string
        setFormattedDob(patient.dob || '');
      }
    }
  }, [patient]);

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSaveProfile = async (profileData: Partial<PatientProfileType>) => {
    return await updateProfile(profileData);
  };

  if (!patient) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-teal-700 animate-spin" />
        <p className="ml-2 text-teal-700">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-teal-700">My Profile</h1>
          <p className="text-gray-600">Manage your personal information</p>
        </div>
        <button 
          onClick={handleOpenEditModal}
          className="flex items-center px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 transition-colors"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Profile Header */}
        <div className="bg-teal-700 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-teal-700 text-3xl font-bold">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{patient.name}</h2>
              <p className="text-teal-100">Patient ID: {patient.patientId}</p>
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
                  <p className="font-medium">{patient.email}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">{patient.contactNumber || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{formattedDob || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{patient.gender || 'Not provided'}</p>
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
                  <p className="font-medium">{patient.address || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        patientData={patient}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
