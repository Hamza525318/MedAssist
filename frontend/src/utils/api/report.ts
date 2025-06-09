import axios from "axios";
import { getAuthToken } from "./auth";

const API_BASE_URL = 'http://localhost:4000/api';

export interface LabReportData {
  _id: string;
  patient: string;
  reportType: string;
  name?: string; // Report name
  fileUrl: string;
  cloudinaryId: string;
  addedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReportFilter {
  reportType?: string;
}

export interface ReportPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetPatientReportsResponse {
  success: boolean;
  data?: LabReportData[];
  pagination?: ReportPagination;
  message?: string;
}

export interface DeleteReportResponse {
  success: boolean;
  message: string;
}

export interface UploadReportResponse {
  success: boolean;
  data?: LabReportData;
  message?: string;
}

export const reportApi = {
  /**
   * Upload a lab report for a patient
   * @param patientId - ID of the patient
   * @param reportType - Type of the report (e.g., Blood Test, X-Ray)
   * @param reportName - Name of the report
   * @param reportFile - The file to upload
   * @returns Promise with the upload response
   */
  uploadLabReport: async (patientId: string, reportType: string, reportName: string, reportFile: File): Promise<UploadReportResponse> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Create form data for file upload
      const formData = new FormData();
      formData.append('patientId', patientId);
      formData.append('reportType', reportType);
      formData.append('name', reportName);
      formData.append('reportFile', reportFile);

      const response = await axios.post<UploadReportResponse>(
        `${API_BASE_URL}/patients/upload-lab-report`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to upload report');
      }
      throw error;
    }
  },

  /**
   * Get lab reports for a specific patient with optional filtering and pagination
   * @param patientId - ID of the patient
   * @param filter - Optional filter criteria
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Promise with the reports response
   */
  getPatientReports: async (
    patientId: string,
    filter?: ReportFilter,
    page: number = 1,
    limit: number = 10
  ): Promise<GetPatientReportsResponse> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post<GetPatientReportsResponse>(
        `${API_BASE_URL}/patients/get-patient-reports`,
        {
          patientId,
          filter,
          page,
          limit
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch patient reports');
      }
      throw error;
    }
  },

  /**
   * Delete a lab report
   * @param reportId - ID of the report to delete
   * @returns Promise with the delete response
   */
  deleteLabReport: async (reportId: string): Promise<DeleteReportResponse> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post<DeleteReportResponse>(
        `${API_BASE_URL}/patients/delete-lab-report`,
        { reportId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete report');
      }
      throw error;
    }
  },
}