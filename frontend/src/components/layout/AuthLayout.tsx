"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ 
  children, 
  title, 
  subtitle 
}) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Brand/Logo section */}
      <div className="hidden md:flex md:w-1/2 bg-teal-700 text-white flex-col justify-center items-center p-8">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold mb-6">MedAssist</h1>
          <p className="text-xl mb-8">
            Your intelligent healthcare assistant for better patient care
          </p>
          <div className="relative h-64 w-full">
            {/* Placeholder for an illustration or logo */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl font-bold text-white/20">
                Healthcare Assistant
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 md:hidden">
            <h1 className="text-3xl font-bold text-teal-700">MedAssist</h1>
            <p className="text-gray-600 mt-2">Your healthcare assistant</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
              {subtitle && (
                <p className="text-gray-600 mt-1">{subtitle}</p>
              )}
            </div>
            
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
