
"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, UserCheck, UserX, MapPin, Camera, IndianRupeeIcon,
  Activity,  TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';
import SuperAdminLayout from './layout'; // ← Import Layout
import api from '@/lib/axios';



// Dashboard Card Component
const DashboardCard = ({ icon: Icon, value, label, bgColor, iconColor, trend }) => (
  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3 md:mb-4">
      <div className={`w-10 h-10 md:w-12 md:h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${iconColor}`} />
      </div>
      {trend !== undefined && trend !== null && (
        <div className={`flex items-center gap-1 text-xs md:text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'
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

const SystemHealthCard = ({
  title,
  subtitle,
  count,
  icon: Icon,
  statusColor,
}) => (
  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-600" />
        <div className="font-semibold text-gray-900">{title}</div>
      </div>
    </div>

    <div className="text-sm text-gray-600 mb-1">{subtitle}</div>

    <div className={`text-2xl font-bold ${statusColor}`}>
      {count}
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
      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${status === 'success' ? 'bg-green-100 text-green-700' :
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

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // console.log(API_URL)

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

    const res = await api.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/dashboard`
    );

    setDashboardData(res.data);
    // console.log(res.data);

    setError(null);
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    setError(err.response?.data?.message || err.message);

    
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
            // trend={12}
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
            // trend={8}
          />
          <DashboardCard
            icon={IndianRupeeIcon}
            value={`${(dashboardData?.totalRevenue || 0).toLocaleString()}`}
            label="Total Revenue"
            bgColor="bg-green-50"
            iconColor="text-green-600"
            // trend={15}
          />
        </div>
      </div>

      {/* System Health */}
<div className="mb-6 md:mb-8">
  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
    System Health
  </h2>

  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">

      {/* ANPR Active */}
      <SystemHealthCard
        title="ANPR Cameras"
        subtitle="Active"
        count={dashboardData?.systemHealth?.anprCameras?.online || 0}
        icon={Camera}
        statusColor="text-green-700"
      />

      {/* ANPR Inactive */}
      <SystemHealthCard
        title="ANPR Cameras"
        subtitle="Inactive"
        count={dashboardData?.systemHealth?.anprCameras?.offline || 0}
        icon={Camera}
        statusColor="text-red-600"
      />

      {/* Barrier Active */}
      <SystemHealthCard
        title="Barriers"
        subtitle="Active"
        count={dashboardData?.systemHealth?.barriers?.online || 0}
        icon={Activity}
        statusColor="text-green-700"
      />

      {/* Barrier Inactive */}
      <SystemHealthCard
        title="Barriers"
        subtitle="Inactive"
        count={dashboardData?.systemHealth?.barriers?.offline || 0}
        icon={Activity}
        statusColor="text-red-600"
      />
    </div>

    {/* Offline Devices Alert */}
    {(dashboardData?.offlineDevices || 0) > 0 && (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-yellow-900 text-sm md:text-base">
            {dashboardData?.offlineDevices} Devices Inactive
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

    
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
