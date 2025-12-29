"use client"

import React, { useState } from 'react';
import { BarChart3, Users, MapPin, TrendingUp, FileText, Activity, Menu, Search, Filter, Plus, Mail, Phone, CheckCircle, Copy } from 'lucide-react';
import Link from 'next/link';

const VendorsPage = () => {
  const [activePage, setActivePage] = useState('vendors');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const vendors = [
    {
      name: 'Apex Logistics Ltd.',
      email: 'contact@apexlogistics.com',
      phone: '+44 20 7946 0001',
      status: 'Active',
      assignedSites: 4,
      totalTrips: 856
    },
    {
      name: 'Global Freight Solutions',
      email: 'ops@gfs-world.com',
      phone: '+44 161 700 8822',
      status: 'Active',
      assignedSites: 6,
      totalTrips: 1042
    },
    {
      name: 'City Haulage Partners',
      email: 'dispatch@cityhaul.co.uk',
      phone: '+44 121 496 0333',
      status: 'Inactive',
      assignedSites: 1,
      totalTrips: 42
    },
    {
      name: 'Maritime Transports',
      email: 'info@maritimetrans.com',
      phone: '+44 1394 600 700',
      status: 'Active',
      assignedSites: 3,
      totalTrips: 328
    },
    {
      name: 'Rapid Courier Svc',
      email: 'support@rapidcourier.io',
      phone: '+44 20 7000 9000',
      status: 'Active',
      assignedSites: 8,
      totalTrips: 2150
    }
  ];

  const menuItems = [
    { name: 'Dashboard', icon: BarChart3, key: 'dashboard', link: '/projectmanager/dashboard' },
    { name: 'Sites', icon: MapPin, key: 'sites', link: '/projectmanager/sites' },
    { name: 'Supervisors', icon: Users, key: 'supervisors', link: '/projectmanager/supervisors' },
    { name: 'Vendors', icon: Users, key: 'vendors', link: '/projectmanager/vendors' },
    { name: 'Monitoring', icon: Activity, key: 'monitoring', link: '/projectmanager/monitoring' },
    { name: 'Reports', icon: FileText, key: 'reports', link: '/projectmanager/reports' },
    { name: 'Analytics', icon: TrendingUp, key: 'analytics', link: '/projectmanager/analytics' }
  ];

  const filteredVendors = vendors.filter(vendor => 
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-lg">BarrierGuard</span>}
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          {menuItems.map((item) => (
            <Link 
              key={item.key} 
              href={item.link}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activePage === item.key
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActivePage(item.key)}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 bg-white">
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
                <p className="text-sm text-gray-500">Overview / Vendor Management</p>
                <h1 className="text-2xl font-bold text-gray-900">Vendors</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                Log out
              </button>
            </div>
          </div>
        </header>

        {/* Vendors Content */}
        <main className="p-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Vendors</h2>
            <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <Plus className="w-5 h-5" />
              <span>Add New Vendor</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Total Vendors</p>
              <p className="text-4xl font-bold text-gray-900">24</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Active Vendors</p>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-4xl font-bold text-gray-900">18</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Trips This Month</p>
                <Copy className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-4xl font-bold text-gray-900">1,248</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vendor name..."
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

          {/* Vendors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVendors.map((vendor, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Card Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{vendor.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      vendor.status === 'Active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {vendor.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{vendor.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{vendor.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Card Stats */}
                <div className="p-6 bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Assigned Sites</p>
                      <p className="text-2xl font-bold text-gray-900">{vendor.assignedSites}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Trips</p>
                      <p className="text-2xl font-bold text-gray-900">{vendor.totalTrips}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors text-sm font-medium text-gray-700">
                      Edit
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredVendors.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No vendors found</h3>
              <p className="text-gray-500">Try adjusting your search or add a new vendor</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default VendorsPage;