import { Slot } from "./types/slot";

export interface PatientData {
    _id?: string; // MongoDB ID from backend
    patientId: string;
    name: string;
    dob: string;
    gender: string;
    contactNumber?: string;
    address?: string;
    history?: Array<{
      _id?: string; // MongoDB ID for history items
      note: string;
      field: string;
    }>;
    labReports?: Array<{
      _id?: string; // MongoDB ID for lab reports
      name: string;
      type: string;
      fileUrl: string;
    }>;
}

export interface PatientListResponse {
    success: boolean;
    data: PatientData[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
}
  
export interface GetPatientsParams {
    page?: number;
    limit?: number;
    search?: string;
}

export interface BookingData {
  _id?: string; // MongoDB ID from backend
  slotId: string;
  patientId: string;
  patientName: string; // For display purposes
  dob: string;
  slotTime: string;
  requestedAt: string;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'CheckedIn' | 'Completed';
  reason: string;
  updatedAt: string;
  // Additional fields for display
  contactNumber?: string;
  age?: number;
  gender?: string;
}

export interface BookingListResponse {
  success: boolean;
  data: BookingData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetBookingsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  slot?: string;
}

export interface BookingResponse{
  createdAt: string,
  patientId: PatientData,
  reason: string,
  requestedAt: string,
  slotId: Slot,
  status: string,
  updatedAt: string,
  _id: string
}