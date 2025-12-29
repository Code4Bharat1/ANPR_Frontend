"use client"

import React, { useState } from 'react';
import { BarChart3, Users, MapPin, TrendingUp, FileText, Activity, Menu, Search, Filter, Plus } from 'lucide-react';

const SitesPage = () => {
  const [activePage, setActivePage] = useState('sites');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const sites = [
    {
      name: 'North Logistics Hub',
      location: 'Manchester, UK',
      status: 'Active',
      supervisors: 4,
      activeVehicles: 28
    },
    {
      name: 'Westside Distribution',
      location: 'Liverpool, UK',
      status: 'Active',
      supervisors: 2,
      activeVehicles: 15
    },
    {
      name: 'Central Storage Facility',
      location: 'Birmingham, UK',
      status: 'Active',
      supervisors: 6,
      activeVehicles: 42
    },
    {
      name: 'Port Gate 7',
      location: 'Felixstowe, UK',
      status: 'Active',
      supervisors: 3,
      activeVehicles: 112
    },
    {
      name: 'Tech Park Entry A',
      location: 'Cambridge, UK',
      status: 'Maintenance',
      supervisors: 1,
      activeVehicles: 0
    }
  ];

  const menuItems = [
    { name: 'Dashboard', icon: BarChart3, key: 'dashboard' },
    { name: 'Sites', icon: MapPin, key: 'sites' },
    { name: 'Supervisors', icon: Users, key: 'supervisors' },
    { name: 'Vendors', icon: Users, key: 'vendors' },
    { name: 'Monitoring', icon: Activity, key: 'monitoring' },
    { name: 'Reports', icon: FileText, key: 'reports' },
    { name: 'Analytics', icon: TrendingUp, key: 'analytics' }
  ];

  const filteredSites = sites.filter(site => 
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    site.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                <p className="text-sm text-gray-500">Overview / My Sites</p>
                <h1 className="text-2xl font-bold text-gray-900">My Sites</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                Log out
              </button>
            </div>
          </div>
        </header>

        {/* Sites Content */}
        <main className="p-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">My Sites</h2>
            <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <Plus className="w-5 h-5" />
              <span>Add New Site</span>
            </button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sites by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filters</span>
            </button>
          </div>

          {/* Sites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map((site, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Card Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{site.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      site.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {site.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{site.location}</p>
                </div>

                {/* Card Stats */}
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Supervisors</p>
                      <p className="text-2xl font-bold text-gray-900">{site.supervisors}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Active Vehicles</p>
                      <p className="text-2xl font-bold text-gray-900">{site.activeVehicles}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors text-sm font-medium text-gray-700">
                      Assign
                    </button>
                    <button className={`px-4 py-2 border border-gray-300 rounded-lg transition-colors text-sm font-medium ${
                      site.status === 'Active' 
                        ? 'hover:bg-white text-gray-700' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={site.status !== 'Active'}
                    >
                      Monitor
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredSites.length === 0 && (
            <div className="text-center py-16">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sites found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SitesPage;