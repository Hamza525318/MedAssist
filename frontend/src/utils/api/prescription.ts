import axios from "axios";
import { getAuthToken } from "./auth";

const API_BASE_URL = 'http://localhost:4000/api';

export interface MedicationData{
    name: string; 
    strength: string; 
    frequency: string; 
    duration: string
}

export interface PrescriptionData{
    patientId: string;
    patientName: string;
    age: number;
    gender: string;
    patientContact: string;
    doctorName: string;
    diagnosis: string;
    medications: Array<{
        name: string;
        strength: string;
        frequency: string;
        duration: string;
    }>;
    advice: string;
    followUpDate: string;
    signatureUrl?: string;
}

export interface Prescription {
    _id: string;
    prescriptionId: string;
    patientId: string;
    patientName: string;
    age: string;
    gender: string;
    patientContact: string;
    doctorId: string;
    doctorName: string;
    diagnosis: string;
    medications: MedicationData[];
    advice: string;
    followUpDate: string;
    signatureUrl?: string;
    pdfUrl?: string;
    createdAt: string;
}

export const createPrescription = async (formData: FormData) => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication required');
    }
    
    try {
        const response = await axios.post(`${API_BASE_URL}/prescription/create`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to create prescription');
        }
        throw new Error('Failed to create prescription');
    }
       
};

export const getPrescriptionsByPatientId = async (patientId: string) => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication required');
    }

    try {
        const response = await axios.get(`${API_BASE_URL}/prescription/byPatient/${patientId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
        
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch prescriptions');
        }
        throw new Error('Failed to fetch prescriptions');
    }
    
};

export const deletePrescription = async (prescriptionId: string) => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication required');
    }

    try {
        const response = await axios.delete(`${API_BASE_URL}/prescription/${prescriptionId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to delete prescription');
        }
        throw new Error('Failed to delete prescription');
    }
};

export const updatePrescription = async (prescriptionId: string, formData: FormData) => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Authentication required');
    }

    try {
        const response = await axios.put(`${API_BASE_URL}/prescription/${prescriptionId}`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            },
        });
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to update prescription');
        }
        throw new Error('Failed to update prescription');
    }
};