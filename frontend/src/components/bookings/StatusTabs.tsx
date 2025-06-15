"use client";

import React from 'react';

interface StatusTabsProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
}

const StatusTabs: React.FC<StatusTabsProps> = ({ activeStatus, onStatusChange }) => {
  const tabs = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'CheckedIn', label: 'Checked In' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onStatusChange(tab.value)}
          className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
            activeStatus === tab.value
              ? 'bg-teal-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default StatusTabs; 