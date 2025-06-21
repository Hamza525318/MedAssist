import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CreateSlotData, Slot } from '@/types/slot';

interface CreateSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSlotData) => Promise<void>;
  slot?: Slot | null;
}

export default function CreateSlotModal({
  isOpen,
  onClose,
  onSubmit,
  slot
}: CreateSlotModalProps) {
  const [formData, setFormData] = useState<CreateSlotData>({
    date: '',
    startHour: 9,
    endHour: 10,
    capacity: 1,
    location: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when slot changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (slot) {
        // Format date to YYYY-MM-DD for input
        const dateObj = new Date(slot.date);
        const formattedDate = dateObj.toISOString().split('T')[0];
        
        setFormData({
          date: formattedDate,
          startHour: slot.startHour,
          endHour: slot.endHour,
          capacity: slot.capacity,
          location: slot.location || ''
        });
      } else {
        // Reset form for new slot
        setFormData({
          date: '',
          startHour: 9,
          endHour: 10,
          capacity: 1,
          location: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, slot]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }
    
    // End time must be after start time
    if (formData.endHour <= formData.startHour) {
      newErrors.endHour = 'End time must be after start time';
    }
    
    // Capacity must be positive
    if (formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error saving slot:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-xl font-semibold">{slot ? 'Edit Slot' : 'Create New Slot'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`mt-1 block w-full rounded-md border ${errors.date ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startHour" className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <select
                id="startHour"
                required
                value={formData.startHour}
                onChange={(e) => setFormData({ ...formData, startHour: Number(e.target.value) })}
                className={`mt-1 block w-full rounded-md border ${errors.startHour ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
              {errors.startHour && (
                <p className="mt-1 text-sm text-red-600">{errors.startHour}</p>
              )}
            </div>

            <div>
              <label htmlFor="endHour" className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <select
                id="endHour"
                required
                value={formData.endHour}
                onChange={(e) => setFormData({ ...formData, endHour: Number(e.target.value) })}
                className={`mt-1 block w-full rounded-md border ${errors.endHour ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
              {errors.endHour && (
                <p className="mt-1 text-sm text-red-600">{errors.endHour}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
              Capacity
            </label>
            <input
              type="number"
              id="capacity"
              required
              min={1}
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              className={`mt-1 block w-full rounded-md border ${errors.capacity ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
            )}
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              id="location"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter location"
              className={`mt-1 block w-full rounded-md border ${errors.location ? 'border-red-500' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500`}
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location}</p>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? (slot ? 'Updating...' : 'Creating...') : (slot ? 'Update Slot' : 'Create Slot')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 