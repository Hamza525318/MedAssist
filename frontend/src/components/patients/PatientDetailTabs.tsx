"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FileText, ClipboardList, BarChart2, Upload, X, Filter, ChevronLeft, ChevronRight, Trash2, Pill, Eye } from 'lucide-react';
import DeleteReportModal from './DeleteReportModal';
import { PatientData } from '@/types';
import { reportApi, LabReportData, ReportFilter } from '@/utils/api/report';
import { useAuth } from '@/contexts/AuthContext';
import { MedicationData, createPrescription, getPrescriptionsByPatientId, Prescription, deletePrescription, updatePrescription } from '@/utils/api/prescription';
import SignatureCanvas from 'react-signature-canvas';
import type { SignatureCanvas as SignatureCanvasType } from 'react-signature-canvas';
import AddHistoryModal from './AddHistoryModal';
import PrescriptionTab from './tabs/PrescriptionTab';

interface PatientHistoryItem {
  _id?: string;
  note: string;
  field: string;
  date?: string;
  addedBy?: {
    name: string;
  };
}

interface PatientLabReport {
  id: string;
  name: string;
  date: string;
  type: string;
  fileUrl: string;
}

interface Prescription {
  id: string;
  doctorName: string;
  patientName: string;
  age: string;
  gender: string;
  patientContact: string;
  diagnosis: string;
  medications: MedicationData[];
  advice: string;
  followUpDate: string;
  createdAt: string;
  pdfUrl?: string;
}

interface PatientDetailsTabsProps {
  patient: PatientData;
  onRefresh?: () => Promise<void>;
}

interface UploadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (reportType: string, reportName: string, file: File) => Promise<void>;
  isLoading: boolean;
}

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  patient: PatientData;
  doctorName: string;
  prescriptionToEdit?: Prescription;
}


interface DeletePrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  prescriptionId: string;
  isLoading: boolean;
}

const COMMON_REPORT_TYPES = [
  'Blood Test',
  'X-Ray',
  'CT Scan',
  'MRI',
  'Ultrasound',
  'ECG',
  'EEG',
  'Pathology',
  'Other'
];

const UploadReportModal: React.FC<UploadReportModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isLoading
}) => {
  const [reportType, setReportType] = useState('');
  const [reportName, setReportName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customType, setCustomType] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!reportType) {
      setError('Please select or enter a report type');
      return;
    }
    
    if (!reportName) {
      setError('Please enter a report name');
      return;
    }
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    try {
      await onUpload(reportType, reportName, file);
      // Reset form after successful upload
      setReportType('');
      setReportName('');
      setFile(null);
      setCustomType(false);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload report');
    }
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'other') {
      setCustomType(true);
      setReportType('');
    } else {
      setCustomType(false);
      setReportType(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Lab Report</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            {!customType ? (
              <select
                value={reportType}
                onChange={handleTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                disabled={isLoading}
                required
              >
                <option value="">Select report type</option>
                {COMMON_REPORT_TYPES.map((type) => (
                  <option key={type} value={type === 'Other' ? 'other' : type}>
                    {type}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter custom report type"
                disabled={isLoading}
                required
              />
            )}
            {customType && (
              <button
                type="button"
                onClick={() => setCustomType(false)}
                className="text-sm text-teal-600 mt-1 hover:underline"
              >
                Back to common types
              </button>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Name
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="e.g., Annual Blood Work, Chest X-Ray"
              disabled={isLoading}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report File
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-teal-50 file:text-teal-700
                hover:file:bg-teal-100"
              disabled={isLoading}
              required
            />
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
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              disabled={isLoading}
            >
              {isLoading ? 'Uploading...' : 'Upload Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PrescriptionModal: React.FC<PrescriptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  patient,
  doctorName,
  prescriptionToEdit
}) => {
  const [medications, setMedications] = useState<MedicationData[]>(
    prescriptionToEdit?.medications || [{ name: '', strength: '', frequency: '', duration: '' }]
  );
  const [diagnosis, setDiagnosis] = useState(prescriptionToEdit?.diagnosis || '');
  const [advice, setAdvice] = useState(prescriptionToEdit?.advice || '');
  const [followUpDate, setFollowUpDate] = useState(prescriptionToEdit?.followUpDate || '');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const signatureRef = useRef<SignatureCanvasType>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  console.log("PRESCRIPTION EDIT",prescriptionToEdit);

 

  // Update canvas size when container size changes
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setCanvasSize({
          width,
          height: 150 // Fixed height for better control
        });
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (medications.length === 0) {
      setError('Please add at least one medication');
      return;
    }

    try {
      const formData = new FormData();
      
      // Add prescription data with type checks
      if (user?.id) formData.append('doctorId', user.id);
      if (patient._id) formData.append('patientId', patient._id);
      formData.append('patientName', patient.name);
      formData.append('age', '21'); // Using the hardcoded value as per your change
      formData.append('gender', patient.gender);
      formData.append('patientContact', patient.contactNumber || '');
      formData.append('doctorName', user?.name || '');
      formData.append('diagnosis', diagnosis);
      formData.append('medications', JSON.stringify(medications));
      formData.append('advice', advice);
      formData.append('followUpDate', followUpDate);

      // Handle signature
      if (user?.signatureUrl) {
        formData.append('signatureUrl', user.signatureUrl);
      } else if (signatureRef.current) {
        const signatureData = signatureRef.current.toDataURL('image/png');
        // Convert base64 to blob
        const response = await fetch(signatureData);
        const blob = await response.blob();
        formData.append('signature', blob, 'signature.png');
      }

      if (prescriptionToEdit) {
        await updatePrescription(prescriptionToEdit._id, formData);
      } else {
        await createPrescription(formData);
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error saving prescription:', error);
      setError('Failed to save prescription');
    }
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', strength: '', frequency: '', duration: '' }]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (index: number, field: string, value: string) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = { ...updatedMedications[index], [field]: value };
    setMedications(updatedMedications);
  };

  const resetForm = () => {
    setMedications([{ name: '', strength: '', frequency: '', duration: '' }]);
    setDiagnosis('');
    setAdvice('');
    setFollowUpDate('');
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {prescriptionToEdit ? 'Edit Prescription' : 'Create Prescription'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Doctor Name</p>
              <p className="font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Patient Name</p>
              <p className="font-medium">{patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="font-medium">{patient.age}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium">{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Contact</p>
              <p className="font-medium">{patient.contactNumber || 'NA'}</p>
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diagnosis
            </label>
            <textarea
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          {/* Medications */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Medications
              </label>
              <button
                type="button"
                onClick={addMedication}
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                + Add Medication
              </button>
            </div>
            
            <div className="space-y-4">
              {medications.map((med, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Medication {index + 1}</h4>
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        value={med.name}
                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Strength</label>
                      <input
                        type="text"
                        value={med.strength}
                        onChange={(e) => updateMedication(index, 'strength', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="e.g., 500mg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Frequency</label>
                      <input
                        type="text"
                        value={med.frequency}
                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="e.g., Twice a day"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Duration</label>
                      <input
                        type="text"
                        value={med.duration}
                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="e.g., 5 days"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advice */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Advice
            </label>
            <textarea
              value={advice}
              onChange={(e) => setAdvice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>

          {/* Signature Section */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor's Signature
            </label>
            {user?.signatureUrl ? (
              <div className="border rounded-lg p-4">
                <img 
                  src={user.signatureUrl} 
                  alt="Doctor's Signature" 
                  className="max-h-32 object-contain"
                />
              </div>
            ) : (
              <div 
                ref={containerRef}
                className="border rounded-lg p-4 bg-white"
              >
                <div className="relative w-full" style={{ height: '150px' }}>
                  <SignatureCanvas
                    ref={signatureRef}
                    canvasProps={{
                      className: 'signature-canvas absolute inset-0 w-full h-full',
                      width: canvasSize.width,
                      height: canvasSize.height
                    }}
                    backgroundColor="white"
                    penColor="black"
                    velocityFilterWeight={0.7}
                    minWidth={1}
                    maxWidth={2.5}
                    throttle={16}
                  />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Draw your signature above
                  </p>
                  <button
                    type="button"
                    onClick={() => signatureRef.current?.clear()}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Clear Signature
                  </button>
                </div>
              </div>
            )}
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
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeletePrescriptionModal: React.FC<DeletePrescriptionModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  prescriptionId,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Delete Prescription</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete prescription #{prescriptionId}? This action cannot be undone.
        </p>

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
            onClick={onDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PatientDetailTabs: React.FC<PatientDetailsTabsProps> = ({ patient, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'reports' | 'prescriptions'>('details');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<LabReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<LabReportData[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reportFilter, setReportFilter] = useState<string>('');
  const [reportPagination, setReportPagination] = useState({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 0
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeletePrescriptionModalOpen, setIsDeletePrescriptionModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const {user} = useAuth();
  const [isAddHistoryModalOpen, setIsAddHistoryModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleAddHistorySuccess = async () => {
    try {
      setSuccessMessage('Medical history added successfully');
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error('Error refreshing patient data:', error);
      setError('Failed to refresh patient data');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  const fetchReports = useCallback(async () => {
    if (!patient?.patientId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const filter: ReportFilter = {};
      if (reportFilter) {
        filter.reportType = reportFilter;
      }
      
      const response = await reportApi.getPatientReports(
        patient.patientId,
        filter,
        reportPagination.page,
        reportPagination.limit
      );
      
      if (response.success && response.data) {
        setReports(response.data);
        if (response.pagination) {
          setReportPagination(response.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  }, [patient?.patientId, reportFilter, reportPagination.page, reportPagination.limit]);

  const fetchPrescriptions = useCallback(async () => {

    console.log("FETCH PRESCRIPTIONS",patient?._id);
    if (!patient?._id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getPrescriptionsByPatientId(patient._id);
      if (response.success && response.data) {
        setPrescriptions(response.data);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prescriptions');
    } finally {
      setIsLoading(false);
    }
  }, [patient?._id]);

  // Fetch reports when tab changes to reports or after filter/pagination changes
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab, fetchReports]);

  // Fetch prescriptions when tab changes to prescriptions
  useEffect(() => {
    if (activeTab === 'prescriptions') {
      fetchPrescriptions();
    }
  }, [activeTab, fetchPrescriptions]);

  const handleUploadReport = async (reportType: string, reportName: string, file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await reportApi.uploadLabReport(patient.patientId, reportType, reportName, file);
      // Refresh reports list
      await fetchReports();
      // Refresh patient data after successful upload
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload report');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteReport = async () => {
    if (!selectedReport) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await reportApi.deleteLabReport(selectedReport._id);
      // Refresh reports list
      await fetchReports();
      // Refresh patient data after successful deletion
      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
      throw err;
    } finally {
      setIsLoading(false);
      setSelectedReport(null);
    }
  };
  
  const openDeleteModal = (report: LabReportData) => {
    setSelectedReport(report);
    setIsDeleteModalOpen(true);
  };
  
  const handlePageChange = (newPage: number) => {
    setReportPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };
  
  const handleFilterChange = (type: string) => {
    setReportFilter(type);
    setReportPagination(prev => ({
      ...prev,
      page: 1 // Reset to first page when filter changes
    }));
    setIsFilterOpen(false);
  };

  const handleEditPrescription = (prescription: Prescription) => {
    console.log("PRESCRIPTION", prescription);
    setSelectedPrescription(prescription);
    setIsEditMode(true);
    setIsPrescriptionModalOpen(true);
  };

  const handleCreatePrescription = () => {
    setSelectedPrescription(null);
    setIsEditMode(false);
    setIsPrescriptionModalOpen(true);
  };

  const handlePrescriptionSubmit = async (prescriptionData: Omit<Prescription, 'id' | 'createdAt'>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Add prescription data
      if (user?.id) formData.append('doctorId', user.id);
      if (patient._id) formData.append('patientId', patient._id);
      formData.append('patientName', patient.name);
      formData.append('age', patient.age?.toString() || '');
      formData.append('gender', patient.gender);
      formData.append('patientContact', patient.contactNumber || '');
      formData.append('doctorName', user?.name || '');
      formData.append('diagnosis', prescriptionData.diagnosis);
      formData.append('medications', JSON.stringify(prescriptionData.medications));
      formData.append('advice', prescriptionData.advice);
      formData.append('followUpDate', prescriptionData.followUpDate);

      if (isEditMode && selectedPrescription) {
        await updatePrescription(selectedPrescription._id, formData);
      } else {
        await createPrescription(formData);
      }
      
      console.log("CREATED PRESCRIPTION SUCCESSFULLY");
      // Close modal first
      setIsPrescriptionModalOpen(false);
      setSelectedPrescription(null);
      setIsEditMode(false);
      
      // Then refresh prescriptions
      await fetchPrescriptions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prescription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePrescription = async () => {
    if (!selectedPrescription) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await deletePrescription(selectedPrescription._id);
      // Refresh prescriptions list
      await fetchPrescriptions();
      // Close modal and reset selection
      setIsDeletePrescriptionModalOpen(false);
      setSelectedPrescription(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prescription');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const openDeletePrescriptionModal = (prescription: Prescription) => {
    setSelectedPrescription(prescription);
    setIsDeletePrescriptionModalOpen(true);
  };

  const tabs = [
    { id: 'details' as const, label: 'Details', icon: ClipboardList },
    { id: 'history' as const, label: 'Medical History', icon: FileText },
    { id: 'reports' as const, label: 'Lab Reports', icon: BarChart2 },
    { id: 'prescriptions' as const, label: 'Prescriptions', icon: Pill },
  ];

  const handleTabChange = (tabId: 'details' | 'history' | 'reports' | 'prescriptions') => {
    setActiveTab(tabId);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'border-b-2 border-teal-700 text-teal-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange(tab.id)}
          >
            <tab.icon size={18} className="mr-2" />
            {tab.label}
          </button>
        ))}
      </div>
       
    {successMessage && (
      <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
        {successMessage}
      </div>
    )}

      <div className="p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-800">Patient Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Full Name</p>
                  <p className="font-medium">{patient.name}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Patient ID</p>
                  <p className="font-medium">#{patient.patientId}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                  <p className="font-medium">{formatDate(patient.dob)}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Age</p>
                  <p className="font-medium">{patient.age}</p>
                </div>
              </div>
              
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Gender</p>
                  <p className="font-medium">{patient.gender}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Contact</p>
                  <p className="font-medium">{patient.contactNumber || 'NA'}</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-1">Address</p>
                  <p className="font-medium">{patient.address || 'NA'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Medical History</h3>
              <button 
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 flex items-center"
                onClick={() => setIsAddHistoryModalOpen(true)}
              >
                <FileText size={16} className="mr-2" />
                Add Note
              </button>
            </div>
            
            {patient.history && patient.history.length > 0 ? (
              <div className="space-y-6">
                {patient.history?.map((item, ind) => (
                  <div key={ind} className="relative pl-6 pb-6 border-l-2 border-gray-200">
                    {/* Timeline dot */}
                    <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-teal-700"></div>
                    
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-800">{item.field}</span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{formatDate(item.date)}</span>
                    </div>
                    
                    <p className="text-gray-700 mb-2">{item.note}</p>
                    
                    <p className="text-xs text-gray-500">Added by: Dr. {item.addedBy?.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No medical history records found
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-800 mr-3">Lab Reports</h3>
                <div className="relative">
                  <button 
                    className="px-2 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                  >
                    <Filter size={14} className="mr-1" />
                    {reportFilter ? reportFilter : 'Filter'}
                  </button>
                  
                  {isFilterOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-white shadow-lg rounded-md z-10 w-48 py-1">
                      <button 
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                        onClick={() => handleFilterChange('')}
                      >
                        All Types
                      </button>
                      {COMMON_REPORT_TYPES.filter(t => t !== 'Other').map(type => (
                        <button 
                          key={type}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => handleFilterChange(type)}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button 
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 flex items-center"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <Upload size={16} className="mr-2" />
                Upload Report
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4 animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : reports.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reports.map((report) => (
                    <div key={report._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{report.name || 'Unnamed Report'}</h4>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                          {report.reportType}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-1">Uploaded on {new Date(report.createdAt).toLocaleDateString()}</p>
                      {report.addedBy && (
                        <p className="text-xs text-gray-500 mb-3">By: {report.addedBy.name}</p>
                      )}
                      
                      <div className="flex space-x-2">
                        <a 
                          href={report.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-xs font-medium text-teal-700 bg-teal-50 rounded-md hover:bg-teal-100"
                        >
                          View
                        </a>
                        <a 
                          href={report.fileUrl} 
                          download
                          className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Download
                        </a>
                        <button
                          onClick={() => openDeleteModal(report)}
                          className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 flex items-center"
                        >
                          <Trash2 size={12} className="mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {reportPagination.totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                        disabled={reportPagination.page === 1}
                        onClick={() => handlePageChange(reportPagination.page - 1)}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      
                      <span className="text-sm text-gray-600">
                        Page {reportPagination.page} of {reportPagination.totalPages}
                      </span>
                      
                      <button
                        className="p-2 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                        disabled={reportPagination.page === reportPagination.totalPages}
                        onClick={() => handlePageChange(reportPagination.page + 1)}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {reportFilter ? `No ${reportFilter} reports found` : 'No lab reports uploaded yet'}
              </div>
            )}
          </div>
        )}

        {activeTab === 'prescriptions' && (
            <PrescriptionTab
             prescriptions={prescriptions}
             isLoading={isLoading}
             error={error}
             patient={patient}
             onCreatePrescription={handleCreatePrescription}
             onEditPrescription={handleEditPrescription}
             onDeletePrescription={openDeletePrescriptionModal}
           />
        )}
      </div>
      
      <UploadReportModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadReport}
        isLoading={isLoading}
      />
      
      <DeleteReportModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteReport}
        reportName={selectedReport?.name || selectedReport?.reportType || 'this report'}
        isLoading={isLoading}
      />

        <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => {
          setIsPrescriptionModalOpen(false);
          setSelectedPrescription(null);
          setIsEditMode(false);
        }}
        onSubmit={handlePrescriptionSubmit}
        isLoading={isLoading}
        patient={patient}
        doctorName={user?.name || ''}
        prescriptionToEdit={selectedPrescription}
      />

      <DeletePrescriptionModal
        isOpen={isDeletePrescriptionModalOpen}
        onClose={() => {
          setIsDeletePrescriptionModalOpen(false);
          setSelectedPrescription(null);
        }}
        onDelete={handleDeletePrescription}
        prescriptionId={selectedPrescription?.prescriptionId || ''}
        isLoading={isLoading}
      />
       <AddHistoryModal
        isOpen={isAddHistoryModalOpen}
        onClose={() => setIsAddHistoryModalOpen(false)}
        patient={patient}
        onSuccess={handleAddHistorySuccess}
      />
    </div>
  );
};

export default PatientDetailTabs;
