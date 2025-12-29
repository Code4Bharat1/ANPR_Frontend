"use client";
import React, { useState, useEffect } from 'react';
import {
  Menu, Bell, TrendingUp, TrendingDown, Users, MapPin,
  Camera, Activity, DollarSign, Download, Calendar
} from 'lucide-react';
import Sidebar from './sidebar';

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, trend, trendValue, bgColor, iconColor }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {trendValue}%
        </div>
      )}
    </div>
    <div className="text-sm text-gray-600 mb-1">{title}</div>
    <div className="text-3xl font-bold text-gray-900">{value}</div>
  </div>
);

// Top Client Card
const TopClientCard = ({ client, rank }) => (
  <div className="bg-white rounded-lg p-4 border border-gray-100 flex items-center justify-between hover:shadow-md transition">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
        <span className="text-lg font-bold text-purple-600">#{rank}</span>
      </div>
      <div>
        <div className="font-semibold text-gray-900">{client.name}</div>
        <div className="text-sm text-gray-600">{client.sites} sites • {client.devices} devices</div>
      </div>
    </div>
    <div className="text-right">
      <div className="text-lg font-bold text-gray-900">{client.trips.toLocaleString()}</div>
      <div className="text-sm text-gray-600">trips</div>
    </div>
  </div>
);

// Trip Trend Chart (Simple Bar Chart)
const TripTrendChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Trip Trends (Last 7 Days)</h3>
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-purple-100 rounded-t-lg relative" style={{ 
              height: `${(item.value / maxValue) * 100}%`,
              minHeight: '20px'
            }}>
              <div className="absolute -top-6 left-0 right-0 text-center text-sm font-semibold text-gray-900">
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
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
        <div className="text-sm text-gray-600">Last 6 Months</div>
      </div>
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-gradient-to-t from-green-400 to-green-600 rounded-t-lg relative" style={{ 
              height: `${(item.value / maxValue) * 100}%`,
              minHeight: '30px'
            }}>
              <div className="absolute -top-6 left-0 right-0 text-center text-xs font-semibold text-gray-900">
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/analytics?range=${dateRange}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAnalyticsData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
      // Mock data
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

  const handleExport = () => {
    alert('Exporting analytics report...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
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
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">System Analytics</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-600" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Demo mode: Using sample data. API Error: {error}
              </p>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <TripTrendChart data={analyticsData?.tripTrends || []} />
            <RevenueChart data={analyticsData?.revenueData || []} />
          </div>

          {/* Top Clients */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Top Performing Clients</h3>
              <div className="text-sm text-gray-600">By total trips</div>
            </div>
            <div className="space-y-3">
              {(analyticsData?.topClients || []).map((client, index) => (
                <TopClientCard key={index} client={client} rank={index + 1} />
              ))}
            </div>
          </div>

          {/* Client Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Client Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Active Clients</span>
                    <span className="text-sm font-semibold text-gray-900">42 (87.5%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '87.5%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Expired Clients</span>
                    <span className="text-sm font-semibold text-gray-900">6 (12.5%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '12.5%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Device Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Online Devices</span>
                    <span className="text-sm font-semibold text-gray-900">856 (96%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Offline Devices</span>
                    <span className="text-sm font-semibold text-gray-900">36 (4%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '4%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">API Uptime</span>
                  <span className="text-lg font-bold text-green-600">99.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="text-lg font-bold text-gray-900">142ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="text-lg font-bold text-green-600">0.02%</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics;