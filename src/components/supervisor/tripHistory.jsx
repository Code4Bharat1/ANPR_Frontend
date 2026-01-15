// components/supervisor/tripHistory.jsx
"use client";
import React, { useState, useEffect } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  Search, Filter, Download, Eye, Calendar, Loader2,
  FileText, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight,
  X, AlertCircle
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const TripHistory = () => {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('last7days');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const tripsPerPage = 10;

  useEffect(() => {
    fetchTripHistory();
  }, [dateFilter]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, trips]);

  const fetchTripHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');
      
      console.log('🔍 Fetching trips with period:', dateFilter);
      console.log('📍 API URL:', `${API_URL}/api/trips/history?period=${dateFilter}`);
      
      const response = await axios.get(
        `${API_URL}/api/trips/history?period=${dateFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ Trip history response:', response.data);
      
      const data = response.data.data || response.data || [];
      console.log('📊 Trips received:', data.length);
      
      if (data.length > 0) {
        console.log('🔍 First trip sample:', data[0]);
      }
      
      setTrips(data);
    } catch (error) {
      console.error('❌ Error fetching trip history:', error);
      console.error('Error response:', error.response?.data);
      
      setError(error.response?.data?.message || 'Failed to fetch trip history. Please try again.');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...trips];

    if (searchQuery.trim()) {
      filtered = filtered.filter(trip => {
        const searchLower = searchQuery.toLowerCase();
        return (
          (trip.vehicleNumber || '').toLowerCase().includes(searchLower) ||
          (trip.vendor || '').toLowerCase().includes(searchLower) ||
          (trip.tripId || '').toLowerCase().includes(searchLower)
        );
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(trip => trip.status === statusFilter);
    }

    setFilteredTrips(filtered);
    setCurrentPage(1);
  };

  const handleExportReport = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      alert('Exporting report... (Feature to be implemented)');
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report');
    }
  };

  const handleViewDetails = (trip) => {
    console.log('📋 Viewing trip details:', trip);
    setSelectedTrip(trip);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const configs = {
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed', icon: CheckCircle },
      active: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Inside', icon: Clock },
      inside: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Inside', icon: Clock },
      // denied: { bg: 'bg-red-100', text: 'text-red-700', label: 'Denied', icon: XCircle }
    };
    
    const config = configs[status?.toLowerCase()] || configs.active;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);

  const stats = {
    total: trips.length,
    completed: trips.filter(t => t.status === 'completed').length,
    active: trips.filter(t => t.status === 'active' || t.status === 'inside').length,
    denied: trips.filter(t => t.status === 'denied').length
  };

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Access Logs</h1>
            <p className="text-sm sm:text-base text-gray-600">History of all vehicle movements</p>
          </div>
          <button
            onClick={handleExportReport}
            className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            Export Report
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-2 border-red-400 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-red-900 mb-1 text-sm sm:text-base">Error Loading Trips</h3>
              <p className="text-red-700 text-xs sm:text-sm break-words">{error}</p>
            </div>
            <button
              onClick={fetchTripHistory}
              className="px-3 py-1 bg-red-600 text-white rounded text-xs sm:text-sm font-semibold hover:bg-red-700 flex-shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
            <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Total Trips</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 sm:p-5 border border-green-200 shadow-sm">
            <div className="text-xs sm:text-sm text-green-700 font-medium mb-1">Completed</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-700">{stats.completed}</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 sm:p-5 border border-blue-200 shadow-sm">
            <div className="text-xs sm:text-sm text-blue-700 font-medium mb-1">Active</div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-700">{stats.active}</div>
          </div>
          {/* <div className="bg-red-50 rounded-xl p-4 sm:p-5 border border-red-200 shadow-sm">
            <div className="text-xs sm:text-sm text-red-700 font-medium mb-1">Denied</div>
            <div className="text-2xl sm:text-3xl font-bold text-red-700">{stats.denied}</div>
          </div> */}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Vehicle No, Vendor, Trip ID..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold"
            >
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold"
            >
              <option value="all">Status: All ({trips.length})</option>
              <option value="completed">Completed ({stats.completed})</option>
              <option value="active">Active ({stats.active})</option>
              {/* <option value="denied">Denied ({stats.denied})</option> */}
            </select>
          </div>
          <div className="mt-3 text-xs sm:text-sm text-gray-600">
            Showing <span className="font-bold text-blue-600">{filteredTrips.length}</span> of {trips.length} trips
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600">Loading trip history...</p>
            </div>
          ) : currentTrips.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No trips found</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {trips.length === 0
                  ? 'No trip history available for the selected period'
                  : 'Try adjusting your search or filters'}
              </p>
              <button
                onClick={fetchTripHistory}
                className="mt-4 px-4 py-2 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Refresh
              </button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">TRIP ID</th> */}
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">VEHICLE</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">VENDOR</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">ENTRY TIME</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">EXIT TIME</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">DURATION</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">STATUS</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentTrips.map((trip) => (
                      <tr key={trip._id} className="hover:bg-gray-50 transition">
                        {/* <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{trip.tripId || 'N/A'}</div>
                        </td> */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-center text-gray-900">{trip.vehicleNumber || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{trip.vendor || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm ${trip.entryTime === 'Invalid Date' ? 'text-red-600' : 'text-gray-900'}`}>
                            {trip.entryTime || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm ${
                            trip.exitTime === '--' ? 'text-blue-600 font-semibold' : 
                            trip.exitTime === 'Invalid Date' ? 'text-red-600' : 
                            'text-gray-900'
                          }`}>
                            {trip.exitTime || '--'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{trip.duration || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(trip.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleViewDetails(trip)}
                            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-semibold text-sm"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {currentTrips.map((trip) => (
                  <div key={trip._id} className="p-4 hover:bg-gray-50 transition">
                    {/* Trip Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-900 text-base sm:text-lg truncate">{trip.vehicleNumber || 'N/A'}</div>
                        <div className="text-xs sm:text-sm text-gray-500 truncate">ID: {trip.tripId || 'N/A'}</div>
                      </div>
                      {getStatusBadge(trip.status)}
                    </div>

                    {/* Vendor */}
                    <div className="mb-3 pb-3 border-b border-gray-100">
                      <div className="text-xs text-gray-500 mb-0.5">Vendor</div>
                      <div className="text-sm font-semibold text-gray-900 truncate">{trip.vendor || 'N/A'}</div>
                    </div>

                    {/* Time Details */}
                    <div className="grid grid-cols-2 gap-3 mb-3 text-xs sm:text-sm">
                      <div>
                        <div className="text-gray-500 mb-1">Entry Time</div>
                        <div className={`font-semibold ${trip.entryTime === 'Invalid Date' ? 'text-red-600' : 'text-gray-900'}`}>
                          {trip.entryTime || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 mb-1">Exit Time</div>
                        <div className={`font-semibold ${
                          trip.exitTime === '--' ? 'text-blue-600' : 
                          trip.exitTime === 'Invalid Date' ? 'text-red-600' : 
                          'text-gray-900'
                        }`}>
                          {trip.exitTime || '--'}
                        </div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="mb-3 pb-3 border-b border-gray-100">
                      <div className="text-xs text-gray-500 mb-0.5">Duration</div>
                      <div className="font-semibold text-sm text-gray-900">{trip.duration || 'N/A'}</div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleViewDetails(trip)}
                      className="w-full px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition font-semibold"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
                  {/* Mobile Pagination */}
                  <div className="lg:hidden">
                    <div className="text-xs sm:text-sm text-gray-600 text-center mb-3">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm">
                        {currentPage}
                      </span>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop Pagination */}
                  <div className="hidden lg:flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {indexOfFirstTrip + 1} to {Math.min(indexOfLastTrip, filteredTrips.length)} of {filteredTrips.length} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      
                      {[...Array(totalPages)].map((_, idx) => {
                        const pageNum = idx + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                        }
                        return null;
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedTrip && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden">
              <div className="bg-blue-600 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between rounded-t-2xl">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-white">Trip Details</h2>
                  <p className="text-blue-100 text-xs sm:text-sm truncate">{selectedTrip.tripId}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition text-white flex-shrink-0 ml-2"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="text-xs text-gray-500 mb-1">Vehicle Number</div>
                      <div className="text-base sm:text-lg font-bold text-gray-900 truncate">{selectedTrip.vehicleNumber || 'N/A'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <div>{getStatusBadge(selectedTrip.status)}</div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 sm:p-5">
                    <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Trip Information</h3>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-600">Trip ID</span>
                        <span className="font-semibold text-gray-900 text-right truncate">{selectedTrip.tripId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-600">Vendor</span>
                        <span className="font-semibold text-gray-900 text-right truncate">{selectedTrip.vendor || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-600">Driver</span>
                        <span className="font-semibold text-gray-900 text-right truncate">{selectedTrip.driver || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-600">Material Type</span>
                        <span className="font-semibold text-gray-900 text-right truncate">{selectedTrip.materialType || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-600">Entry Time</span>
                        <span className="font-semibold text-gray-900 text-right">{selectedTrip.entryTime || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-600">Exit Time</span>
                        <span className="font-semibold text-gray-900 text-right">{selectedTrip.exitTime || '--'}</span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-semibold text-gray-900 text-right">{selectedTrip.duration || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </SupervisorLayout>
  );
};

export default TripHistory;