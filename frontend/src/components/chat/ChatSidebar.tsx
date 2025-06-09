import React, { useState } from 'react';
import { Plus, MoreVertical, MessageSquare, Loader2 } from 'lucide-react';

interface ChatSession {
  _id: string;
  name: string;
  lastUpdatedAt: string;
}

interface ChatSidebarProps {
  chats: ChatSession[];
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onRenameChat: (chatId: string, newName: string) => void;
  onDeleteChat: (chatId: string) => void;
  isLoading?: boolean;
}

export default function ChatSidebar({
  chats,
  selectedChatId,
  onChatSelect,
  onNewChat,
  onRenameChat,
  onDeleteChat,
  isLoading = false,
}: ChatSidebarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isRenaming, setIsRenaming] = useState<string | null>(null);
  const [newChatName, setNewChatName] = useState('');

  const handleRename = (chatId: string) => {
    if (newChatName.trim()) {
      onRenameChat(chatId, newChatName.trim());
      setIsRenaming(null);
      setNewChatName('');
    }
  };

  return (
    <div className="w-80 h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onNewChat}
          className="w-full btn btn-primary flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <Plus size={20} />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="animate-spin text-gray-500" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No chats yet
          </div>
        ) : (
          chats.map((chat,index) => (
            <div
              key={index}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                selectedChatId === chat._id ? 'bg-teal-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 flex-1"
                  onClick={() => onChatSelect(chat._id)}
                >
                  <MessageSquare size={20} className="text-gray-500" />
                  {isRenaming === chat._id ? (
                    <input
                      type="text"
                      value={newChatName}
                      onChange={(e) => setNewChatName(e.target.value)}
                      onBlur={() => handleRename(chat._id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(chat._id);
                      }}
                      className="input py-1"
                      autoFocus
                    />
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chat.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(chat.lastUpdatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === chat._id ? null : chat._id)}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <MoreVertical size={16} className="text-gray-500" />
                  </button>
                  {activeDropdown === chat._id && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsRenaming(chat._id);
                            setNewChatName(chat.name);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Rename Chat
                        </button>
                        <button
                          onClick={() => {
                            onDeleteChat(chat._id);
                            setActiveDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete Chat
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 