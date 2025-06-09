"use client";

import React, { useState } from 'react';
import { Upload, Search, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import UploadCard from '@/components/upload/UploadCard';

// Sample data for patients
const patients = [
  { id: '10023', name: 'Jane Doe' },
  { id: '10024', name: 'John Smith' },
  { id: '10025', name: 'Emily Johnson' },
  { id: '10026', name: 'Michael Brown' },
];

// Sample data for report types
const reportTypes = [
  'Blood Test',
  'X-Ray',
  'CT Scan',
  'MRI',
  'Ultrasound',
  'ECG',
  'EEG',
  'Urinalysis',
  'Other'
];

// Sample data for uploaded reports
const initialReports = [
  {
    id: '1',
    name: 'Blood Test',
    type: 'Hematology',
    date: '2025-05-31',
    patientName: 'Jane Doe',
    patientId: '10023',
    fileUrl: '/reports/blood-test.pdf'
  },
  {
    id: '2',
    name: 'X-Ray Chest',
    type: 'Radiology',
    date: '2025-05-20',
    patientName: 'John Smith',
    patientId: '10024',
    fileUrl: '/reports/xray-chest.jpg'
  },
  {
    id: '3',
    name: 'CT Scan Brain',
    type: 'Radiology',
    date: '2025-05-15',
    patientName: 'Emily Johnson',
    patientId: '10025',
    fileUrl: '/reports/ct-scan.jpg'
  }
];

export default function UploadReportPage() {
  const [selectedPatient, setSelectedPatient] = useState('');
  const [reportType, setReportType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState(initialReports);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Filter reports based on search query
  const filteredReports = reports.filter((report) => {
    const query = searchQuery.toLowerCase();
    return (
      report.name.toLowerCase().includes(query) ||
      report.patientName.toLowerCase().includes(query) ||
      report.type.toLowerCase().includes(query)
    );
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient || !reportType || !file) {
      return;
    }

    // Get patient name from selected ID
    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient) return;

    // Create new report
    const newReport = {
      id: (reports.length + 1).toString(),
      name: reportType,
      type: reportType.includes('Blood') ? 'Hematology' : 
            reportType.includes('X-Ray') || reportType.includes('CT') || reportType.includes('MRI') ? 'Radiology' : 
            'General',
      date: new Date().toISOString().split('T')[0],
      patientName: patient.name,
      patientId: patient.id,
      fileUrl: URL.createObjectURL(file)
    };

    // Add to reports list
    setReports([newReport, ...reports]);
    
    // Reset form
    setSelectedPatient('');
    setReportType('');
    setFile(null);
    
    // Reset file input by clearing its value
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleDeleteReport = (id: string) => {
    setReports(reports.filter(report => report.id !== id));
  };

  const handleViewReport = (id: string) => {
    const report = reports.find(r => r.id === id);
    if (report && report.fileUrl) {
      setPreviewUrl(report.fileUrl);
      setIsPreviewOpen(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Upload Reports</h1>
        <p className="text-gray-600">Upload and manage patient lab reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload form */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Upload New Report</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="patient" className="label">
                  Select Patient
                </label>
                <select
                  id="patient"
                  className="input"
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} (#{patient.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="report-type" className="label">
                  Report Type
                </label>
                <select
                  id="report-type"
                  className="input"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  required
                >
                  <option value="">Select report type</option>
                  {reportTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="file-upload" className="label">
                  Upload File (PDF or Image)
                </label>
                <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    required
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-700">
                      {file ? file.name : 'Click to upload file'}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PDF, JPG or PNG (max. 10MB)
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={!selectedPatient || !reportType || !file}
              >
                Upload Report
              </button>
            </form>
          </div>
        </div>

        {/* Reports list */}
        <div className="lg:col-span-2">
          <div className="card mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                className="input pl-10 placeholder:ml-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <UploadCard
                  key={report.id}
                  report={report}
                  onDelete={handleDeleteReport}
                  onView={handleViewReport}
                />
              ))
            ) : (
              <div className="card text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Reports Found</h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? 'No reports match your search criteria'
                    : 'Upload your first report using the form'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Preview Modal */}
      {isPreviewOpen && previewUrl && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setIsPreviewOpen(false)}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all">
              {/* Header */}
              <div className="border-b px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Report Preview</h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[500px]">
                  {previewUrl.endsWith('.pdf') ? (
                    <iframe 
                      src={previewUrl} 
                      className="w-full h-[500px]" 
                      title="PDF Preview"
                    />
                  ) : (
                    <div className="flex justify-center items-center w-full h-[500px]">
                      <img 
                        src={previewUrl} 
                        alt="Report Preview" 
                        className="max-h-[500px] max-w-full object-contain" 
                        style={{ display: 'block' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t px-6 py-4 flex justify-end space-x-3">
                <button
                  className="btn btn-outline"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  Close
                </button>
                <a
                  href={previewUrl}
                  download
                  className="btn btn-primary"
                >
                  Download
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
