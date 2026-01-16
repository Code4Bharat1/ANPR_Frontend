// components/supervisor/dashboard.jsx
"use client";
import React, { useState, useEffect } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  LogIn, LogOut as ExitIcon, Car, Clock, TrendingUp,
  AlertCircle, MapPin, Activity, ArrowRight, Package, Truck,
  Users, Shield, BarChart3, RefreshCw, ChevronRight
} from 'lucide-react';
/* ✅ NEW: Charts */
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('accessToken');

      const response = await axios.get(
        `${API_URL}/api/supervisor/dashboard/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        if (response.data.stats) {
          setStats(response.data.stats);
        }
        if (response.data.siteInfo) {
          setSiteInfo(response.data.siteInfo);
        }
        if (response.data.recentActivity) {
          setRecentActivity(response.data.recentActivity);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ===================== Chart Data ===================== */
  const barData = [
    { name: 'Entry', value: stats.todayEntry, color: '#10b981' },
    { name: 'Exit', value: stats.todayExit, color: '#3b82f6' },
  ];

  const pieData = [
    { name: 'Inside Site', value: stats.vehiclesInside, color: '#8b5cf6' },
    { name: 'Pending Exit', value: stats.pendingExit, color: '#f59e0b' },
  ];

  const COLORS = ['#8b5cf6', '#f59e0b', '#3b82f6'];

  if (loading) {
    return (
      <SupervisorLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
          <p className="text-gray-400 text-sm mt-1">Please wait while we fetch your data</p>
        </div>
      </SupervisorLayout>
    );
  }

  return (
    <SupervisorLayout>
      {/* Header with Gradient */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {/* <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div> */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Supervisor Dashboard</h1>
                <p className="text-gray-600 mt-1">Real-time monitoring & barrier control system</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">{siteInfo.name || 'No Site Assigned'}</span>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${siteInfo.status === 'Active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
                }`}>
                {siteInfo.status || 'Inactive'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm font-medium text-gray-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid - Enhanced with gradients */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        {/* Today Entry Card */}
        <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-5 border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 font-medium">Today Entry</div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
              <LogIn className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.todayEntry || 0}</div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Today's entry count</div>
            <div className={`text-xs font-semibold ${stats.todayEntry > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              {stats.todayEntry > 0 ? `+${stats.todayEntry}` : 'No entries'}
            </div>
          </div>
        </div>

        {/* Today Exit Card */}
        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 font-medium">Today Exit</div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-sm">
              <ExitIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.todayExit || 0}</div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Today's exit count</div>
            <div className={`text-xs font-semibold ${stats.todayExit > 0 ? 'text-blue-600' : 'text-gray-400'}`}>
              {stats.todayExit > 0 ? `+${stats.todayExit}` : 'No exits'}
            </div>
          </div>
        </div>

        {/* Vehicles Inside Card */}
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 font-medium">Vehicles Inside</div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-sm">
              <Car className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.vehiclesInside || 0}</div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Currently inside site</div>
            <div className={`text-xs font-semibold ${stats.vehiclesInside > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
              {stats.vehiclesInside > 0 ? 'Active' : 'None'}
            </div>
          </div>
        </div>

        {/* Pending Exit Card */}
        <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-5 border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 font-medium">Pending Exit</div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-sm">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingExit || 0}</div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">Awaiting exit clearance</div>
            <div className={`text-xs font-semibold ${stats.pendingExit > 0 ? 'text-orange-600 bg-orange-50 px-2 py-1 rounded' : 'text-gray-400'}`}>
              {stats.pendingExit > 0 ? 'Attention needed' : 'All clear'}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Today Vehicle Movement</h3>
              </div>
              <div className="text-sm text-gray-500">Last 24 hours</div>
            </div>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <YAxis 
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value} vehicles`, 'Count']}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                  barSize={60}
                >
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
              {barData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}:</span>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pie Chart Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Vehicle Status Overview</h3>
              </div>
            </div>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} vehicles`, 'Count']}
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
              {pieData.map((item, index) => (
                <div key={index} className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">{item.value}</span>
                  <span className="text-xs text-gray-500">vehicles</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Vehicle Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Recent Vehicle Activity</h2>
                <p className="text-sm text-gray-500">Last 10 vehicle movements</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/supervisor/trip-history')}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition"
            >
              View All Logs
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5">
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div
                    key={activity.id || index}
                    className="flex items-center justify-between p-4 bg-white hover:bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${activity.status === 'allowed'
                          ? activity.type === 'entry'
                            ? 'bg-gradient-to-br from-green-100 to-emerald-100'
                            : 'bg-gradient-to-br from-blue-100 to-cyan-100'
                          : 'bg-gradient-to-br from-red-100 to-rose-100'
                        }`}>
                        {activity.type === 'entry' ? (
                          <LogIn className={`w-6 h-6 ${activity.status === 'allowed' ? 'text-green-600' : 'text-red-600'
                            }`} />
                        ) : (
                          <ExitIcon className="w-6 h-6 text-blue-600" />
                        )}
                        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${activity.status === 'allowed' ? 'bg-green-500' : 'bg-red-500'
                          } text-white`}>
                          {activity.type === 'entry' ? 'E' : 'X'}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-gray-900 text-lg">{activity.vehicleNumber}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${activity.status === 'allowed'
                              ? activity.type === 'entry'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                            }`}>
                            {activity.status === 'allowed' ? 'Allowed' : 'Denied'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">{activity.visitor || 'Unknown Visitor'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {activity.gate || 'Main Gate'}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{activity.type || 'entry'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{activity.time}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {activity.date || 'Today'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium mb-1">No recent activity</p>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  Activity will appear here as vehicles pass through gates. Check back later for updates.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Site Status Card */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-blue-600 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-xl">{siteInfo.name || 'No Site'}</h3>
                    <p className="text-blue-100 text-sm">Assigned Site</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Site Status</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${siteInfo.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                      }`}></div>
                    <span className="font-semibold text-gray-900">{siteInfo.status || 'Inactive'}</span>
                  </div>
                </div>
                {/* <div className="bg-white p-3 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Active Gates</div>
                  <div className="font-semibold text-gray-900 text-lg">{siteInfo.gates || 0}</div>
                </div> */}
              </div>
              
              {/* <div className="bg-white p-3 rounded-lg border border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Current Shift</div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">{siteInfo.shift || 'Day Shift'}</span>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
              </div> */}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Quick Actions
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/supervisor/active-vehicles')}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg border border-blue-200 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Active Vehicles</div>
                    <div className="text-xs text-gray-600">{stats.vehiclesInside || 0} vehicles inside</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-600" />
              </button>

              <button
                onClick={() => router.push('/supervisor/trip-history')}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg border border-purple-200 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition">
                    <Truck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Trip History</div>
                    <div className="text-xs text-gray-600">View all vehicle logs</div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-purple-600" />
              </button>

              {stats.pendingExit > 0 && (
                <button
                  onClick={() => router.push('/supervisor/pending-exits')}
                  className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-lg border border-orange-200 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Pending Exits</div>
                      <div className="text-xs text-orange-600">{stats.pendingExit} require attention</div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-orange-600" />
                </button>
              )}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Movements</span>
                <span className="font-semibold text-gray-900">{stats.todayEntry + stats.todayExit}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Entry/Exit Ratio</span>
                <span className="font-semibold text-gray-900">
                  {stats.todayEntry}:{stats.todayExit}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Site Occupancy</span>
                <span className="font-semibold text-gray-900">{stats.vehiclesInside}</span>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Overall Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${stats.pendingExit === 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                    }`}>
                    {stats.pendingExit === 0 ? 'All Clear' : 'Needs Attention'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
};

export default SupervisorDashboard;