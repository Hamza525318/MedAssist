import axios from 'axios';

const API_BASE_URL = "http://localhost:4000/api";

export interface ChatSession {
  _id: string;
  name: string;
  startedAt: string;
  lastUpdatedAt: string;
  patientId?: string;
}

export interface Message {
  _id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  role: string
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface UploadReportResponse {
  success: boolean;
  message: string;
  data?: {
    analysis: string;
    patientContext: string;
    chatId: string;
  };
}

export const chatApi = {
  /**
   * Create a new chat session
   * @param name Chat name
   * @param patientId Optional patient ID to associate with the chat
   * @returns Created chat session
   */
  createChat: async (name: string, patientId?: string): Promise<ChatResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chat-history/create-chat`,
        { name, patientId },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create chat');
      }
      throw new Error('Failed to create chat');
    }
  },

  /**
   * Get all chat sessions for the current user
   * @returns List of chat sessions
   */
  getAllChats: async (): Promise<ChatResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat-history/get-all-chats`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log("CHATS RESPONSE",response.data);
      return response.data;
    } catch (error) {
      console.log("ERROR",error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch chats');
      }
      throw new Error('Failed to fetch chats');
    }
  },

  /**
   * Get messages for a specific chat
   * @param chatId ID of the chat to fetch messages for
   * @returns List of messages
   */
  getMessagesByChatId: async (chatId: string): Promise<ChatResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/chat-history/get-messages-by-chat-id/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("ERROR",error);
        throw new Error(error.response?.data?.message || 'Failed to fetch messages');
      }
      throw new Error('Failed to fetch messages');
    }
  },

  /**
   * Delete a chat session
   * @param chatId ID of the chat to delete
   * @returns Success response
   */
  deleteChat: async (chatId: string): Promise<ChatResponse> => {
    try {
      console.log("DELETE CHAT ID",chatId);
      const response = await axios.post(
        `${API_BASE_URL}/chat-history/delete-chat-by-id`,
        { chatId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("ERROR",error);
        throw new Error(error.response?.data?.message || 'Failed to delete chat');
      }
      throw new Error('Failed to delete chat');
    }
  },

  /**
   * Rename a chat session
   * @param chatId ID of the chat to rename
   * @param newName New name for the chat
   * @returns Updated chat session
   */
  renameChat: async (chatId: string, newName: string): Promise<ChatResponse> => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/chat-history/update-chat-by-id/${chatId}`,
        { name: newName },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to rename chat');
      }
      throw new Error('Failed to rename chat');
    }
  },

  /**
   * Send a message in a chat session
   * @param chatId ID of the chat session
   * @param message Message content
   * @param patientId Optional patient ID for context
   * @returns Chat response with AI reply
   */
  sendMessage: async (chatId: string, message: string, patientId?: string): Promise<ChatResponse> => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/ai/chat`,
        { chatId, chatMessage: message, patientId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log("CHAT RESPONSE",response);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to send message');
      }
      throw new Error('Failed to send message');
    }
  },

  /**
   * Upload and analyze a medical report
   * @param file The file to upload
   * @param chatMessage Optional message to guide the analysis
   * @param patientId Optional patient ID for context
   * @param chatId Optional chat ID to add the analysis to
   * @returns Analysis response
   */
  uploadReportForAI: async (
    file: File,
    chatMessage?: string,
    patientId?: string,
    chatId?: string
  ): Promise<UploadReportResponse> => {
    try {
      const formData = new FormData();
      formData.append('report', file);
      if (chatMessage) formData.append('chatMessage', chatMessage);
      if (patientId) formData.append('patientId', patientId);
      if (chatId) formData.append('chatId', chatId);

      const response = await axios.post(
        `${API_BASE_URL}/ai/upload-report`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to upload and analyze report');
      }
      throw new Error('Failed to upload and analyze report');
    }
  },

  /**
   * Delete a specific message from a chat
   * @param chatId ID of the chat containing the message
   * @param messageId ID of the message to delete
   * @returns Updated chat messages
   */
  deleteMessage: async (chatId: string, messageId: string): Promise<ChatResponse> => {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/chat-history/delete-message/${chatId}/${messageId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete message');
      }
      throw new Error('Failed to delete message');
    }
  },
};