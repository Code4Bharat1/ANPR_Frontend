// components/supervisor/dashboard.jsx
"use client";
import React, { useState, useEffect } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  LogIn, LogOut as ExitIcon, Car, Clock, TrendingUp,
  AlertCircle, MapPin, Activity, ArrowRight, Package, Truck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const SupervisorDashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [siteInfo, setSiteInfo] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get(
        `${API_URL}/api/supervisor/dashboard/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        setStats(response.data.stats || response.data);
        setRecentActivity(response.data.recentActivity || recentActivity);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  return (
    <SupervisorLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Supervisor Dashboard</h1>
        <p className="text-gray-600">Real-time barrier control & monitoring</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Today Entry */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 font-medium">Today Entry</div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <LogIn className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.todayEntry}</div>
          {/* <div className="flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span>+12% from yesterday</span>
          </div> */}
        </div>

        {/* Today Exit */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 font-medium">Today Exit</div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ExitIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.todayExit}</div>
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
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.vehiclesInside}</div>
          {/* <div className="text-xs text-gray-500">45% Capacity</div> */}
        </div>

        {/* Pending Exit */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 font-medium">Pending Exit</div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingExit}</div>
          <div className="text-xs text-orange-600">Needs attention</div>
        </div>

        {/* Denied Entries */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600 font-medium">Denied Entries</div>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.deniedEntries}</div>
          <div className="text-xs text-red-600">Requires review</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Gate Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-5 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Gate Activity</h2>
            <button
              onClick={() => router.push('/supervisor/trip-history')}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              View All Logs
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-5 space-y-4">
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
        </div>

        {/* Assigned Site Info */}
        <div className="space-y-6">
          {/* Site Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg">{siteInfo.name}</h3>
              </div>
            </div>
            
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Site Name</span>
                <span className="font-semibold text-gray-900">{siteInfo.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Gates</span>
                <span className="font-semibold text-gray-900">{siteInfo.gates}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Current Shift</span>
                <span className="font-semibold text-gray-900">{siteInfo.shift}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                  {siteInfo.status}
                </span>
              </div>
            </div>
          </div>

          {/* Active Vehicles Quick View */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Active Vehicles</h3>
            <div className="text-sm text-gray-600 mb-3">Inside: {stats.vehiclesInside} vehicles</div>
            
           
            
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
