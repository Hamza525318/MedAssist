import React, { useState } from 'react';
import { X, Download } from 'lucide-react';
import dynamic from 'next/dynamic';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// Dynamically import the PDF viewer components to avoid SSR issues
const PDFViewer = dynamic(
  () => import('./PdfViewerComponent'),
  { ssr: false }
);

interface PDFViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  fileName?: string;
}

const PDFViewerModal: React.FC<PDFViewerModalProps> = ({
  isOpen,
  onClose,
  fileUrl,
  fileName = 'Prescription'
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            {fileName}
          </h2>
          <div className="flex items-center space-x-2">
            <a
              href={fileUrl}
              download
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              title="Download PDF"
            >
              <Download size={20} />
            </a>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PDF Viewer Content */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-80 z-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
            </div>
          )}
          
          <PDFViewer 
            fileUrl={fileUrl} 
            onLoadSuccess={() => setIsLoading(false)}
            onError={(error) => {
              console.error('PDF loading error:', error);
              setIsLoading(false);
              setError('Failed to load the PDF. Please try opening it in a new tab.');
            }}
          />
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <div className="text-red-600 text-center">
                <p className="text-xl font-semibold mb-2">Failed to load PDF</p>
                <p>{error}</p>
                <button 
                  onClick={() => window.open(fileUrl, '_blank')}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700"
                >
                  Open in new tab
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PDFViewerModal;