export interface Slot {
  _id: string;
  doctorId: string;
  date: string;
  startHour: number;
  endHour: number;
  capacity: number;
  location: string;
  bookedCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSlotData {
  date: string;
  startHour: number;
  endHour: number;
  capacity: number;
  location: string;
  doctorId?: string;
}

export interface UpdateSlotData {
  date?: string;
  startHour?: number;
  endHour?: number;
  capacity?: number;
  location?: string;
  doctorId?: string;
}

export interface SlotFilters {
  date?: string;
  location?: string;
  search?: string;
  doctorId?: string;
} 