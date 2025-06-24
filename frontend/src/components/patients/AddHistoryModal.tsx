import React, { useState } from 'react';
import { X } from 'lucide-react';
import { updatePatient, UpdatePatientData } from '@/utils/api/patient';
import { PatientData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface AddHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientData;
  onSuccess: () => void;
}

// Medical history types matching those in AddPatientModal
const medicalHistoryTypes = [
  'Orthopedic',
  'Pathology',
  'Neurology',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Other'
];

const AddHistoryModal: React.FC<AddHistoryModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSuccess
}) => {
  const [field, setField] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!field) {
      setError('Please select a history type');
      return;
    }
    
    if (!note) {
      setError('Please enter a note');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Prepare the update data
      const updateData: UpdatePatientData = {
        patientId: patient.patientId,
        history: [{
          field,
          note,
          // The backend will add the date and addedBy information
        }]
      };
      
      // Call the update API
      await updatePatient(updateData);
      
      // Reset form and close modal
      setField('');
      setNote('');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding history:', error);
      setError(error instanceof Error ? error.message : 'Failed to add history');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Add Medical History</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="field" className="block text-sm font-medium text-gray-700 mb-1">
              History Type
            </label>
            <select
              id="field"
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            >
              <option value="">Select history type</option>
              {medicalHistoryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              placeholder="Enter medical history details..."
              disabled={isSubmitting}
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Add History'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHistoryModal;