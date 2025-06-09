import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Loader2, MoreHorizontal, MoreVertical, Trash2 } from 'lucide-react';
import ChatBubble from './ChatBubble';
import PatientSearch from './PatientSearch';

interface Message {
  _id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  role: string
}

interface ChatWindowProps {
  messages: Message[];
  isTyping: boolean;
  isLoading?: boolean;
  onPatientSelect?: (patientId: string) => void;
  selectedPatientId?: string | null;
  onDeleteMessage?: (messageId: string) => void;
}

export default function ChatWindow({ 
  messages, 
  isTyping, 
  isLoading = false,
  onPatientSelect,
  selectedPatientId,
  onDeleteMessage
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // console.log("MESSAGES",messages);
  // Memoize the scroll function
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Scroll to bottom when messages change or typing starts/stops
  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      scrollToBottom();
    }
  }, [messages.length, isTyping, scrollToBottom]);

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

  const handleMenuClick = useCallback((messageId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveMenuId(activeMenuId === messageId ? null : messageId);
  }, [activeMenuId]);

  const handleDeleteClick = useCallback((messageId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onDeleteMessage?.(messageId);
    setActiveMenuId(null);
  }, [onDeleteMessage]);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Patient Search */}
      {onPatientSelect && (
        <div className="p-4 border-b bg-white">
          <PatientSearch
            onPatientSelect={onPatientSelect}
            selectedPatientId={selectedPatientId}
          />
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="animate-spin text-gray-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={message._id} className="relative group">
              <ChatBubble
                _id={message._id}
                role={message.role}
                message={message.content}
                isUser={message.isUser}
                timestamp={message.timestamp}
              />
              {message.role === 'user' && (
                <div className="absolute bottom-0 right-0 top-1/2">
                  <button
                    className='p-1'
                    onClick={(e) => handleMenuClick(message._id, e)}
                    title="Message options"
                  >
                    <MoreHorizontal size={16} className="text-white" />
                  </button>
                  {activeMenuId === message._id && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                      <button
                        onClick={(e) => handleDeleteClick(message._id, e)}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} className="mr-2" />
                        Delete message
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-4 py-3">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
} 