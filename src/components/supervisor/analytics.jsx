// components/supervisor/analytics.jsx
"use client";
import React, { useState, useEffect } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  Download, Calendar, TrendingUp, TrendingDown, Activity,
  Clock, Car, CheckCircle, XCircle, BarChart3, Loader2, 
  Users, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const Analytics = () => {
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    fetchAnalytics();
  }, [timeFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
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
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
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

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">Traffic insights and operational metrics</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-gray-200 shadow-sm">
              <Calendar className="w-5 h-5 text-blue-600 ml-2" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium bg-transparent"
              >
                <option value="today">Today</option>
                <option value="last7days">Last 7 Days</option>
              </select>
            </div>
            {/* <button
              onClick={handleDownloadReport}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <Download className="w-5 h-5" />
              Download Report
            </button> */}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
              </div>
              <p className="text-gray-700 font-semibold text-lg">Loading analytics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Today Trips */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-600 font-medium mb-2">Today's Trips</div>
                    <div className="text-4xl font-bold text-gray-900">{analytics.todayTrips}</div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                    <Activity className="w-7 h-7 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {analytics.todayChange >= 0 ? (
                    <>
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 rounded-full">
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-bold">{analytics.todayChange}%</span>
                      </div>
                      <span className="text-sm text-gray-500">from yesterday</span>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-red-50 rounded-full">
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                        <span className="text-sm text-red-700 font-bold">{Math.abs(analytics.todayChange)}%</span>
                      </div>
                      <span className="text-sm text-gray-500">from yesterday</span>
                    </>
                  )}
                </div>
              </div>

              {/* Week Trips */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-600 font-medium mb-2">Last 7 Days</div>
                    <div className="text-4xl font-bold text-gray-900">{analytics.weekTrips}</div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-7 h-7 text-purple-600" />
                  </div>
                </div>
                <div className="text-sm text-gray-500">Total trip volume</div>
              </div>

              {/* Processing Time */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-600 font-medium mb-2">Avg. Processing</div>
                    <div className="text-4xl font-bold text-gray-900">{analytics.avgProcessingTime}</div>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center">
                    <Clock className="w-7 h-7 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 rounded-full">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-bold">{analytics.timeImprovement} min</span>
                  </div>
                  <span className="text-sm text-gray-500">faster</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Daily Trends */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Daily Traffic Trends</h2>
                    <p className="text-sm text-gray-600">Entry and exit patterns</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-600 rounded"></div>
                      <span className="text-gray-600 font-medium">Entries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-400 rounded"></div>
                      <span className="text-gray-600 font-medium">Exits</span>
                    </div>
                  </div>
                </div>

                <div className="h-80">
                  <div className="flex items-end justify-between h-full gap-4">
                    {dailyTrends.map((data, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-3 h-full">
                        <div className="flex-1 w-full flex items-end justify-center gap-1">
                          <div className="relative flex-1 flex flex-col justify-end group">
                            <div
                              className="bg-blue-600 rounded-t-lg hover:bg-blue-700 transition cursor-pointer min-h-[8px]"
                              style={{ height: `${(data.entries / maxDailyValue) * 100}%` }}
                            >
                              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 shadow-xl">
                                {data.entries} entries
                              </div>
                            </div>
                          </div>
                          <div className="relative flex-1 flex flex-col justify-end group">
                            <div
                              className="bg-gray-400 rounded-t-lg hover:bg-gray-500 transition cursor-pointer min-h-[8px]"
                              style={{ height: `${(data.exits / maxDailyValue) * 100}%` }}
                            >
                              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 shadow-xl">
                                {data.exits} exits
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-700">{data.day}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats Panel */}
              <div className="space-y-6">
                {/* Peak Hours */}
                <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-medium opacity-90">Peak Traffic Hours</div>
                  </div>
                  <div className="text-3xl font-bold mb-2">{analytics.peakHour}</div>
                  <div className="text-sm opacity-80">Highest activity period</div>
                </div>

                {/* Today Summary */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Today's Summary</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">Total Entries</span>
                      </div>
                      <span className="font-bold text-gray-900 text-lg">{analytics.totalEntries}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <XCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">Total Exits</span>
                      </div>
                      <span className="font-bold text-gray-900 text-lg">{analytics.totalExits}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Car className="w-5 h-5 text-purple-600" />
                        </div>
                        <span className="text-sm text-gray-700 font-medium">Inside Now</span>
                      </div>
                      <span className="font-bold text-purple-600 text-lg">{analytics.activeVehicles}</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span className="text-sm text-gray-700 font-medium">Avg Duration</span>
                      </div>
                      <span className="font-bold text-gray-900 text-lg">{analytics.avgDuration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hourly Distribution */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Hourly Distribution</h2>
                <p className="text-sm text-gray-600 mb-6">Traffic by hour of day</p>

                <div className="space-y-3">
                  {hourlyTrends.map((data, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-gray-700 w-20">{data.hour}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-9 overflow-hidden relative">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                          style={{ width: `${Math.max((data.count / maxHourlyValue) * 100, 5)}%` }}
                        >
                          <span className="text-sm font-bold text-white">{data.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Vehicle Types */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-5">Vehicle Types</h2>
                  <div className="space-y-4">
                    {vehicleTypes.map((type, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700 font-medium">{type.type}</span>
                          <span className="text-sm font-bold text-gray-900">{type.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${type.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Vendors */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-5">Top Vendors</h2>
                  <div className="space-y-4">
                    {topVendors.map((vendor, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0 shadow-sm ${
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
                                className="bg-gradient-to-r from-green-500 to-green-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${vendor.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 flex-shrink-0">{vendor.trips}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </SupervisorLayout>
  );
};

export default Analytics;