// hooks/useAuthGuard.ts
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authApi } from '@/utils/api/auth'; // adjust path if needed
import { getAuthToken } from '@/utils/api/auth'; // your helper
import { useAuth } from '@/contexts/AuthContext'; // assuming you have context

export const useAuthGuard = () => {
  const router = useRouter();
  const { addUserData } = useAuth();

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
            id: response.data._id!,
            name: response.data.name!,
            email: response.data.email!,
            role: response.data.role!,
          });
        } else {
          throw new Error('Invalid response');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router, addUserData]);
};
