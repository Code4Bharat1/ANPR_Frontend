"use client"

import React, { useState } from 'react';
import { BarChart3, Users, MapPin, TrendingUp, FileText, Activity, Menu, Search, Filter, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const SupervisorsPage = () => {
  const [activePage, setActivePage] = useState('supervisors');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const supervisors = [
    {
      name: 'Sarah Jennings',
      avatar: '👩‍💼',
      assignedSite: 'North Logistics Hub',
      status: 'Active',
      todayTrips: 12
    },
    {
      name: 'Michael Chen',
      avatar: '👨‍💼',
      assignedSite: 'Westside Distribution',
      status: 'Active',
      todayTrips: 8
    },
    {
      name: 'David Miller',
      avatar: '👨',
      assignedSite: 'Unassigned',
      status: 'Inactive',
      todayTrips: 0
    },
    {
      name: 'Emily Davis',
      avatar: '👩',
      assignedSite: 'Port Gate 7',
      status: 'Active',
      todayTrips: 24
    },
    {
      name: 'James Robinson',
      avatar: 'JR',
      assignedSite: 'Central Storage',
      status: 'Active',
      todayTrips: 5
    }
  ];

  const menuItems = [
    { name: 'Dashboard', icon: BarChart3, key: 'dashboard', link: '/admin/dashboard' },
    { name: 'Sites', icon: MapPin, key: 'sites', link: '/admin/sites' },
    { name: 'Supervisors', icon: Users, key: 'supervisors', link: '/admin/supervisors' },
    { name: 'Vendors', icon: Users, key: 'vendors', link: '/admin/vendors' },
    { name: 'Monitoring', icon: Activity, key: 'monitoring', link: '/admin/monitoring' },
    { name: 'Reports', icon: FileText, key: 'reports', link: '/admin/reports' },
    { name: 'Analytics', icon: TrendingUp, key: 'analytics', link: '/admin/analytics' }
  ];

  const filteredSupervisors = supervisors.filter(supervisor => 
    supervisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supervisor.assignedSite.toLowerCase().includes(searchQuery.toLowerCase())
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
                <p className="text-sm text-gray-500">Overview / Supervisors</p>
                <h1 className="text-2xl font-bold text-gray-900">Supervisor Management</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                Log out
              </button>
            </div>
          </div>
        </header>

        {/* Supervisors Content */}
        <main className="p-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Supervisor Management</h2>
            <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              <Plus className="w-5 h-5" />
              <span>Add Supervisor</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Total Supervisors</p>
              <p className="text-4xl font-bold text-gray-900">48</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Active Supervisors</p>
              <p className="text-4xl font-bold text-gray-900">32</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Supervisor Trips</p>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-4xl font-bold text-gray-900">1,245</p>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl border border-gray-200 mb-6">
            <div className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search supervisors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Status: All</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Site: All</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Site
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Today Trips
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSupervisors.map((supervisor, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-semibold">
                            {supervisor.avatar}
                          </div>
                          <span className="font-medium text-gray-900">{supervisor.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-700">{supervisor.assignedSite}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          supervisor.status === 'Active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {supervisor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">{supervisor.todayTrips}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            View
                          </button>
                          <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            {supervisor.assignedSite === 'Unassigned' ? 'Enable' : 'Assign Site'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing 1-5 of 48 supervisors
              </p>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                  1
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                  2
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                  3
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupervisorsPage;