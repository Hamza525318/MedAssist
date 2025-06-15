import axios from "axios";
import { BookingData } from "@/types";
import { getAuthToken } from "./auth";

const API_BASE_URL = 'http://localhost:4000/api';

interface CreateBookingRequest {
  slotId: string;
  patientData?: {
    name: string;
    contactNumber: string;
    age: number;
    gender: string;
    dob: string;
  };
  patientId?: string;
  reason: string;
}

export const createBooking = async (bookingData: CreateBookingRequest): Promise<BookingData> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(
      `${API_BASE_URL}/bookings/create`,
      bookingData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
    throw new Error('Failed to create booking');
  }
};