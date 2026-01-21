"use client";
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Users, MapPin, Camera, Activity,
  Download, Calendar, BarChart3, RefreshCw, Sparkles, 
  Target, Award, Building2, AlertCircle, Loader2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import SuperAdminLayout from './layout';
import api from '@/lib/axios';

// Enhanced Stat Card with better loading and error states
const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  trend, 
  trendValue, 
  bgColor, 
  iconColor, 
  subtitle,
  loading = false 
}) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-purple-200 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
        {loading ? (
          <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
        ) : (
          <Icon className={`w-7 h-7 ${iconColor}`} />
        )}
      </div>
      {!loading && trend && (
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
    {loading ? (
      <div className="h-12 flex items-center">
        <div className="w-32 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    ) : (
      <>
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {subtitle && (
          <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
            {subtitle}
          </div>
        )}
      </>
    )}
  </div>
);

// Top Client Card with loading state
const TopClientCard = ({ client, rank, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl p-5 border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="flex gap-4">
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
          <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

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

// Enhanced Trip Trend Chart with better error handling
const TripTrendChart = ({ data, period, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

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
    name: item.day || item.date,
    trips: item.value || item.trips || 0
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl">
          <p className="font-bold text-sm mb-1">{label}</p>
          <p className="text-purple-300 font-semibold">
            {payload[0].value.toLocaleString()} trips
          </p>
        </div>
      );
    }
    return null;
  };

  const totalTrips = chartData.reduce((sum, item) => sum + item.trips, 0);
  const maxTrips = Math.max(...chartData.map(item => item.trips));

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
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 border border-purple-200">
            <Target className="w-4 h-4" />
            {period}
          </div>
          <div className="hidden sm:block text-sm text-gray-500">
            Total: <span className="font-bold">{totalTrips.toLocaleString()}</span> trips
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={chartData} 
          margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
        >
          <XAxis 
            dataKey="name" 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            allowDecimals={false}
            tick={{ fill: '#6b7280' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="trips" 
            name="Trips"
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

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-purple-600"></div>
          <span className="text-sm text-gray-600 font-medium">Daily Trips</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div>Total: <span className="font-bold">{totalTrips.toLocaleString()}</span></div>
          <div>Peak: <span className="font-bold">{maxTrips.toLocaleString()}</span></div>
          <div>Avg: <span className="font-bold">
            {Math.round(totalTrips / chartData.length).toLocaleString()}
          </span></div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Client Distribution Component
const ClientDistribution = ({ data, loading = false }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm text-center">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Client Distribution</h3>
        <p className="text-gray-500 text-sm">No distribution data available</p>
      </div>
    );
  }

  const totalClients = data.reduce((sum, item) => sum + (item.count || 0), 0);
  const COLORS = ['#8b5cf6', '#3b82f6', '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#84cc16'];
  
  const pieData = data.map((item, index) => ({
    name: item.label || 'Unknown',
    value: item.count || 0,
    percent: item.percent || 0
  }));

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-xl">
          <p className="font-bold text-sm mb-1">{payload[0].name}</p>
          <p className="text-blue-300 font-semibold">
            {payload[0].value.toLocaleString()} clients
          </p>
          <p className="text-gray-300 text-xs">
            {payload[0].payload.percent}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
          {totalClients} Total Clients
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
            innerRadius={40}
            paddingAngle={2}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value, entry) => (
              <span className="text-sm text-gray-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {pieData.slice(0, 4).map((item, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold text-gray-900">{item.value}</div>
            <div className="text-xs text-gray-500 truncate">{item.name}</div>
            <div className="text-xs font-medium text-gray-700">{item.percent}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Analytics Component
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
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
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
  }, [dateRange, refreshKey]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const period = periodMap[dateRange] || "7d";

      console.log(`Fetching analytics for period: ${period}`);

      const [summaryRes, tripsRes, clientsRes] = await Promise.all([
        api.get(`/api/superadmin/analytics/summary?period=${period}`).catch(err => {
          console.error('Summary API error:', err);
          return { data: {} };
        }),
        api.get(`/api/superadmin/analytics/trips?period=${period}`).catch(err => {
          console.error('Trips API error:', err);
          return { data: [] };
        }),
        api.get(`/api/superadmin/analytics/clients?period=${period}`).catch(err => {
          console.error('Clients API error:', err);
          return { data: [] };
        })
      ]);

      console.log('API Responses:', {
        summary: summaryRes.data,
        trips: tripsRes.data,
        clients: clientsRes.data
      });

      // Format trip trends
      const tripTrends = Array.isArray(tripsRes.data) 
        ? tripsRes.data.map(t => ({
            day: t.date,
            value: t.trips || 0
          }))
        : [];

      // Format client distribution
      const clientDistribution = Array.isArray(clientsRes.data)
        ? clientsRes.data.map(d => ({
            label: d.label || 'Others',
            count: d.count || 0,
            percent: d.percent || 0
          }))
        : [];

      // Format top clients
      const topClients = Array.isArray(summaryRes.data.topClients)
        ? summaryRes.data.topClients.map(client => ({
            name: client.name || 'Unknown Client',
            sites: client.sites || 0,
            devices: client.devices || 0,
            trips: client.trips || 0
          }))
        : [];

      setAnalyticsData({
        totalTrips: summaryRes.data.totalTrips || 0,
        totalClients: summaryRes.data.totalClients || 0,
        totalSites: summaryRes.data.totalSites || 0,
        totalDevices: summaryRes.data.totalDevices || 0,
        growth: summaryRes.data.growth || { trips: 0, clients: 0 },
        tripTrends,
        clientDistribution,
        topClients
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data. Please try again.');
      
      // Set default data structure
      setAnalyticsData({
        totalTrips: 0,
        totalClients: 0,
        totalSites: 0,
        totalDevices: 0,
        growth: { trips: 0, clients: 0 },
        tripTrends: [],
        clientDistribution: [],
        topClients: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const exportToCSV = () => {
    if (!analyticsData || loading) return;
    setExporting(true);

    try {
      const csvRows = [];
      
      // Header
      csvRows.push('System Analytics Report');
      csvRows.push(`Generated on:,${new Date().toLocaleString()}`);
      csvRows.push(`Date Range:,${periodLabels[dateRange]}`);
      csvRows.push('');
      
      // Key Metrics
      csvRows.push('Key Metrics');
      csvRows.push('Metric,Value,Growth');
      csvRows.push(`Active Clients,${analyticsData.totalClients},${analyticsData.growth.clients}%`);
      csvRows.push(`Total Sites,${analyticsData.totalSites},-`);
      csvRows.push(`Total Devices,${analyticsData.totalDevices},-`);
      csvRows.push(`Total Trips,${analyticsData.totalTrips},${analyticsData.growth.trips}%`);
      csvRows.push('');
      
      // Trip Trends
      csvRows.push('Trip Trends');
      csvRows.push('Date,Trips');
      analyticsData.tripTrends.forEach(item => {
        csvRows.push(`${item.day},${item.value}`);
      });
      csvRows.push('');
      
      // Client Distribution
      csvRows.push('Client Distribution');
      csvRows.push('Package Type,Count,Percentage');
      analyticsData.clientDistribution.forEach(item => {
        csvRows.push(`${item.label},${item.count},${item.percent}%`);
      });
      csvRows.push('');
      
      // Top Clients
      csvRows.push('Top Performing Clients');
      csvRows.push('Rank,Client Name,Sites,Devices,Total Trips');
      analyticsData.topClients.forEach((client, index) => {
        csvRows.push(`${index + 1},${client.name},${client.sites},${client.devices},${client.trips}`);
      });

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        const timestamp = new Date().toISOString().split('T')[0];
        link.setAttribute("download", `Analytics_Report_${timestamp}_${dateRange}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

    } catch (err) {
      console.error('Error exporting to CSV:', err);
      alert('Error exporting report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (loading && refreshKey === 0) {
    return (
      <SuperAdminLayout title="Analytics">
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <div className="relative w-24 h-24 mb-8">
            <div className="w-24 h-24 border-4 border-purple-200 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-purple-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
          <p className="text-gray-800 font-semibold text-lg mb-2">Loading Analytics Dashboard</p>
          <p className="text-gray-500 text-sm">Fetching real-time data...</p>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout title="Analytics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-gray-200 shadow-sm">
              <Calendar className="w-5 h-5 text-purple-600" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium bg-transparent min-w-[140px]"
                disabled={loading}
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm border border-gray-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          
          <button
            onClick={exportToCSV}
            disabled={exporting || loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all font-semibold text-sm disabled:opacity-50 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Exporting...' : 'Export Report'}
          </button>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

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
            subtitle="Total registered clients"
            loading={loading}
          />
          
          <StatCard
            icon={MapPin}
            title="Total Sites"
            value={analyticsData.totalSites}
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            iconColor="text-blue-600"
            subtitle="Monitored locations"
            loading={loading}
          />
          
          <StatCard
            icon={Camera}
            title="Total Devices"
            value={analyticsData.totalDevices}
            bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200"
            iconColor="text-indigo-600"
            subtitle="Active cameras"
            loading={loading}
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
            loading={loading}
          />
        </div>

        {/* Trip Trends Chart */}
        <div className="mb-8">
          <TripTrendChart 
            data={analyticsData.tripTrends} 
            period={periodLabels[dateRange]}
            loading={loading}
          />
        </div>

        {/* Distribution & Top Clients */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ClientDistribution 
            data={analyticsData.clientDistribution} 
            loading={loading}
          />
          
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  Top Performing Clients
                </h3>
                <p className="text-sm text-gray-600 ml-12">By total trips in selected period</p>
              </div>
              
              <div className="text-sm text-gray-500">
                Showing top {Math.min(analyticsData.topClients.length, 5)} clients
              </div>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <TopClientCard key={i} loading={true} />
                ))}
              </div>
            ) : analyticsData.topClients.length > 0 ? (
              <div className="space-y-3">
                {analyticsData.topClients.map((client, index) => (
                  <TopClientCard 
                    key={client.name + index} 
                    client={client} 
                    rank={index + 1} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 font-medium">No trip data available for clients</p>
                <p className="text-sm text-gray-500 mt-1">
                  Clients will appear here once they have trip activity
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAnalytics;