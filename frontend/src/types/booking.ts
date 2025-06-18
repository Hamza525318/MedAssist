export interface Slot {
  _id: string;
  date: string;
  startHour: number;
  endHour: number;
  capacity: number;
  location: string;
  bookedCount: number;
}

export interface Patient {
  _id: string;
  patientId: number;
  name: string;
  dob: string;
  gender: string;
  contactNumber: string;
  age: number;
}

export interface BookingData {
  _id: string;
  slotId: Slot;
  patientId: Patient;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'CheckedIn' | 'Completed';
  reason: string;
  requestedAt: string;
  updatedAt: string;
  createdAt: string;
}

export interface BookingResponse {
  success: boolean;
  message?: string;
  data: BookingData;
}

export interface GetBookingsResponse {
  success: boolean;
  data: BookingData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
} 