import React, { useState } from 'react';
import { Pill, Trash2, Eye } from 'lucide-react';
import { PatientData } from '@/types';
import { Prescription } from '@/utils/api/prescription';
import PrescriptionDetailsModal from '../PrescriptionDetailsModal';

interface PrescriptionTabProps {
  prescriptions: Prescription[];
  isLoading: boolean;
  error: string | null;
  patient: PatientData;
  onCreatePrescription: () => void;
  onEditPrescription: (prescription: Prescription) => void;
  onDeletePrescription: (prescription: Prescription) => void;
}

const PrescriptionTab: React.FC<PrescriptionTabProps> = ({
  prescriptions,
  isLoading,
  error,
  patient,
  onCreatePrescription,
  onEditPrescription,
  onDeletePrescription
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  const handleViewPrescription = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Prescriptions</h3>
        <button 
          className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 flex items-center"
          onClick={onCreatePrescription}
        >
          <Pill size={16} className="mr-2" />
          New Prescription
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : prescriptions.length > 0 ? (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div key={prescription._id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-gray-800">Prescription #{prescription.prescriptionId}</h4>
                  <p className="text-sm text-gray-500">
                    Created on {new Date(prescription.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewPrescription(prescription)}
                    className="px-3 py-1 text-xs font-medium text-teal-700 bg-teal-50 rounded-md hover:bg-teal-100 flex items-center"
                  >
                    <Eye size={12} className="mr-1" />
                    View Details
                  </button>
                  <button
                    onClick={() => onEditPrescription(prescription)}
                    className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeletePrescription(prescription)}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 flex items-center"
                  >
                    <Trash2 size={12} className="mr-1" />
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Diagnosis:</span> {prescription.diagnosis}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Medications:</span> {prescription.medications.length}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Follow-up:</span> {new Date(prescription.followUpDate).toLocaleDateString()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Doctor:</span> {prescription.doctorName}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No prescriptions found
        </div>
      )}

      {/* Prescription Details Modal */}
      <PrescriptionDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        prescription={selectedPrescription}
      />
    </div>
  );
};

export default PrescriptionTab;