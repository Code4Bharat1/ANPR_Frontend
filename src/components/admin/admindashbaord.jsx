"use client";
import React, { useState, useEffect } from 'react';
import { 
  Bell, Menu, MapPin, Camera, Users, UserCheck, ArrowRight, ArrowLeft, 
  AlertCircle, Shield, LayoutDashboard, BarChart3, Settings, User, LogOut, X 
} from 'lucide-react';
import Sidebar from './sidebar';

// Sidebar Component
// const Sidebar = ({ isOpen, onClose }) => {
//   const [activeItem, setActiveItem] = useState('Dashboard');

//   const menuItems = [
//     { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
//     { name: 'Sites', icon: MapPin, path: '/sites' },
//     { name: 'Users', icon: Users, path: '/users' },
//     { name: 'Devices', icon: Camera, path: '/devices' },
//     { name: 'Reports', icon: BarChart3, path: '/reports' },
//     { name: 'Settings', icon: Settings, path: '/settings' },
//     { name: 'Profile', icon: User, path: '/profile' }
//   ];

//   const handleLogout = () => {
//     if (confirm('Are you sure you want to logout?')) {
//       localStorage.removeItem('accessToken');
//       window.location.href = '/login';
//     }
//   };

//   const handleNavigation = (itemName, path) => {
//     setActiveItem(itemName);
//     console.log(`Navigating to ${path}`);
//     if (onClose) onClose();
//   };

//   return (
//     <>
//       {/* Mobile Overlay */}
//       {isOpen && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={onClose}
//         />
//       )}

//       {/* Sidebar */}
//       <aside className={`
//         fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
//         w-72 flex flex-col
//         transform transition-transform duration-300 ease-in-out
//         ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
//       `}>
//         {/* Header */}
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center gap-3">
//               <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
//                 <Shield className="w-7 h-7 text-white" />
//               </div>
//               <span className="text-xl font-bold text-gray-900">AccessControl</span>
//             </div>
//             <button 
//               onClick={onClose}
//               className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
//             >
//               <X className="w-5 h-5 text-gray-600" />
//             </button>
//           </div>

//           {/* User Profile */}
//           <div className="flex items-center gap-3">
//             <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
//               JA
//             </div>
//             <div>
//               <div className="font-semibold text-gray-900">James Anderson</div>
//               <div className="text-sm text-gray-500">Client Admin</div>
//             </div>
//           </div>
//         </div>

//         {/* Navigation Menu */}
//         <nav className="flex-1 p-4 overflow-y-auto">
//           <div className="space-y-1">
//             {menuItems.map((item) => {
//               const Icon = item.icon;
//               const isActive = activeItem === item.name;
              
//               return (
//                 <button
//                   key={item.name}
//                   onClick={() => handleNavigation(item.name, item.path)}
//                   className={`
//                     w-full flex items-center gap-3 px-4 py-3 rounded-lg
//                     transition-all duration-200
//                     ${isActive 
//                       ? 'bg-blue-50 text-blue-700 font-semibold' 
//                       : 'text-gray-700 hover:bg-gray-50'
//                     }
//                   `}
//                 >
//                   <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-600'}`} />
//                   <span>{item.name}</span>
//                 </button>
//               );
//             })}
//           </div>
//         </nav>

//         {/* Footer */}
//         <div className="p-4 border-t border-gray-200">
//           <button
//             onClick={handleLogout}
//             className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//           >
//             <LogOut className="w-5 h-5" />
//             <span className="font-semibold">Logout</span>
//           </button>
          
//           <div className="mt-4 text-center text-xs text-gray-400">
//             v2.4.1 Enterprise Build
//           </div>
//         </div>
//       </aside>
//     </>
//   );
// };

// Dashboard Card Component
const DashboardCard = ({ icon: Icon, value, label, bgColor, iconColor }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between">
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center mb-4`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
    </div>
    <div className="text-gray-600 text-sm font-medium">{label}</div>
  </div>
);

// Activity Item Component
const ActivityItem = ({ type, id, location, time, icon: Icon, iconBg }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-gray-700" />
      </div>
      <div>
        <div className="font-semibold text-gray-900">{type}: {id}</div>
        <div className="text-sm text-gray-600">{location}</div>
      </div>
    </div>
    <div className="text-sm text-gray-500">{time}</div>
  </div>
);

// Main Dashboard Component
const AccessControlDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentActivity] = useState([
    { type: 'Entry', id: 'CA-554-BD', location: 'Main Gate • Barrier 1', time: '2m ago', icon: ArrowRight, iconBg: 'bg-green-100' },
    { type: 'Exit', id: 'DL-902-XX', location: 'Rear Gate • Barrier 2', time: '15m ago', icon: ArrowLeft, iconBg: 'bg-gray-100' },
    { type: 'Device Offline', id: 'Gate-3-Cam-01', location: 'East Wing • Gate 3', time: '1h ago', icon: AlertCircle, iconBg: 'bg-yellow-100' }
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      // Set mock data for demonstration
      setDashboardData({
        totalSites: 4,
        devices: 12,
        projectManagers: 8,
        supervisors: 15,
        todayEntries: 342,
        todayExits: 289
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:ml-72">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                CA
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Plan Info Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="text-sm text-gray-500 font-medium mb-2">CURRENT PLAN</div>
                <h2 className="text-3xl font-bold text-gray-900">Enterprise Gold</h2>
              </div>
              <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                Active
              </span>
            </div>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-sm text-gray-500 mb-1">Expires</div>
                <div className="text-lg font-semibold text-gray-900">Dec 31, 2024</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Devices</div>
                <div className="text-lg font-semibold text-gray-900">12 / 20</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Users</div>
                <div className="text-lg font-semibold text-gray-900">45 / Unlimited</div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Demo mode: Using sample data. API Error: {error}
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            <DashboardCard
              icon={MapPin}
              value={dashboardData?.totalSites || 0}
              label="Total Sites"
              bgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <DashboardCard
              icon={Camera}
              value={dashboardData?.devices || 0}
              label="Active Devices"
              bgColor="bg-green-50"
              iconColor="text-green-600"
            />
            <DashboardCard
              icon={Users}
              value={dashboardData?.projectManagers || 0}
              label="Proj. Managers"
              bgColor="bg-red-50"
              iconColor="text-red-600"
            />
            <DashboardCard
              icon={UserCheck}
              value={dashboardData?.supervisors || 0}
              label="Supervisors"
              bgColor="bg-orange-50"
              iconColor="text-orange-600"
            />
          </div>

          {/* Activity Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <DashboardCard
              icon={ArrowRight}
              value={dashboardData?.todayEntries || 0}
              label="Today Entries"
              bgColor="bg-purple-50"
              iconColor="text-purple-600"
            />
            <DashboardCard
              icon={ArrowLeft}
              value={dashboardData?.todayExits || 0}
              label="Today Exits"
              bgColor="bg-purple-50"
              iconColor="text-purple-600"
            />
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AccessControlDashboard;