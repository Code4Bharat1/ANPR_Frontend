// "use client";
// import React, { useState, useEffect } from 'react';
// import { 
//   Bell, Menu, Users, UserCheck, UserX, MapPin, Camera, 
//   Activity, DollarSign, TrendingUp, AlertTriangle, CheckCircle, 
//   XCircle, Clock, ArrowRight
// } from 'lucide-react';
// import Sidebar from './sidebar';

// // Dashboard Card Component
// const DashboardCard = ({ icon: Icon, value, label, bgColor, iconColor, trend }) => (
//   <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//     <div className="flex items-start justify-between mb-4">
//       <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
//         <Icon className={`w-6 h-6 ${iconColor}`} />
//       </div>
//       {trend && (
//         <div className={`flex items-center gap-1 text-sm font-semibold ${
//           trend > 0 ? 'text-green-600' : 'text-red-600'
//         }`}>
//           <TrendingUp className="w-4 h-4" />
//           {Math.abs(trend)}%
//         </div>
//       )}
//     </div>
//     <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
//     <div className="text-gray-600 text-sm font-medium">{label}</div>
//   </div>
// );

// // System Health Card
// const SystemHealthCard = ({ title, status, count, icon: Icon, statusColor }) => (
//   <div className="bg-white rounded-lg p-4 border border-gray-100">
//     <div className="flex items-center justify-between">
//       <div className="flex items-center gap-3">
//         <Icon className="w-5 h-5 text-gray-600" />
//         <div>
//           <div className="font-semibold text-gray-900">{title}</div>
//           <div className="text-sm text-gray-600">{count} units</div>
//         </div>
//       </div>
//       <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
//         {status}
//       </span>
//     </div>
//   </div>
// );

// // Recent Activity Item
// const ActivityItem = ({ client, action, time, status }) => (
//   <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
//     <div className="flex items-center gap-3">
//       <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
//         <Users className="w-5 h-5 text-purple-600" />
//       </div>
//       <div>
//         <div className="font-semibold text-gray-900">{client}</div>
//         <div className="text-sm text-gray-600">{action}</div>
//       </div>
//     </div>
//     <div className="text-right">
//       <div className="text-sm text-gray-500">{time}</div>
//       <span className={`text-xs px-2 py-1 rounded-full ${
//         status === 'success' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
//       }`}>
//         {status}
//       </span>
//     </div>
//   </div>
// );

// // Main Super Admin Dashboard
// const SuperAdminDashboard = () => {
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [dashboardData, setDashboardData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('accessToken');

//       if (!token) {
//         throw new Error('No authentication token found');
//       }

//       const response = await fetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/dashboard`,
//         {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       setDashboardData(data);
//       setError(null);
//     } catch (err) {
//       console.error('Error fetching dashboard data:', err);
//       setError(err.message);
//       // Mock data for demonstration
//       setDashboardData({
//         totalClients: 48,
//         activeClients: 42,
//         expiredClients: 6,
//         totalSites: 156,
//         totalDevices: 892,
//         activeDevices: 856,
//         offlineDevices: 36,
//         totalTrips: 15847,
//         totalRevenue: 284500,
//         systemHealth: {
//           anprCameras: { online: 445, offline: 12 },
//           barriers: { online: 411, offline: 24 },
//           apiUptime: 99.8
//         }
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

//       <div className="lg:ml-72">
//         {/* Header */}
//         <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
//           <div className="flex items-center justify-between px-6 py-4">
//             <div className="flex items-center gap-4">
//               <button 
//                 onClick={() => setSidebarOpen(true)}
//                 className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
//               >
//                 <Menu className="w-6 h-6 text-gray-700" />
//               </button>
//               <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
//             </div>
//             <div className="flex items-center gap-4">
//               <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
//                 <Bell className="w-6 h-6 text-gray-600" />
//                 <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//               </button>
//               <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
//                 SA
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Main Content */}
//         <main className="max-w-7xl mx-auto px-6 py-8">
//           {error && (
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
//               <p className="text-sm text-yellow-800">
//                 Demo mode: Using sample data. API Error: {error}
//               </p>
//             </div>
//           )}

//           {/* Client Analytics */}
//           <div className="mb-8">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">Client Overview</h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <DashboardCard
//                 icon={Users}
//                 value={dashboardData?.totalClients || 0}
//                 label="Total Clients"
//                 bgColor="bg-purple-50"
//                 iconColor="text-purple-600"
//                 trend={12}
//               />
//               <DashboardCard
//                 icon={UserCheck}
//                 value={dashboardData?.activeClients || 0}
//                 label="Active Clients"
//                 bgColor="bg-green-50"
//                 iconColor="text-green-600"
//               />
//               <DashboardCard
//                 icon={UserX}
//                 value={dashboardData?.expiredClients || 0}
//                 label="Expired Clients"
//                 bgColor="bg-red-50"
//                 iconColor="text-red-600"
//               />
//             </div>
//           </div>

//           {/* System Stats */}
//           <div className="mb-8">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">System Statistics</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//               <DashboardCard
//                 icon={MapPin}
//                 value={dashboardData?.totalSites || 0}
//                 label="Total Sites"
//                 bgColor="bg-blue-50"
//                 iconColor="text-blue-600"
//               />
//               <DashboardCard
//                 icon={Camera}
//                 value={dashboardData?.totalDevices || 0}
//                 label="Total Devices"
//                 bgColor="bg-indigo-50"
//                 iconColor="text-indigo-600"
//               />
//               <DashboardCard
//                 icon={Activity}
//                 value={dashboardData?.totalTrips || 0}
//                 label="Total Trips"
//                 bgColor="bg-orange-50"
//                 iconColor="text-orange-600"
//                 trend={8}
//               />
//               <DashboardCard
//                 icon={DollarSign}
//                 value={`$${(dashboardData?.totalRevenue || 0).toLocaleString()}`}
//                 label="Total Revenue"
//                 bgColor="bg-green-50"
//                 iconColor="text-green-600"
//                 trend={15}
//               />
//             </div>
//           </div>

//           {/* System Health */}
//           <div className="mb-8">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">System Health</h2>
//             <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div>
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="font-semibold text-gray-900">Device Status</h3>
//                     <div className="text-sm text-gray-600">
//                       {dashboardData?.activeDevices || 0} / {dashboardData?.totalDevices || 0} Online
//                     </div>
//                   </div>
//                   <div className="space-y-3">
//                     <SystemHealthCard
//                       title="ANPR Cameras"
//                       status="Operational"
//                       count={dashboardData?.systemHealth?.anprCameras?.online || 0}
//                       icon={Camera}
//                       statusColor="bg-green-100 text-green-700"
//                     />
//                     <SystemHealthCard
//                       title="Barriers"
//                       status="Operational"
//                       count={dashboardData?.systemHealth?.barriers?.online || 0}
//                       icon={Activity}
//                       statusColor="bg-green-100 text-green-700"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <h3 className="font-semibold text-gray-900 mb-4">API Performance</h3>
//                   <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-sm text-gray-600">Uptime</span>
//                       <CheckCircle className="w-5 h-5 text-green-600" />
//                     </div>
//                     <div className="text-4xl font-bold text-gray-900 mb-1">
//                       {dashboardData?.systemHealth?.apiUptime || 0}%
//                     </div>
//                     <div className="text-sm text-gray-600">Last 30 days</div>
//                   </div>
//                 </div>
//               </div>

//               {/* Offline Devices Alert */}
//               {(dashboardData?.offlineDevices || 0) > 0 && (
//                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
//                   <AlertTriangle className="w-5 h-5 text-yellow-600" />
//                   <div>
//                     <div className="font-semibold text-yellow-900">
//                       {dashboardData?.offlineDevices} Devices Offline
//                     </div>
//                     <div className="text-sm text-yellow-700">
//                       Immediate attention required for optimal system performance
//                     </div>
//                   </div>
//                   <button className="ml-auto px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm font-semibold">
//                     View Details
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Recent Activity */}
//           <div>
//             <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
//             <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
//               <ActivityItem
//                 client="Enterprise Corp"
//                 action="Package renewed - Gold Plan"
//                 time="5m ago"
//                 status="success"
//               />
//               <ActivityItem
//                 client="TechStart Ltd"
//                 action="New client registered"
//                 time="1h ago"
//                 status="success"
//               />
//               <ActivityItem
//                 client="Global Industries"
//                 action="Added 12 new devices"
//                 time="2h ago"
//                 status="success"
//               />
//               <ActivityItem
//                 client="Metro Logistics"
//                 action="Package expires in 7 days"
//                 time="3h ago"
//                 status="warning"
//               />
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default SuperAdminDashboard;
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, UserCheck, UserX, MapPin, Camera, 
  Activity, DollarSign, TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';
import SuperAdminLayout from './layout'; // ← Import Layout

// Dashboard Card Component
const DashboardCard = ({ icon: Icon, value, label, bgColor, iconColor, trend }) => (
  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3 md:mb-4">
      <div className={`w-10 h-10 md:w-12 md:h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${iconColor}`} />
      </div>
      {trend !== undefined && trend !== null && (
        <div className={`flex items-center gap-1 text-xs md:text-sm font-semibold ${
          trend > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-gray-600 text-xs md:text-sm font-medium">{label}</div>
  </div>
);

// System Health Card
const SystemHealthCard = ({ title, status, count, icon: Icon, statusColor }) => (
  <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-100 hover:shadow-sm transition-shadow">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <Icon className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 text-sm md:text-base truncate">{title}</div>
          <div className="text-xs md:text-sm text-gray-600">{count} units</div>
        </div>
      </div>
      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusColor}`}>
        {status}
      </span>
    </div>
  </div>
);

// Recent Activity Item
const ActivityItem = ({ client, action, time, status }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-gray-100 last:border-0 gap-2">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-gray-900 text-sm md:text-base truncate">{client}</div>
        <div className="text-xs md:text-sm text-gray-600 truncate">{action}</div>
      </div>
    </div>
    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 ml-11 sm:ml-0">
      <div className="text-xs md:text-sm text-gray-500">{time}</div>
      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
        status === 'success' ? 'bg-green-100 text-green-700' : 
        status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {status}
      </span>
    </div>
  </div>
);

// Main Super Admin Dashboard
const SuperAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.response?.data?.message || err.message);
      
      // Mock data fallback
      setDashboardData({
        totalClients: 48,
        activeClients: 42,
        expiredClients: 6,
        totalSites: 156,
        totalDevices: 892,
        activeDevices: 856,
        offlineDevices: 36,
        totalTrips: 15847,
        totalRevenue: 284500,
        systemHealth: {
          anprCameras: { online: 445, offline: 12 },
          barriers: { online: 411, offline: 24 },
          apiUptime: 99.8
        },
        recentActivity: [
          { id: 1, client: "Enterprise Corp", action: "Package renewed - Gold Plan", time: "5m ago", status: "success" },
          { id: 2, client: "TechStart Ltd", action: "New client registered", time: "1h ago", status: "success" },
          { id: 3, client: "Global Industries", action: "Added 12 new devices", time: "2h ago", status: "success" },
          { id: 4, client: "Metro Logistics", action: "Package expires in 7 days", time: "3h ago", status: "warning" }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminLayout title="Super Admin Dashboard">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex items-start gap-2 md:gap-3">
            <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs md:text-sm text-yellow-800">
              Demo mode: Using sample data. API Error: {error}
            </p>
          </div>
        </div>
      )}

      {/* Client Analytics */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Client Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <DashboardCard
            icon={Users}
            value={dashboardData?.totalClients || 0}
            label="Total Clients"
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
            trend={12}
          />
          <DashboardCard
            icon={UserCheck}
            value={dashboardData?.activeClients || 0}
            label="Active Clients"
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
          <DashboardCard
            icon={UserX}
            value={dashboardData?.expiredClients || 0}
            label="Expired Clients"
            bgColor="bg-red-50"
            iconColor="text-red-600"
          />
        </div>
      </div>

      {/* System Stats */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">System Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <DashboardCard
            icon={MapPin}
            value={dashboardData?.totalSites || 0}
            label="Total Sites"
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <DashboardCard
            icon={Camera}
            value={dashboardData?.totalDevices || 0}
            label="Total Devices"
            bgColor="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          <DashboardCard
            icon={Activity}
            value={dashboardData?.totalTrips?.toLocaleString() || 0}
            label="Total Trips"
            bgColor="bg-orange-50"
            iconColor="text-orange-600"
            trend={8}
          />
          <DashboardCard
            icon={DollarSign}
            value={`$${(dashboardData?.totalRevenue || 0).toLocaleString()}`}
            label="Total Revenue"
            bgColor="bg-green-50"
            iconColor="text-green-600"
            trend={15}
          />
        </div>
      </div>

      {/* System Health */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">System Health</h2>
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <div>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">Device Status</h3>
                <div className="text-xs md:text-sm text-gray-600">
                  {dashboardData?.activeDevices || 0} / {dashboardData?.totalDevices || 0} Online
                </div>
              </div>
              <div className="space-y-3">
                <SystemHealthCard
                  title="ANPR Cameras"
                  status="Operational"
                  count={dashboardData?.systemHealth?.anprCameras?.online || 0}
                  icon={Camera}
                  statusColor="bg-green-100 text-green-700"
                />
                <SystemHealthCard
                  title="Barriers"
                  status="Operational"
                  count={dashboardData?.systemHealth?.barriers?.online || 0}
                  icon={Activity}
                  statusColor="bg-green-100 text-green-700"
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">API Performance</h3>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 md:p-6 border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs md:text-sm text-gray-600">Uptime</span>
                  <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  {dashboardData?.systemHealth?.apiUptime || 0}%
                </div>
                <div className="text-xs md:text-sm text-gray-600">Last 30 days</div>
              </div>
            </div>
          </div>

          {/* Offline Devices Alert */}
          {(dashboardData?.offlineDevices || 0) > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-yellow-900 text-sm md:text-base">
                  {dashboardData?.offlineDevices} Devices Offline
                </div>
                <div className="text-xs md:text-sm text-yellow-700">
                  Immediate attention required for optimal system performance
                </div>
              </div>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-xs md:text-sm font-semibold whitespace-nowrap">
                View Details
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
          {dashboardData?.recentActivity?.length > 0 ? (
            dashboardData.recentActivity.map((activity) => (
              <ActivityItem
                key={activity.id}
                client={activity.client}
                action={activity.action}
                time={activity.time}
                status={activity.status}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
