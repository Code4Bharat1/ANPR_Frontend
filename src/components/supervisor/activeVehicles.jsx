// components/supervisor/activeVehicles.jsx
"use client";
import React, { useState, useEffect } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  Search, Filter, Car, Clock, Package, Eye, ArrowRight,
  Loader2, TrendingUp, MapPin, User, Building2, X, Calendar,
  LogOut, LogIn,
  Camera,
  Video
} from 'lucide-react';
import { useRouter } from 'next/navigation';
// Import the getDownloadUrl function
import { getDownloadUrl } from '@/utils/wasabiUpload';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ActiveVehicles = () => {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  // Add state for media loading
  const [mediaLoading, setMediaLoading] = useState(false);
  const [resolvedEntryMedia, setResolvedEntryMedia] = useState({
    photos: {},
    video: null
  });

  const [resolvedExitMedia, setResolvedExitMedia] = useState({
    photos: {},
    video: null
  });


  useEffect(() => {
    fetchActiveVehicles();
    // Auto refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchActiveVehicles, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update current time every second for live duration updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterStatus, vehicles]);

  const fetchActiveVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/api/supervisor/vehicles/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // console.log('📥 API Response:', response.data);

      const data = response.data.data || response.data || [];
      const vehiclesArray = Array.isArray(data) ? data : [];

      // console.log('🚗 Vehicles received:', vehiclesArray.length);

      // Map backend fields to frontend fields and calculate duration
      const vehiclesWithDuration = vehiclesArray.map(vehicle => {
        // Backend sends: entryTimeUTC, entryTimeIST, exitTimeUTC (if exited)
        const entryTime = vehicle.entryTimeISO || vehicle.entryTimeUTC || vehicle.entryTimeIST || vehicle.entryAt || vehicle.entryTime;
        const exitTime = vehicle.exitTimeUTC || vehicle.exitTimeIST || vehicle.exitAt || vehicle.exitTime;

        // console.log('🔍 Processing vehicle:', {
        //   vehicleNumber: vehicle.vehicleNumber,
        //   entryTimeUTC: vehicle.entryTimeUTC,
        //   entryTimeIST: vehicle.entryTimeIST,
        //   hasExit: !!exitTime
        // });

        return {
          ...vehicle,
          // Normalize field names for component
          entryTimestamp: entryTime,
          entryTime: entryTime,
          exitTimestamp: exitTime,
          exitTime: exitTime,
          gate: vehicle.entryGate || vehicle.gate || 'N/A',
          exitGate: vehicle.exitGate || 'N/A',
          materialType: vehicle.loadStatus || vehicle.materialType || 'N/A',
          // Calculate real-time duration (will update every 30 seconds)
          calculatedDuration: calculateDuration(entryTime, exitTime),
          hasExited: !!exitTime
        };
      });

      // console.log('✅ Processed vehicles:', vehiclesWithDuration);
      setVehicles(vehiclesWithDuration);
    } catch (error) {
      console.error('❌ Error fetching active vehicles:', error);
      console.error('Error details:', error.response?.data);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate duration from entry time to now or exit time
  const calculateDuration = (entryTime, exitTime = null) => {
    if (!entryTime) return 'N/A';

    try {
      const entry = new Date(entryTime);
      const end = exitTime ? new Date(exitTime) : new Date();
      const diffMs = end - entry;

      if (diffMs < 0) return '0h 0m';

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      return `${hours}h ${minutes}m`;
    } catch (error) {
      console.error('Duration calculation error:', error);
      return 'N/A';
    }
  };

  // Format date and time separately
  const formatDateTime = (timestamp) => {
    if (!timestamp) return { date: 'N/A', time: 'N/A', fullDateTime: 'N/A' };

    try {
      const date = new Date(timestamp);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return { date: 'N/A', time: 'N/A', fullDateTime: 'N/A' };
      }

      const dateStr = date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const timeStr = date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      const fullDateTime = `${dateStr} ${timeStr}`;

      return { date: dateStr, time: timeStr, fullDateTime };
    } catch (error) {
      console.error('Date formatting error:', error, timestamp);
      return { date: 'N/A', time: 'N/A', fullDateTime: 'N/A' };
    }
  };

  const applyFilters = () => {
    let filtered = [...vehicles];

    if (searchQuery.trim()) {
      filtered = filtered.filter(v =>
        (v.vehicleNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.vendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.driver || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(v => v.status === filterStatus);
    }

    setFilteredVehicles(filtered);
  };

  // Updated handleViewDetails to load media URLs
  const handleViewDetails = async (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
    setMediaLoading(true);

    try {
      // ---------- ENTRY MEDIA ----------
      const entryMedia = vehicle.entryMedia || {};
      const entryPhotos = entryMedia.photos || {};
      const resolvedEntryPhotos = {};

      for (const key in entryPhotos) {
        if (entryPhotos[key]) {
          const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
            params: { key: entryPhotos[key] }
          });
          resolvedEntryPhotos[key] = res.data.url;
        }
      }

      let entryVideoUrl = null;
      if (entryMedia.video) {
        const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
          params: { key: entryMedia.video }
        });
        entryVideoUrl = res.data.url;
      }

      setResolvedEntryMedia({
        photos: resolvedEntryPhotos,
        video: entryVideoUrl
      });

      // ---------- EXIT MEDIA ----------
      const exitMedia = vehicle.exitMedia || {};
      const exitPhotos = exitMedia.photos || {};
      const resolvedExitPhotos = {};

      for (const key in exitPhotos) {
        if (exitPhotos[key]) {
          const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
            params: { key: exitPhotos[key] }
          });
          resolvedExitPhotos[key] = res.data.url;
        }
      }

      let exitVideoUrl = null;
      if (exitMedia.video) {
        const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
          params: { key: exitMedia.video }
        });
        exitVideoUrl = res.data.url;
      }

      setResolvedExitMedia({
        photos: resolvedExitPhotos,
        video: exitVideoUrl
      });

    } catch (err) {
      console.error("❌ Media resolve failed", err);
    } finally {
      setMediaLoading(false);
    }
  };


  const handleMarkExit = (vehicle) => {
    // Store vehicle data in sessionStorage for exit screen
    sessionStorage.setItem('exitVehicleData', JSON.stringify({
      ...vehicle,
      exitInitiatedFrom: 'activeVehicles'
    }));
    router.push('/supervisor/exit-vehicles');
  };

  const getStatusBadge = (status) => {
    const configs = {
      loading: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Loading' },
      unloading: { bg: 'bg-green-100', text: 'text-green-700', label: 'Unloading' },
      overstay: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Overstay' },
      meeting: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Meeting' },
      maintenance: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Maintenance' },
      exited: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Exited' }
    };

    const config = configs[status] || configs.loading;
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const stats = {
    total: vehicles.length,
    loading: vehicles.filter(v => v.status === 'loading').length,
    overstay: vehicles.filter(v => v.status === 'overstay').length
  };

  const capacityPercentage = Math.min(Math.round((stats.total / 100) * 100), 100);

  // Function to get media URL with proper error handling
  const getMediaUrl = async (fileKey) => {
    if (!fileKey) return null;

    try {
      const url = await getDownloadUrl(fileKey);
      return url;
    } catch (error) {
      console.error('Error getting media URL:', error);
      return null;
    }
  };

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Active Vehicles</h1>
          <p className="text-sm sm:text-base text-gray-600">Monitoring vehicles currently inside premises</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Total Inside</div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Car className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">{capacityPercentage}% Capacity</div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Loading/Unloading</div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.loading}</div>
            <div className="text-xs text-gray-500 mt-1">Active operations</div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-200 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Overstay Alert</div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.overstay}</div>
            <div className="text-xs text-orange-600 mt-1">{stats.overstay > 0 ? 'Needs attention' : 'All clear'}</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm mb-4 sm:mb-6">
          <div className="flex flex-col gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicle, vendor, driver..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold"
            >
              <option value="all">Status: All ({vehicles.length})</option>
              <option value="loading">Loading ({vehicles.filter(v => v.status === 'loading').length})</option>
              <option value="unloading">Unloading ({vehicles.filter(v => v.status === 'unloading').length})</option>
              <option value="overstay">Overstay ({vehicles.filter(v => v.status === 'overstay').length})</option>
              <option value="meeting">Meeting ({vehicles.filter(v => v.status === 'meeting').length})</option>
              <option value="maintenance">Maintenance ({vehicles.filter(v => v.status === 'maintenance').length})</option>
            </select>
          </div>
          <div className="mt-3 text-xs sm:text-sm text-gray-600">
            Showing <span className="font-bold text-blue-600">{filteredVehicles.length}</span> of {vehicles.length} vehicles
          </div>
        </div>

        {/* Vehicles List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600">Loading vehicles...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <Car className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No vehicles found</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {vehicles.length === 0
                  ? 'No vehicles currently inside the premises'
                  : 'Try adjusting your search or filters'}
              </p>
              <button
                onClick={fetchActiveVehicles}
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
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Vehicle Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Vendor / Agency
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Entry Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Exit Time
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredVehicles.map((vehicle) => {
                      const entryDateTime = formatDateTime(vehicle.entryTimestamp);
                      const exitDateTime = formatDateTime(vehicle.exitTimestamp);
                      const duration = calculateDuration(
                        vehicle.entryTimestamp,
                        vehicle.exitTimestamp
                      );

                      return (
                        <tr key={vehicle._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-bold text-gray-900">{vehicle.vehicleNumber || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{vehicle.vehicleType || 'Unknown'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-900">{vehicle.vendor || 'Unknown'}</div>
                              <div className="text-xs text-gray-500">Driver: {vehicle.driver || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-900 flex items-center gap-1">
                                <LogIn className="w-3 h-3 text-green-600" />
                                {entryDateTime.time}
                              </div>
                              <div className="text-xs text-gray-500">{entryDateTime.date}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              {vehicle.exitTimestamp ? (
                                <>
                                  <div className="font-semibold text-gray-900 flex items-center gap-1">
                                    <LogOut className="w-3 h-3 text-red-600" />
                                    {exitDateTime.time}
                                  </div>
                                  <div className="text-xs text-gray-500">{exitDateTime.date}</div>
                                </>
                              ) : (
                                <div className="text-sm text-gray-400 italic">Still Inside</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`font-semibold ${vehicle.status === 'overstay' ? 'text-orange-600' : 'text-gray-900'
                              }`}>
                              {duration}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(vehicle.status || 'loading')}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => handleViewDetails(vehicle)}
                              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-semibold text-sm inline-flex items-center gap-1"
                            >
                              Details
                            </button>
                            {!vehicle.hasExited && (
                              <button
                                onClick={() => handleMarkExit(vehicle)}
                                className="px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition font-semibold text-sm inline-flex items-center gap-1"
                              >
                                Allow Exit
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {filteredVehicles.map((vehicle) => {
                  const entryDateTime = formatDateTime(vehicle.entryTimestamp);
                  const exitDateTime = formatDateTime(vehicle.exitTimestamp);
                  const duration = calculateDuration(
                    vehicle.entryTimestamp,
                    vehicle.exitTimestamp
                  );

                  return (
                    <div key={vehicle._id} className="p-4 hover:bg-gray-50 transition">
                      {/* Vehicle Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-bold text-gray-900 text-base sm:text-lg">{vehicle.vehicleNumber || 'N/A'}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{vehicle.vehicleType || 'Unknown'}</div>
                        </div>
                        {getStatusBadge(vehicle.status || 'loading')}
                      </div>

                      {/* Vendor & Driver */}
                      <div className="mb-3 pb-3 border-b border-gray-100">
                        <div className="text-sm font-semibold text-gray-900">{vehicle.vendor || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">Driver: {vehicle.driver || 'N/A'}</div>
                      </div>

                      {/* Time & Duration Info */}
                      <div className="grid grid-cols-2 gap-3 mb-3 text-xs sm:text-sm">
                        <div>
                          <div className="text-gray-500 mb-1 flex items-center gap-1">
                            <LogIn className="w-3 h-3 text-green-600" />
                            Entry
                          </div>
                          <div className="font-semibold text-gray-900">{entryDateTime.time}</div>
                          <div className="text-xs text-gray-500">{entryDateTime.date}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-1 flex items-center gap-1">
                            <LogOut className="w-3 h-3 text-red-600" />
                            Exit
                          </div>
                          {vehicle.exitTimestamp ? (
                            <>
                              <div className="font-semibold text-gray-900">{exitDateTime.time}</div>
                              <div className="text-xs text-gray-500">{exitDateTime.date}</div>
                            </>
                          ) : (
                            <div className="text-gray-400 italic">Still Inside</div>
                          )}
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="mb-3 pb-3 border-b border-gray-100">
                        <div className="text-xs text-gray-500 mb-1">Duration Inside</div>
                        <div className={`font-bold text-sm sm:text-base ${vehicle.status === 'overstay' ? 'text-orange-600' : 'text-gray-900'
                          }`}>
                          {duration}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(vehicle)}
                          className="flex-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition font-semibold"
                        >
                          Details
                        </button>
                        {!vehicle.hasExited && (
                          <button
                            onClick={() => handleMarkExit(vehicle)}
                            className="flex-1 px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition font-semibold"
                          >
                            Allow Exit
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Details Modal */}
     {/* Details Modal */}
{showDetailsModal && selectedVehicle && (() => {
  const entryDateTime = formatDateTime(selectedVehicle.entryTimestamp);
  const exitDateTime = formatDateTime(selectedVehicle.exitTimestamp);
  const duration = calculateDuration(
    selectedVehicle.entryTimestamp,
    selectedVehicle.exitTimestamp
  );

  const entryVideo = resolvedEntryMedia.video;

  const photoFields = [
    { key: 'frontView', label: 'Front View' },
    { key: 'backView', label: 'Back View' },
    { key: 'loadView', label: 'Load Area' },
    { key: 'driverView', label: 'Driver' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden">

        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Vehicle Details</h2>
            <p className="text-blue-100 text-sm">{selectedVehicle.vehicleNumber}</p>
          </div>
          <button onClick={() => setShowDetailsModal(false)}>
            <X className="text-white" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[80vh] space-y-6">

          {/* Entry Info */}
          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-3">Entry Information</h3>
            <div className="text-sm space-y-1">
              <div>Date: <b>{entryDateTime.date}</b></div>
              <div>Time: <b>{entryDateTime.time}</b></div>
              <div>Gate: <b>{selectedVehicle.gate}</b></div>
            </div>
          </div>

          {/* Entry Photos */}
          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-3">Entry Photos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {photoFields.map(photo => {
                const photoUrl = resolvedEntryMedia.photos[photo.key];
                return (
                  <div key={photo.key} className="border rounded overflow-hidden">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        className="h-28 w-full object-cover cursor-pointer"
                        onClick={() => window.open(photoUrl, '_blank')}
                      />
                    ) : (
                      <div className="h-28 flex items-center justify-center text-xs text-gray-400 bg-gray-100">
                        Not Available
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Entry Video */}
          <div className="border rounded-lg p-4">
            <h3 className="font-bold mb-3">Entry Video</h3>
            {entryVideo ? (
              <button
                onClick={() => window.open(entryVideo, '_blank')}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                View Entry Video
              </button>
            ) : (
              <p className="text-sm text-gray-500">No video captured</p>
            )}
          </div>

          {/* Exit Evidence */}
          {selectedVehicle.exitTimestamp && (
            <div className="border rounded-lg p-4">
              <h3 className="font-bold mb-3">Exit Evidence</h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {photoFields.map(photo => {
                  const photoUrl = resolvedExitMedia.photos[photo.key];
                  return (
                    <div key={photo.key} className="border rounded overflow-hidden">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          className="h-24 w-full object-cover cursor-pointer"
                          onClick={() => window.open(photoUrl, '_blank')}
                        />
                      ) : (
                        <div className="h-24 flex items-center justify-center text-xs text-gray-400 bg-gray-100">
                          Not Available
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {resolvedExitMedia.video && (
                <button
                  onClick={() => window.open(resolvedExitMedia.video, '_blank')}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  View Exit Video
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowDetailsModal(false)}
              className="flex-1 bg-gray-100 py-2 rounded"
            >
              Close
            </button>
            {!selectedVehicle.hasExited && (
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleMarkExit(selectedVehicle);
                }}
                className="flex-1 bg-green-600 text-white py-2 rounded"
              >
                Mark Exit
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
})()}

      </div>
    </SupervisorLayout>
  );
};

export default ActiveVehicles;