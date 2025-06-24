import React from 'react';
import { Viewer, SpecialZoomLevel, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

interface PDFViewerComponentProps {
  fileUrl: string;
  onLoadSuccess: () => void;
  onError: (error: Error) => void;
}

const PDFViewerComponent: React.FC<PDFViewerComponentProps> = ({
  fileUrl,
  onLoadSuccess,
  onError
}) => {
  // Create the default layout plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div className="h-full">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
        <Viewer
          fileUrl={fileUrl}
          plugins={[defaultLayoutPluginInstance]}
          defaultScale={SpecialZoomLevel.PageFit}
          onDocumentLoad={onLoadSuccess}
          onError={onError}
        />
      </Worker>
    </div>
  );
};

export default PDFViewerComponent;