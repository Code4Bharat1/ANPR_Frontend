"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, Menu, TrendingUp, TrendingDown, Activity, 
  Calendar, MapPin, Package, Users
} from 'lucide-react';
import Sidebar from './sidebar';

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
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/project/analytics`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: { timeRange }
        }
      );

      setAnalyticsData(response.data);
    } catch (err) {
      // setAnalyticsData({
      //   totalTrips: 3429,
      //   avgDuration: '2h 15m',
      //   peakHours: '10 AM - 2 PM',
      //   utilizationRate: '78%',
      //   topVendors: [
      //     { name: 'Apex Logistics', trips: 856, percentage: 25 },
      //     { name: 'Global Freight', trips: 742, percentage: 22 },
      //     { name: 'Rapid Courier', trips: 628, percentage: 18 },
      //     { name: 'Maritime Transports', trips: 514, percentage: 15 },
      //     { name: 'City Haulage', trips: 689, percentage: 20 }
      //   ],
      //   topSites: [
      //     { name: 'North Logistics Hub', trips: 1245, percentage: 36 },
      //     { name: 'Port Gate 7', trips: 892, percentage: 26 },
      //     { name: 'Westside Distribution', trips: 658, percentage: 19 },
      //     { name: 'Central Storage', trips: 634, percentage: 19 }
      //   ],
      //   weeklyData: [
      //     { day: 'Mon', trips: 142 },
      //     { day: 'Tue', trips: 158 },
      //     { day: 'Wed', trips: 134 },
      //     { day: 'Thu', trips: 167 },
      //     { day: 'Fri', trips: 189 },
      //     { day: 'Sat', trips: 98 },
      //     { day: 'Sun', trips: 76 }
      //   ]
      // });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
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
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                AM
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Time Range Filter */}
          <div className="mb-6">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              {/* <option value="1year">Last Year</option> */}
            </select>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Activity}
              value={analyticsData?.totalTrips?.toLocaleString() || 0}
              label="Total Trips"
              // change={12}
              bgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatCard
              icon={Calendar}
              value={analyticsData?.avgDuration || '-'}
              label="Avg Duration"
              // change={-5}
              bgColor="bg-purple-50"
              iconColor="text-purple-600"
            />
            <StatCard
              icon={TrendingUp}
              value={analyticsData?.peakHours || '-'}
              label="Peak Hours"
              bgColor="bg-orange-50"
              iconColor="text-orange-600"
            />
            <StatCard
              icon={Activity}
              value={analyticsData?.utilizationRate || '-'}
              label="Utilization Rate"
              // change={8}
              bgColor="bg-green-50"
              iconColor="text-green-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            
            {/* Top Vendors */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Package className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Top Vendors by Trips</h2>
              </div>
              <div className="space-y-4">
                {analyticsData?.topVendors?.map((vendor, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">{vendor.name}</div>
                      <div className="text-sm text-gray-600">{vendor.trips} trips</div>
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
            </div>

            {/* Top Sites */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <MapPin className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl font-bold text-gray-900">Top Sites by Activity</h2>
              </div>
              <div className="space-y-4">
                {analyticsData?.topSites?.map((site, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-semibold text-gray-900">{site.name}</div>
                      <div className="text-sm text-gray-600">{site.trips} trips</div>
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
            </div>
          </div>

          {/* Weekly Trips Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Trip Distribution</h2>
            <div className="flex items-end justify-between gap-4 h-64">
              {analyticsData?.weeklyData?.map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center justify-end">
                  <div className="text-sm font-semibold text-gray-900 mb-2">{day.trips}</div>
                  <div
                    className="w-full bg-indigo-600 rounded-t-lg transition-all hover:bg-indigo-700"
                    style={{ height: `${(day.trips / 200) * 100}%` }}
                  ></div>
                  <div className="text-xs text-gray-600 mt-2">{day.day}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PMAnalytics;
