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