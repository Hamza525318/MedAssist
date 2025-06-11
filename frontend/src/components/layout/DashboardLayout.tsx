"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Upload, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { authApi } from '@/utils/api/auth';
import { getAuthToken } from '@/utils/api/auth';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const {addUserData} = useAuth();

    useEffect(() => {
      const checkAuth = async () => {
        const token = getAuthToken();
        if (!token) {
          router.push('/auth/login');
          return;
        }
  
        try {
          const response =  await authApi.getProfile();
          // console.log("RESPONSE", response);
          if(response.success){
            addUserData({
              id: response?.data?._id,
              name: response?.data?.name,
              email: response?.data?.email,
              role: response?.data?.role
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

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Chat', href: '/chat', icon: MessageSquare, current: pathname === '/chat' },
    { name: 'Slot Management', href: '/slots', icon: Calendar, current: pathname === '/slots' },
    // { name: 'Upload Reports', href: '/upload-report', icon: Upload },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/auth/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-5 border-b">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-teal-700">MedAssist</span>
            </div>
            <button
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
              onClick={toggleSidebar}
            >
              <X size={24} />
            </button>
          </div>

          {/* Sidebar navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-teal-700 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="px-4 py-4 border-t">
            <button onClick={handleLogout} className="flex w-full items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
              <LogOut className="mr-3 h-5 w-5 text-gray-500" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <button
                className="p-1 text-gray-500 focus:outline-none lg:hidden"
                onClick={toggleSidebar}
              >
                <Menu size={24} />
              </button>

              {/* User profile and notifications */}
              <div className="flex items-center space-x-4 float-end">
                <button className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none">
                  <Bell size={20} />
                </button>
                <div className="flex items-center">
                  <div className="mr-3 text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-700">Hello, Dr. {user?.name}</p>
                    <p className="text-xs text-gray-500">Doctor</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-teal-700 flex items-center justify-center text-white font-medium">
                    {user?.name?.slice(0, 2).toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
