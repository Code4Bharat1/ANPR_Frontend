// components/supervisor/SupervisorLayout.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard, LogIn, LogOut as ExitIcon, Car, FileText,
  BarChart3, Settings, LogOut, Menu, X, Bell, Shield
} from 'lucide-react';
import Image from 'next/image'; // ✅ Import Image

const SupervisorLayout = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('supervisorData');
    if (data) {
      setUserData(JSON.parse(data));
    }
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/supervisor/dashboard' },
    { icon: LogIn, label: 'Entry Vehicles', path: '/supervisor/entry-vehicles' },
    { icon: ExitIcon, label: 'Exit Vehicles', path: '/supervisor/exit-vehicles' },
    { icon: Car, label: 'Active Vehicles', path: '/supervisor/active-vehicles' },
    { icon: FileText, label: 'Trip History', path: '/supervisor/trip-history' },
    { icon: BarChart3, label: 'Analytics', path: '/supervisor/analytics' }
  ];

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('supervisorData');
      localStorage.removeItem('userRole');
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200 fixed h-full z-50">
        {/* ✅ Logo Header - Desktop */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image 
                src="/logo.png" 
                alt="SecureGate Logo" 
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">SecureGate</span>
              <p className="text-xs text-gray-500">Supervisor Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
                <Bell className="w-5 h-5 text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900">
                    {userData?.name || 'Supervisor'}
                  </div>
                  <div className="text-xs text-gray-500">Site Supervisor</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {userData?.name?.charAt(0) || 'S'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
            {/* ✅ Logo Header - Mobile */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image 
                    src="/logo.png" 
                    alt="SecureGate Logo" 
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900">SecureGate</span>
                  <p className="text-xs text-gray-500">Supervisor</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            <nav className="p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      router.push(item.path);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition font-medium mt-4"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
};

export default SupervisorLayout;
