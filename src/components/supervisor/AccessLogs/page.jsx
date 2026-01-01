"use client" 

import React, { useState } from 'react';
import { 
  Search,
  Download,
  CheckCircle,
  AlertCircle,
  Settings,
  Video,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Sidebar from '../sidebar';

const AccessLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Last 7 Days');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const accessLogs = [
    {
      tripId: '#TR-8892',
      vehicle: 'MH12-DE-1992',
      vendor: 'Blue Dart Logistics',
      entryTime: 'Today, 10:45 AM',
      exitTime: 'Today, 01:00 PM',
      duration: '2h 15m',
      status: 'Completed',
      statusColor: 'bg-green-500'
    },
    {
      tripId: '#TR-8891',
      vehicle: 'KA01-AG-4421',
      vendor: 'Amazon Transport',
      entryTime: 'Today, 09:15 AM',
      exitTime: '--',
      duration: 'Active',
      status: 'Inside',
      statusColor: 'bg-yellow-500'
    },
    {
      tripId: '#TR-8890',
      vehicle: 'MH14-X-9988',
      vendor: 'Local Supplier',
      entryTime: 'Today, 08:30 AM',
      exitTime: 'Today, 09:45 AM',
      duration: '1h 15m',
      status: 'Completed',
      statusColor: 'bg-green-500'
    },
    {
      tripId: '#TR-8889',
      vehicle: 'MH12-AB-1234',
      vendor: 'Unknown',
      entryTime: 'Yesterday, 11:20 PM',
      exitTime: '--',
      duration: '--',
      status: 'Denied',
      statusColor: 'bg-red-500'
    },
    {
      tripId: '#TR-8888',
      vehicle: 'DL04-CC-5511',
      vendor: 'DHL Express',
      entryTime: 'Yesterday, 04:15 PM',
      exitTime: 'Yesterday, 06:30 PM',
      duration: '2h 15m',
      status: 'Completed',
      statusColor: 'bg-green-500'
    },
    {
      tripId: '#TR-8887',
      vehicle: 'MH02-ZZ-0001',
      vendor: 'Gati KWE',
      entryTime: 'Yesterday, 02:00 PM',
      exitTime: 'Yesterday, 03:45 PM',
      duration: '1h 45m',
      status: 'Completed',
      statusColor: 'bg-green-500'
    }
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleViewDetails = (tripId) => {
    console.log('View details for trip:', tripId);
  };

  const handleExportReport = () => {
    console.log('Exporting report...');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    console.log('Changed to page:', page);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar/>
     

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Access Logs</h1>
              <p className="text-gray-500 text-sm mt-1">History of all vehicle movements</p>
            </div>
            <button 
              onClick={handleExportReport}
              className="flex items-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-5 py-2.5 rounded-lg font-semibold transition-colors"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Filter Bar */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search Vehicle No..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Date Filter */}
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>Custom Range</option>
                </select>

                {/* Status Filter */}
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  <option>Status: All</option>
                  <option>Completed</option>
                  <option>Inside</option>
                  <option>Denied</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trip ID</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vehicle</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Entry Time</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Exit Time</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {accessLogs.map((log, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {/* Trip ID */}
                      <td className="px-6 py-4">
                        <span className="text-gray-500 font-mono text-sm">{log.tripId}</span>
                      </td>

                      {/* Vehicle */}
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">{log.vehicle}</span>
                      </td>

                      {/* Vendor */}
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{log.vendor}</span>
                      </td>

                      {/* Entry Time */}
                      <td className="px-6 py-4">
                        <span className="text-gray-900">{log.entryTime}</span>
                      </td>

                      {/* Exit Time */}
                      <td className="px-6 py-4">
                        <span className={`${log.exitTime === '--' ? 'text-blue-600 font-semibold' : 'text-gray-900'}`}>
                          {log.exitTime}
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-4">
                        <span className={`${log.duration === 'Active' ? 'text-blue-600 font-semibold' : log.duration === '--' ? 'text-gray-400' : 'text-gray-900'}`}>
                          {log.duration}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${log.statusColor}`}>
                          {log.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(log.tripId)}
                          className="text-gray-700 hover:text-gray-900 font-medium text-sm"
                        >
                          View<br/>Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-semibold">1</span> to <span className="font-semibold">6</span> of <span className="font-semibold">128</span> entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                
                <button
                  onClick={() => handlePageChange(1)}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium"
                >
                  1
                </button>
                
                <button
                  onClick={() => handlePageChange(2)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  2
                </button>
                
                <button
                  onClick={() => handlePageChange(3)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  3
                </button>
                
                <span className="px-3 text-gray-500">...</span>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessLogs;