"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, Menu, MapPin, Users, Camera, Activity, 
  ArrowUpRight, ArrowDownRight, CheckCircle, AlertTriangle, Package
} from 'lucide-react';
import Sidebar from './sidebar';

const DashboardCard = ({ icon: Icon, value, label, bgColor, iconColor, trend }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          trend >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-gray-600 text-sm font-medium">{label}</div>
  </div>
);

const ActivityItem = ({ icon: Icon, title, description, time, iconColor }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className={`w-10 h-10 ${iconColor} rounded-lg flex items-center justify-center`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="flex-1">
      <div className="font-semibold text-gray-900">{title}</div>
      <div className="text-sm text-gray-600">{description}</div>
      <div className="text-xs text-gray-500 mt-1">{time}</div>
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
    } catch (err) {
      console.error('Error:', err);
      setDashboardData({
        totalSites: 12,
        totalUsers: 2340,
        projectManagers: 8,
        supervisors: 24,
        totalDevices: 48,
        activeDevices: 46,
        todayEntries: 843,
        todayExits: 612,
        packageInfo: {
          plan: 'Enterprise Tier 1',
          status: 'Active',
          sitesIncluded: 'Up to 20',
          devices: 'Unlimited',
          storage: '1 Year Retention',
          expiryDate: 'Dec 31, 2025'
        }
      });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-72">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                AD
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard icon={MapPin} value={dashboardData?.totalSites || 0} label="Total Sites" bgColor="bg-blue-50" iconColor="text-blue-600" />
              <DashboardCard icon={Users} value={dashboardData?.totalUsers || 0} label="Total Users" bgColor="bg-purple-50" iconColor="text-purple-600" />
              <DashboardCard icon={Users} value={dashboardData?.projectManagers || 0} label="Project Managers" bgColor="bg-indigo-50" iconColor="text-indigo-600" />
              <DashboardCard icon={Users} value={dashboardData?.supervisors || 0} label="Supervisors" bgColor="bg-green-50" iconColor="text-green-600" />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard icon={Camera} value={dashboardData?.totalDevices || 0} label="Total Devices" bgColor="bg-orange-50" iconColor="text-orange-600" />
              <DashboardCard icon={Activity} value={dashboardData?.activeDevices || 0} label="Active Devices" bgColor="bg-green-50" iconColor="text-green-600" />
              <DashboardCard icon={ArrowUpRight} value={dashboardData?.todayEntries || 0} label="Today Entries" bgColor="bg-emerald-50" iconColor="text-emerald-600" trend={12} />
              <DashboardCard icon={ArrowDownRight} value={dashboardData?.todayExits || 0} label="Today Exits" bgColor="bg-cyan-50" iconColor="text-cyan-600" trend={8} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                <ActivityItem icon={CheckCircle} iconColor="bg-green-500" title="Entry granted to Vehicle AB12 CDE" description="Site A - Main Gate" time="2 mins ago" />
                <ActivityItem icon={AlertTriangle} iconColor="bg-yellow-500" title="Device Offline Alert: Cam-04" description="Site B - Rear Exit" time="15 mins ago" />
                <ActivityItem icon={Users} iconColor="bg-blue-500" title="New User Added: Sarah Jenkins" description="By Admin" time="1 hour ago" />
                <ActivityItem icon={CheckCircle} iconColor="bg-green-500" title="Exit recorded for Vehicle XY99 ZZZ" description="Site A - Main Gate" time="1.5 hours ago" />
              </div>
            </div>

            <div>
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Package Summary</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-blue-100 text-sm mb-1">Current Plan</div>
                    <div className="text-2xl font-bold">{dashboardData?.packageInfo?.plan}</div>
                    <span className="inline-block mt-2 px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                      {dashboardData?.packageInfo?.status}
                    </span>
                  </div>
                  <div className="border-t border-blue-400 pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue-100">Sites Included</span>
                      <span className="font-semibold">{dashboardData?.packageInfo?.sitesIncluded}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-100">ANPR Devices</span>
                      <span className="font-semibold">{dashboardData?.packageInfo?.devices}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-100">Cloud Storage</span>
                      <span className="font-semibold">{dashboardData?.packageInfo?.storage}</span>
                    </div>
                  </div>
                  <div className="border-t border-blue-400 pt-4">
                    <div className="text-blue-100 text-sm mb-1">Expiry Date</div>
                    <div className="text-lg font-bold">{dashboardData?.packageInfo?.expiryDate}</div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2.5 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50">
                    Manage Subscription
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
