import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Slot } from '@/types/slot';
import { format } from 'date-fns';

interface SlotTableProps {
  slots: Slot[];
  onEdit: (slot: Slot) => void;
  onDelete: (slot: Slot) => void;
}

export default function SlotTable({ slots, onEdit, onDelete }: SlotTableProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (slotId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveMenuId(activeMenuId === slotId ? null : slotId);
  };

  if (slots.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-gray-500">No slots available</p>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-lg border border-gray-200 shadow overflow-visible">
      {/* Desktop view */}
      <div className="hidden md:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Time Range
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Booked
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {slots.map((slot) => (
              <tr key={slot._id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  {format(new Date(slot.date), 'MMM d, yyyy')}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {slot.startHour.toString().padStart(2, '0')}:00 - {slot.endHour.toString().padStart(2, '0')}:00
                </td>
                <td className="whitespace-nowrap px-6 py-4">{slot.location}</td>
                <td className="whitespace-nowrap px-6 py-4">{slot.capacity}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                      slot.bookedCount === slot.capacity
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {slot.bookedCount}/{slot.capacity}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="relative inline-block text-left" ref={menuRef}>
                    <button
                      type="button"
                      onClick={(e) => handleMenuClick(slot._id, e)}
                      className="inline-flex items-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {activeMenuId === slot._id && (
                      <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                          <button
                            onClick={() => onEdit(slot)}
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="mr-3 h-4 w-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(slot)}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                          >
                            <Trash2 className="mr-3 h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden">
        {slots.map((slot) => (
          <div
            key={slot._id}
            className="border-b border-gray-200 p-4 last:border-b-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {format(new Date(slot.date), 'MMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-500">
                  {slot.startHour.toString().padStart(2, '0')}:00 - {slot.endHour.toString().padStart(2, '0')}:00
                </p>
                <p className="text-sm text-gray-500">{slot.location}</p>
              </div>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={(e) => handleMenuClick(slot._id, e)}
                  className="inline-flex items-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                {activeMenuId === slot._id && (
                  <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={() => onEdit(slot)}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Edit className="mr-3 h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(slot)}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <Trash2 className="mr-3 h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span
                className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  slot.bookedCount === slot.capacity
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {slot.bookedCount}/{slot.capacity} Booked
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 