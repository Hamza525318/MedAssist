import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Pencil } from 'lucide-react';
import { PatientData } from '@/types';

interface MedicalHistoryEntry {
  id: string;
  type: string;
  note: string;
  isEditing?: boolean;
}

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (patientData: PatientData) => void;
  patient?: PatientData | null;
  isEditing?: boolean;
  isLoading?: boolean;
}

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

const AddPatientModal: React.FC<AddPatientModalProps> = ({ 
  isOpen, 
  onClose,
  onSubmit,
  patient = null,
  isEditing = false,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: 'Male',
    contact: '',
    address: '',
    patientId: ''
  });

  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryEntry[]>([]);
  const [newHistory, setNewHistory] = useState<Omit<MedicalHistoryEntry, 'id'>>({ 
    type: 'Orthopedic', 
    note: '',
    isEditing: true 
  });
  const [isAddingHistory, setIsAddingHistory] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleHistoryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewHistory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addMedicalHistory = () => {
    if (newHistory.type && newHistory.note.trim()) {
      setMedicalHistory([
        ...medicalHistory,
        {
          ...newHistory,
          id: Date.now().toString(),
          isEditing: false
        }
      ]);
      setNewHistory({ type: 'Orthopedic', note: '', isEditing: true });
      setIsAddingHistory(false);
    }
  };

  const removeMedicalHistory = (id: string) => {
    setMedicalHistory(medicalHistory.filter(item => item.id !== id));
  };

  const startEditing = (id: string) => {
    setMedicalHistory(medicalHistory.map(item => 
      item.id === id 
        ? { ...item, isEditing: true } 
        : { ...item, isEditing: false }
    ));
  };

  const saveEdit = (id: string, updatedData: Omit<MedicalHistoryEntry, 'id'>) => {
    setMedicalHistory(medicalHistory.map(item => 
      item.id === id 
        ? { ...updatedData, id, isEditing: false } 
        : item
    ));
  };

  // Load patient data when editing
  useEffect(() => {
    if (patient && isEditing) {
      setFormData({
        name: patient.name || '',
        dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : '',
        gender: patient.gender || 'Male',
        contact: patient.contactNumber || '',
        address: patient.address || '',
        patientId: patient.patientId || ''
      });
      
      // Convert history to the format used by the form
      if (patient.history && Array.isArray(patient.history)) {
        const formattedHistory = patient.history.map(item => {
          // Define a proper type for the history item
          interface HistoryItem {
            _id?: string;
            field?: string;
            note: string;
          }
          const historyItem = item as HistoryItem;
          
          return {
            id: historyItem._id || Date.now().toString(),
            type: historyItem.field || '',
            note: historyItem.note || '',
            isEditing: false
          };
        });
        setMedicalHistory(formattedHistory);
      }
    } else {
      // Reset form when not editing
      setFormData({
        name: '',
        dob: '',
        gender: 'Male',
        contact: '',
        address: '',
        patientId: ''
      });
      setMedicalHistory([]);
    }
  }, [patient, isEditing, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientData: PatientData = {
      name: formData.name,
      dob: formData.dob,
      gender: formData.gender,
      contactNumber: formData.contact,
      address: formData.address,
      patientId: isEditing ? formData.patientId : '',
      history: medicalHistory.map((item) => ({
        field: item.type,
        note: item.note,
      }))
    }
    
    onSubmit(patientData);
    setFormData({
        name: '',
        dob: '',
        gender: 'Male',
        contact: '',
        address: '',
        patientId: ''
      });
    setMedicalHistory([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all">
          {/* Header */}
          <div className="border-b px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {isEditing ? 'Update Patient Details' : 'Add New Patient'}
            </h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="label">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="input"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="dob" className="label">
                    Date of Birth
                  </label>
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    required
                    className="input"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="label">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    required
                    className="input"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact" className="label">
                    Contact Number
                  </label>
                  <input
                    id="contact"
                    name="contact"
                    type="tel"
                    className="input"
                    value={formData.contact}
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="label">
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    className="input"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="label">
                      Medical History
                    </label>
                    {!isAddingHistory && (
                      <button
                        type="button"
                        onClick={() => setIsAddingHistory(true)}
                        className="text-sm text-teal-600 hover:text-teal-700 flex items-center"
                      >
                        <Plus size={16} className="mr-1" /> Add Entry
                      </button>
                    )}
                  </div>

                  {/* Medical History List */}
                  <div className="space-y-3 mb-4">
                    {medicalHistory.map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-3 bg-gray-50">
                        {entry.isEditing ? (
                          <div className="space-y-2">
                            <select
                              name="type"
                              value={entry.type}
                              onChange={(e) => saveEdit(entry.id, { 
                                ...entry, 
                                type: e.target.value 
                              })}
                              className="input text-sm py-1"
                            >
                              {medicalHistoryTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                            <div className="flex space-x-2">
                              <input
                                name="note"
                                value={entry.note}
                                onChange={(e) => saveEdit(entry.id, { 
                                  ...entry, 
                                  note: e.target.value 
                                })}
                                className="input flex-1 text-sm py-1"
                                placeholder="Enter note"
                              />
                              <button
                                type="button"
                                onClick={() => saveEdit(entry.id, { ...entry, isEditing: false })}
                                className="px-2 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium text-sm text-gray-700">{entry.type}</span>
                              <p className="text-sm text-gray-600 mt-1">{entry.note}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => startEditing(entry.id)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeMedicalHistory(entry.id)}
                                className="text-gray-500 hover:text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add New Medical History Form */}
                  {isAddingHistory && (
                    <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <select
                            name="type"
                            value={newHistory.type}
                            onChange={handleHistoryChange}
                            className="input w-full"
                          >
                            {medicalHistoryTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Note
                          </label>
                          <textarea
                            name="note"
                            value={newHistory.note}
                            onChange={handleHistoryChange}
                            className="input w-full"
                            rows={3}
                            placeholder="Enter medical note"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingHistory(false);
                              setNewHistory({ type: 'Orthopedic', note: '', isEditing: true });
                            }}
                            className="px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={addMedicalHistory}
                            className="px-3 py-1.5 text-sm bg-teal-600 text-white rounded hover:bg-teal-700"
                            disabled={!newHistory.note.trim()}
                          >
                            Add Entry
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 flex justify-end space-x-3">
              <button
                type="button"
                className="btn btn-outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex items-center"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  isEditing ? 'Update Patient' : 'Add Patient'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPatientModal;