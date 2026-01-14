// components/supervisor/dashboard.jsx
"use client";
import React, { useState, useEffect } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  LogIn, LogOut as ExitIcon, Car, Clock, TrendingUp,
  AlertCircle, MapPin, Activity, ArrowRight, Package, Truck
} from 'lucide-react';
/* ✅ NEW: Charts */
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const SupervisorDashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    todayEntry: 0,
    todayExit: 0,
    vehiclesInside: 0,
    pendingExit: 0,
    deniedEntries: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [siteInfo, setSiteInfo] = useState({
    name: '',
    gates: 0,
    shift: '',
    status: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get(
        `${API_URL}/api/supervisor/dashboard/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log(response.data);
      
      if (response.data) {
        // Set stats from response
        if (response.data.stats) {
          setStats(response.data.stats);
        }
        
        // Set site info from response
        if (response.data.siteInfo) {
          setSiteInfo(response.data.siteInfo);
        }
        
        // Set recent activity from response
        if (response.data.recentActivity) {
          setRecentActivity(response.data.recentActivity);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };
  /* ===================== NEW: Chart Data ===================== */
  const barData = [
    { name: 'Entry', value: stats.todayEntry },
    { name: 'Exit', value: stats.todayExit },
    // { name: 'Denied', value: stats.deniedEntries },
  ];

  const pieData = [
    { name: 'Inside', value: stats.vehiclesInside },
    { name: 'Pending Exit', value: stats.pendingExit },
    { name: 'Exited Today', value: stats.todayExit },
  ];

  const COLORS = ['#22c55e', '#f59e0b', '#3b82f6'];

  if (loading) {
    return (
      <SupervisorLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </SupervisorLayout>
    );
  }

  return (
    <SupervisorLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Supervisor Dashboard</h1>
        <p className="text-gray-600">Real-time barrier control & monitoring</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {/* Today Entry */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 font-medium">Today Entry</div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <LogIn className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.todayEntry || 0}</div>
          <div className="text-xs text-gray-500">Entry count today</div>
        </div>

        {/* Today Exit */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 font-medium">Today Exit</div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ExitIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.todayExit || 0}</div>
          <div className="text-xs text-gray-500">Normal activity</div>
        </div>

        {/* Vehicles Inside */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 font-medium">Vehicles Inside</div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.vehiclesInside || 0}</div>
          <div className="text-xs text-gray-500">Currently inside</div>
        </div>

        {/* Pending Exit */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 font-medium">Pending Exit</div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingExit || 0}</div>
          <div className="text-xs text-orange-600">{stats.pendingExit > 0 ? 'Needs attention' : 'All clear'}</div>
        </div>

        {/* Denied Entries */}
        {/* <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 font-medium">Denied Entries</div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.deniedEntries || 0}</div>
          <div className="text-xs text-red-600">{stats.deniedEntries > 0 ? 'Requires review' : 'No denials'}</div>
        </div> */}
      </div>
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        <div className="bg-white p-5 ">
          <h3 className="text-lg font-bold mb-4">Today Vehicle Movement</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-5 ">
          <h3 className="text-lg font-bold mb-4">Vehicle Status Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        
</div>
          </div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Gate Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Vehicle Activity</h2>
            <button
              onClick={() => router.push('/supervisor/trip-history')}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              View All Logs
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-5">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.status === 'allowed'
                          ? activity.type === 'entry'
                            ? 'bg-green-100'
                            : 'bg-blue-100'
                          : 'bg-red-100'
                      }`}>
                        {activity.type === 'entry' ? (
                          <LogIn className={`w-5 h-5 ${
                            activity.status === 'allowed' ? 'text-green-600' : 'text-red-600'
                          }`} />
                        ) : (
                          <ExitIcon className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{activity.vehicleNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            activity.status === 'allowed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {activity.status === 'allowed' ? 'Allowed' : 'Denied'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-0.5">{activity.visitor}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {activity.gate} • {activity.type === 'entry' ? 'Entry' : 'Exit'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No recent activity</p>
                <p className="text-gray-400 text-xs mt-1">Activity will appear here as vehicles pass through gates</p>
              </div>
            )}
          </div>
        </div>

        {/* Assigned Site Info */}
        <div className="space-y-6">
          {/* Site Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg">{siteInfo.name || 'No Site Assigned'}</h3>
              </div>
            </div>
            
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Site Name</span>
                <span className="font-semibold text-gray-900">{siteInfo.name || 'N/A'}</span>
              </div>
              {/* <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Gates</span>
                <span className="font-semibold text-gray-900">{siteInfo.gates || 0}</span>
              </div> */}
              {/* <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Shift</span>
                <span className="font-semibold text-gray-900">{siteInfo.shift || 'N/A'}</span>
              </div> */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  siteInfo.status === 'Active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {siteInfo.status || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Active Vehicles Quick View */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Active Vehicles</h3>
            <div className="text-sm text-gray-600 mb-3">Inside: {stats.vehiclesInside || 0} vehicles</div>
            
            <button
              onClick={() => router.push('/supervisor/active-vehicles')}
              className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm"
            >
              View All Active Vehicles
            </button>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
};

export default SupervisorDashboard;