"use client";
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Users, MapPin, Camera, Activity,
  Download, Calendar, BarChart3, ChevronRight, RefreshCw,
  Sparkles, Target, Zap, Award, Building2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import SuperAdminLayout from './layout';
import api from '@/lib/axios';

// Enhanced Stat Card
const StatCard = ({ icon: Icon, title, value, trend, trendValue, bgColor, iconColor, subtitle }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-purple-200 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
          trend === 'up' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {trendValue}%
        </div>
      )}
    </div>
    <div className="text-sm text-gray-600 mb-2 font-medium">{title}</div>
    <div className="text-4xl font-bold text-gray-900 mb-2">{value.toLocaleString()}</div>
    {subtitle && (
      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-2">
        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
        {subtitle}
      </div>
    )}
  </div>
);

// Top Client Card - Redesigned
const TopClientCard = ({ client, rank }) => {
  const getRankBadge = (rank) => {
    switch(rank) {
      case 1: return { bg: 'bg-gradient-to-r from-yellow-400 to-yellow-500', icon: '🥇', color: 'text-yellow-700' };
      case 2: return { bg: 'bg-gradient-to-r from-gray-400 to-gray-500', icon: '🥈', color: 'text-gray-700' };
      case 3: return { bg: 'bg-gradient-to-r from-orange-400 to-orange-500', icon: '🥉', color: 'text-orange-700' };
      default: return { bg: 'bg-gradient-to-r from-purple-400 to-purple-500', icon: rank, color: 'text-purple-700' };
    }
  };

  const badge = getRankBadge(rank);

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md hover:border-purple-300 transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 ${badge.bg} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
          <span className="text-2xl">{badge.icon}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-bold text-gray-900 text-base truncate">{client.name}</h4>
            {rank === 1 && <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <span className="font-medium">{client.sites || 0} sites</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-purple-500" />
              <span className="font-medium">{client.devices || 0} devices</span>
            </div>
          </div>
        </div>
        
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
            {(client.trips || 0).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 font-medium mt-1">trips</div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Trip Trend Chart with Recharts
const TripTrendChart = ({ data, period }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Trip Volume Trends</h3>
        <p className="text-gray-500 text-sm">No trip data available for this period</p>
      </div>
    );
  }

  // Transform data for recharts
  const chartData = data.map(item => ({
    name: item.day,
    trips: item.value
  }));

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            Trip Volume Trends
          </h3>
          <p className="text-sm text-gray-600 ml-12">Daily trip activity monitoring</p>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 border border-purple-200">
          <Target className="w-4 h-4" />
          {period}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            style={{ fontSize: '12px', fontWeight: '500' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px', fontWeight: '500' }}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              padding: '12px'
            }}
            labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
            itemStyle={{ color: '#c084fc' }}
            cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
          />
          <Bar 
            dataKey="trips" 
            fill="url(#colorGradient)" 
            radius={[8, 8, 0, 0]}
            maxBarSize={60}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={1}/>
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={1}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-purple-600"></div>
          <span className="text-sm text-gray-600 font-medium">Daily Trips</span>
        </div>
      </div>
    </div>
  );
};

// Client Distribution Component with Recharts Pie
const ClientDistribution = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Client Distribution</h3>
        <p className="text-gray-500 text-sm">No distribution data available</p>
      </div>
    );
  }

  const totalClients = data.reduce((sum, item) => sum + item.count, 0);
  
  const COLORS = ['#8b5cf6', '#3b82f6', '#6366f1', '#ec4899', '#10b981', '#f59e0b'];
  
  const pieData = data.map((item, index) => ({
    name: item.label || 'Unknown',
    value: item.count,
    percent: Math.round((item.count / totalClients) * 100)
  }));

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            Client Distribution
          </h3>
          <p className="text-sm text-gray-600 ml-12">By package type</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 px-4 py-2 rounded-xl font-bold text-sm border border-blue-200">
          {totalClients} Total
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${percent}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1f2937', 
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              padding: '12px'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main Component
const SuperAdminAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalTrips: 0,
    totalClients: 0,
    totalSites: 0,
    totalDevices: 0,
    growth: { trips: 0, clients: 0 },
    tripTrends: [],
    clientDistribution: [],
    topClients: []
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState('7days');
  
  const periodMap = {
    today: "today",
    "7days": "7d",
    "30days": "30d",
    "90days": "90d"
  };

  const periodLabels = {
    today: "Today",
    "7days": "Last 7 Days",
    "30days": "Last 30 Days",
    "90days": "Last 90 Days"
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

      const tripTrends = tripsRes.data.map(t => ({
        day: t.date,
        value: t.trips || 0
      }));

      const clientDistribution = clientsRes.data.map(d => ({
        label: d.label || 'Others',
        count: d.percent ? Math.round((d.percent / 100) * summaryRes.data.totalClients) : 0,
        percent: d.percent || 0
      }));

      const topClients = (summaryRes.data.topClients || []).map(client => ({
        name: client.name || 'Unknown Client',
        sites: client.sites || 0,
        devices: client.devices || 0,
        trips: client.trips || 0
      }));

      setAnalyticsData({
        ...summaryRes.data,
        tripTrends,
        clientDistribution,
        topClients,
        growth: summaryRes.data.growth || { trips: 0, clients: 0 }
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!analyticsData) return;
    setExporting(true);

    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "System Analytics Report\n";
      csvContent += `Generated on:,${new Date().toLocaleString()}\n`;
      csvContent += `Date Range:,${periodLabels[dateRange]}\n\n`;
      
      csvContent += "Key Metrics\n";
      csvContent += "Metric,Value\n";
      csvContent += `Active Clients,${analyticsData.totalClients}\n`;
      csvContent += `Total Sites,${analyticsData.totalSites}\n`;
      csvContent += `Total Devices,${analyticsData.totalDevices}\n`;
      csvContent += `Total Trips,${analyticsData.totalTrips}\n\n`;
      
      csvContent += "Trip Trends\n";
      csvContent += "Date,Trips\n";
      analyticsData.tripTrends.forEach(item => {
        csvContent += `${item.day},${item.value}\n`;
      });
      csvContent += "\n";

      csvContent += "Client Distribution\n";
      csvContent += "Package Type,Count,Percentage\n";
      analyticsData.clientDistribution.forEach(item => {
        csvContent += `${item.label},${item.count},${item.percent}%\n`;
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
      link.setAttribute("download", `Analytics_Report_${timestamp}_${dateRange}.csv`);
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
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="w-20 h-20 border-4 border-purple-200 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="text-gray-700 font-semibold text-lg">Loading Analytics...</p>
            <p className="text-gray-500 text-sm mt-2">Fetching real-time data</p>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout title="Analytics">
      <div className="max-w-7xl mx-auto">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-gray-200 shadow-sm">
              <Calendar className="w-5 h-5 text-purple-600 ml-2" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium bg-transparent"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
            {/* <button
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm border border-gray-200 shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button> */}
          </div>
          <button
            onClick={exportToCSV}
            disabled={exporting}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all font-semibold text-sm disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export Report'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Active Clients"
            value={analyticsData.totalClients}
            trend={analyticsData.growth?.clients >= 0 ? 'up' : 'down'}
            trendValue={Math.abs(analyticsData.growth?.clients || 0)}
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            iconColor="text-purple-600"
            subtitle="Growing network"
          />
          <StatCard
            icon={MapPin}
            title="Total Sites"
            value={analyticsData.totalSites}
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            iconColor="text-blue-600"
            subtitle="Monitored locations"
          />
          <StatCard
            icon={Camera}
            title="Total Devices"
            value={analyticsData.totalDevices}
            bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200"
            iconColor="text-indigo-600"
            subtitle="Active cameras"
          />
          <StatCard
            icon={Activity}
            title="Total Trips"
            value={analyticsData.totalTrips}
            trend={analyticsData.growth?.trips >= 0 ? 'up' : 'down'}
            trendValue={Math.abs(analyticsData.growth?.trips || 0)}
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            iconColor="text-green-600"
            subtitle={`in ${periodLabels[dateRange]}`}
          />
        </div>

        {/* Chart */}
        <div className="mb-8">
          <TripTrendChart 
            data={analyticsData.tripTrends} 
            period={periodLabels[dateRange]} 
          />
        </div>

        {/* Distribution & Top Clients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ClientDistribution data={analyticsData.clientDistribution} />
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  Top Clients
                </h3>
                <p className="text-sm text-gray-600 ml-12">By total trips</p>
              </div>
            </div>
            
            {analyticsData.topClients.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.topClients.map((client, index) => (
                  <TopClientCard key={index} client={client} rank={index + 1} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-medium">No client data available</p>
                <p className="text-sm text-gray-400 mt-1">Try a different time period</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAnalytics;