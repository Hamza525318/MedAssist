import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { getPatients } from '@/utils/api/patient';
import { PatientData } from '@/types';

interface PatientSearchProps {
  onPatientSelect: (patientId: string) => void;
  selectedPatientId?: string | null;
}

export default function PatientSearch({ onPatientSelect, selectedPatientId }: PatientSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 👇 Fetch patients (with pagination + search)
  const fetchPatients = useCallback(async (reset = false) => {
    if (loading || (!reset && !hasMore)) return;

    try {
      setLoading(true);
      const response = await getPatients({ search: searchTerm, page: reset ? 1 : page, limit: 10 });

      if (response.success && response.data) {
        if (reset) {
          setPatients(response.data);
        } else {
          setPatients(prev => [...prev, ...response.data]);
        }

        setHasMore(response.data.length === 10);
        if (reset) setPage(2);
        else setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, hasMore, loading]);

  // 👇 Debounced search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      fetchPatients(true); // reset on new search
    }, 300);
  }, [searchTerm]);

  // 👇 Initial load
  useEffect(() => {
    if (isOpen) fetchPatients(true);
  }, [isOpen]);

  // 👇 Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 👇 Scroll handler for pagination
  const handleScroll = () => {
    if (!scrollRef.current || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 40) {
      fetchPatients(); // next page
    }
  };

  const handleSelect = (patient: PatientData) => {
    setSelectedPatient(patient);
    onPatientSelect(patient._id || '');
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSelectedPatient(null);
    onPatientSelect('');
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="flex items-center justify-between p-2 border rounded-lg cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedPatient ? (
          <div className="flex items-center justify-between w-full">
            <span className="text-sm">
              {selectedPatient.name} ({calculateAge(selectedPatient.dob)} years, {selectedPatient.gender})
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-gray-500">Select a patient</span>
            <ChevronDown size={16} className="text-gray-500" />
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-2 border-b">
            <div className="relative">
              <Search size={16} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div
            className="max-h-60 overflow-y-auto"
            ref={scrollRef}
            onScroll={handleScroll}
          >
            {loading && patients.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : patients.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No patients found</div>
            ) : (
              patients.map((patient) => (
                <div
                  key={patient._id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelect(patient)}
                >
                  <div className="text-sm font-medium">{patient.name}</div>
                  <div className="text-xs text-gray-500">
                    {calculateAge(patient.dob)} years • {patient.gender}
                  </div>
                </div>
              ))
            )}
            {loading && patients.length > 0 && (
              <div className="p-2 text-center text-sm text-gray-500">Loading more...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
