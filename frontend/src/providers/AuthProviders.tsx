'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { PatientAuthProvider } from '@/contexts/PatientAuthContext';

interface AuthProvidersProps {
  children: ReactNode;
}

export const AuthProviders = ({ children }: AuthProvidersProps) => {
  return (
    <AuthProvider>
      <PatientAuthProvider>
        {children}
      </PatientAuthProvider>
    </AuthProvider>
  );
};
