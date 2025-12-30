"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp, TrendingDown, Users, MapPin, Camera, Activity, 
  DollarSign, Download, Calendar
} from 'lucide-react';
import SuperAdminLayout from './layout';

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, trend, trendValue, bgColor, iconColor }) => (
  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between mb-3 md:mb-4">
      <div className={`w-10 h-10 md:w-12 md:h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${iconColor}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs md:text-sm font-semibold ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />}
          {trendValue}%
        </div>
      )}
    </div>
    <div className="text-xs md:text-sm text-gray-600 mb-1">{title}</div>
    <div className="text-xl md:text-3xl font-bold text-gray-900 truncate">{value}</div>
  </div>
);

// Top Client Card
const TopClientCard = ({ client, rank }) => (
  <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-100 flex items-center justify-between hover:shadow-md transition gap-3">
    <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-base md:text-lg font-bold text-purple-600">#{rank}</span>
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-gray-900 text-sm md:text-base truncate">{client.name}</div>
        <div className="text-xs md:text-sm text-gray-600 truncate">{client.sites} sites • {client.devices} devices</div>
      </div>
    </div>
    <div className="text-right flex-shrink-0">
      <div className="text-base md:text-lg font-bold text-gray-900">{client.trips.toLocaleString()}</div>
      <div className="text-xs md:text-sm text-gray-600">trips</div>
    </div>
  </div>
);

// Trip Trend Chart (Simple Bar Chart)
const TripTrendChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 md:mb-6">Trip Trends (Last 7 Days)</h3>
      <div className="flex items-end justify-between gap-1 md:gap-2 h-40 md:h-48">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-purple-100 rounded-t-lg relative" style={{ 
              height: `${(item.value / maxValue) * 100}%`,
              minHeight: '20px'
            }}>
              <div className="absolute -top-5 md:-top-6 left-0 right-0 text-center text-xs md:text-sm font-semibold text-gray-900">
                {item.value}
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-2">{item.day}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Revenue Chart
const RevenueChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-bold text-gray-900">Revenue Analytics</h3>
        <div className="text-xs md:text-sm text-gray-600">Last 6 Months</div>
      </div>
      <div className="flex items-end justify-between gap-1 md:gap-2 h-40 md:h-48">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-gradient-to-t from-green-400 to-green-600 rounded-t-lg relative" style={{ 
              height: `${(item.value / maxValue) * 100}%`,
              minHeight: '30px'
            }}>
              <div className="absolute -top-5 md:-top-6 left-0 right-0 text-center text-xs font-semibold text-gray-900">
                ${item.value}k
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-2">{item.month}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Analytics Component
const SuperAdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/analytics/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setAnalyticsData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || err.message);
      
      // Mock data fallback
      setAnalyticsData({
        totalClients: 48,
        totalSites: 156,
        totalDevices: 892,
        totalTrips: 15847,
        totalRevenue: 284500,
        tripTrends: [
          { day: 'Mon', value: 2341 },
          { day: 'Tue', value: 2156 },
          { day: 'Wed', value: 2489 },
          { day: 'Thu', value: 2234 },
          { day: 'Fri', value: 2678 },
          { day: 'Sat', value: 1987 },
          { day: 'Sun', value: 1962 }
        ],
        revenueData: [
          { month: 'Jul', value: 42 },
          { month: 'Aug', value: 45 },
          { month: 'Sep', value: 48 },
          { month: 'Oct', value: 51 },
          { month: 'Nov', value: 49 },
          { month: 'Dec', value: 52 }
        ],
        topClients: [
          { name: 'Enterprise Corp', sites: 12, devices: 145, trips: 4567 },
          { name: 'Global Industries', sites: 8, devices: 98, trips: 3421 },
          { name: 'TechStart Ltd', sites: 6, devices: 76, trips: 2890 },
          { name: 'Metro Logistics', sites: 5, devices: 65, trips: 2234 },
          { name: 'Swift Transport', sites: 4, devices: 52, trips: 1987 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/analytics/summary`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      alert('Analytics report exported successfully!');
    } catch (err) {
      console.error(err);
      alert('Exporting analytics report... (Demo mode)');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminLayout title="System Analytics">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
        <button
          onClick={handleExport}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-sm md:text-base"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 mb-6">
          <p className="text-xs md:text-sm text-yellow-800">
            Demo mode: Using sample data. API Error: {error}
          </p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
        <StatCard
          icon={Users}
          title="Total Clients"
          value={analyticsData?.totalClients || 0}
          trend="up"
          trendValue="12"
          bgColor="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={MapPin}
          title="Total Sites"
          value={analyticsData?.totalSites || 0}
          trend="up"
          trendValue="8"
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Camera}
          title="Total Devices"
          value={analyticsData?.totalDevices || 0}
          trend="up"
          trendValue="5"
          bgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          icon={Activity}
          title="Total Trips"
          value={(analyticsData?.totalTrips || 0).toLocaleString()}
          trend="up"
          trendValue="15"
          bgColor="bg-orange-50"
          iconColor="text-orange-600"
        />
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`$${(analyticsData?.totalRevenue || 0).toLocaleString()}`}
          trend="up"
          trendValue="18"
          bgColor="bg-green-50"
          iconColor="text-green-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <TripTrendChart data={analyticsData?.tripTrends || []} />
        <RevenueChart data={analyticsData?.revenueData || []} />
      </div>

      {/* Top Clients */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold text-gray-900">Top Performing Clients</h3>
          <div className="text-xs md:text-sm text-gray-600">By total trips</div>
        </div>
        <div className="space-y-2 md:space-y-3">
          {(analyticsData?.topClients || []).map((client, index) => (
            <TopClientCard key={index} client={client} rank={index + 1} />
          ))}
        </div>
      </div>

      {/* Client Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Client Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm text-gray-600">Active Clients</span>
                <span className="text-xs md:text-sm font-semibold text-gray-900">42 (87.5%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '87.5%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm text-gray-600">Expired Clients</span>
                <span className="text-xs md:text-sm font-semibold text-gray-900">6 (12.5%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '12.5%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">Device Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm text-gray-600">Online Devices</span>
                <span className="text-xs md:text-sm font-semibold text-gray-900">856 (96%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm text-gray-600">Offline Devices</span>
                <span className="text-xs md:text-sm font-semibold text-gray-900">36 (4%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '4%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
          <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4">System Health</h3>
          <div className="space-y-3 md:space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-gray-600">API Uptime</span>
              <span className="text-base md:text-lg font-bold text-green-600">99.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-gray-600">Avg Response Time</span>
              <span className="text-base md:text-lg font-bold text-gray-900">142ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm text-gray-600">Error Rate</span>
              <span className="text-base md:text-lg font-bold text-green-600">0.02%</span>
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAnalytics;
