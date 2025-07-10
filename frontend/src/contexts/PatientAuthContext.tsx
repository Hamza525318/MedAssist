'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PatientProfile, 
  getPatientAuthToken, 
  setPatientAuthToken, 
  removePatientAuthToken, 
  patientAuthApi 
} from '@/utils/api/users/auth';

interface PatientAuthContextType {
  isAuthenticated: boolean;
  patient: PatientProfile | null;
  login: (token: string, patientData: PatientProfile) => void;
  logout: () => void;
  addPatientData: (patientData: PatientProfile) => void;
  updateProfile: (profileData: Partial<PatientProfile>) => Promise<PatientProfile | null>;
}

const PatientAuthContext = createContext<PatientAuthContextType | null>(null);

export const PatientAuthProvider = ({ children }: { children: ReactNode }) => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if patient is logged in on initial load
    const checkAuth = async () => {
      const token = getPatientAuthToken();
      if (!token) {
        return;
      }

      try {
        const response = await patientAuthApi.getProfile();
        if (response.success && response.data) {
          setPatient(response.data);
          setIsAuthenticated(true);
        } else {
          // If profile fetch fails, clear token
          removePatientAuthToken();
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to fetch patient profile:', error);
        removePatientAuthToken();
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const login = (token: string, patientData: PatientProfile) => {
    setPatientAuthToken(token);
    setPatient(patientData);
    setIsAuthenticated(true);
    router.push('/patient/dashboard');
  };

  const addPatientData = (patientData: PatientProfile) => {
    setPatient(patientData);
    setIsAuthenticated(true);
  };

  const updateProfile = async (profileData: Partial<PatientProfile>): Promise<PatientProfile | null> => {
    try {
      const response = await patientAuthApi.updateProfile(profileData);
      if (response.success && response.data) {
        setPatient(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Update profile error:', error);
      return null;
    }
  };

  const logout = async () => {
    try {
      // Call the logout API
      await patientAuthApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove token and reset state
      removePatientAuthToken();
      setPatient(null);
      setIsAuthenticated(false);
      router.push('/auth/patients/login');
    }
  };

  return (
    <PatientAuthContext.Provider value={{ isAuthenticated, patient, login, logout, addPatientData, updateProfile }}>
      {children}
    </PatientAuthContext.Provider>
  );
};

export const usePatientAuth = () => {
  const context = useContext(PatientAuthContext);
  if (!context) {
    throw new Error('usePatientAuth must be used within a PatientAuthProvider');
  }
  return context;
};
