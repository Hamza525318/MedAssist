import axios from "axios";
import { BookingData, BookingResponse } from "@/types/booking";
import { getAuthToken } from "./auth";


export interface UpdateBookingRequest {
  status: string;
}

const API_BASE_URL = 'http://localhost:4000/api';

export interface GetBookingsParams {
  slotId?: string;
  patientId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
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

export interface CreateBookingRequest {
  slotId: string;
  reason: string;
  patientId?: string;
  patientData?: {
    name: string;
    contactNumber: string;
    age: number;
    gender: string;
    dob: string;
  };
}

export const getBookings = async (params: GetBookingsParams = {}): Promise<GetBookingsResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.get(`${API_BASE_URL}/bookings/get-bookings`, {
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log("GET BOOKINGS RESPONSE",response);
    return response.data;
  } catch (error) {

    console.log("BOOKINGS ERROR",error);
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
    throw new Error('Failed to fetch bookings');
  }
};

export const deleteBooking = async (bookingId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.delete(`${API_BASE_URL}/bookings/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to delete booking');
    }
    throw new Error('Failed to delete booking');
  }
};

export const createBooking = async (bookingData: CreateBookingRequest): Promise<BookingResponse> => {
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

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to create booking');
    }
    throw new Error('Failed to create booking');
  }
};
export interface UpdateBookingRequest {
  status?: string;
  reason?: string;
  slotId?: string;
  patientId?: string;
  requestedAt?: Date;
  updatedAt?: Date;
}


export const updateBooking = async (bookingId: string, data: UpdateBookingRequest): Promise<BookingResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.put(
      `${API_BASE_URL}/bookings/update-booking/${bookingId}`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to update booking');
    }
    throw new Error('Failed to update booking');
  }
};

export interface RescheduleBookingsBySlotRequest {
  oldSlotId: string;
  newSlotId: string;
}

export interface RescheduleBookingsBySlotResponse {
  success: boolean;
  message: string;
  data: BookingData[];
}

export const rescheduleBookingsBySlot = async (data: RescheduleBookingsBySlotRequest): Promise<RescheduleBookingsBySlotResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(
      `${API_BASE_URL}/bookings/reschedule-slot`,
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to reschedule bookings');
    }
    throw new Error('Failed to reschedule bookings');
  }
};