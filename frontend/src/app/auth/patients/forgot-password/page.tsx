"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import { authApi } from '@/utils/api/auth';

export default function PatientForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    
    try {
      // TODO: Replace with patient password reset API endpoint
      // const data = await authApi.patientForgotPassword(email);
      
      // if (data.success) {
      //   setSuccess(true);
      // } else {
      //   setError(data.message || 'Failed to process your request');
      // }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Reset Your Password" 
      subtitle="Enter your email to receive a password reset link"
    >
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success ? (
        <div className="text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">Password reset link sent! Please check your email.</span>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Did not receive an email?{' '}
            <button 
              onClick={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)} 
              className="text-blue-600 hover:text-blue-500 font-medium"
              disabled={loading}
            >
              Resend
            </button>
          </p>
          <Link href="/auth/patients/login" className="mt-6 inline-block text-blue-600 hover:text-blue-500 font-medium">
            Return to login
          </Link>
        </div>
      ) : (
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
              value={email}
              onChange={handleChange}
            />
          </div>

          <div>
            <button
              type="submit"
              className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <Link href="/auth/patients/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Sign in
          </Link>
        </p>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Need an account?{' '}
          <Link href="/auth/patients/register" className="text-blue-600 hover:text-blue-500 font-medium">
            Register here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
