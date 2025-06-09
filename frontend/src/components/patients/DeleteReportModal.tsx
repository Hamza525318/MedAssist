"use client";

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  reportName: string;
  isLoading: boolean;
}

const DeleteReportModal: React.FC<DeleteReportModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  reportName,
  isLoading
}) => {
  const handleDelete = async () => {
    try {
      await onDelete();
      onClose();
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Delete Report</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-center mb-4 text-amber-500">
            <AlertTriangle size={48} />
          </div>
          <p className="text-center text-gray-700 mb-2">
            Are you sure you want to delete this report?
          </p>
          <p className="text-center font-medium mb-2">
            &quot;{reportName}&quot;
          </p>
          <p className="text-center text-sm text-gray-500">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteReportModal;
