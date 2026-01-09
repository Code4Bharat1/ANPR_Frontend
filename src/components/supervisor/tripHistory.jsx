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
      
      // Log first trip for debugging
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

    // Search filter
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

    // Status filter
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
      // Implementation for CSV/PDF export
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
      denied: { bg: 'bg-red-100', text: 'text-red-700', label: 'Denied', icon: XCircle }
    };
    
    const config = configs[status?.toLowerCase()] || configs.active;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Pagination
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Logs</h1>
            <p className="text-gray-600">History of all vehicle movements</p>
          </div>
          <button
            onClick={handleExportReport}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-1">Error Loading Trips</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={fetchTripHistory}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm font-semibold hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-600 font-medium mb-1">Total Trips</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-200 shadow-sm">
            <div className="text-sm text-green-700 font-medium mb-1">Completed</div>
            <div className="text-3xl font-bold text-green-700">{stats.completed}</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200 shadow-sm">
            <div className="text-sm text-blue-700 font-medium mb-1">Active</div>
            <div className="text-3xl font-bold text-blue-700">{stats.active}</div>
          </div>
          <div className="bg-red-50 rounded-xl p-5 border border-red-200 shadow-sm">
            <div className="text-sm text-red-700 font-medium mb-1">Denied</div>
            <div className="text-3xl font-bold text-red-700">{stats.denied}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Vehicle No, Vendor, Trip ID..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold"
            >
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold"
            >
              <option value="all">Status: All ({trips.length})</option>
              <option value="completed">Completed ({stats.completed})</option>
              <option value="active">Active ({stats.active})</option>
              <option value="denied">Denied ({stats.denied})</option>
            </select>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Showing <span className="font-bold text-blue-600">{filteredTrips.length}</span> of {trips.length} trips
          </div>
        </div>

        {/* Debug Info */}
        {/* {process.env.NODE_ENV === 'development' && trips.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-6 text-xs">
            <div className="font-bold text-yellow-900 mb-2">🐛 Debug Info</div>
            <div className="text-yellow-800">
              <div>Total trips loaded: {trips.length}</div>
              <div>Filtered trips: {filteredTrips.length}</div>
              <div>First trip ID: {trips[0]?.tripId}</div>
              <div>First vehicle: {trips[0]?.vehicleNumber}</div>
            </div>
          </div>
        )} */}

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading trip history...</p>
            </div>
          ) : currentTrips.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-600">
                {trips.length === 0
                  ? 'No trip history available for the selected period'
                  : 'Try adjusting your search or filters'}
              </p>
              <button
                onClick={fetchTripHistory}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Refresh
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">TRIP ID</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">VEHICLE</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">VENDOR</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ENTRY TIME</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">EXIT TIME</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">DURATION</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">STATUS</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentTrips.map((trip) => (
                      <tr key={trip._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{trip.tripId || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{trip.vehicleNumber || 'N/A'}</div>
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
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
              )}
            </>
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedTrip && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden">
              <div className="bg-blue-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-xl font-bold text-white">Trip Details</h2>
                  <p className="text-blue-100 text-sm">{selectedTrip.tripId}</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-500 mb-1">Vehicle Number</div>
                      <div className="text-lg font-bold text-gray-900">{selectedTrip.vehicleNumber || 'N/A'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-500 mb-1">Status</div>
                      <div>{getStatusBadge(selectedTrip.status)}</div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-5">
                    <h3 className="font-bold text-gray-900 mb-4">Trip Information</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trip ID</span>
                        <span className="font-semibold text-gray-900">{selectedTrip.tripId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vendor</span>
                        <span className="font-semibold text-gray-900">{selectedTrip.vendor || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Driver</span>
                        <span className="font-semibold text-gray-900">{selectedTrip.driver || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Material Type</span>
                        <span className="font-semibold text-gray-900">{selectedTrip.materialType || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Entry Time</span>
                        <span className="font-semibold text-gray-900">{selectedTrip.entryTime || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Exit Time</span>
                        <span className="font-semibold text-gray-900">{selectedTrip.exitTime || '--'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-semibold text-gray-900">{selectedTrip.duration || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
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