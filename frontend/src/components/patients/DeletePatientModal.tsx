"use client";

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeletePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  patientName: string;
  isLoading: boolean;
}

const DeletePatientModal: React.FC<DeletePatientModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  patientName,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 p-2 rounded-full mr-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900">Delete Patient Record</h4>
          </div>
          
          <p className="mb-4 text-gray-600">
            Are you sure you want to delete <span className="font-medium">{patientName}</span>&apos;s record? This action cannot be undone and will also remove all associated lab reports.
          </p>
          
          <div className="bg-red-50 p-3 rounded-md text-sm text-red-600 mb-4">
            <p>Warning: This will permanently delete the following:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Patient&apos;s personal information</li>
              <li>Medical history records</li>
              <li>All uploaded lab reports</li>
            </ul>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 bg-gray-50">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="btn bg-red-600 hover:bg-red-700 text-white flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting...
              </>
            ) : (
              'Delete Patient'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePatientModal;
