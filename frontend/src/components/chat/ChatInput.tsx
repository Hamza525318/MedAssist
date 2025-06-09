import React, { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (inputValue.trim() === '' && !selectedFile) return;
    onSendMessage(inputValue.trim(), selectedFile || undefined);
    setInputValue('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      {selectedFile && (
        <div className="mb-2 flex items-center gap-2 bg-gray-50 p-2 rounded-md">
          <span className="text-sm text-gray-600 flex-1 truncate">
            {selectedFile.name}
          </span>
          <button
            onClick={removeFile}
            className="p-1 hover:bg-gray-200 rounded-full"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      )}
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          disabled={disabled}
        >
          <Paperclip size={20} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
          accept=".pdf,.jpg,.jpeg,.png,.docx"
        />
        
        <textarea
          className="flex-1 input resize-none"
          placeholder={selectedFile ? "Add a message with your file..." : "Type your message..."}
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        
        <button
          className="p-2 bg-teal-700 text-white rounded-full hover:bg-teal-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSendMessage}
          disabled={(inputValue.trim() === '' && !selectedFile) || disabled}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
} 