"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, addDays, startOfWeek } from 'date-fns';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl?: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface SlotsByTime {
  morning: TimeSlot[];
  afternoon: TimeSlot[];
  evening: TimeSlot[];
}

interface SlotExplorerProps {
  onSlotSelect: (slotId: string, doctor: Doctor, date: Date) => void;
}

const SlotExplorer: React.FC<SlotExplorerProps> = ({ onSlotSelect }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<SlotsByTime>({
    morning: [],
    afternoon: [],
    evening: []
  });

  // Sample doctors data - in a real app, this would come from an API
  const doctors: Doctor[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      imageUrl: '/images/doctors/sarah-johnson.jpg'
    },
    {
      id: '2',
      name: 'Dr. Michael Smith',
      specialty: 'Dermatologist',
      imageUrl: '/images/doctors/michael-smith.jpg'
    },
    {
      id: '3',
      name: 'Dr. Emily Wilson',
      specialty: 'Neurologist',
      imageUrl: '/images/doctors/emily-wilson.jpg'
    }
  ];

  // Generate week dates
  useEffect(() => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    setWeekDates(dates);
  }, [selectedDate]);

  // Fetch slots for selected doctor and date - in a real app, this would be an API call
  useEffect(() => {
    if (selectedDoctor) {
      // Simulate API call
      setTimeout(() => {
        // Generate sample slots
        const morningSlots = Array.from({ length: 4 }, (_, i) => ({
          id: `morning-${i}`,
          startTime: `${8 + i}:00`,
          endTime: `${9 + i}:00`,
          available: Math.random() > 0.3
        }));

        const afternoonSlots = Array.from({ length: 4 }, (_, i) => ({
          id: `afternoon-${i}`,
          startTime: `${12 + i}:00`,
          endTime: `${13 + i}:00`,
          available: Math.random() > 0.3
        }));

        const eveningSlots = Array.from({ length: 4 }, (_, i) => ({
          id: `evening-${i}`,
          startTime: `${17 + i}:00`,
          endTime: `${18 + i}:00`,
          available: Math.random() > 0.3
        }));

        setSlots({
          morning: morningSlots,
          afternoon: afternoonSlots,
          evening: eveningSlots
        });
      }, 500);
    }
  }, [selectedDoctor, selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
  };

  const handleSlotSelect = (slotId: string) => {
    if (selectedDoctor) {
      onSlotSelect(slotId, selectedDoctor, selectedDate);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold mb-4">Find Available Slots</h2>
      
      {/* Date Picker */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <CalendarIcon className="mr-2 h-5 w-5 text-teal-700" />
          <h3 className="text-md font-medium">Select Date</h3>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekDates.map((date, index) => (
            <button
              key={index}
              onClick={() => handleDateSelect(date)}
              className={`p-2 rounded-md flex flex-col items-center justify-center ${
                format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                  ? 'bg-teal-700 text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span className="text-xs">{format(date, 'EEE')}</span>
              <span className="text-lg font-semibold">{format(date, 'd')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Selection */}
      <div className="mb-6">
        <h3 className="text-md font-medium mb-2">Select Doctor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {doctors.map((doctor) => (
            <button
              key={doctor.id}
              onClick={() => handleDoctorSelect(doctor)}
              className={`p-3 border rounded-md flex items-center ${
                selectedDoctor?.id === doctor.id
                  ? 'border-teal-700 bg-teal-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                {doctor.imageUrl ? (
                  <span className="h-10 w-10 rounded-full overflow-hidden">
                    <Image
                      src={doctor.imageUrl}
                      alt={doctor.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </span>
                ) : (
                  <span className="text-teal-700 font-semibold">
                    {doctor.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="text-left">
                <p className="font-medium">{doctor.name}</p>
                <p className="text-sm text-gray-500">{doctor.specialty}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDoctor && (
        <div>
          <h3 className="text-md font-medium mb-3">Available Time Slots</h3>
          
          {/* Morning Slots */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Morning
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.morning.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => slot.available && handleSlotSelect(slot.id)}
                  disabled={!slot.available}
                  className={`py-2 px-3 text-sm rounded-md ${
                    slot.available
                      ? 'bg-white border border-teal-700 text-teal-700 hover:bg-teal-50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          </div>
          
          {/* Afternoon Slots */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Afternoon
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.afternoon.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => slot.available && handleSlotSelect(slot.id)}
                  disabled={!slot.available}
                  className={`py-2 px-3 text-sm rounded-md ${
                    slot.available
                      ? 'bg-white border border-teal-700 text-teal-700 hover:bg-teal-50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          </div>
          
          {/* Evening Slots */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Evening
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.evening.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => slot.available && handleSlotSelect(slot.id)}
                  disabled={!slot.available}
                  className={`py-2 px-3 text-sm rounded-md ${
                    slot.available
                      ? 'bg-white border border-teal-700 text-teal-700 hover:bg-teal-50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {slot.startTime}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlotExplorer;
