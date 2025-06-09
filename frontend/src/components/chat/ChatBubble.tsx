"use client";

import React from 'react';
import { Trash2 } from 'lucide-react';

interface ChatBubbleProps {
  _id: string;
  message: string;
  isUser: boolean;
  timestamp?: string;
  role: string;
  onDelete?: (messageId: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  _id,
  message, 
  isUser,
  timestamp,
  role,
  onDelete
}) => {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4 group relative`}>
      <div 
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          role === 'user'
            ? 'bg-teal-700 text-white rounded-br-none' 
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}
      >
        <p className="text-sm">{message}</p>
        {timestamp && (
          <div className={`text-xs mt-1 text-right ${isUser ? 'text-teal-100' : 'text-gray-500'}`}>
            {timestamp}
          </div>
        )}
      </div>
      {onDelete && role === 'user' && (
        <button
          onClick={() => onDelete(_id)}
          className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-100 rounded-full"
          title="Delete message"
        >
          <Trash2 size={16} className="text-red-500" />
        </button>
      )}
    </div>
  );
};

export default ChatBubble;
