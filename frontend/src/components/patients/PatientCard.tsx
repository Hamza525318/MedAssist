"use client";

import React from 'react';
import { User } from 'lucide-react';

interface PatientCardProps {
  patient: {
    id: string;
    name: string;
    gender: string;
    age: number;
    contact?: string;
    lastVisit?: string;
  };
  onClick?: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
  return (
    <div 
      className="card hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 mr-4">
          <User size={24} />
        </div>
        <div>
          <h3 className="font-medium text-gray-800">{patient.name}</h3>
          <p className="text-sm text-gray-500">
            #{patient.id} • {patient.gender} • {patient.age} years
          </p>
          {patient.contact && (
            <p className="text-sm text-gray-500 mt-1">{patient.contact}</p>
          )}
        </div>
      </div>
      {patient.lastVisit && (
        <div className="mt-4 pt-4 border-t text-sm text-gray-500">
          Last visit: {patient.lastVisit}
        </div>
      )}
    </div>
  );
};

export default PatientCard;
