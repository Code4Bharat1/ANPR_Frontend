"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, UserCheck, UserX, MapPin, Camera, IndianRupee,
  Activity, TrendingUp, AlertTriangle, CheckCircle, Shield
} from 'lucide-react';
import SuperAdminLayout from './layout';
import api from '@/lib/axios';

// Dashboard Card Component
const DashboardCard = ({ icon: Icon, value, label, bgColor, iconColor, trend }) => (
  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3 md:mb-4">
      <div className={`w-10 h-10 md:w-12 md:h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${iconColor}`} />
      </div>
      {trend !== undefined && trend !== null && (
        <div className={`flex items-center gap-1 text-xs md:text-sm font-semibold ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-gray-600 text-xs md:text-sm font-medium">{label}</div>
  </div>
);

const SystemHealthCard = ({ title, subtitle, count, icon: Icon, statusColor }) => (
  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-blue-600" />
        <div className="font-semibold text-gray-900">{title}</div>
      </div>
    </div>
    <div className="text-sm text-gray-600 mb-1">{subtitle}</div>
    <div className={`text-2xl font-bold ${statusColor}`}>{count}</div>
  </div>
);

// Main Super Admin Dashboard
const SuperAdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

 const fetchDashboardData = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('accessToken');

    if (!token) {
      // Redirect to login if no token found
      window.location.href = '/login';
      return; // Important: Stop further execution
    }

    const res = await api.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/dashboard`
    );

    setDashboardData(res.data);
    // console.log(res.data);
    setError(null);
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    
    // Check for 401 Unauthorized or 403 Forbidden
    if (err.response?.status === 401 || err.response?.status === 403) {
      // Clear local storage and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    
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
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <DashboardCard
            icon={Users}
            value={dashboardData?.overview?.totalClients || 0}
            label="Total Clients"
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
          <DashboardCard
            icon={UserCheck}
            value={dashboardData?.overview?.activeClients || 0}
            label="Active Clients"
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
          <DashboardCard
            icon={UserX}
            value={dashboardData?.overview?.expiredClients || 0}
            label="Expired Clients"
            bgColor="bg-red-50"
            iconColor="text-red-600"
          />
          {/* <DashboardCard
            icon={IndianRupee}
            value={dashboardData?.overview?.totalRevenue ? `₹${dashboardData.overview.totalRevenue.toLocaleString()}` : '₹0'}
            label="Total Revenue"
            bgColor="bg-green-50"
            iconColor="text-green-600"
          /> */}
        </div>
      </div>

      {/* System Stats */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">System Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <DashboardCard
            icon={MapPin}
            value={dashboardData?.operations?.totalSites || 0}
            label="Total Sites"
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <DashboardCard
            icon={Camera}
            value={dashboardData?.operations?.totalDevices || 0}
            label="Total Devices"
            bgColor="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          <DashboardCard
            icon={Shield}
            value={dashboardData?.operations?.totalBarriers || 0}
            label="Total Barriers"
            bgColor="bg-cyan-50"
            iconColor="text-cyan-600"
          />
          <DashboardCard
            icon={Activity}
            value={dashboardData?.operations?.todayTrips?.toLocaleString() || 0}
            label="Today's Trips"
            bgColor="bg-orange-50"
            iconColor="text-orange-600"
          />
          
        </div>
      </div>

      {/* Device Health Stats */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Device Health</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 md:gap-6">
          <DashboardCard
            icon={CheckCircle}
            value={dashboardData?.deviceHealth?.online || 0}
            label="Online Devices"
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
          <DashboardCard
            icon={AlertTriangle}
            value={dashboardData?.deviceHealth?.offline || 0}
            label="Offline Devices"
            bgColor="bg-red-50"
            iconColor="text-red-600"
          />
        </div>
      </div>

      {/* Barrier Health Stats */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">Barrier Health</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 md:gap-6">
          <DashboardCard
            icon={CheckCircle}
            value={dashboardData?.barrierHealth?.online || 0}
            label="Online Barriers"
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
          <DashboardCard
            icon={AlertTriangle}
            value={dashboardData?.barrierHealth?.offline || 0}
            label="Offline Barriers"
            bgColor="bg-red-50"
            iconColor="text-red-600"
          />
        </div>
      </div>

      {/* System Health */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-sm font-bold text-gray-900 mb-3 md:mb-4">
          System Health
        </h2>

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <SystemHealthCard
              title="Server"
              subtitle="Status"
              count={dashboardData?.systemHealth?.server || "Unknown"}
              icon={Activity}
              statusColor="text-green-700"
            />

            <SystemHealthCard
              title="Database"
              subtitle="Status"
              count={dashboardData?.systemHealth?.database || "Unknown"}
              icon={CheckCircle}
              statusColor="text-green-700"
            />

            <SystemHealthCard
              title="Connectivity"
              subtitle="Status"
              count={dashboardData?.systemHealth?.connectivity || "Unknown"}
              icon={AlertTriangle}
              statusColor={dashboardData?.systemHealth?.connectivity === "Operational" ? "text-green-700" : "text-yellow-700"}
            />
          </div>

          {/* Offline Devices Alert */}
          {/* {(dashboardData?.deviceHealth?.offline || 0) > 0 && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-red-800 mb-2">
                    {dashboardData?.deviceHealth?.offline} Device(s) Offline
                  </div>
                  {dashboardData?.deviceHealth?.offlineDevices?.map(device => (
                    <div key={device._id} className="text-sm text-red-700 mb-1">
                      • {device.name} ({device.deviceId}) — {device.siteId?.name || 'Unknown Site'}
                      {device.lastSeen && (
                        <span className="text-red-600 ml-2">
                          Last seen: {new Date(device.lastSeen).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="text-sm text-red-700 mt-2 font-medium">
                    ⚠️ Immediate attention required
                  </div>
                </div>
              </div>
            </div>
          )} */}

          {/* Offline Barriers Alert */}
          {/* {(dashboardData?.barrierHealth?.offline || 0) > 0 && (
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-3 md:p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-orange-800 mb-2">
                    {dashboardData?.barrierHealth?.offline} Barrier(s) Offline
                  </div>
                  {dashboardData?.barrierHealth?.offlineBarriers?.map(barrier => (
                    <div key={barrier._id} className="text-sm text-orange-700 mb-1">
                      • {barrier.name} ({barrier.barrierId}) — {barrier.siteId?.name || 'Unknown Site'}
                      {barrier.lastSeen && (
                        <span className="text-orange-600 ml-2">
                          Last seen: {new Date(barrier.lastSeen).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="text-sm text-orange-700 mt-2 font-medium">
                    ⚠️ Check barrier connectivity
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;