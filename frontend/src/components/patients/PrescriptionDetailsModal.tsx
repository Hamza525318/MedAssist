import React from 'react';
import { X, Calendar, User, FileText, Pill } from 'lucide-react';
import { Prescription } from '@/utils/api/prescription';
import { format } from 'date-fns';


interface PrescriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription | null;
}

const PrescriptionDetailsModal: React.FC<PrescriptionDetailsModalProps> = ({
  isOpen,
  onClose,
  prescription
}) => {
  if (!isOpen || !prescription) return null;

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <FileText className="mr-2 text-teal-600" size={20} />
            Prescription Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Patient Info Section */}
          <div className="mb-6 pb-4 border-b">
            <div className='flex items-center gap-2'>
              <User className="mr-2 text-gray-500" size={16} />
              <h3 className="text-lg font-medium text-gray-800">Patient Information</h3>
            </div>
           
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Patient Name</p>
                  <p className="font-medium">{prescription.patientName}</p>
                </div>
              <div>
                <p className="text-sm text-gray-500">Patient ID</p>
                <p className="font-medium">{prescription.patientId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Age</p>
                <p className="font-medium">{prescription.age}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium">{prescription.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">{prescription.patientContact || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Prescription Details */}
          <div className="mb-6 pb-4 border-b">
            <h3 className="text-lg font-medium mb-3 text-gray-800">Prescription Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Doctor</p>
                <p className="font-medium">{prescription.doctorName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(prescription.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Diagnosis</p>
                <p className="font-medium">{prescription.diagnosis}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Follow-up Date</p>
                <div className="flex items-center">
                  <Calendar className="mr-2 text-teal-600" size={16} />
                  <p className="font-medium">{formatDate(prescription.followUpDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Medications */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-gray-800 flex items-center">
              <Pill className="mr-2 text-teal-600" size={18} />
              Medications
            </h3>
            {prescription.medications && prescription.medications.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medication
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Strength
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frequency
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {prescription.medications.map((med, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {med.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {med.strength}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {med.frequency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {med.duration}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">No medications listed</p>
            )}
          </div>

          {/* Additional Advice */}
          {prescription.advice && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2 text-gray-800">Additional Advice</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-700">{prescription.advice}</p>
              </div>
            </div>
          )}
          
          {/* Doctor Signature */}
          {prescription.signatureUrl && (
            <div className="mt-6 text-right">
              <p className="text-sm text-gray-500 mb-1">Doctor&apos;s Signature</p>
              <img
                src={prescription.signatureUrl} 
                alt="Doctor's Signature" 
                className="inline-block h-16 object-contain"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetailsModal;