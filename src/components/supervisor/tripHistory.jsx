// components/supervisor/tripHistory.jsx
"use client";
import React, { useState, useEffect } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  Search, Filter, Download, Eye, Calendar, Loader2,
  FileText, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight,
  X, AlertCircle, Car, Truck, User, Package, MapPin,
  Camera, Video, ExternalLink, RefreshCw, BarChart3,
  ChevronDown, ChevronUp, LogIn, LogOut, Timer, Shield
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const TripHistory = () => {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('last7days');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [resolvedEntryMedia, setResolvedEntryMedia] = useState({ photos: {}, video: null });
  const [resolvedExitMedia, setResolvedExitMedia] = useState({ photos: {}, video: null });
  const [mediaLoading, setMediaLoading] = useState(false);
  const tripsPerPage = 10;
  const [expandedSections, setExpandedSections] = useState({
    entryEvidence: true,
    exitEvidence: true
  });

  useEffect(() => {
    fetchTripHistory();
  }, [dateFilter]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, trips]);

  const fetchTripHistory = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);
      const token = localStorage.getItem('accessToken');

      const response = await axios.get(
        `${API_URL}/api/trips/history?period=${dateFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data.data || response.data || [];
      setTrips(data);
      // console.log(data);
      
    } catch (error) {
      console.error('❌ Error fetching trip history:', error);
      setError(error.response?.data?.message || 'Failed to fetch trip history. Please try again.');
      setTrips([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const handleViewDetails = async (trip) => {
    setSelectedTrip(trip);
    setShowDetailsModal(true);
    setMediaLoading(true);
    
    try {
      const token = localStorage.getItem('accessToken');
      
      // Resolve entry media
      if (trip.entryMedia) {
        const entryPhotos = {};
        const entryMedia = trip.entryMedia.photos || {};
        
        for (const key in entryMedia) {
          if (entryMedia[key]) {
            try {
              const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
                params: { key: entryMedia[key] },
                headers: { Authorization: `Bearer ${token}` }
              });
              entryPhotos[key] = res.data.url;
            } catch (err) {
              console.warn(`Failed to load ${key} photo:`, err);
            }
          }
        }
        
        let entryVideoUrl = null;
        if (trip.entryMedia.video) {
          try {
            const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
              params: { key: trip.entryMedia.video },
              headers: { Authorization: `Bearer ${token}` }
            });
            entryVideoUrl = res.data.url;
          } catch (err) {
            console.warn('Failed to load entry video:', err);
          }
        }
        
        setResolvedEntryMedia({ photos: entryPhotos, video: entryVideoUrl });
      }
      
      // Resolve exit media
      if (trip.exitMedia) {
        const exitPhotos = {};
        const exitMedia = trip.exitMedia.photos || {};
        
        for (const key in exitMedia) {
          if (exitMedia[key]) {
            try {
              const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
                params: { key: exitMedia[key] },
                headers: { Authorization: `Bearer ${token}` }
              });
              exitPhotos[key] = res.data.url;
            } catch (err) {
              console.warn(`Failed to load exit ${key} photo:`, err);
            }
          }
        }
        
        let exitVideoUrl = null;
        if (trip.exitMedia.video) {
          try {
            const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
              params: { key: trip.exitMedia.video },
              headers: { Authorization: `Bearer ${token}` }
            });
            exitVideoUrl = res.data.url;
          } catch (err) {
            console.warn('Failed to load exit video:', err);
          }
        }
        
        setResolvedExitMedia({ photos: exitPhotos, video: exitVideoUrl });
      }
    } catch (err) {
      console.error('Media resolve failed:', err);
    } finally {
      setMediaLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      completed: { 
        bg: 'bg-gradient-to-r from-green-100 to-green-50', 
        text: 'text-green-700', 
        label: 'Completed', 
        icon: CheckCircle 
      },
      active: { 
        bg: 'bg-gradient-to-r from-blue-100 to-blue-50', 
        text: 'text-blue-700', 
        label: 'Inside', 
        icon: Clock 
      },
      inside: { 
        bg: 'bg-gradient-to-r from-blue-100 to-blue-50', 
        text: 'text-blue-700', 
        label: 'Inside', 
        icon: Clock 
      },
    };

    const config = configs[status?.toLowerCase()] || configs.active;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const indexOfLastTrip = currentPage * tripsPerPage;
  const indexOfFirstTrip = indexOfLastTrip - tripsPerPage;
  const currentTrips = filteredTrips.slice(indexOfFirstTrip, indexOfLastTrip);
  const totalPages = Math.ceil(filteredTrips.length / tripsPerPage);

  const stats = {
    total: trips.length,
    completed: trips.filter(t => t.status === 'completed').length,
    active: trips.filter(t => t.status === 'active' || t.status === 'inside').length,
  };

  const photoFields = [
    { key: 'frontView', label: 'Front View', description: 'Vehicle front side' },
    { key: 'backView', label: 'Back View', description: 'Vehicle rear side' },
    { key: 'loadView', label: 'Load Area', description: 'Cargo/load area' },
    { key: 'driverView', label: 'Driver', description: 'Driver identification' }
  ];

  if (loading) {
    return (
      <SupervisorLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading trip history...</p>
          <p className="text-gray-400 text-sm mt-1">Fetching vehicle movement data</p>
        </div>
      </SupervisorLayout>
    );
  }

  return (
    <SupervisorLayout>
      <div className="max-w-5xl ">
        {/* Enhanced Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {/* <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div> */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Access Logs</h1>
                  <p className="text-gray-600 mt-1">Complete history of all vehicle movements</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchTripHistory}
                disabled={refreshing}
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={() => alert('Export feature coming soon')}
                className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition font-semibold text-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-red-900 mb-1">Error Loading Trips</h3>
              <p className="text-red-700 text-sm break-words">{error}</p>
            </div>
            <button
              onClick={fetchTripHistory}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Total Trips</div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-sm">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-xs text-gray-500">All time records</div>
          </div>

          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-5 border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Completed</div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.completed}</div>
            <div className="text-xs text-gray-500">Successfully exited</div>
          </div>

          <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Active</div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-sm">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.active}</div>
            <div className="text-xs text-gray-500">Currently inside</div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Period</div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-slate-500 rounded-xl flex items-center justify-center shadow-sm">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900 mb-1 capitalize">{dateFilter.replace('last', '').replace('days', ' Days')}</div>
            <div className="text-xs text-gray-500">Time range</div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicle number, vendor, trip ID..."
                className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
              >
                <option value="today">Today</option>
                <option value="last7days">Last 7 Days</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
              >
                <option value="all">All Status ({trips.length})</option>
                <option value="completed">Completed ({stats.completed})</option>
                <option value="active">Active ({stats.active})</option>
              </select>
              
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-3 rounded-lg">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  {filteredTrips.length} of {trips.length} trips
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredTrips.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {trips.length === 0
                  ? 'No trip history available for the selected period'
                  : 'No trips match your search criteria. Try adjusting your filters.'}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={fetchTripHistory}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                {searchQuery || statusFilter !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    Clear Filters
                  </button>
                ) : null}
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                    <tr>
                      {['S.No.', 'Vehicle', 'Vendor', 'Entry Time', 'Exit Time', 'Duration', 'Status', 'Actions'].map((header, idx) => (
                        <th key={idx} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentTrips.map((trip, index) => (
                      <tr key={trip._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-700 text-center">{indexOfFirstTrip + index + 1}</div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                              <Truck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">{trip.vehicleNumber || 'N/A'}</div>
                              <div className="text-xs text-gray-500">ID: {trip.tripId || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-semibold text-gray-900">{trip.vendor || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{trip.driver || 'N/A'}</div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                              <LogIn className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {trip.entryTime?.split(',')[1]?.trim() || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {trip.entryTime?.split(',')[0] || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          {trip.exitTime && trip.exitTime !== '--' ? (
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-50 rounded-lg flex items-center justify-center">
                                <LogOut className="w-4 h-4 text-red-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">
                                  {trip.exitTime.split(',')[1]?.trim()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {trip.exitTime.split(',')[0]}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 italic">--</div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                              <Timer className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{trip.duration || 'N/A'}</div>
                              <div className="text-xs text-gray-500">Inside</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          {getStatusBadge(trip.status)}
                        </td>
                        
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewDetails(trip)}
                            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium text-sm flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {currentTrips.map((trip, index) => (
                  <div key={trip._id} className="p-5 hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-b-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                          <Truck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{trip.vehicleNumber || 'N/A'}</div>
                          <div className="text-sm text-gray-500">ID: {trip.tripId || 'N/A'}</div>
                        </div>
                      </div>
                      {getStatusBadge(trip.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">Vendor</div>
                        <div className="font-semibold text-gray-900">{trip.vendor || 'N/A'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-gray-500">Driver</div>
                        <div className="font-semibold text-gray-900">{trip.driver || 'N/A'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <LogIn className="w-4 h-4 text-green-600" />
                          <div className="text-xs text-gray-500">Entry</div>
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">
                          {trip.entryTime?.split(',')[1]?.trim() || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {trip.entryTime?.split(',')[0] || 'N/A'}
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <LogOut className="w-4 h-4 text-red-600" />
                          <div className="text-xs text-gray-500">Exit</div>
                        </div>
                        {trip.exitTime && trip.exitTime !== '--' ? (
                          <>
                            <div className="font-semibold text-gray-900 text-sm">
                              {trip.exitTime.split(',')[1]?.trim()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {trip.exitTime.split(',')[0]}
                            </div>
                          </>
                        ) : (
                          <div className="text-sm text-gray-400 italic">--</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-purple-600" />
                        <div>
                          <div className="font-semibold text-gray-900">{trip.duration || 'N/A'}</div>
                          <div className="text-xs text-gray-500">Duration</div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleViewDetails(trip)}
                      className="w-full px-4 py-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstTrip + 1} to {Math.min(indexOfLastTrip, filteredTrips.length)} of {filteredTrips.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = idx + 1;
                      } else if (currentPage <= 3) {
                        pageNum = idx + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + idx;
                      } else {
                        pageNum = currentPage - 2 + idx;
                      }
                      
                      if (pageNum < 1 || pageNum > totalPages) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium text-sm transition ${currentPage === pageNum
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                              : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Details Modal */}
        {showDetailsModal && selectedTrip && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Trip Details</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="text-blue-100 text-sm">{selectedTrip.vehicleNumber}</div>
                    {getStatusBadge(selectedTrip.status)}
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setResolvedEntryMedia({ photos: {}, video: null });
                    setResolvedExitMedia({ photos: {}, video: null });
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
                {mediaLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading media...</p>
                  </div>
                ) : (
                  <>
                    {/* Vehicle Info Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-blue-600 font-medium mb-2">VEHICLE INFORMATION</div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">{selectedTrip.vehicleNumber}</div>
                          <div className="text-sm text-gray-600">{selectedTrip.vehicleType || 'Unknown Type'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-600 font-medium mb-2">VENDOR</div>
                          <div className="font-semibold text-gray-900 mb-1">{selectedTrip.vendor || 'Unknown'}</div>
                          <div className="text-sm text-gray-600">Driver: {selectedTrip.driver || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-600 font-medium mb-2">TRIP INFO</div>
                          <div className="font-semibold text-gray-900 mb-1">{selectedTrip.tripId || 'N/A'}</div>
                          <div className="text-sm text-gray-600">Material: {selectedTrip.loadStatus || 'N/A'}</div>
                          <div className="text-sm text-gray-600">Type: {selectedTrip.purpose || 'N/A'}</div>
                          <div className="text-sm text-gray-600">Count: {selectedTrip.countOfMaterials || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-r from-green-50 to-white border border-green-100 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <LogIn className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Entry Time</div>
                            <div className="font-bold text-gray-900">
                              {selectedTrip.entryTime?.split(',')[1]?.trim() || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">{selectedTrip.entryTime?.split(',')[0] || 'N/A'}</div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Timer className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Duration</div>
                            <div className="font-bold text-gray-900">{selectedTrip.duration || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">Time spent inside premises</div>
                      </div>

                      <div className={`${selectedTrip.exitTime && selectedTrip.exitTime !== '--' ? 'bg-gradient-to-r from-red-50 to-white border border-red-100' : 'bg-gradient-to-r from-blue-50 to-white border border-blue-100'} rounded-xl p-4`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 ${selectedTrip.exitTime && selectedTrip.exitTime !== '--' ? 'bg-red-100' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
                            <LogOut className={`w-5 h-5 ${selectedTrip.exitTime && selectedTrip.exitTime !== '--' ? 'text-red-600' : 'text-blue-600'}`} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">Exit Time</div>
                            <div className="font-bold text-gray-900">
                              {selectedTrip.exitTime && selectedTrip.exitTime !== '--' 
                                ? selectedTrip.exitTime.split(',')[1]?.trim()
                                : '--'
                              }
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedTrip.exitTime && selectedTrip.exitTime !== '--' 
                            ? selectedTrip.exitTime.split(',')[0]
                            : 'Still Inside'
                          }
                        </div>
                      </div>
                    </div>

                    {/* Entry Evidence Section */}
                    <div className="border border-gray-200 rounded-xl p-5">
                      <button
                        onClick={() => toggleSection('entryEvidence')}
                        className="w-full flex items-center justify-between mb-4"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">Entry Evidence</h3>
                          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">4 Photos Required</span>
                        </div>
                        {expandedSections.entryEvidence ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                      
                      {expandedSections.entryEvidence && (
                        <>
                          <div className="mb-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {photoFields.map(photo => {
                                const photoUrl = resolvedEntryMedia.photos[photo.key];
                                return (
                                  <div key={photo.key} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                    {photoUrl ? (
                                      <div className="cursor-pointer" onClick={() => window.open(photoUrl, '_blank')}>
                                        <img
                                          src={photoUrl}
                                          alt={photo.label}
                                          className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="p-2 bg-gradient-to-t from-black/80 to-transparent relative -mt-12">
                                          <div className="text-white text-xs font-medium">{photo.label}</div>
                                          <div className="text-white/70 text-xs">{photo.description}</div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="h-32 flex flex-col items-center justify-center p-4 bg-gray-50">
                                        <Camera className="w-8 h-8 text-gray-300 mb-2" />
                                        <div className="text-xs text-center">
                                          <div className="font-medium text-gray-500">{photo.label}</div>
                                          <div className="text-gray-400 mt-1">Not available</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {resolvedEntryMedia.video && (
                            <button
                              onClick={() => window.open(resolvedEntryMedia.video, '_blank')}
                              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                            >
                              <Video className="w-5 h-5" />
                              View Entry Video Evidence
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Exit Evidence Section (if available) */}
                    {selectedTrip.exitMedia && (
                      <div className="border border-gray-200 rounded-xl p-5">
                        <button
                          onClick={() => toggleSection('exitEvidence')}
                          className="w-full flex items-center justify-between mb-4"
                        >
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">Exit Evidence</h3>
                            <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">4 Photos Required</span>
                          </div>
                          {expandedSections.exitEvidence ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        
                        {expandedSections.exitEvidence && (
                          <>
                            <div className="mb-6">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {photoFields.map(photo => {
                                  const photoUrl = resolvedExitMedia.photos[photo.key];
                                  return (
                                    <div key={photo.key} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                                      {photoUrl ? (
                                        <div className="cursor-pointer" onClick={() => window.open(photoUrl, '_blank')}>
                                          <img
                                            src={photoUrl}
                                            alt={`Exit ${photo.label}`}
                                            className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                                          />
                                          <div className="p-2 bg-gradient-to-t from-black/80 to-transparent relative -mt-12">
                                            <div className="text-white text-xs font-medium">{photo.label}</div>
                                            <div className="text-white/70 text-xs">{photo.description}</div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="h-32 flex flex-col items-center justify-center p-4 bg-gray-50">
                                          <Camera className="w-8 h-8 text-gray-300 mb-2" />
                                          <div className="text-xs text-center">
                                            <div className="font-medium text-gray-500">{photo.label}</div>
                                            <div className="text-gray-400 mt-1">Not available</div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {resolvedExitMedia.video && (
                              <button
                                onClick={() => window.open(resolvedExitMedia.video, '_blank')}
                                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                              >
                                <Video className="w-5 h-5" />
                                View Exit Video Evidence
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Close Button */}
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setResolvedEntryMedia({ photos: {}, video: null });
                        setResolvedExitMedia({ photos: {}, video: null });
                      }}
                      className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SupervisorLayout>
  );
};

export default TripHistory;