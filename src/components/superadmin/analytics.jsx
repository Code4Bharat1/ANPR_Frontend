"use client";
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Users, MapPin, Camera, Activity,
  DollarSign, Download, Calendar, Menu, X, LayoutDashboard,
  BarChart3, Settings, LogOut, FileText, Server, User,
  IndianRupeeIcon
} from 'lucide-react';
import Sidebar from './sidebar';
import SuperAdminLayout from './layout';
import axios from 'axios';
import api from '@/lib/axios';



// Layout Component


// Stat Card Component
const StatCard = ({ icon: Icon, title, value, trend, trendValue, bgColor, iconColor }) => (
  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between mb-3 md:mb-4">
      <div className={`w-10 h-10 md:w-12 md:h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-5 h-5 md:w-6 md:h-6 ${iconColor}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs md:text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />}
          {trendValue}%
        </div>
      )}
    </div>
    <div className="text-xs md:text-sm text-gray-600 mb-1">{title}</div>
    <div className="text-xl md:text-3xl font-bold text-gray-900">{value}</div>
  </div>
);

// Top Client Card
const TopClientCard = ({ client, rank }) => (
  <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-100 flex items-center justify-between hover:shadow-md transition gap-3">
    <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
      <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-base md:text-lg font-bold text-purple-600">#{rank}</span>
      </div>
      <div className="min-w-0 flex-1">
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

// Trip Trend Chart
const TripTrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border text-center text-gray-500">
        No trip data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-white rounded-xl p-6 border">
      <h3 className="font-bold mb-4">Trip Trends</h3>
      <div className="flex items-end h-40 gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center">
            <div
              className="bg-purple-500 rounded-t"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            />
            <div className="text-xs mt-2">{item.day}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Revenue Chart
const RevenueChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-bold text-gray-900">Revenue Analytics</h3>
        {/* <div className="text-xs md:text-sm text-gray-600">Last 6 Months</div> */}
      </div>
      <div className="flex items-end justify-between gap-1 md:gap-2 h-40 md:h-48">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-gradient-to-t from-green-400 to-green-600 rounded-t-lg relative transition-all duration-300 hover:from-green-500 hover:to-green-700" style={{
              height: `${(item.value / maxValue) * 100}%`,
              minHeight: '30px'
            }}>
              <div className="absolute -top-5 md:-top-6 left-0 right-0 text-center text-xs font-semibold text-gray-900">
                ₹{item.value}k
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
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState('7days');
  const periodMap = {
  today: "today",
  "7days": "7d",
  "30days": "30d",
  "90days": "90d"
};


  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

const fetchAnalytics = async () => {
  try {
    setLoading(true);

    const period = periodMap[dateRange] || "7d";

    const [summaryRes, tripsRes, clientsRes] = await Promise.all([
      api.get(`/api/superadmin/analytics/summary?period=${period}`),
      api.get(`/api/superadmin/analytics/trips?period=${period}`),
      api.get(`/api/superadmin/analytics/clients?period=${period}`),
    ]);

    setAnalyticsData({
      ...summaryRes.data,
      tripTrends: tripsRes.data.map(t => ({
        day: t.date,
        value: t.trips
      })),
      clientDistribution: clientsRes.data,
      revenueData: summaryRes.data.revenueData || [],
      topClients: summaryRes.data.topClients || []
    });

  } finally {
    setLoading(false);
  }
};




  const exportToCSV = () => {
    if (!analyticsData) return;

    setExporting(true);

    try {
      let csvContent = "data:text/csv;charset=utf-8,";

      csvContent += "Analytics Summary Report\n";
      csvContent += `Generated on:,${new Date().toLocaleString()}\n`;
      csvContent += `Date Range:,${dateRange}\n\n`;
      csvContent += "Metric,Value\n";
      csvContent += `Total Clients,${analyticsData.totalClients}\n`;
      csvContent += `Total Sites,${analyticsData.totalSites}\n`;
      csvContent += `Total Devices,${analyticsData.totalDevices}\n`;
      csvContent += `Total Trips,${analyticsData.totalTrips}\n`;
      csvContent += `Total Revenue (₹),${analyticsData.totalRevenue.toLocaleString()}\n\n`;

      csvContent += "Trip Trends - Last 7 Days\n";
      csvContent += "Day,Trips\n";
      analyticsData.tripTrends.forEach(item => {
        csvContent += `${item.day},${item.value}\n`;
      });
      csvContent += "\n";

      csvContent += "Revenue Analytics - Last 6 Months\n";
      csvContent += "Month,Revenue (₹ thousands)\n";
      analyticsData.revenueData.forEach(item => {
        csvContent += `${item.month},${item.value}\n`;
      });
      csvContent += "\n";

      csvContent += "Top Performing Clients\n";
      csvContent += "Rank,Client Name,Sites,Devices,Total Trips\n";
      analyticsData.topClients.forEach((client, index) => {
        csvContent += `${index + 1},${client.name},${client.sites},${client.devices},${client.trips}\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      const timestamp = new Date().toISOString().split('T')[0];
      link.setAttribute("download", `Analytics_Report_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExporting(false);
    } catch (err) {
      console.error('Error exporting to CSV:', err);
      alert('Error exporting report. Please try again.');
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <SuperAdminLayout title="Analytics">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm md:text-base">Loading analytics...</p>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout title="Analytics">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
          System Analytics
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Comprehensive overview of system performance and metrics
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <Calendar className="w-4 h-4 md:w-5 md:h-5 text-gray-600 flex-shrink-0" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base bg-white"
          >
            <option value="1year">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
          </select>
        </div>
        <button
          onClick={exportToCSV}
          disabled={exporting}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export to CSV'}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-6 mb-6 md:mb-8">
        <StatCard
          icon={Users}
          title="Active Clients"
          value={analyticsData?.totalClients}
          trend="up"
          trendValue={analyticsData?.growth?.clients}
        />
        <StatCard
          icon={MapPin}
          title="Total Sites"
          value={analyticsData?.totalSites || 0}
          bgColor="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={Camera}
          title="Total Devices"
          value={analyticsData?.totalDevices || 0}
          bgColor="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          icon={Activity}
          title="Total Trips"
          value={analyticsData?.totalTrips}
          trend="up"
          trendValue={analyticsData?.growth?.trips}
        />
        <StatCard
          icon={IndianRupeeIcon}
          title="Total Revenue"
          value={`₹${analyticsData?.totalRevenue}`}
          trend="up"
          trendValue={analyticsData?.growth?.revenue}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <TripTrendChart data={analyticsData?.tripTrends || []} />
        <RevenueChart data={analyticsData?.revenueData || []} />
      </div>
      {analyticsData?.clientDistribution?.length ? (
        analyticsData.clientDistribution.map((c, i) => (
          <div key={i} className="flex justify-between text-sm py-1">
            <span>{c.label}</span>
            <span>{c.percent}%</span>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-500">No client distribution data</p>
      )}

      {/* Top Clients */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100">
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
    </SuperAdminLayout>
  );
};

export default SuperAdminAnalytics;