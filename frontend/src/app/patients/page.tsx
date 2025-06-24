"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Search, Plus, FileText, Edit, Upload, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PatientDetailTabs from '@/components/patients/PatientDetailTabs';
import AddPatientModal from '@/components/patients/AddPatientModal';
import DeletePatientModal from '@/components/patients/DeletePatientModal';
import { createPatient, getPatients, deletePatient, updatePatient } from '@/utils/api/patient';
import { PatientData } from '@/types';
import { useRouter } from 'next/navigation';
import { authApi, getAuthToken } from '@/utils/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthProfile';

export default function PatientsPage() {
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<PatientData | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<PatientData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    total: 0, 
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  const [patients, setPatients] = useState<PatientData[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const {addUserData} = useAuth();
  

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     const token = getAuthToken();
  //     if (!token) {
  //       router.push('/auth/login');
  //       return;
  //     }

  //     try {
  //       const response =  await authApi.getProfile();
  //       console.log("RESPONSE", response);
  //       if(response.success){
  //         addUserData({
  //           id: response?.data?._id,
  //           name: response?.data?.name,
  //           email: response?.data?.email,
  //           role: response?.data?.role
  //         });
  //       }
  //     } catch (err) {
  //       console.error('Failed to fetch user profile:', err);
  //       // If token exists but profile fetch fails, token is likely invalid
  //       localStorage.removeItem('token');
  //       router.push('/auth/login');
  //     }
  //   };

  //   checkAuth();
  // }, [router]);


  const debounce = <F extends (...args: any[]) => void>(
    func: F,
    delay: number
  ) => {
    let timeoutId: NodeJS.Timeout;
    return function (this: any, ...args: Parameters<F>) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  };

   // Show success message for 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Fetch patients with search and pagination
  const fetchPatients = useCallback(async (search = '', page = 1, limit = 10) => {
    try {
      setIsFetching(true);
      setError(null);
      
      const response = await getPatients({
        search,
        page,
        limit,
      });
      
      setPatients(response.data);
      setPagination(response.pagination);
      
      // If we have patients but none selected, select the first one
      if (response.data.length > 0 && !selectedPatient) {
        setSelectedPatient(response.data[0]);
      }
      
      // If the selected patient is no longer in the list (e.g., after deletion)
      if (selectedPatient && !response.data.some(p => p.patientId === selectedPatient.patientId)) {
        setSelectedPatient(response.data.length > 0 ? response.data[0] : null);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch patients');
    } finally {
      setIsFetching(false);
    }
  }, [selectedPatient]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((search: string) => {
      fetchPatients(search, 1, pagination.limit);
    }, 500),
    [fetchPatients, pagination.limit]
  );

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    // Only trigger search if value is not empty or if clearing a previous search
    debouncedSearch(value);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    fetchPatients(searchQuery, newPage, pagination.limit);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Initial fetch - only run once when component mounts
  useEffect(() => {
    fetchPatients('', pagination.page, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handlePatientSelect = (patient: PatientData) => {
    setSelectedPatient(patient);
  };

  // Handle patient edit button click
  const handleEditClick = (patient: PatientData, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the patient
    setPatientToEdit(patient);
    setIsEditModalOpen(true);
  };

  // Handle patient delete button click
  const handleDeleteClick = (patient: PatientData, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the patient
    setPatientToDelete(patient);
    setIsDeleteModalOpen(true);
  };

  // Handle patient add/update
  const handleAddPatient = async (patientData: PatientData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the createPatient API
      await createPatient(patientData);
      
      fetchPatients(searchQuery, pagination.page, pagination.limit);
      setSuccessMessage('Patient added successfully');
      setIsAddModalOpen(false);
      
    } catch (err) {
      console.error('Error adding patient:', err);
      setError(err instanceof Error ? err.message : 'Failed to add patient');
    } finally {
      setIsLoading(false);
    }
  };

  console.log("PATIENTS PAGE RENDERED");

  // Handle patient update
  const handleUpdatePatient = async (patientData: PatientData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the updatePatient API
      await updatePatient({
        patientId: patientData.patientId || '',
        name: patientData.name,
        dob: patientData.dob,
        gender: patientData.gender,
        contact: patientData.contactNumber,
        address: patientData.address,
        history: patientData.history
      });
      
      fetchPatients(searchQuery, pagination.page, pagination.limit);
      setSuccessMessage('Patient updated successfully');
      setIsEditModalOpen(false);
      
    } catch (err) {
      console.error('Error updating patient:', err);
      setError(err instanceof Error ? err.message : 'Failed to update patient');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle patient delete confirmation
  const handleDeletePatient = async () => {
    if (!patientToDelete) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      await deletePatient(patientToDelete.patientId);
      
      // Close modal and refresh patient list
      setIsDeleteModalOpen(false);
      setPatientToDelete(null);
      setSuccessMessage(`Patient ${patientToDelete.name} has been deleted`);
      
      // Refresh patient list
      fetchPatients(searchQuery, pagination.page, pagination.limit);
    } catch (err) {
      console.error('Error deleting patient:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete patient');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch patient details after successful report upload
  const handlePatientRefresh = useCallback(async () => {
    if (selectedPatient) {
      try {
        setIsFetching(true);
        const response = await getPatients({
          search: '',
          page: pagination.page,
          limit: pagination.limit,
        });
        
        setPatients(response.data);
        setPagination(response.pagination);
        
        // Update selected patient with new data
        const updatedPatient = response.data.find(
          p => p.patientId === selectedPatient.patientId
        );
        if (updatedPatient) {
          setSelectedPatient(updatedPatient);
        }
      } catch (err) {
        console.error('Error refreshing patient data:', err);
        setError(err instanceof Error ? err.message : 'Failed to refresh patient data');
      } finally {
        setIsFetching(false);
      }
    }
  }, [selectedPatient, pagination.page, pagination.limit]);

  return (
    <DashboardLayout>
      <div className="overflow-y-auto max-h-[calc(100vh-6rem)]">
      {/* Success message */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md flex items-center">
          <div className="mr-2 bg-green-200 rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          {successMessage}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
          <div className="mr-2 bg-red-200 rounded-full p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Patients</h1>
          <p className="text-gray-600">Manage your patient records</p>
        </div>
        <button 
          className="btn btn-primary mt-4 sm:mt-0"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} className="mr-2" />
          Add New Patient
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patients list */}
        <div className="lg:col-span-1">
          <div className="card mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, contact and ID"
                className="input pl-10 placeholder:ml-4"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-300px)]">
            {isFetching ? (
              // Loading skeleton
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="w-3/4">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-6 w-6 bg-gray-100 rounded"></div>
                      <div className="h-6 w-6 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : patients.length > 0 ? (
              patients.map((patient) => (
                <div 
                  key={patient.patientId || patient._id}
                  className={`card cursor-pointer transition-all ${
                    selectedPatient?.patientId === patient.patientId 
                      ? 'border-l-4 border-l-teal-700' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handlePatientSelect(patient)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800 flex items-center">
                        {patient.name}
                        {patient.gender && (
                          <span className="ml-2 text-gray-500">
                            {patient.gender.toLowerCase() === 'male' ? (
                              <Male size={16} className="text-blue-500" />
                            ) : patient.gender.toLowerCase() === 'female' ? (
                              <Female size={16} className="text-pink-500" />
                            ) : null}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        #{patient.patientId} • {patient.gender} • {formatDate(patient.dob)}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 text-gray-500 hover:text-teal-700"
                        onClick={(e) => handleEditClick(patient, e)}
                        title="Edit patient"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="p-1 text-gray-500 hover:text-red-600"
                        onClick={(e) => handleDeleteClick(patient, e)}
                        title="Delete patient"
                      >
                        <Trash2 size={16}/>
                      </button>
                      <button 
                        className="p-1 text-gray-500 hover:text-blue-600"
                        title="Upload reports"
                      >
                        <Upload size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="card text-center py-8 text-gray-500">
                {searchQuery ? `No patients found matching "${searchQuery}"` : 'No patients found'}
              </div>
            )}
          </div>
        </div>

        {/* Patient details */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <PatientDetailTabs 
              patient={selectedPatient} 
              onRefresh={handlePatientRefresh}
            />
          ) : (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No Patient Selected</h3>
              <p className="text-gray-500 max-w-md mb-6">
                Select a patient from the list to view their details, medical history, and lab reports
              </p>
              <button 
                className="btn btn-outline"
                onClick={() => setIsAddModalOpen(true)}
              >
                <Plus size={18} className="mr-2" />
                Add New Patient
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6 mb-4">
          <div className="flex items-center space-x-2">
            <button
              className="btn btn-outline p-2"
              disabled={pagination.page === 1 || isFetching}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            
            <button
              className="btn btn-outline p-2"
              disabled={pagination.page === pagination.totalPages || isFetching}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      <AddPatientModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPatient}
        isLoading={isLoading}
      />

      {/* Edit Patient Modal */}
      <AddPatientModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdatePatient}
        patient={patientToEdit}
        isEditing={true}
        isLoading={isLoading}
      />

      {/* Delete Patient Modal */}
      <DeletePatientModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePatient}
        patientName={patientToDelete?.name || ''}
        isLoading={isLoading}
      />
      </div>
    </DashboardLayout>
  );
}
