// components/supervisor/activeVehicles.jsx
"use client";
import React, { useState, useEffect } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  Search, Filter, Car, Clock, Package, Eye, ArrowRight,
  Loader2, TrendingUp, MapPin, User, Building2, X, Calendar,
  LogOut, LogIn
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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
      
      console.log('📥 API Response:', response.data);
      
      const data = response.data.data || response.data || [];
      const vehiclesArray = Array.isArray(data) ? data : [];
      
      console.log('🚗 Vehicles received:', vehiclesArray.length);
      
      // Map backend fields to frontend fields and calculate duration
      const vehiclesWithDuration = vehiclesArray.map(vehicle => {
        // Backend sends: entryTimeUTC, entryTimeIST, exitTimeUTC (if exited)
        const entryTime = vehicle.entryTimeISO || vehicle.entryTimeUTC || vehicle.entryTimeIST || vehicle.entryAt || vehicle.entryTime;
        const exitTime = vehicle.exitTimeUTC || vehicle.exitTimeIST || vehicle.exitAt || vehicle.exitTime;
        
        console.log('🔍 Processing vehicle:', {
          vehicleNumber: vehicle.vehicleNumber,
          entryTimeUTC: vehicle.entryTimeUTC,
          entryTimeIST: vehicle.entryTimeIST,
          hasExit: !!exitTime
        });
        
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
      
      console.log('✅ Processed vehicles:', vehiclesWithDuration);
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
    // console.log(timestamp);
    
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

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
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

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Active Vehicles</h1>
          <p className="text-gray-600">Monitoring vehicles currently inside premises</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 font-medium">Total Inside</div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">{capacityPercentage}% Capacity</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 font-medium">Loading/Unloading</div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.loading}</div>
            <div className="text-xs text-gray-500 mt-1">Active operations</div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600 font-medium">Overstay Alert</div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.overstay}</div>
            <div className="text-xs text-orange-600 mt-1">{stats.overstay > 0 ? 'Needs attention' : 'All clear'}</div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicle, vendor, driver..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold"
            >
              <option value="all">Status: All ({vehicles.length})</option>
              <option value="loading">Loading ({vehicles.filter(v => v.status === 'loading').length})</option>
              <option value="unloading">Unloading ({vehicles.filter(v => v.status === 'unloading').length})</option>
              <option value="overstay">Overstay ({vehicles.filter(v => v.status === 'overstay').length})</option>
              <option value="meeting">Meeting ({vehicles.filter(v => v.status === 'meeting').length})</option>
              <option value="maintenance">Maintenance ({vehicles.filter(v => v.status === 'maintenance').length})</option>
            </select>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Showing <span className="font-bold text-blue-600">{filteredVehicles.length}</span> of {vehicles.length} vehicles
          </div>
        </div>

        {/* Vehicles List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading vehicles...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="p-12 text-center">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No vehicles found</h3>
              <p className="text-gray-600">
                {vehicles.length === 0 
                  ? 'No vehicles currently inside the premises'
                  : 'Try adjusting your search or filters'}
              </p>
              <button
                onClick={fetchActiveVehicles}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                    // Recalculate duration in real-time
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
                          <div className={`font-semibold ${
                            vehicle.status === 'overstay' ? 'text-orange-600' : 'text-gray-900'
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
          )}
        </div>

        {/* Details Modal */}
        {showDetailsModal && selectedVehicle && (() => {
          const entryDateTime = formatDateTime(selectedVehicle.entryTimestamp);
          const exitDateTime = formatDateTime(selectedVehicle.exitTimestamp);
          // Recalculate duration in real-time
          const duration = calculateDuration(
            selectedVehicle.entryTimestamp,
            selectedVehicle.exitTimestamp
          );
          
          return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden">
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                  <div>
                    <h2 className="text-xl font-bold text-white">Vehicle Details</h2>
                    <p className="text-blue-100 text-sm">{selectedVehicle.vehicleNumber || 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                  {/* Vehicle Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-500 mb-1">Vehicle Number</div>
                      <div className="text-lg font-bold text-gray-900">{selectedVehicle.vehicleNumber || 'N/A'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs text-gray-500 mb-1">Vehicle Type</div>
                      <div className="text-lg font-bold text-gray-900">{selectedVehicle.vehicleType || 'Unknown'}</div>
                    </div>
                  </div>

                  {/* Vendor & Driver */}
                  <div className="border border-gray-200 rounded-lg p-5 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      Vendor & Driver Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Vendor / Agency</span>
                        <span className="font-semibold text-gray-900">{selectedVehicle.vendor || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Driver Name</span>
                        <span className="font-semibold text-gray-900">{selectedVehicle.driver || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Driver Phone</span>
                        <span className="font-semibold text-gray-900">{selectedVehicle.driverPhone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Entry & Exit Details */}
                  <div className="border border-gray-200 rounded-lg p-5 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      Entry & Exit Details
                    </h3>
                    <div className="space-y-4 text-sm">
                      {/* Entry Section */}
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <LogIn className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-900">Entry Information</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Date</span>
                            <span className="font-semibold text-gray-900">{entryDateTime.date}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Time</span>
                            <span className="font-semibold text-gray-900">{entryDateTime.time}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Entry Gate</span>
                            <span className="font-semibold text-gray-900">{selectedVehicle.gate || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Exit Section */}
                      <div className={`rounded-lg p-4 ${
                        selectedVehicle.exitTimestamp ? 'bg-red-50' : 'bg-gray-50'
                      }`}>
                        <div className="flex items-center gap-2 mb-3">
                          <LogOut className={`w-4 h-4 ${
                            selectedVehicle.exitTimestamp ? 'text-red-600' : 'text-gray-400'
                          }`} />
                          <span className={`font-semibold ${
                            selectedVehicle.exitTimestamp ? 'text-red-900' : 'text-gray-600'
                          }`}>
                            Exit Information
                          </span>
                        </div>
                        {selectedVehicle.exitTimestamp ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Date</span>
                              <span className="font-semibold text-gray-900">{exitDateTime.date}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Time</span>
                              <span className="font-semibold text-gray-900">{exitDateTime.time}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Exit Gate</span>
                              <span className="font-semibold text-gray-900">{selectedVehicle.exitGate || 'N/A'}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-2">
                            <p className="text-gray-500 italic">Vehicle has not exited yet</p>
                          </div>
                        )}
                      </div>

                      {/* Duration & Status */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <span className="text-gray-600 text-xs">Duration Inside</span>
                          <span className={`font-bold ${
                            selectedVehicle.status === 'overstay' ? 'text-orange-600' : 'text-blue-900'
                          }`}>
                            {duration}
                          </span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                          <span className="text-gray-600 text-xs">Current Status</span>
                          {getStatusBadge(selectedVehicle.status || 'loading')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Material Info */}
                  <div className="border border-gray-200 rounded-lg p-5 mb-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      Material Information
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Material Type</span>
                        <span className="font-semibold text-gray-900">{selectedVehicle.materialType || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Load Status</span>
                        <span className="font-semibold text-gray-900">{selectedVehicle.loadStatus || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Purpose</span>
                        <span className="font-semibold text-gray-900">{selectedVehicle.purpose || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                    >
                      Close
                    </button>
                    {!selectedVehicle.hasExited && (
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          handleMarkExit(selectedVehicle);
                        }}
                        className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                      >
                        Mark Exit
                        <ArrowRight className="w-5 h-5" />
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