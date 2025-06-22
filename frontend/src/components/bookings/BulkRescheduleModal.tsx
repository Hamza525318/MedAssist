import React, { useState, useEffect } from 'react';
import { X, Calendar, ArrowRight, Clock } from 'lucide-react';
import { getSlots } from '@/utils/api/slot';
import { rescheduleBookingsBySlot } from '@/utils/api/booking';
import { Slot } from '@/types/slot';

interface BulkRescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRescheduleComplete: () => void;
}

const BulkRescheduleModal: React.FC<BulkRescheduleModalProps> = ({
  isOpen,
  onClose,
  onRescheduleComplete
}) => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromSlotId, setFromSlotId] = useState<string>('');
  const [toSlotId, setToSlotId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchSlots();
    }
  }, [isOpen]);

  const fetchSlots = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const slotsData = await getSlots();
      setSlots(slotsData);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setError('Failed to fetch available slots');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!fromSlotId) {
      setError('Please select a source slot');
      return;
    }
    
    if (!toSlotId) {
      setError('Please select a destination slot');
      return;
    }
    
    if (fromSlotId === toSlotId) {
      setError('Source and destination slots cannot be the same');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      await rescheduleBookingsBySlot({
        oldSlotId: fromSlotId,
        newSlotId: toSlotId
      });
      
      onRescheduleComplete();
      onClose();
    } catch (error) {
      console.error('Error rescheduling bookings:', error);
      setError(error instanceof Error ? error.message : 'Failed to reschedule bookings');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const formatSlotOption = (slot: Slot) => {
    const date = new Date(slot.date).toLocaleDateString();
    const startTime = `${slot.startHour % 12 || 12}:00 ${slot.startHour >= 12 ? 'PM' : 'AM'}`;
    const endTime = `${slot.endHour % 12 || 12}:00 ${slot.endHour >= 12 ? 'PM' : 'AM'}`;
    return `${date}, ${startTime} - ${endTime} (${slot.location}) - Available: ${slot.capacity - slot.bookedCount}/${slot.capacity}`;
  };

  // Group slots by date for better organization
  const groupedSlots = slots.reduce((acc, slot) => {
    const date = new Date(slot.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Reschedule Bulk Bookings</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="fromSlot" className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="mr-2 text-blue-600" />
            From Slot
          </label>
          {isLoading ? (
            <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
          ) : (
            <div className="relative">
              <select
                id="fromSlot"
                value={fromSlotId}
                onChange={(e) => setFromSlotId(e.target.value)}
                className="w-full p-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white shadow-sm text-gray-700"
                disabled={isSubmitting}
              >
                <option value="">Select source slot</option>
                {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                  <optgroup key={`from-group-${date}`} label={date}>
                    {dateSlots.map((slot) => (
                      <option 
                        key={`from-${slot._id}`} 
                        value={slot._id}
                        className={slot.capacity - slot.bookedCount < 3 ? "text-orange-600" : ""}
                      >
                        {`${new Date(slot.date).toLocaleDateString('en-US', {weekday: 'short'})}, ${slot.startHour % 12 || 12}:00 ${slot.startHour >= 12 ? 'PM' : 'AM'} - ${slot.endHour % 12 || 12}:00 ${slot.endHour >= 12 ? 'PM' : 'AM'} (${slot.location}) - Available: ${slot.capacity - slot.bookedCount}/${slot.capacity}`}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Clock size={18} className="text-gray-500" />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-center my-2">
          <ArrowRight size={20} className="text-gray-500" />
        </div>

        <div className="mb-6">
          <label htmlFor="toSlot" className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="mr-2 text-green-600" />
            To Slot
          </label>
          {isLoading ? (
            <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
          ) : (
            <div className="relative">
              <select
                id="toSlot"
                value={toSlotId}
                onChange={(e) => setToSlotId(e.target.value)}
                className="w-full p-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white shadow-sm text-gray-700"
                disabled={isSubmitting}
              >
                <option value="">Select destination slot</option>
                {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                  <optgroup key={`to-group-${date}`} label={date}>
                    {dateSlots.map((slot) => (
                      <option 
                        key={`to-${slot._id}`} 
                        value={slot._id}
                        className={slot.capacity - slot.bookedCount < 3 ? "text-orange-600" : ""}
                        disabled={slot._id === fromSlotId}
                      >
                        {`${new Date(slot.date).toLocaleDateString('en-US', {weekday: 'short'})}, ${slot.startHour % 12 || 12}:00 ${slot.startHour >= 12 ? 'PM' : 'AM'} - ${slot.endHour % 12 || 12}:00 ${slot.endHour >= 12 ? 'PM' : 'AM'} (${slot.location}) - Available: ${slot.capacity - slot.bookedCount}/${slot.capacity}`}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <Clock size={18} className="text-gray-500" />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Reschedule Bookings'
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};
export default BulkRescheduleModal;