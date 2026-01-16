"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TrendingUp, TrendingDown, Activity, 
  Calendar, MapPin, Package, AlertCircle, RefreshCw
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';

const StatCard = ({ icon: Icon, value, label, change, bgColor, iconColor, isLoading }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        {isLoading ? (
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        ) : (
          <Icon className={`w-6 h-6 ${iconColor}`} />
        )}
      </div>
      {change && !isLoading && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          change > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {change > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {Math.abs(change)}%
        </div>
      )}
    </div>
    {isLoading ? (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-2 w-24"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
    ) : (
      <>
        <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
        <div className="text-gray-600 text-sm font-medium">{label}</div>
      </>
    )}
  </div>
);

const PMAnalytics = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('30days');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // console.log('🌐 Fetching analytics for time range:', timeRange);
      
      const response = await axiosInstance.get('/api/project/analytics', {
        params: { timeRange },
        timeout: 10000 // 10 second timeout
      });

      // console.log('✅ Analytics data received:', response.data);
      setAnalyticsData(response.data);
    } catch (err) {
      console.error('❌ Error fetching analytics:', err);
      
      let errorMessage = 'Failed to load analytics data';
      if (err.response) {
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'No response from server. Check your connection.';
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading && !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Header title="Analytics" onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-6">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <StatCard
                key={i}
                icon={Activity}
                value="0"
                label="Loading..."
                bgColor="bg-gray-100"
                iconColor="text-gray-400"
                isLoading={true}
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header title="Analytics" onMenuClick={() => setSidebarOpen(true)} />

      <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Header with refresh */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            {/* <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1> */}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-indigo-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              disabled={loading}
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
            </select>
            
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Analytics</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <div className="flex gap-3">
                  <button
                    onClick={fetchAnalytics}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => {
                      setTimeRange('30days');
                      fetchAnalytics();
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <StatCard
            icon={Activity}
            value={analyticsData?.totalTrips?.toLocaleString() || '0'}
            label="Total Trips"
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
            isLoading={loading}
          />
          <StatCard
            icon={Calendar}
            value={analyticsData?.avgDuration || '0h 0m'}
            label="Avg Duration"
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
            isLoading={loading}
          />
          <StatCard
            icon={TrendingUp}
            value={analyticsData?.peakHours || 'N/A'}
            label="Peak Hours"
            bgColor="bg-orange-50"
            iconColor="text-orange-600"
            isLoading={loading}
          />
          <StatCard
            icon={Activity}
            value={analyticsData?.utilizationRate || '0%'}
            label="Utilization Rate"
            bgColor="bg-green-50"
            iconColor="text-green-600"
            isLoading={loading}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Vendors */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Top Vendors</h2>
              </div>
              <span className="text-sm text-gray-500">
                {analyticsData?.topVendors?.length || 0} vendors
              </span>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2"></div>
                  </div>
                ))}
              </div>
            ) : analyticsData?.topVendors?.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.topVendors.map((vendor, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900 truncate">{vendor.name}</div>
                      <div className="text-sm text-gray-600 ml-2 whitespace-nowrap">
                        {vendor.trips} trips ({vendor.percentage}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${vendor.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No vendor data</p>
                <p className="text-gray-400 text-sm mt-1">Trips from vendors will appear here</p>
              </div>
            )}
          </div>

          {/* Top Sites */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Top Sites</h2>
              </div>
              <span className="text-sm text-gray-500">
                {analyticsData?.topSites?.length || 0} sites
              </span>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2"></div>
                  </div>
                ))}
              </div>
            ) : analyticsData?.topSites?.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.topSites.map((site, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900 truncate">{site.name}</div>
                      <div className="text-sm text-gray-600 ml-2 whitespace-nowrap">
                        {site.trips} trips ({site.percentage}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${site.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No site data</p>
                <p className="text-gray-400 text-sm mt-1">Trips from sites will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Chart */}
        {/* Weekly Chart Section */}
<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-bold text-gray-900">Weekly Trip Distribution</h2>
    <span className="text-sm text-gray-500">
      Total: {analyticsData?.weeklyData?.reduce((sum, day) => sum + (day.trips || 0), 0) || 0} trips
    </span>
  </div>
  
  {loading ? (
    <div className="animate-pulse h-64 flex items-end justify-between gap-4">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="flex-1 flex flex-col items-center">
          <div className="bg-gray-200 rounded-t-lg w-full" style={{ 
            height: `${Math.random() * 80 + 20}px` 
          }}></div>
          <div className="h-3 bg-gray-200 rounded mt-2 w-8"></div>
        </div>
      ))}
    </div>
  ) : analyticsData?.weeklyData?.length > 0 ? (
    <div>
      {/* Improved Chart Container */}
      <div className="flex items-end justify-between gap-2 sm:gap-4 h-64 px-4">
        {analyticsData.weeklyData.map((day, index) => {
          const maxTrips = Math.max(...analyticsData.weeklyData.map(d => d.trips || 0), 1);
          const heightPercentage = ((day.trips || 0) / maxTrips) * 100;
          
          // Dynamic height calculation with minimum height
          const barHeight = Math.max(20, (heightPercentage * 200) / 100);
          
          // Color based on trip count
          const getBarColor = (trips) => {
            if (trips === 0) return 'bg-gray-200';
            if (trips <= 3) return 'bg-blue-400';
            if (trips <= 6) return 'bg-blue-500';
            return 'bg-blue-600';
          };
          
          return (
            <div 
              key={index} 
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              {/* Trip count above bar */}
              <div className="text-sm font-bold text-gray-800 mb-2">
                {day.trips || 0}
              </div>
              
              {/* Bar with gradient and hover effect */}
              <div
                className={`w-10 sm:w-12 rounded-t-lg transition-all duration-300 hover:shadow-lg relative group ${getBarColor(day.trips)}`}
                style={{ 
                  height: `${barHeight}px`,
                  minHeight: '20px'
                }}
              >
                {/* Hover tooltip */}
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {day.day}: {day.trips || 0} trips
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
              
              {/* Day label below bar */}
              <div className="text-xs text-gray-600 mt-2 font-medium">
                {day.day}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* X-axis */}
      <div className="border-t border-gray-300 mt-4 pt-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>Days of Week</span>
          <span>{Math.max(...analyticsData.weeklyData.map(d => d.trips || 0))} max</span>
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center py-12">
      <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 font-medium">No weekly data available</p>
      <p className="text-gray-400 text-sm mt-1">Try selecting a different time range</p>
    </div>
  )}
</div>
      </main>
    </div>
  );
};

export default PMAnalytics;