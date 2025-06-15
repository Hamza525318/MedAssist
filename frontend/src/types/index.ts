export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  signatureUrl?: string;
}

export interface PatientData {
  _id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  contactNumber?: string;
  address?: string;
  history?: Array<{
    _id?: string;
    note: string;
    field: string;
    date?: string;
    addedBy?: {
      name: string;
    };
  }>;
}

export interface BookingData {
  id: string;
  patientName: string;
  patientId: string;
  slotDate: string;
  slotTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'checkedIn' | 'completed';
  reason: string;
  contactNumber: string;
  age: number;
  gender: string;
} 