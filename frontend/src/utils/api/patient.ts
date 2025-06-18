import axios from 'axios';
import { PatientData, PatientListResponse, GetPatientsParams } from '@/types';

const API_BASE_URL = 'http://localhost:4000/api';

/**
 * Interface for patient update data
 */
export interface UpdatePatientData {
  patientId: string;
  name?: string;
  dob?: string;
  gender?: string;
  contact?: string;
  address?: string;
  history?: Array<{
    note: string;
    field: string;
  }>;
}

/**
 * Function to create a new patient
 * @param patientData Patient data to be created
 * @returns Created patient data
 */
export const createPatient = async (patientData: PatientData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/patients/add-patient`, patientData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create patient');
    }
    throw new Error('Failed to create patient');
  }
};

/**
 * Function to fetch patients with search and pagination
 * @param params Get patients params
 * @returns Patient list response
 */
export const getPatients = async (params: GetPatientsParams = {}): Promise<PatientListResponse> => {
  try {
    console.log("GET PATIENT PARAMS",params);
    const response = await axios.post(`${API_BASE_URL}/patients/get-all-patients`, params, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch patients');
    }
    throw new Error('Failed to fetch patients');
  }
};

/**
 * Function to delete a patient and their related data
 * @param patientId ID of the patient to delete
 * @returns Response with success message
 */
export const deletePatient = async (patientId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/patients/delete-patient`, 
      { patientId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete patient');
    }
    throw new Error('Failed to delete patient');
  }
};

/**
 * Function to update a patient's details
 * @param patientData Patient data to update
 * @returns Updated patient data
 */
export const updatePatient = async (patientData: UpdatePatientData): Promise<{ success: boolean; data: PatientData }> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/patients/update-patient-details`, 
      patientData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update patient');
    }
    throw new Error('Failed to update patient');
  }
};

/**
 * Function to search patients by query (name, contact number, or patient ID)
 * @param search Search query string
 * @returns Array of matching patients
 */
export const searchPatient = async (search: string): Promise<{ success: boolean; data: PatientData[] }> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/patients/search-patient?search=${search}`,{
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log("ERROR WHILE SEARCH",error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to search patients');
    }
    throw new Error('Failed to search patients');
  }
};