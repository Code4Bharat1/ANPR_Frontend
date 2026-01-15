"use client";
import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Users, MapPin, Camera, Activity,
  Download, Calendar, BarChart3, ChevronRight, MoreVertical,
  Sparkles, Target, Zap, Award
} from 'lucide-react';
import SuperAdminLayout from './layout';
import api from '@/lib/axios';

// Stat Card Component - Enhanced
const StatCard = ({ icon: Icon, title, value, trend, trendValue, bgColor, iconColor, subtitle }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 md:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
        <Icon className={`w-6 h-6 md:w-7 md:h-7 ${iconColor}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold ${trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {trend === 'up' ? <TrendingUp className="w-3 h-3 md:w-4 md:h-4" /> : <TrendingDown className="w-3 h-3 md:w-4 md:h-4" />}
          {trendValue}%
        </div>
      )}
    </div>
    <div className="text-xs md:text-sm text-gray-600 mb-1 font-medium">{title}</div>
    <div className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">{value}</div>
    {subtitle && (
      <div className="text-xs text-gray-500 flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        {subtitle}
      </div>
    )}
  </div>
);

// Top Client Card - Enhanced
const TopClientCard = ({ client, rank }) => {
  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-purple-400 to-purple-600';
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 flex items-center justify-between hover:shadow-lg transition-all duration-300 gap-4 group hover:border-purple-300 transform hover:-translate-y-0.5">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className={`w-14 h-14 bg-gradient-to-br ${getRankColor(rank)} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          {rank <= 3 ? (
            <Award className="w-6 h-6 text-white" />
          ) : (
            <span className="text-lg font-bold text-white">#{rank}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-gray-900 text-sm md:text-base truncate flex items-center gap-2">
            {client.name}
            {rank === 1 && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>}
          </div>
          <div className="text-xs md:text-sm text-gray-600 truncate flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{client.sites || 0} sites</span>
            </div>
            <div className="flex items-center gap-1">
              <Camera className="w-3 h-3" />
              <span>{client.devices || 0} devices</span>
            </div>
          </div>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-base md:text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
          {(client.trips || 0).toLocaleString()}
        </div>
        <div className="text-xs md:text-sm text-gray-600 flex items-center gap-1 justify-end">
          <Activity className="w-3 h-3" />
          trips
        </div>
      </div>
    </div>
  );
};

// Enhanced Trip Trend Chart with Recharts
const TripTrendChart = ({ data, period }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 border border-purple-100 text-center shadow-lg">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-purple-200" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Trip Volume Trends</h3>
        <p className="text-gray-500">No trip data available for this period</p>
      </div>
    );
  }

  // Calculate chart height based on data points
  const chartHeight = 220;
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.max(30, 400 / data.length);

  return (
    <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 border border-purple-100 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Trip Volume Trends
          </h3>
          <p className="text-sm text-gray-600 mt-1">Real-time monitoring of trip activities</p>
        </div>
        <div className="text-sm bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold flex items-center gap-2">
          <Target className="w-4 h-4" />
          {period}
        </div>
      </div>
      
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
          <span>{Math.ceil(maxValue).toLocaleString()}</span>
          <span>{Math.ceil(maxValue * 0.75).toLocaleString()}</span>
          <span>{Math.ceil(maxValue * 0.5).toLocaleString()}</span>
          <span>{Math.ceil(maxValue * 0.25).toLocaleString()}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-12 pl-4">
          <div className="relative h-48">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 0.25, 0.5, 0.75, 1].map((pos, i) => (
                <div key={i} className="border-t border-gray-200"></div>
              ))}
            </div>

            {/* Bars */}
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around gap-1 h-full px-2">
              {data.map((item, index) => {
                const height = (item.value / maxValue) * 100;
                const isPeak = item.value === maxValue;
                
                return (
                  <div 
                    key={index} 
                    className="relative group flex flex-col items-center"
                    style={{ width: `${barWidth}px` }}
                  >
                    {/* Bar */}
                    <div
                      className={`w-3/4 rounded-t-lg transition-all duration-500 ease-out group-hover:w-full ${
                        isPeak 
                          ? 'bg-gradient-to-t from-yellow-500 to-yellow-600 shadow-lg' 
                          : 'bg-gradient-to-t from-purple-500 to-purple-600'
                      }`}
                      style={{ height: `${height}%` }}
                    >
                      {/* Bar animation */}
                      <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 shadow-xl">
                      <div className="font-bold">{item.day}</div>
                      <div className="text-purple-300">{item.value.toLocaleString()} trips</div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                    
                    {/* Value label (always visible) */}
                    <div className="mt-2 text-xs font-semibold text-gray-700">
                      {item.value}
                    </div>
                    
                    {/* Day label */}
                    <div className="mt-1 text-xs text-gray-600 truncate w-full text-center">
                      {item.day}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-purple-500 to-purple-600"></div>
          <span className="text-xs text-gray-600">Regular Trips</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
          <span className="text-xs text-gray-600">Peak Activity</span>
        </div>
      </div>
    </div>
  );
};

// Enhanced Client Distribution Component
const ClientDistribution = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-6 border border-blue-100 text-center">
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-blue-200" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">Client Distribution</h3>
        <p className="text-gray-500">No client distribution data available</p>
      </div>
    );
  }

  const totalClients = data.reduce((sum, item) => sum + item.count, 0);

  // Pie chart simulation
  const colors = [
    { bg: 'bg-gradient-to-r from-purple-500 to-purple-700', text: 'text-purple-700', light: 'bg-purple-50' },
    { bg: 'bg-gradient-to-r from-blue-500 to-blue-700', text: 'text-blue-700', light: 'bg-blue-50' },
    { bg: 'bg-gradient-to-r from-indigo-500 to-indigo-700', text: 'text-indigo-700', light: 'bg-indigo-50' },
    { bg: 'bg-gradient-to-r from-pink-500 to-pink-700', text: 'text-pink-700', light: 'bg-pink-50' },
    { bg: 'bg-gradient-to-r from-green-500 to-green-700', text: 'text-green-700', light: 'bg-green-50' },
    { bg: 'bg-gradient-to-r from-yellow-500 to-yellow-700', text: 'text-yellow-700', light: 'bg-yellow-50' }
  ];

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-6 border border-blue-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Client Distribution
          </h3>
          <p className="text-sm text-gray-600 mt-1">Analysis by package type</p>
        </div>
        <div className="text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-semibold">
          Total: {totalClients} Clients
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart Visualization */}
        <div className="relative h-64 flex items-center justify-center">
          <div className="relative w-48 h-48">
            {data.map((item, i) => {
              const percent = Math.round((item.count / totalClients) * 100);
              const color = colors[i % colors.length];
              const rotation = data.slice(0, i).reduce((sum, _, idx) => 
                sum + (data[idx].count / totalClients) * 360, 0
              );
              
              return (
                <div
                  key={i}
                  className="absolute top-0 left-0 w-full h-full rounded-full"
                  style={{
                    clipPath: `conic-gradient(transparent 0deg ${rotation}deg, ${color.text} ${rotation}deg ${rotation + (percent * 3.6)}deg, transparent ${rotation + (percent * 3.6)}deg)`
                  }}
                >
                  <div className={`absolute inset-0 ${color.bg} opacity-80`}></div>
                </div>
              );
            })}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white rounded-full shadow-inner flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalClients}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution Details */}
        <div className="space-y-4">
          {data.map((c, i) => {
            const color = colors[i % colors.length];
            const percent = Math.round((c.count / totalClients) * 100);
            
            return (
              <div key={i} className="group hover:scale-[1.02] transition-all duration-300">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${color.bg} shadow-sm`} />
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{c.label || 'Unknown'}</span>
                      <span className="text-xs text-gray-500 ml-2">({c.count} clients)</span>
                    </div>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${color.light} ${color.text} shadow-sm`}>
                    {percent}%
                  </span>
                </div>
                <div className="relative w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                  <div 
                    className={`h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${color.bg}`}
                    style={{ width: `${percent}%` }}
                  >
                    <div className="absolute inset-0 bg-white opacity-30 animate-shimmer"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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

      // Format trip trends data
      const tripTrends = tripsRes.data.map(t => ({
        day: t.date,
        value: t.trips || 0
      }));

      // Format client distribution data
      const clientDistribution = clientsRes.data.map(d => ({
        label: d.label || 'Others',
        count: d.percent ? Math.round((d.percent / 100) * summaryRes.data.totalClients) : 0,
        percent: d.percent || 0
      }));

      // Ensure top clients have proper structure
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
      csvContent += `Total Trips,${analyticsData.totalTrips}\n`;
      
      csvContent += "\nTrip Trends\n";
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
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-200 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-gray-600 text-sm md:text-base mt-6 animate-pulse">Loading analytics dashboard...</p>
            <p className="text-xs text-gray-400 mt-2">Fetching real-time data</p>
          </div>
        </div>
      </SuperAdminLayout>
    );
  }

  return (
    <SuperAdminLayout title="Analytics">
      {/* Header */}
      {/* <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                Analytics <span className="text-purple-600">Dashboard</span>
              </h1>
            </div>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl">
              Real-time insights and performance metrics for intelligent decision making
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 via-white to-blue-50 px-6 py-4 rounded-2xl border border-purple-100 shadow-sm">
            <div className="text-xs text-purple-600 font-semibold uppercase tracking-wider">Live Dashboard</div>
            <div className="text-lg text-gray-800 font-bold mt-1">{new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</div>
            <div className="text-sm text-gray-500 mt-1">{new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div> */}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-white rounded-xl p-2 border border-gray-200 shadow-sm">
            <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base bg-transparent border-none outline-none"
            >
              <option value="today">📊 Today</option>
              <option value="7days">📈 Last 7 Days</option>
              <option value="30days">📅 Last 30 Days</option>
              <option value="90days">📆 Last 90 Days</option>
            </select>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-100 transition-all duration-300 font-medium text-sm border border-gray-200 shadow-sm"
          >
            <Zap className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
        <button
          onClick={exportToCSV}
          disabled={exporting}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-700 hover:via-purple-600 hover:to-purple-700 transition-all duration-300 font-semibold text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting...' : 'Export Full Report'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={Users}
          title="Active Clients"
          value={analyticsData.totalClients}
          trend={analyticsData.growth?.clients >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(analyticsData.growth?.clients || 0)}
          bgColor="bg-gradient-to-br from-purple-50 to-purple-100"
          iconColor="text-purple-600"
          subtitle="Growing network"
        />
        <StatCard
          icon={MapPin}
          title="Total Sites"
          value={analyticsData.totalSites}
          bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
          iconColor="text-blue-600"
          subtitle="Monitored locations"
        />
        <StatCard
          icon={Camera}
          title="Total Devices"
          value={analyticsData.totalDevices}
          bgColor="bg-gradient-to-br from-indigo-50 to-indigo-100"
          iconColor="text-indigo-600"
          subtitle="Active cameras"
        />
        <StatCard
          icon={Activity}
          title="Total Trips"
          value={analyticsData.totalTrips}
          trend={analyticsData.growth?.trips >= 0 ? 'up' : 'down'}
          trendValue={Math.abs(analyticsData.growth?.trips || 0)}
          bgColor="bg-gradient-to-br from-green-50 to-green-100"
          iconColor="text-green-600"
          subtitle={`in ${periodLabels[dateRange]}`}
        />
      </div>

      {/* Charts */}
      <div className="mb-10">
        <TripTrendChart 
          data={analyticsData.tripTrends} 
          period={periodLabels[dateRange]} 
        />
      </div>

      {/* Client Distribution & Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ClientDistribution data={analyticsData.clientDistribution} />
        
        {/* Top Clients */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-yellow-600" />
                Top Performing Clients
              </h3>
              <p className="text-sm text-gray-600">By total trips in selected period</p>
            </div>
            <div className="text-sm bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold shadow-sm">
              🏆 Performance Ranking
            </div>
          </div>
          
          {analyticsData.topClients.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.topClients.map((client, index) => (
                <TopClientCard key={index} client={client} rank={index + 1} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No client data available</p>
              <p className="text-sm text-gray-400 mt-1">Try selecting a different time period</p>
            </div>
          )}
          
          {analyticsData.topClients.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing top {Math.min(analyticsData.topClients.length, 5)} of {analyticsData.totalClients} clients
                </div>
                {/* <button className="text-sm text-purple-600 font-semibold hover:text-purple-700 transition-colors flex items-center gap-1">
                  View All Clients
                  <ChevronRight className="w-4 h-4" />
                </button> */}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add custom CSS for shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </SuperAdminLayout>
  );
};

export default SuperAdminAnalytics;