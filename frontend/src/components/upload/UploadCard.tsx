"use client";

import React from 'react';
import { File, X, Download, Eye } from 'lucide-react';

interface UploadCardProps {
  report: {
    id: string;
    name: string;
    type: string;
    date: string;
    patientName: string;
    patientId: string;
    fileUrl?: string;
  };
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

const UploadCard: React.FC<UploadCardProps> = ({ 
  report, 
  onDelete,
  onView 
}) => {
  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center text-teal-700 mr-3">
            <File size={20} />
          </div>
          <div>
            <h3 className="font-medium text-gray-800">{report.name}</h3>
            <p className="text-sm text-gray-500">
              {report.type} • {report.date}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Patient: {report.patientName} <span className="text-xs">#{report.patientId}</span>
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {onView && (
            <button 
              className="p-1 text-gray-500 hover:text-teal-700"
              onClick={() => onView(report.id)}
            >
              <Eye size={18} />
            </button>
          )}
          <button className="p-1 text-gray-500 hover:text-teal-700">
            <Download size={18} />
          </button>
          {onDelete && (
            <button 
              className="p-1 text-gray-500 hover:text-red-500"
              onClick={() => onDelete(report.id)}
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadCard;
