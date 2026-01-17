// components/supervisor/analytics.jsx
"use client";
import React, { useState, useEffect } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  Download, Calendar, TrendingUp, TrendingDown, Activity,
  Clock, Car, CheckCircle, XCircle, BarChart3, Loader2, 
  Users, ArrowUpRight, ArrowDownRight, PieChart, LineChart,
  Target, Shield, Zap, Filter, RefreshCw, Award,
  Truck, Package, Building2, Database, AlertCircle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('last7days');
  const [analytics, setAnalytics] = useState({
    todayTrips: 0,
    todayChange: 0,
    weekTrips: 0,
    avgProcessingTime: "--",
    peakHour: "--",
    totalEntries: 0,
    totalExits: 0,
    activeVehicles: 0,
    avgDuration: "--",
    timeImprovement: 0
  });

  const [dailyTrends, setDailyTrends] = useState([]);
  const [hourlyTrends, setHourlyTrends] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [topVendors, setTopVendors] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_URL}/api/supervisor/analytics?period=${timeFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data) {
        setAnalytics(response.data.analytics || analytics);
        setDailyTrends(response.data.dailyTrends || []);
        setHourlyTrends(response.data.hourlyTrends || []);
        setVehicleTypes(response.data.vehicleTypes || []);
        setTopVendors(response.data.topVendors || []);
        
        // Enhanced performance metrics
        setPerformanceMetrics([
          { label: 'Entry Processing', value: response.data.analytics?.avgProcessingTime || '--', trend: 'faster' },
          { label: 'Exit Processing', value: '12 min', trend: 'stable' },
          { label: 'Security Checks', value: '98%', trend: 'improved' },
          { label: 'Compliance Rate', value: '99.5%', trend: 'excellent' }
        ]);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const downloadUrl = `${API_URL}/api/supervisor/analytics/export?period=${timeFilter}`;
      
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      if (!response.ok) throw new Error('Failed to download report');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      link.setAttribute('download', `analytics-report-${dateStr}.xlsx`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const maxDailyValue = dailyTrends.length > 0
    ? Math.max(1, ...dailyTrends.map(d => Math.max(d.entries || 0, d.exits || 0)))
    : 1;

  const maxHourlyValue = hourlyTrends.length > 0
    ? Math.max(...hourlyTrends.map(h => h.count))
    : 1;

  if (loading) {
    return (
      <SupervisorLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <div className="relative mb-8">
            <div className="w-24 h-24 border-4 border-blue-200 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-700 font-semibold text-xl mb-2">Loading Analytics Dashboard</p>
          <p className="text-gray-500 text-sm">Crunching numbers and preparing insights...</p>
        </div>
      </SupervisorLayout>
    );
  }

  return (
    <SupervisorLayout>
      <div className="max-w-5xl ">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {/* <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div> */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                  <p className="text-gray-600 mt-1">Data-driven insights and operational intelligence</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchAnalytics}
                  disabled={refreshing}
                  className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center gap-2 text-sm font-medium text-gray-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                
                <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl p-2 border border-blue-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <select
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-transparent text-gray-700"
                    >
                      <option value="today">Today</option>
                      <option value="last7days">Last 7 Days</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDownloadReport}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Today Trips */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm text-gray-600 font-medium mb-2">Today's Trips</div>
                <div className="text-4xl font-bold text-gray-900">{analytics.todayTrips}</div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {analytics.todayChange >= 0 ? (
                <>
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 rounded-full">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-bold">+{analytics.todayChange}%</span>
                  </div>
                  <span className="text-sm text-gray-500">vs yesterday</span>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-red-50 rounded-full">
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700 font-bold">{analytics.todayChange}%</span>
                  </div>
                  <span className="text-sm text-gray-500">vs yesterday</span>
                </>
              )}
            </div>
          </div>

          {/* Week Trips */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 border border-purple-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm text-gray-600 font-medium mb-2">Last 7 Days</div>
                <div className="text-4xl font-bold text-gray-900">{analytics.weekTrips}</div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
                <LineChart className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="text-sm text-gray-500">Total trip volume this week</div>
          </div>

          {/* Processing Time */}
          <div className="bg-gradient-to-br from-white to-green-50 rounded-2xl p-6 border border-green-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm text-gray-600 font-medium mb-2">Avg. Processing</div>
                <div className="text-4xl font-bold text-gray-900">{analytics.avgProcessingTime}</div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {analytics.timeImprovement > 0 ? (
                <>
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-green-50 rounded-full">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-bold">{analytics.timeImprovement} min</span>
                  </div>
                  <span className="text-sm text-gray-500">faster</span>
                </>
              ) : (
                <span className="text-sm text-gray-500">Processing time</span>
              )}
            </div>
          </div>

          {/* Active Vehicles */}
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-2xl p-6 border border-orange-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-sm text-gray-600 font-medium mb-2">Active Now</div>
                <div className="text-4xl font-bold text-gray-900">{analytics.activeVehicles}</div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Truck className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="text-sm text-gray-500">Vehicles inside premises</div>
          </div>
        </div>

        {/* Enhanced Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Daily Trends Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <LineChart className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Daily Traffic Trends</h2>
                    <p className="text-sm text-gray-600">Entry and exit patterns over time</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                    <span className="text-gray-600 font-medium">Entries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
                    <span className="text-gray-600 font-medium">Exits</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="h-80">
                <div className="flex items-end justify-between h-full gap-4">
                  {dailyTrends.map((data, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-3 h-full group">
                      <div className="flex-1 w-full flex items-end justify-center gap-1">
                        {/* Entry Bar */}
                        <div className="relative flex-1 flex flex-col justify-end">
                          <div
                            className="bg-gradient-to-t from-blue-500 to-blue-600 rounded-t-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 cursor-pointer min-h-[8px]"
                            style={{ height: `${(data.entries / maxDailyValue) * 100}%` }}
                          >
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 shadow-xl before:content-[''] before:absolute before:left-1/2 before:-bottom-1 before:transform before:-translate-x-1/2 before:w-2 before:h-2 before:bg-gray-900 before:rotate-45">
                              <div className="font-bold">{data.entries} entries</div>
                              <div className="text-gray-300">{data.day}</div>
                            </div>
                          </div>
                        </div>
                        {/* Exit Bar */}
                        <div className="relative flex-1 flex flex-col justify-end">
                          <div
                            className="bg-gradient-to-t from-gray-400 to-gray-500 rounded-t-lg hover:from-gray-500 hover:to-gray-600 transition-all duration-300 cursor-pointer min-h-[8px]"
                            style={{ height: `${(data.exits / maxDailyValue) * 100}%` }}
                          >
                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 shadow-xl before:content-[''] before:absolute before:left-1/2 before:-bottom-1 before:transform before:-translate-x-1/2 before:w-2 before:h-2 before:bg-gray-900 before:rotate-45">
                              <div className="font-bold">{data.exits} exits</div>
                              <div className="text-gray-300">{data.day}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg min-w-[60px] text-center">
                        {data.day}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Performance Stats */}
          <div className="space-y-6">
            {/* Peak Hours Card */}
            <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-medium opacity-90">Peak Traffic Hours</div>
                </div>
                <div className="text-3xl font-bold mb-2 drop-shadow-sm">{analytics.peakHour}</div>
                <div className="text-sm opacity-80">Highest activity period • Most efficient processing</div>
              </div>
            </div>

            {/* Today Summary Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Today's Summary</h3>
                  <p className="text-sm text-gray-500">Real-time operational metrics</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">Total Entries</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{analytics.totalEntries}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">Total Exits</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{analytics.totalExits}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Car className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">Inside Now</span>
                  </div>
                  <span className="font-bold text-purple-600 text-lg">{analytics.activeVehicles}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">Avg Duration</span>
                  </div>
                  <span className="font-bold text-gray-900 text-lg">{analytics.avgDuration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Hourly Distribution */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Hourly Distribution</h2>
                  <p className="text-sm text-gray-500">Traffic intensity by hour of day</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {hourlyTrends.map((data, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="text-sm font-semibold text-gray-700 w-16 text-center bg-gray-50 px-3 py-1.5 rounded-lg">
                    {data.hour}
                  </div>
                  <div className="flex-1 relative">
                    <div className="flex-1 bg-gray-100 rounded-full h-10 overflow-hidden relative">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-4 transition-all duration-700 group-hover:from-blue-600 group-hover:to-cyan-600"
                        style={{ width: `${Math.max((data.count / maxHourlyValue) * 100, 5)}%` }}
                      >
                        <span className="text-sm font-bold text-white">{data.count} vehicles</span>
                      </div>
                    </div>
                    <div className="absolute -top-8 left-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 shadow-xl">
                      {data.count} vehicles at {data.hour}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Performance Metrics</h2>
                <p className="text-sm text-gray-500">Operational excellence indicators</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {performanceMetrics.map((metric, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{metric.label}</span>
                    <span className={`text-sm font-bold ${
                      metric.trend === 'excellent' ? 'text-green-600' :
                      metric.trend === 'improved' ? 'text-blue-600' :
                      metric.trend === 'stable' ? 'text-gray-600' :
                      'text-green-600'
                    }`}>
                      {metric.value}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {metric.trend === 'faster' && 'Processing speed'}
                      {metric.trend === 'stable' && 'Consistent performance'}
                      {metric.trend === 'improved' && 'Quality improvement'}
                      {metric.trend === 'excellent' && 'Top-tier compliance'}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      metric.trend === 'excellent' ? 'bg-green-100 text-green-700' :
                      metric.trend === 'improved' ? 'bg-blue-100 text-blue-700' :
                      metric.trend === 'stable' ? 'bg-gray-100 text-gray-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {metric.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vehicle Types & Top Vendors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vehicle Types */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Vehicle Types</h2>
                <p className="text-sm text-gray-500">Distribution by vehicle category</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {vehicleTypes.map((type, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        idx === 0 ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                        idx === 1 ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                        idx === 2 ? 'bg-gradient-to-br from-purple-500 to-violet-500' :
                        'bg-gradient-to-br from-orange-500 to-amber-500'
                      }`}>
                        {idx === 0 && <Truck className="w-4 h-4 text-white" />}
                        {idx === 1 && <Package className="w-4 h-4 text-white" />}
                        {idx === 2 && <Car className="w-4 h-4 text-white" />}
                        {idx === 3 && <Building2 className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{type.type}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{type.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        idx === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                        idx === 1 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        idx === 2 ? 'bg-gradient-to-r from-purple-500 to-violet-500' :
                        'bg-gradient-to-r from-orange-500 to-amber-500'
                      }`}
                      style={{ width: `${type.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Vendors */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-lg">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Top Vendors</h2>
                <p className="text-sm text-gray-500">Leading partners by trip volume</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {topVendors.map((vendor, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-blue-200 transition group">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 shadow-lg ${
                        idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 
                        idx === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 
                        idx === 2 ? 'bg-gradient-to-br from-orange-500 to-orange-600' : 
                        'bg-gradient-to-br from-blue-500 to-blue-600'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate mb-1">{vendor.name}</div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
                              idx === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' : 
                              idx === 2 ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 
                              'bg-gradient-to-r from-blue-500 to-blue-600'
                            }`}
                            style={{ width: `${vendor.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-gray-900 flex-shrink-0">{vendor.trips}</span>
                      <span className="text-xs text-gray-500">trips</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
};

export default Analytics;