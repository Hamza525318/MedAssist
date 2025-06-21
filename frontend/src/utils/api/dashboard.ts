import axios from "axios";
import { getAuthToken } from "./auth";

const API_BASE_URL = 'http://localhost:4000/api';

// Define types for the API responses
export interface DashboardStats {
  totalPatients: number;
  pendingBookings: number;
  todayBookings: number;
  followUpPatients: number;
  newMonthlyPatients: number;
}

export interface TopBooking {
  bookingId: string;
  patientName: string;
  patientId: number;
  contactNumber: string;
  time: string;
  location: string;
  status: string;
  reason: string;
}

// Get dashboard statistics
export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch dashboard statistics');
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Get top bookings for today
export const getTopBookingsForToday = async (): Promise<TopBooking[]> => {
  try {
    const token = getAuthToken();
    const response = await axios.get(`${API_BASE_URL}/dashboard/top-bookings`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch top bookings');
    }
  } catch (error) {
    console.error('Error fetching top bookings:', error);
    throw error;
  }
};