"use client";
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './sidebar';
import Header from './header';

const SuperAdminLayout = ({ children, title = "Dashboard" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication only on client side
    const checkAuth = () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('user');

        if (accessToken && userData) {
          const user = JSON.parse(userData);
          
          // Check if user is superadmin
          if (user.role === 'superadmin') {
            setIsAuthenticated(true);
          } else {
            // If not superadmin, redirect based on role
            setIsAuthenticated(false);
            if (user.role === 'admin','client') {
              router.replace('/admin/dashboard');
            } else {
              router.replace('/login');
            }
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    // Redirect logic after auth check
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 font-medium text-lg">Checking authentication...</p>
          <p className="text-gray-400 text-sm mt-2">Verifying your access permissions</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show nothing (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-72">
        <Header 
          title={title} 
          onMenuClick={() => setSidebarOpen(true)} 
        />

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;