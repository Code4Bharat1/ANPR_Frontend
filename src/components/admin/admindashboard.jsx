"use client";
import { useState, useEffect } from 'react';
import {
  Bell, Menu, MapPin, Users, Camera, Activity,
  ArrowUpRight, ArrowDownRight, AlertCircle, Clock,
  TrendingUp, Database, Wifi, WifiOff
} from 'lucide-react';
import axios from 'axios';
import Sidebar from './sidebar';
import Header from './header';

const DashboardCard = ({ icon: Icon, value, label, bgColor, iconColor, trend, subtitle }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
          {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-gray-600 text-sm font-medium">{label}</div>
    {subtitle && <div className="text-xs text-gray-500 mt-2">{subtitle}</div>}
  </div>
);

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
    <div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
    </div>
    <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
  </div>
);

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/dashboard`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDashboardData(response.data);
      console.log(response.data);

    } catch (err) {
      console.error('Error:', err);

    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  // const formatDateTime = (dateString) => {
  //   const date = new Date(dateString);
  //   return date.toLocaleString('en-IN', {
  //     dateStyle: 'medium',
  //     timeStyle: 'short'
  //   });
  // };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //         <p className="text-gray-600 font-medium">Loading dashboard...</p>
  //       </div>
  //     </div>
  //   );
  // }

  const deviceActivityRate = dashboardData.totalDevices > 0
    ? ((dashboardData.activeDevices / dashboardData.totalDevices) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* Header */}
      <Header/>

      <main className="max-w-7xl mx-auto px-6 ">
        {/* Last Updated */}
        {/* <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Last updated: {formatDateTime(dashboardData.lastUpdated)}</span>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            Refresh Data
          </button>
        </div> */}

        {/* Site & User Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Infrastructure Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              icon={MapPin}
              value={dashboardData.totalSites}
              label="Total Sites"
              bgColor="bg-blue-50"
              iconColor="text-blue-600"
            />

            <DashboardCard
              icon={Users}
              value={dashboardData.totalProjectManagers}
              label="Project Managers"
              bgColor="bg-indigo-50"
              iconColor="text-indigo-600"
            />

            <DashboardCard
              icon={Users}
              value={dashboardData.totalSupervisors}
              label="Supervisors"
              bgColor="bg-pink-50"
              iconColor="text-pink-600"
            />

            <DashboardCard
              icon={Users}
              value={dashboardData.totalUsers}
              label="Total Users"
              bgColor="bg-purple-50"
              iconColor="text-purple-600"
            />
          </div>

        </div>

        {/* Device Status */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Device Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Devices</h3>
                <Wifi className="w-6 h-6 text-green-500" />
              </div>
              
              <div className="text-4xl font-bold text-green-600 mb-2">
                {dashboardData.activeDevices}
              </div>
              <div className="text-sm text-gray-600">
                Devices currently online and operational
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Operational
                  </span>
                </div>
                
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Inactive Devices</h3>
                <WifiOff className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-4xl font-bold text-red-600 mb-2">
                {dashboardData.inactiveDevices}
              </div>
              <div className="text-sm text-gray-600">
                Devices offline or not responding
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                    {dashboardData.inactiveDevices > 0 ? 'Attention Required' : 'All Online'}
                  </span>
                </div>
              </div>
              
            </div>
            <DashboardCard
                icon={Camera}
                value={dashboardData.totalDevices}
                label="Total Devices"
                bgColor="bg-orange-50"
                iconColor="text-orange-600"
                subtitle="ANPR cameras"
              />
          </div>
        </div>

        {/* Today's Activity */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Activity</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <DashboardCard
              icon={ArrowUpRight}
              value={dashboardData.todayEntries}
              label="Today's Entries"
              bgColor="bg-emerald-50"
              iconColor="text-emerald-600"
              subtitle="Vehicles entered"
            />
            <DashboardCard
              icon={ArrowDownRight}
              value={dashboardData.todayExits}
              label="Today's Exits"
              bgColor="bg-cyan-50"
              iconColor="text-cyan-600"
              subtitle="Vehicles exited"
            />
            <DashboardCard
              icon={TrendingUp}
              value={dashboardData.todayTotal}
              label="Total Movements"
              bgColor="bg-indigo-50"
              iconColor="text-indigo-600"
              subtitle="Total activity today"
            />
          </div>
        </div>

        {/* Recent Activity & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <span className="text-sm text-gray-500">Live updates</span>
              </div>

              {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{activity.title}</div>
                        <div className="text-sm text-gray-600">{activity.description}</div>
                        <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No recent activity</p>
                  <p className="text-sm text-gray-400 mt-1">Activity will appear here when events occur</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-6">
                <Database className="w-6 h-6" />
                <h2 className="text-xl font-bold">System Summary</h2>
              </div>

              <div className="space-y-4">
                <StatCard
                  label="Sites"
                  value={dashboardData.totalSites}
                  icon={MapPin}
                  color="bg-white/20"
                />
                <StatCard
                  label="Devices"
                  value={dashboardData.totalDevices}
                  icon={Camera}
                  color="bg-white/20"
                />
                <StatCard
                  label="Active"
                  value={dashboardData.activeDevices}
                  icon={Wifi}
                  color="bg-green-500"
                />
                <StatCard
                  label="Offline"
                  value={dashboardData.inactiveDevices}
                  icon={WifiOff}
                  color="bg-red-500"
                />
              </div>

              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="text-sm text-blue-100 mb-2">System Health</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full transition-all"
                      style={{ width: `${deviceActivityRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{deviceActivityRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;