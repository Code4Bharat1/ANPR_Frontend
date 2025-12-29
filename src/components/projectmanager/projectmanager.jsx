"use client"

import React, { useState } from 'react';
import { BarChart3, Users, MapPin, TrendingUp, FileText, Activity, Menu, LogOut, Bell, Search, ChevronRight, Copy, ExternalLink, Target } from 'lucide-react';

const PMDashboard = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Stats data
  const stats = [
    {
      title: 'Total Sites',
      value: '12',
      subtitle: 'All operational',
      subtitleColor: 'text-green-600',
      icon: MapPin,
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Supervisors',
      value: '48',
      subtitle: 'Total registered',
      subtitleColor: 'text-gray-600',
      icon: Users,
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Active Supervisors',
      value: '32',
      subtitle: 'Currently online',
      subtitleColor: 'text-green-600',
      icon: Activity,
      bgColor: 'bg-green-50'
    },
    {
      title: "Today's Trips",
      value: '142',
      subtitle: '+12% vs yesterday',
      subtitleColor: 'text-green-600',
      icon: TrendingUp,
      bgColor: 'bg-orange-50'
    }
  ];

  const tripStats = [
    { title: 'Total Trips (MTD)', value: '3,429', icon: Copy },
    { title: 'Active Trips', value: '28', subtitle: 'In progress now', icon: Target },
    { title: 'Completed Trips', value: '3,401', icon: ExternalLink }
  ];

  const assignedSites = [
    { name: 'North Logistics Hub', id: '#NLH-01', barriers: 4, active: 8, status: 'Operational' },
    { name: 'Westside Distribution Center', id: '#WDC-04', barriers: 2, active: 3, status: 'Maintenance' },
    { name: 'Port Gate 7 Access', id: '#PGA-07', barriers: 6, active: 12, status: 'Operational' },
    { name: 'Central Storage Facility', id: '#CSF-02', barriers: 3, active: 5, status: 'Operational' }
  ];

  const recentActivities = [
    { text: 'Vehicle Entry at North Logistics Hub - Gate 1', time: '2 mins ago', icon: Activity },
    { text: 'Barrier Alert reported at Westside Distribution', time: '15 mins ago', icon: Bell },
    { text: 'New Supervisor assigned to Port Gate 7', time: '1 hour ago', icon: Users },
    { text: 'Daily Report generated for Zone A', time: '2 hours ago', icon: FileText },
    { text: 'Vehicle Exit at North Logistics Hub - Gate 2', time: '3 hours ago', icon: Activity }
  ];

  const menuItems = [
    { name: 'Dashboard', icon: BarChart3, key: 'dashboard'  },
    { name: 'Sites', icon: MapPin, key: 'sites' },
    { name: 'Supervisors', icon: Users, key: 'supervisors' },
    { name: 'Vendors', icon: Users, key: 'vendors' },
    { name: 'Monitoring', icon: Activity, key: 'monitoring' },
    { name: 'Reports', icon: FileText, key: 'reports' },
    { name: 'Analytics', icon: TrendingUp, key: 'analytics' }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-lg">BarrierGuard</span>}
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActivePage(item.key)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activePage === item.key
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              AM
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="font-semibold text-sm">Alex Morgan</p>
                <p className="text-xs text-gray-500">Project Manager</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="w-6 h-6 text-gray-600" />
              </button>
              <div>
                <p className="text-sm text-gray-500">Overview / Dashboard</p>
                <h1 className="text-2xl font-bold text-gray-900">Project Overview</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <p className="text-sm text-gray-500">Oct 24, 2025</p>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                Log out
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className={`text-sm ${stat.subtitleColor}`}>{stat.subtitle}</p>
              </div>
            ))}
          </div>

          {/* Trip Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {tripStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <stat.icon className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                {stat.subtitle && <p className="text-sm text-gray-500">{stat.subtitle}</p>}
              </div>
            ))}
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Assigned Sites */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">My Assigned Sites</h2>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {assignedSites.map((site, index) => (
                  <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{site.name}</h3>
                        <p className="text-sm text-gray-500">
                          ID: {site.id} • {site.barriers} Barriers
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{site.active} active</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          site.status === 'Operational' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {site.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Recent Activities</h2>
              </div>
              <div className="p-4 space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <activity.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PMDashboard;