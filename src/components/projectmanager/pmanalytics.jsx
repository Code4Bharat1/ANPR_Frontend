"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, TrendingDown, Activity, 
  Calendar, MapPin, Package, AlertCircle
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';  // ✅ Import Header

const StatCard = ({ icon: Icon, value, label, change, bgColor, iconColor }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          change > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-gray-600 text-sm font-medium">{label}</div>
  </div>
);

const PMAnalytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');

  // Configure axios instance
  const API_URL = process.env.NEXT_PUBLIC_API_URL ;
  
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add request interceptor to include token
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get('/api/project/analytics', {
        params: { timeRange }
      });

      setAnalyticsData(response.data);
      console.log(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        {/* ✅ Header Component with Dropdown */}
        <Header title="Analytics" onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Analytics</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={fetchAnalytics}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ✅ Header Component with Dropdown */}
      <Header title="Analytics" onMenuClick={() => setSidebarOpen(true)} />

      {/* ✅ Main Content with proper spacing */}
      <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Time Range Filter */}
        <div className="mb-6">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            icon={Activity}
            value={analyticsData?.totalTrips?.toLocaleString() || '0'}
            label="Total Trips"
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={Calendar}
            value={analyticsData?.avgDuration || '0h 0m'}
            label="Avg Duration"
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
          <StatCard
            icon={TrendingUp}
            value={analyticsData?.peakHours || 'N/A'}
            label="Peak Hours"
            bgColor="bg-orange-50"
            iconColor="text-orange-600"
          />
          <StatCard
            icon={Activity}
            value={analyticsData?.utilizationRate || '0%'}
            label="Utilization Rate"
            bgColor="bg-green-50"
            iconColor="text-green-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          
          {/* Top Vendors */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Top Vendors by Trips</h2>
            </div>
            <div className="space-y-4">
              {analyticsData?.topVendors && analyticsData.topVendors.length > 0 ? (
                analyticsData.topVendors.map((vendor, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900 truncate flex-1">{vendor.name}</div>
                      <div className="text-sm text-gray-600 ml-2 flex-shrink-0">{vendor.trips} trips</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${vendor.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No vendor data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Top Sites */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-bold text-gray-900">Top Sites by Activity</h2>
            </div>
            <div className="space-y-4">
              {analyticsData?.topSites && analyticsData.topSites.length > 0 ? (
                analyticsData.topSites.map((site, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900 truncate flex-1">{site.name}</div>
                      <div className="text-sm text-gray-600 ml-2 flex-shrink-0">{site.trips} trips</div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${site.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No site data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Trips Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Trip Distribution</h2>
          {analyticsData?.weeklyData && analyticsData.weeklyData.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex items-end justify-between gap-2 sm:gap-4 h-64 min-w-[500px]">
                {analyticsData.weeklyData.map((day, index) => {
                  const maxTrips = Math.max(...analyticsData.weeklyData.map(d => d.trips), 1);
                  const height = (day.trips / maxTrips) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center justify-end">
                      <div className="text-sm font-semibold text-gray-900 mb-2">{day.trips}</div>
                      <div
                        className="w-full bg-indigo-600 rounded-t-lg transition-all hover:bg-indigo-700 cursor-pointer"
                        style={{ height: `${height}%`, minHeight: day.trips > 0 ? '20px' : '4px' }}
                        title={`${day.day}: ${day.trips} trips`}
                      ></div>
                      <div className="text-xs text-gray-600 mt-2 font-medium truncate w-full text-center">{day.day}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No weekly data available</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PMAnalytics;
