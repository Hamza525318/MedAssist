"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/layout/AuthLayout';
import { authApi } from '@/utils/api/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function PatientLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    // try {
    //   // TODO: Replace with patient login API endpoint
    //   const data = await authApi.patientLogin(formData.email, formData.password);
      
    //   if (data.token) {
    //     // Store the token in localStorage or context/state management
    //     localStorage.setItem('patientToken', data.token);
    //     login(data.token, data.user);
    //     // Redirect to patient dashboard
    //     router.push('/patient/dashboard');
    //   } else {
    //     setError(data.message || 'Login failed');
    //   }
    // } catch (err) {
    //   setError('An error occurred during login');
    //   console.error('Login error:', err);
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <AuthLayout 
      title="Patient Portal" 
      subtitle="Sign in to access your healthcare services"
    >
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="label">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input"
            placeholder="patient@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label">
              Password
            </label>
            <Link href="/auth/patients/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="input"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <button
            type="submit"
            className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          New patient?{' '}
          <Link href="/auth/patients/register" className="text-blue-600 hover:text-blue-500 font-medium">
            Create an account
          </Link>
        </p>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Are you a doctor?{' '}
          <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Login here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
