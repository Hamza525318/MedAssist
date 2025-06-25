import React, { useState } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import { PatientData } from '@/types';
import { exportPatientHistoryPDF } from '@/utils/api/patient';

interface ExportPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientData | null;
}

const ExportPatientModal: React.FC<ExportPatientModalProps> = ({ isOpen, onClose, patient }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !patient) return null;

  const handleExport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call API to generate and download PDF
      const pdfBlob = await exportPatientHistoryPDF(patient.patientId.toString());
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Create a temporary anchor element to trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient_${patient.patientId}_history.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      onClose();
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Failed to export patient history');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Export Patient History</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Are you sure you want to export the medical history for:
          </p>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="font-medium text-gray-800">{patient.name}</p>
            <p className="text-sm text-gray-500">
              #{patient.patientId} • {patient.gender}
            </p>
          </div>
          
          <p className="mt-4 text-sm text-gray-600">
            This will generate a PDF document with the patient's details and medical history.
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileText size={16} className="mr-2" />
                Export PDF
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportPatientModal;