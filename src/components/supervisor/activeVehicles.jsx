// components/supervisor/activeVehicles.jsx
"use client";
import React, { useState, useEffect } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  Search, Filter, Car, Clock, Package, Eye, ArrowRight,
  Loader2, TrendingUp, MapPin, User, Building2, X, Calendar,
  LogOut, LogIn, Camera, Video, Users, Shield,
  RefreshCw, ChevronRight, AlertCircle, BarChart3, Truck,
  CheckCircle, ExternalLink, Download, MoreVertical, Timer,
  ToolCase
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ActiveVehicles = () => {
  const router = useRouter();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [mediaLoading, setMediaLoading] = useState(false);
  const [resolvedEntryMedia, setResolvedEntryMedia] = useState({ photos: {}, video: null });
  const [resolvedExitMedia, setResolvedExitMedia] = useState({ photos: {}, video: null });

  useEffect(() => {
    fetchActiveVehicles();
    const interval = setInterval(fetchActiveVehicles, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterStatus, vehicles]);

  // In your activeVehicles.jsx component

  const fetchActiveVehicles = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('accessToken');

      // 🔥 Make sure this endpoint returns trips with entryMedia
      const response = await axios.get(`${API_URL}/api/supervisor/vehicles/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = response.data.data || response.data || [];
      const vehiclesArray = Array.isArray(data) ? data : [];

      console.log('📥 Fetched vehicles:', vehiclesArray.length);
      console.log('📸 Sample vehicle media:', vehiclesArray[0]?.entryMedia);

      const vehiclesWithDuration = vehiclesArray.map(vehicle => {
        const entryTime = vehicle.entryAt || vehicle.entryTime;
        const exitTime = vehicle.exitAt || vehicle.exitTime;

        return {
          ...vehicle,
          entryTimestamp: entryTime,
          entryTime: entryTime,
          exitTimestamp: exitTime,
          exitTime: exitTime,
          gate: vehicle.entryGate || 'Main Gate',
          exitGate: vehicle.exitGate || 'N/A',
          materialType: vehicle.loadStatus || vehicle.purpose || 'N/A',
          calculatedDuration: calculateDuration(entryTime, exitTime),
          hasExited: !!exitTime
        };
      });

      console.log('✅ Vehicles with duration:', vehiclesWithDuration.length);
      setVehicles(vehiclesWithDuration);
    } catch (error) {
      console.error('❌ Error fetching active vehicles:', error);
      setVehicles([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
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
      return 'N/A';
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return { date: 'N/A', time: 'N/A', fullDateTime: 'N/A' };
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return { date: 'N/A', time: 'N/A', fullDateTime: 'N/A' };
      const dateStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      return { date: dateStr, time: timeStr, fullDateTime: `${dateStr} ${timeStr}` };
    } catch (error) {
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

  // Replace the handleViewDetails function with this debug version

  const handleViewDetails = async (vehicle) => {
    console.log('🚗 Opening details for vehicle:', vehicle.vehicleNumber);
    console.log('📦 Entry Media Object:', vehicle.entryMedia);
    console.log('📦 Exit Media Object:', vehicle.exitMedia);

    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
    setMediaLoading(true);

    try {
      const token = localStorage.getItem('accessToken');

      // Entry media
      const entryMedia = vehicle.entryMedia || {};
      const entryPhotos = entryMedia.photos || {};
      const resolvedEntryPhotos = {};

      console.log('🔍 Entry Photos Keys:', Object.keys(entryPhotos));

      for (const key in entryPhotos) {
        if (entryPhotos[key]) {
          try {
            const fileKey = entryPhotos[key];
            console.log(`📸 Fetching ${key}:`, fileKey);

            const url = `${API_URL}/api/uploads/get-file`;
            console.log(`🌐 Request URL:`, url);
            console.log(`🔑 File Key:`, fileKey);

            const res = await axios.get(url, {
              params: { key: fileKey },
              headers: { Authorization: `Bearer ${token}` }
            });

            console.log(`✅ ${key} loaded:`, res.data.url);
            resolvedEntryPhotos[key] = res.data.url;
          } catch (err) {
            console.error(`❌ Failed to load ${key}:`, err.response?.data || err.message);
            console.error('Error details:', {
              status: err.response?.status,
              statusText: err.response?.statusText,
              url: err.config?.url,
              params: err.config?.params
            });
          }
        }
      }

      let entryVideoUrl = null;
      if (entryMedia.video) {
        try {
          console.log('🎥 Fetching entry video:', entryMedia.video);
          const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
            params: { key: entryMedia.video },
            headers: { Authorization: `Bearer ${token}` }
          });
          entryVideoUrl = res.data.url;
          console.log('✅ Entry video loaded:', entryVideoUrl);
        } catch (err) {
          console.error('❌ Failed to load entry video:', err.response?.data || err.message);
        }
      }

      setResolvedEntryMedia({ photos: resolvedEntryPhotos, video: entryVideoUrl });
      console.log('🎨 Resolved Entry Media:', { photos: resolvedEntryPhotos, video: entryVideoUrl });

      // Exit media
      const exitMedia = vehicle.exitMedia || {};
      const exitPhotos = exitMedia.photos || {};
      const resolvedExitPhotos = {};

      console.log('🔍 Exit Photos Keys:', Object.keys(exitPhotos));

      for (const key in exitPhotos) {
        if (exitPhotos[key]) {
          try {
            console.log(`📸 Fetching exit ${key}:`, exitPhotos[key]);
            const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
              params: { key: exitPhotos[key] },
              headers: { Authorization: `Bearer ${token}` }
            });
            resolvedExitPhotos[key] = res.data.url;
            console.log(`✅ Exit ${key} loaded`);
          } catch (err) {
            console.error(`❌ Failed to load exit ${key}:`, err.response?.data || err.message);
          }
        }
      }

      let exitVideoUrl = null;
      if (exitMedia.video) {
        try {
          console.log('🎥 Fetching exit video:', exitMedia.video);
          const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
            params: { key: exitMedia.video },
            headers: { Authorization: `Bearer ${token}` }
          });
          exitVideoUrl = res.data.url;
          console.log('✅ Exit video loaded');
        } catch (err) {
          console.error('❌ Failed to load exit video:', err.response?.data || err.message);
        }
      }

      setResolvedExitMedia({ photos: resolvedExitPhotos, video: exitVideoUrl });
      console.log('🎨 Resolved Exit Media:', { photos: resolvedExitPhotos, video: exitVideoUrl });

    } catch (err) {
      console.error('💥 Media resolve failed:', err);
    } finally {
      setMediaLoading(false);
      console.log('✅ Media loading complete');
    }
  };

  // Also add this to check what's stored in the database
  useEffect(() => {
    if (vehicles.length > 0) {
      console.log('🚛 Sample Vehicle Data:', vehicles[0]);
      console.log('📸 Sample Entry Media:', vehicles[0]?.entryMedia);
      console.log('📸 Sample Exit Media:', vehicles[0]?.exitMedia);
    }
  }, [vehicles]);

  const handleMarkExit = (vehicle) => {
    sessionStorage.setItem('exitVehicleData', JSON.stringify({
      ...vehicle,
      exitInitiatedFrom: 'activeVehicles'
    }));
    router.push('/supervisor/exit-vehicles');
  };

  const getStatusBadge = (status) => {
    const configs = {
      loading: { bg: 'bg-gradient-to-r from-blue-100 to-blue-50', text: 'text-blue-700', icon: Package, label: 'Loading' },
      // unloading: { bg: 'bg-gradient-to-r from-green-100 to-green-50', text: 'text-green-700', icon: Package, label: 'Unloading' },
      overstay: { bg: 'bg-gradient-to-r from-orange-100 to-orange-50', text: 'text-orange-700', icon: AlertCircle, label: 'Overstay' },
      // meeting: { bg: 'bg-gradient-to-r from-purple-100 to-purple-50', text: 'text-purple-700', icon: Users, label: 'Meeting' },
      // maintenance: { bg: 'bg-gradient-to-r from-yellow-100 to-yellow-50', text: 'text-yellow-700', icon: ToolCase, label: 'Maintenance' },
      exited: { bg: 'bg-gradient-to-r from-gray-100 to-gray-50', text: 'text-gray-700', icon: CheckCircle, label: 'Exited' }
    };

    const config = configs[status] || configs.loading;
    const Icon = config.icon || Package;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const stats = {
    total: vehicles.length,
    loading: vehicles.filter(v => v.status === 'loading').length,
    // unloading: vehicles.filter(v => v.status === 'unloading').length,
    overstay: vehicles.filter(v => v.status === 'overstay').length,
    // meeting: vehicles.filter(v => v.status === 'meeting').length,
    // maintenance: vehicles.filter(v => v.status === 'maintenance').length,
  };

  const capacityPercentage = Math.min(Math.round((stats.total / 100) * 100), 100);

  if (loading) {
    return (
      <SupervisorLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Loading active vehicles...</p>
          <p className="text-gray-400 text-sm mt-1">Fetching real-time data from the site</p>
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
                  <Car className="w-6 h-6 text-white" />
                </div> */}
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Active Vehicles</h1>
                  <p className="text-gray-600 mt-1">Real-time monitoring of vehicles inside premises</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchActiveVehicles}
                disabled={refreshing}
                className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm font-medium text-gray-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={() => router.push('/supervisor/trip-history')}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold text-sm flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                View Logs
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-8">
          {/* Total Inside Card */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-5 border border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Total Inside</div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-sm">
                <Car className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">Current occupancy</div>
              <div className={`px-2 py-1 rounded text-xs font-semibold ${capacityPercentage > 80 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {capacityPercentage}% capacity
              </div>
            </div>
          </div>

          {/* Loading Card */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-5 border border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Loading</div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-sm">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.loading}</div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">Active loading</div>
              <div className={`px-2 py-1 rounded text-xs font-semibold ${stats.loading > 0 ? 'bg-blue-100 text-blue-700' : 'text-gray-400'}`}>
                {stats.loading > 0 ? `${stats.loading} active` : 'None'}
              </div>
            </div>
          </div>

          {/* Overstay Alert Card */}
          <div className="bg-gradient-to-br from-white to-orange-50 rounded-xl p-5 border border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Overstay Alert</div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-sm">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.overstay}</div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">Exceeded time</div>
              <div className={`px-2 py-1 rounded text-xs font-semibold ${stats.overstay > 0 ? 'bg-orange-100 text-orange-700' : 'text-gray-400'}`}>
                {stats.overstay > 0 ? 'Attention needed' : 'All clear'}
              </div>
            </div>
          </div>

          {/* Unloading Card */}
          {/* <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-5 border border-green-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-gray-600 font-medium">Unloading</div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.unloading}</div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">Active unloading</div>
              <div className={`px-2 py-1 rounded text-xs font-semibold ${stats.unloading > 0 ? 'bg-green-100 text-green-700' : 'text-gray-400'}`}>
                {stats.unloading > 0 ? `${stats.unloading} active` : 'None'}
              </div>
            </div>
          </div> */}
        </div>

        {/* Enhanced Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicle number, vendor, driver..."
                className="w-full pl-12 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
              >
                <option value="all">All Status ({vehicles.length})</option>
                <option value="loading">Loading ({stats.loading})</option>
                {/* <option value="unloading">Unloading ({stats.unloading})</option> */}
                <option value="overstay">Overstay ({stats.overstay})</option>
                {/* <option value="meeting">Meeting ({stats.meeting})</option> */}
                {/* <option value="maintenance">Maintenance ({stats.maintenance})</option> */}
              </select>

              <div className="flex items-center gap-2 bg-blue-50 px-4 py-3 rounded-lg">
                <Filter className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  Showing {filteredVehicles.length} of {vehicles.length} vehicles
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Vehicles List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {filteredVehicles.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Car className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No vehicles found</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {vehicles.length === 0
                  ? 'No vehicles are currently inside the premises. All vehicles have exited.'
                  : 'No vehicles match your search criteria. Try adjusting your filters.'}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={fetchActiveVehicles}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                {searchQuery || filterStatus !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterStatus('all');
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
                      {['S.No.', 'Vehicle Details', 'Vendor & Driver', 'Entry Time', 'Exit Time', 'Duration', 'Status', 'Actions'].map((header, idx) => (
                        <th key={idx} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredVehicles.map((vehicle, index) => {
                      const entryDateTime = formatDateTime(vehicle.entryTimestamp);
                      const exitDateTime = formatDateTime(vehicle.exitTimestamp);
                      const duration = calculateDuration(vehicle.entryTimestamp, vehicle.exitTimestamp);

                      return (
                        <tr key={vehicle._id} className="hover:bg-gray-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-700 text-center">{index + 1}</div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
                                <Truck className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{vehicle.vehicleNumber || 'N/A'}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {vehicle.gate}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-900">{vehicle.vendor || 'Unknown'}</div>
                              <div className="text-xs text-gray-500 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {vehicle.driver || 'N/A'}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center">
                                <LogIn className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{entryDateTime.time}</div>
                                <div className="text-xs text-gray-500">{entryDateTime.date}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {vehicle.exitTimestamp ? (
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-red-100 to-red-50 rounded-lg flex items-center justify-center">
                                  <LogOut className="w-4 h-4 text-red-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{exitDateTime.time}</div>
                                  <div className="text-xs text-gray-500">{exitDateTime.date}</div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400 italic">Inside Premises</div>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
                                <Timer className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <div className={`font-semibold ${vehicle.status === 'overstay' ? 'text-orange-600' : 'text-gray-900'}`}>
                                  {duration}
                                </div>
                                <div className="text-xs text-gray-500">Inside</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            {getStatusBadge(vehicle.status || 'loading')}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleViewDetails(vehicle)}
                                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium text-sm flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                Details
                              </button>
                              {!vehicle.hasExited && (
                                <button
                                  onClick={() => handleMarkExit(vehicle)}
                                  className="px-4 py-2 text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg transition font-medium text-sm flex items-center gap-2"
                                >
                                  <LogOut className="w-4 h-4" />
                                  Exit
                                </button>
                              )}
                            </div>
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
                  const duration = calculateDuration(vehicle.entryTimestamp, vehicle.exitTimestamp);

                  return (
                    <div key={vehicle._id} className="p-5 hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-b-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                            <Truck className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-lg">{vehicle.vehicleNumber || 'N/A'}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {vehicle.gate}
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(vehicle.status || 'loading')}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">Vendor</div>
                          <div className="font-semibold text-gray-900">{vehicle.vendor || 'Unknown'}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">Driver</div>
                          <div className="font-semibold text-gray-900">{vehicle.driver || 'N/A'}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <LogIn className="w-4 h-4 text-green-600" />
                            <div className="text-xs text-gray-500">Entry</div>
                          </div>
                          <div className="font-semibold text-gray-900">{entryDateTime.time}</div>
                          <div className="text-xs text-gray-500">{entryDateTime.date}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <LogOut className="w-4 h-4 text-red-600" />
                            <div className="text-xs text-gray-500">Exit</div>
                          </div>
                          {vehicle.exitTimestamp ? (
                            <>
                              <div className="font-semibold text-gray-900">{exitDateTime.time}</div>
                              <div className="text-xs text-gray-500">{exitDateTime.date}</div>
                            </>
                          ) : (
                            <div className="text-sm text-gray-400 italic">Inside Premises</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-purple-600" />
                          <div>
                            <div className={`font-semibold ${vehicle.status === 'overstay' ? 'text-orange-600' : 'text-gray-900'}`}>
                              {duration}
                            </div>
                            <div className="text-xs text-gray-500">Duration Inside</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(vehicle)}
                          className="flex-1 px-4 py-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Details
                        </button>
                        {!vehicle.hasExited && (
                          <button
                            onClick={() => handleMarkExit(vehicle)}
                            className="flex-1 px-4 py-2.5 text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2"
                          >
                            <LogOut className="w-4 h-4" />
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

        {/* Enhanced Details Modal */}
        {showDetailsModal && selectedVehicle && (() => {
          const entryDateTime = formatDateTime(selectedVehicle.entryTime);
          const exitDateTime = formatDateTime(selectedVehicle.exitTimestamp);
          const duration = calculateDuration(selectedVehicle.entryTimestamp, selectedVehicle.exitTimestamp);
          const entryVideo = resolvedEntryMedia.video;
          const exitVideo = resolvedExitMedia.video;

          const photoFields = [
            { key: 'frontView', label: 'Front View', description: 'Vehicle front side' },
            { key: 'backView', label: 'Back View', description: 'Vehicle rear side' },
            { key: 'loadView', label: 'Load Area', description: 'Cargo/load area' },
            { key: 'driverView', label: 'Driver', description: 'Driver identification' }
          ];

          return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">Vehicle Details</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="text-blue-100 text-sm">{selectedVehicle.vehicleNumber}</div>
                      {getStatusBadge(selectedVehicle.status || 'loading')}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-blue-600 font-medium mb-2">VEHICLE INFORMATION</div>
                            <div className="text-2xl font-bold text-gray-900 mb-1">{selectedVehicle.vehicleNumber}</div>
                            <div className="text-sm text-gray-600">{selectedVehicle.vehicleType || 'Unknown Type'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-blue-600 font-medium mb-2">VENDOR & DRIVER</div>
                            <div className="font-semibold text-gray-900 mb-1">{selectedVehicle.vendor || 'Unknown'}</div>
                            <div className="text-sm text-gray-600">Driver: {selectedVehicle.driver || 'N/A'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 c">
                        <div className="text-xs text-gray-500 mb-2">Material Details
                          <span className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-700 font-semibold">
                            {selectedVehicle.loadStatus ?? "N/A"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Type:</span>{" "}
                            <span className="font-semibold text-gray-900">
                              {selectedVehicle.purpose ?? "N/A"}
                            </span>
                          </div>

                          <div>
                            <span className="text-gray-500">Count:</span>{" "}
                            <span className="font-semibold text-gray-900">
                              {selectedVehicle.countofmaterials ?? "N/A"}
                            </span>
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
                              <div className="font-bold text-gray-900">{entryDateTime.time}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">{entryDateTime.date}</div>
                          <div className="text-xs text-gray-500 mt-1">Gate: {selectedVehicle.gate}</div>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Timer className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-700">Duration Inside</div>
                              <div className="font-bold text-gray-900">{duration}</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">Time spent inside premises</div>
                        </div>

                        {selectedVehicle.exitTimestamp ? (
                          <div className="bg-gradient-to-r from-red-50 to-white border border-red-100 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <LogOut className="w-5 h-5 text-red-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700">Exit Time</div>
                                <div className="font-bold text-gray-900">{exitDateTime.time}</div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">{exitDateTime.date}</div>
                            <div className="text-xs text-gray-500 mt-1">Exit Gate: {selectedVehicle.exitGate}</div>
                          </div>
                        ) : (
                          <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Car className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-700">Current Status</div>
                                <div className="font-bold text-gray-900">Inside Premises</div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">Vehicle is currently inside</div>
                          </div>
                        )}
                      </div>

                      {/* Entry Evidence Section */}
                      <div className="border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Camera className="w-5 h-5 text-green-600" />
                            Entry Evidence
                          </h3>
                          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">4 Photos Required</span>
                        </div>

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

                        {entryVideo && (
                          <button
                            onClick={() => window.open(entryVideo, '_blank')}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                          >
                            <Video className="w-5 h-5" />
                            View Entry Video Evidence
                          </button>
                        )}
                      </div>

                      {/* Exit Evidence Section (if available) */}
                      {selectedVehicle.exitTimestamp && (
                        <div className="border border-gray-200 rounded-xl p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                              <Camera className="w-5 h-5 text-red-600" />
                              Exit Evidence
                            </h3>
                            <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">4 Photos Required</span>
                          </div>

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

                          {exitVideo && (
                            <button
                              onClick={() => window.open(exitVideo, '_blank')}
                              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                            >
                              <Video className="w-5 h-5" />
                              View Exit Video Evidence
                            </button>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowDetailsModal(false)}
                          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                        >
                          Close
                        </button>
                        {!selectedVehicle.hasExited && (
                          <button
                            onClick={() => {
                              setShowDetailsModal(false);
                              handleMarkExit(selectedVehicle);
                            }}
                            className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition font-medium flex items-center justify-center gap-2"
                          >
                            <LogOut className="w-5 h-5" />
                            Mark Exit
                          </button>
                        )}
                      </div>
                    </>
                  )}
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