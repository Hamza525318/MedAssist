import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// Patient profile interface
export interface PatientProfile {
  _id: string;
  patientId: number;
  name: string;
  email: string;
  age?: number;
  dob?: string;
  gender?: string;
  contactNumber?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  data?: PatientProfile;
  message?: string;
}

/**
 * Get the patient authentication token from localStorage
 * @returns The JWT token or null if not found
 */
export const getPatientAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('patientToken');
  }
  return null;
};

/**
 * Set the patient authentication token in localStorage
 */
export const setPatientAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('patientToken', token);
  }
};

/**
 * Remove the patient authentication token from localStorage
 */
export const removePatientAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('patientToken');
  }
};

/**
 * Check if the patient is authenticated
 */
export const isPatientAuthenticated = (): boolean => {
  return !!getPatientAuthToken();
};

export const patientAuthApi = {
  /**
   * Login a patient
   * @param email Patient's email
   * @param password Patient's password
   * @returns Promise with authentication response
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/patients/login`,
        { email, password },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw error;
    }
  },

  /**
   * Register a new patient
   * @param patientData Patient registration data
   * @returns Promise with registration response
   */
  register: async (patientData: {
    name: string;
    email: string;
    password: string;
    dob: string;
    gender: string;
    contactNumber: string;
    address?: string;
    age?: number;
  }): Promise<AuthResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/patients/register`,
        patientData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Registration failed');
      }
      throw error;
    }
  },

  /**
   * Logout the current patient
   * @returns Promise with logout response
   */
  logout: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const token = getPatientAuthToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await axios.get(
        `${API_BASE_URL}/auth/patients/logout`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      // Remove token from localStorage
      removePatientAuthToken();
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Logout failed');
      }
      throw error;
    }
  },

  /**
   * Get the current patient's profile
   * @returns Promise with the patient profile data
   */
  getProfile: async (): Promise<AuthResponse> => {
    try {
      const token = getPatientAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${API_BASE_URL}/auth/patients/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch profile');
      }
      throw error;
    }
  },

  /**
   * Send a password reset request
   * @param email Patient's email address
   * @returns Promise with response
   */
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/patients/forgot-password`,
        { email }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to process request');
      }
      throw error;
    }
  },

  /**
   * Reset password using token
   * @param token Reset token
   * @param password New password
   * @returns Promise with response
   */
  resetPassword: async (token: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/auth/patients/reset-password/${token}`,
        { password }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to reset password');
      }
      throw error;
    }
  },
};