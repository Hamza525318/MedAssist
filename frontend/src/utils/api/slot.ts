import axios from 'axios';
import { Slot, CreateSlotData, UpdateSlotData, SlotFilters } from '@/types/slot';
import { getAuthToken } from './auth';

const API_BASE_URL = 'http://localhost:4000/api';

// Get slots with filters
export const getSlots = async (filters?: SlotFilters): Promise<Slot[]> => {
  try {
    const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }
    const response = await axios.post(`${API_BASE_URL}/slots/get-slots`,{
        date: filters?.date,
        doctorId: filters?.doctorId
    },{
        headers:{
            Authorization: `Bearer ${token}`,
        }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching slots:', error);
    throw error;
  }
};

// Create a new slot
export const createSlot = async (data: CreateSlotData): Promise<Slot> => {
  try {
    const token = getAuthToken();
    if (!token) {
       throw new Error('Authentication required');
    }

    const response = await axios.post(`${API_BASE_URL}/slots/create-slot`, {
      date: data.date,
      startHour: data.startHour,
      endHour: data.endHour,
      capacity: data.capacity,
      location: data.location
    },{
        headers:{
            Authorization: `Bearer ${token}`
        }
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      throw new Error('Slot already exists for this time');
    }
    console.error('Error creating slot:', error);
    throw error;
  }
};

// Update a slot
export const updateSlot = async (id: string, data: UpdateSlotData): Promise<Slot> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.put(`${API_BASE_URL}/slots/${id}`, {
      date: data.date,
      startHour: data.startHour,
      endHour: data.endHour,
      capacity: data.capacity,
      location: data.location
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Slot not found');
    }
    console.error('Error updating slot:', error);
    throw error;
  }
};

// Delete a slot
export const deleteSlot = async (id: string): Promise<void> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    await axios.delete(`${API_BASE_URL}/slots/delete-slot/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('Slot not found');
    }
    if (error.response?.status === 400) {
      throw new Error('Cannot delete slot with existing bookings');
    }
    console.error('Error deleting slot:', error);
    throw error;
  }
}; 