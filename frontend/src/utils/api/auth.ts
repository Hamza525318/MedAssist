import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

// User profile interface
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  data?: UserProfile;
  message?: string;
}

/**
 * Get the authentication token from localStorage
 * @returns The JWT token or null if not found
 */
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await axios.post(
      `${API_BASE_URL}/auth/login`,
      { email, password },
      { withCredentials: true }
    );
    return response.data;
  },

  register: async (
    name: string,
    email: string,
    password: string,
    role: string = 'Doctor'
  ) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      name,
      email,
      password,
      role,
    });
    return response.data;
  },
  
  /**
   * Get the current user's profile
   * @returns Promise with the user profile data
   */
  getProfile: async (): Promise<ProfileResponse> => {
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get<ProfileResponse>(
        `${API_BASE_URL}/auth/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("ERROR GETTING PROFILE", error);
        throw new Error(error.response?.data?.message || 'Failed to fetch profile');
      }
      throw error;
    }
  },
};
