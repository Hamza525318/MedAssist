"use client";

import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import SlotExplorer from '@/components/appointments/SlotExplorer';
import BookingFormModal from '@/components/appointments/BookingFormModal';
import BookingsTable from '@/components/appointments/BookingsTable';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl?: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime?: string;
}

interface Booking {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Checked In' | 'Completed' | 'Cancelled';
}

export default function PatientAppointments() {
  // State for view toggle
  const [activeView, setActiveView] = useState<'bookings' | 'explorer'>('bookings');
  
  // State for booking modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Sample bookings data - in a real app, this would come from an API
  const bookings: Booking[] = [
    {
      id: '1',
      doctorName: 'Dr. Sarah Johnson',
      doctorSpecialty: 'Cardiologist',
      date: 'June 20, 2025',
      time: '10:00 AM',
      status: 'Confirmed',
    },
    {
      id: '2',
      doctorName: 'Dr. Michael Smith',
      doctorSpecialty: 'Dermatologist',
      date: 'June 25, 2025',
      time: '2:30 PM',
      status: 'Pending',
    },
    {
      id: '3',
      doctorName: 'Dr. Emily Wilson',
      doctorSpecialty: 'Neurologist',
      date: 'June 10, 2025',
      time: '11:15 AM',
      status: 'Completed',
    },
    {
      id: '4',
      doctorName: 'Dr. Robert Brown',
      doctorSpecialty: 'Orthopedic Surgeon',
      date: 'May 28, 2025',
      time: '9:45 AM',
      status: 'Cancelled',
    },
    {
      id: '5',
      doctorName: 'Dr. Lisa Chen',
      doctorSpecialty: 'Pediatrician',
      date: 'June 30, 2025',
      time: '3:15 PM',
      status: 'Checked In',
    },
  ];

  // Handlers for slot selection and booking
  const handleSlotSelect = (slotId: string, doctor: Doctor, date: Date) => {
    setSelectedSlot({
      id: slotId,
      startTime: slotId.includes('morning') ? '9:00 AM' : 
                slotId.includes('afternoon') ? '2:00 PM' : '6:00 PM',
    });
    setSelectedDoctor(doctor);
    setSelectedDate(date);
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = (formData: { reason: string; notes: string }) => {
    // In a real app, this would make an API call to create the booking
    console.log('Booking submitted:', { 
      slot: selectedSlot, 
      doctor: selectedDoctor, 
      date: selectedDate,
      ...formData 
    });
    
    // Close the modal and show a success message
    setIsBookingModalOpen(false);
    alert('Appointment booked successfully!');
    
    // Reset the form
    setSelectedSlot(null);
    setSelectedDoctor(null);
    setSelectedDate(null);
    
    // Switch to bookings view to see the new booking
    setActiveView('bookings');
  };

  // Handlers for booking actions
  const handleCancelBooking = (bookingId: string) => {
    // In a real app, this would make an API call to cancel the booking
    console.log('Cancelling booking:', bookingId);
    alert(`Booking ${bookingId} cancelled successfully!`);
  };

  const handleRescheduleBooking = (bookingId: string) => {
    // In a real app, this would open a reschedule modal or navigate to reschedule page
    console.log('Rescheduling booking:', bookingId);
    setActiveView('explorer');
  };

  return (
    <div className="space-y-6">
      {/* Header with title and book appointment button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
          <p className="text-gray-600">Manage your upcoming and past appointments</p>
        </div>
        <button 
          onClick={() => setActiveView('explorer')}
          className="px-4 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800 transition-colors flex items-center"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          Book Appointment
        </button>
      </div>

      {/* View toggle */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveView('bookings')}
            className={`px-4 py-3 font-medium ${activeView === 'bookings' ? 'text-teal-700 border-b-2 border-teal-700' : 'text-gray-600 hover:text-gray-800'}`}
          >
            My Bookings
          </button>
          <button
            onClick={() => setActiveView('explorer')}
            className={`px-4 py-3 font-medium ${activeView === 'explorer' ? 'text-teal-700 border-b-2 border-teal-700' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Find Available Slots
          </button>
        </div>

        {/* Content based on active view */}
        <div className="p-4">
          {activeView === 'bookings' ? (
            <BookingsTable 
              bookings={bookings}
              onCancelBooking={handleCancelBooking}
              onRescheduleBooking={handleRescheduleBooking}
            />
          ) : (
            <SlotExplorer onSlotSelect={handleSlotSelect} />
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      <BookingFormModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleBookingSubmit}
        selectedSlot={selectedSlot}
        selectedDoctor={selectedDoctor}
        selectedDate={selectedDate}
      />
    </div>
  );
}
