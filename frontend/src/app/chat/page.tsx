"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import ChatInput from '@/components/chat/ChatInput';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthToken } from '@/utils/api/auth';
import { authApi, UserProfile } from '@/utils/api/auth';
import { chatApi, ChatSession, Message } from '@/utils/api/chat';
import { useRouter } from 'next/navigation';

// Initialize empty messages array
const initialMessages: Message[] = [];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { addUserData } = useAuth();
    
  console.log("CHAT PAGE RE-RENDERED")
    // Check authentication and fetch user profile
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await authApi.getProfile();
        if (response.success && response.data) {
          addUserData({
            id: response.data.id,
            name: response.data.name,
            email: response.data.email,
            role: response.data.role
          });
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        localStorage.removeItem('token');
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  // Fetch chat sessions
  useEffect(() => {
    const fetchChats = async () => {
      try {
        setIsLoading(true);
        const response = await chatApi.getAllChats();
        if (response.success && response.data) {
          setChats(response.data);
          // Auto-select first chat if none selected
          if (!selectedChatId && response.data.length > 0) {
            setSelectedChatId(response.data[0]._id);
          }
        }
      } catch (err) {
        setError('Failed to fetch chat sessions');
        console.error('Error fetching chats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []); // Empty dependency array as this should only run once on mount

  // Fetch messages when chat is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChatId) return;

      try {
        setIsLoading(true);
        const response = await chatApi.getMessagesByChatId(selectedChatId);
        if (response.success && response.data) {
          console.log("CHAT MESSAGES",response.data);
          setMessages(response.data);
        }
      } catch (err) {
        setError('Failed to fetch messages');
        console.error('Error fetching messages:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChatId]); // Only depend on selectedChatId

  const handleSendMessage = useCallback(async (message: string, file?: File) => {
    if (!selectedChatId) {
      setError('Please select or create a chat first');
      return;
    }

    try {
    setIsTyping(true);
      setError(null);

      // Add user message to UI immediately
      const userMessage: Message = {
        _id: Date.now().toString(),
        content: file ? `Uploaded file: ${file.name}${message ? ` - ${message}` : ''}` : message,
        isUser: true,
        role: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMessage]);

      let response;
      if (file) {
        // Handle file upload and analysis
        response = await chatApi.uploadReportForAI(
          file,
          message,
          selectedPatientId || undefined,
          selectedChatId
        );
      } else {
        // Handle regular chat message
        response = await chatApi.sendMessage(
          selectedChatId,
          message,
          selectedPatientId || undefined
        );
      }

      if (response.success && response.data) {
        // Add AI response to messages
        const aiMessage: Message = {
          _id: response.data._id || Date.now().toString(),
          content: response.data.content || response.data.analysis,
        isUser: false,
          role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
        setMessages(prev => [...prev, aiMessage]);

        // Only update chat ID if this was a new chat (no chatId was provided)
        if (file && response.data.chatId && !selectedChatId) {
          setSelectedChatId(response.data.chatId);
        }
      } else {
        throw new Error(response.message || 'Failed to get response');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      console.error('Error sending message:', err);
    } finally {
      setIsTyping(false);
    }
  }, [selectedChatId, selectedPatientId]);

  const handleNewChat = useCallback(async () => {
    try {
      const response = await chatApi.createChat('New Chat');
      if (response.success && response.data) {
        const newChat = response.data;
        setChats(prev => [newChat, ...prev]);
        setSelectedChatId(newChat._id);
        setMessages(initialMessages);
      }
    } catch (err) {
      setError('Failed to create new chat');
      console.error('Error creating chat:', err);
    }
  }, []);

  const handleRenameChat = useCallback(async (chatId: string, newName: string) => {
    try {
      console.log("RENAME CHAT",chatId,newName);
      const response = await chatApi.renameChat(chatId, newName);
      if (response.success && response.data) {
        setChats(prev =>
          prev.map(chat =>
            chat._id === chatId ? { ...chat, name: newName } : chat
          )
        );
      }
    } catch (err) {
      setError('Failed to rename chat');
      console.error('Error renaming chat:', err);
    }
  }, []);

  const handleDeleteChat = useCallback(async (chatId: string) => {
    try {
      const response = await chatApi.deleteChat(chatId);
      if (response.success) {
        setChats(prev => prev.filter(chat => chat._id !== chatId));
        if (selectedChatId === chatId) {
          setSelectedChatId(chats[0]?._id || null);
        }
      }
    } catch (err) {
      setError('Failed to delete chat');
      console.error('Error deleting chat:', err);
    }
  }, [selectedChatId]);

  const handlePatientSelect = useCallback((patientId: string) => {
    setSelectedPatientId(patientId);
  }, []);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!selectedChatId) return;

    try {
      const response = await chatApi.deleteMessage(selectedChatId, messageId);
      if (response.success && response.data) {
        setMessages(response.data);
      }
    } catch (err) {
      setError('Failed to delete message');
      console.error('Error deleting message:', err);
    }
  }, [selectedChatId]);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-64px)] flex">
        {/* Mobile Sidebar Toggle */}
              <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu size={24} />
              </button>
              
        {/* Sidebar */}
        <div
          className={`fixed lg:static inset-y-0 left-0 z-40 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition-transform duration-200 ease-in-out`}
        >
          <ChatSidebar
            chats={chats}
            selectedChatId={selectedChatId}
            onChatSelect={setSelectedChatId}
            onNewChat={handleNewChat}
            onRenameChat={handleRenameChat}
            onDeleteChat={handleDeleteChat}
            isLoading={isLoading}
          />
          </div>
          
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
              </div>
            )}
          <ChatWindow
            messages={messages}
            isTyping={isTyping}
            isLoading={isLoading}
            onPatientSelect={handlePatientSelect}
            selectedPatientId={selectedPatientId}
            onDeleteMessage={handleDeleteMessage}
          />
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={!selectedChatId || isLoading}
          />
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
