// components/supervisor/analytics.jsx
"use client";
import React, { useState, useEffect } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  Download, Calendar, TrendingUp, TrendingDown, Activity,
  Clock, Car, CheckCircle, XCircle, BarChart3, Loader2
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('last7days');
  const [analytics, setAnalytics] = useState({});

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
        setDailyTrends(response.data.dailyTrends || dailyTrends);
        setHourlyTrends(response.data.hourlyTrends || hourlyTrends);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      alert('Downloading report... (Feature to be implemented)');
      // Implementation for downloading PDF/Excel report
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report');
    }
  };

  const maxDailyValue = Math.max(...dailyTrends.map(d => Math.max(d.entries, d.exits)));
  const maxHourlyValue = Math.max(...hourlyTrends.map(h => h.count));

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Overview of traffic and operational efficiency</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold"
            >
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="thismonth">This Month</option>
            </select>
            <button
              onClick={handleDownloadReport}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Report
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">Loading analytics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Today Trips */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-600 font-medium mb-1">Today Trips</div>
                    <div className="text-3xl font-bold text-gray-900">{analytics.todayTrips}</div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  {analytics.todayChange >= 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-semibold">+{analytics.todayChange}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-red-600" />
                      <span className="text-red-600 font-semibold">{analytics.todayChange}%</span>
                    </>
                  )}
                  <span className="text-gray-500 ml-1">from yesterday</span>
                </div>
              </div>

              {/* Last 7 Days Trips */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-600 font-medium mb-1">Last 7 Days Trips</div>
                    <div className="text-3xl font-bold text-gray-900">{analytics.weekTrips}</div>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-sm text-gray-500">Consistent with last week</div>
              </div>

              {/* Avg Processing Time */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-600 font-medium mb-1">Avg. Processing Time</div>
                    <div className="text-3xl font-bold text-gray-900">{analytics.avgProcessingTime}</div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-semibold">{Math.abs(analytics.timeImprovement)} min improvement</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Daily Trends - Large */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Vehicle Traffic Trends (Daily)</h2>
                    <p className="text-sm text-gray-600">Entry and exit patterns over the week</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-600 rounded"></div>
                      <span className="text-gray-600">Entries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-400 rounded"></div>
                      <span className="text-gray-600">Exits</span>
                    </div>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="h-80">
                  <div className="flex items-end justify-between h-full gap-4">
                    {dailyTrends.map((data, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full">
                        <div className="flex-1 w-full flex items-end justify-center gap-1">
                          {/* Entries Bar */}
                          <div className="relative flex-1 flex flex-col justify-end group">
                            <div
                              className="bg-blue-600 rounded-t hover:bg-blue-700 transition cursor-pointer"
                              style={{ height: `${(data.entries / maxDailyValue) * 100}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                {data.entries} entries
                              </div>
                            </div>
                          </div>
                          {/* Exits Bar */}
                          <div className="relative flex-1 flex flex-col justify-end group">
                            <div
                              className="bg-gray-400 rounded-t hover:bg-gray-500 transition cursor-pointer"
                              style={{ height: `${(data.exits / maxDailyValue) * 100}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
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

              {/* Quick Stats */}
              <div className="space-y-4">
                {/* Peak Hours */}
                <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div className="text-sm opacity-90">Peak Traffic Hours</div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{analytics.peakHour}</div>
                  <div className="text-sm opacity-75">Highest activity period</div>
                </div>

                {/* Total Stats */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Today's Summary</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="text-sm text-gray-600">Total Entries</span>
                      </div>
                      <span className="font-bold text-gray-900">{analytics.totalEntries}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <XCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-600">Total Exits</span>
                      </div>
                      <span className="font-bold text-gray-900">{analytics.totalExits}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Car className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-sm text-gray-600">Currently Inside</span>
                      </div>
                      <span className="font-bold text-purple-600">{analytics.activeVehicles}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Avg Duration</span>
                      </div>
                      <span className="font-bold text-gray-900">{analytics.avgDuration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hourly Trends */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Hourly Traffic Distribution</h2>
                <p className="text-sm text-gray-600 mb-6">Vehicle movements by hour of day</p>

                <div className="space-y-3">
                  {hourlyTrends.map((data, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-gray-700 w-16">{data.hour}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden relative">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                          style={{ width: `${(data.count / maxHourlyValue) * 100}%` }}
                        >
                          <span className="text-xs font-bold text-white">{data.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle Types & Top Vendors */}
              <div className="space-y-6">
                {/* Vehicle Types */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Vehicle Type Distribution</h2>
                  <div className="space-y-3">
                    {vehicleTypes.map((type, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-700">{type.type}</span>
                          <span className="text-sm font-bold text-gray-900">{type.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${type.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Vendors */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Top Vendors</h2>
                  <div className="space-y-3">
                    {topVendors.map((vendor, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                            idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-blue-500'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">{vendor.name}</div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className="bg-green-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${vendor.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 ml-3">{vendor.trips}</span>
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
