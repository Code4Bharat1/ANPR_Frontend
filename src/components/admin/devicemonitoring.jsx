"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Camera, Activity, Clock, AlertCircle, Filter
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';  // ✅ Import Header

const DeviceMonitoring = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'online', 'offline'

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/devices`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDevices(response.data);
    } catch (err) {
      console.error('Error fetching devices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Normalize devices to handle different API response structures
  const normalizedDevices = devices.map(device => {
    // Handle device ID - API uses 'serialNo'
    const deviceId = device.serialNo || device.deviceId || device.id || device._id || 'N/A';
    
    // Handle device type - API uses 'devicetype' (lowercase)
    const deviceType = device.devicetype || device.type || device.deviceType || 'Unknown';
    
    // Handle site - API returns siteId as ObjectId, not populated site
    let siteName = 'Unknown';
    if (typeof device.site === 'string') {
      siteName = device.site;
    } else if (device.site?.name) {
      siteName = device.site.name;
    } else if (device.siteId) {
      siteName = typeof device.siteId === 'string' ? device.siteId : device.siteId.$oid || 'Unknown';
    }
    
    // Handle status - API uses 'isOnline' boolean
    const status = device.isOnline === true ? 'Online' : 'Offline';
    
    // Handle last active time
    let lastActive = '—';
    if (device.lastActive) {
      try {
        const dateValue = device.lastActive.$date || device.lastActive;
        lastActive = new Date(dateValue).toLocaleString();
      } catch (e) {
        lastActive = '—';
      }
    }

    return {
      id: deviceId,
      type: deviceType,
      site: siteName,
      status: status,
      lastActive: lastActive,
      isEnabled: device.isEnabled !== false
    };
  });

  // Filter devices based on search term and status filter
  const filteredDevices = normalizedDevices.filter(device => {
    // Search filter
    const matchesSearch = 
      device.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'online' && device.status === 'Online') ||
      (statusFilter === 'offline' && device.status === 'Offline');
    
    return matchesSearch && matchesStatus;
  });

  const onlineDevices = normalizedDevices.filter(d => d.status === 'Online').length;
  const offlineDevices = normalizedDevices.filter(d => d.status === 'Offline').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ✅ Header Component with Dropdown */}
      <Header title="Device Management" onMenuClick={() => setSidebarOpen(true)} />

      {/* Main Content */}
      <main className="lg:ml-72 max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
            onClick={() => setStatusFilter('all')}
          >
            <div className="text-sm text-gray-600 mb-1">Total Devices</div>
            <div className="text-3xl font-bold text-gray-900">{normalizedDevices.length}</div>
          </div>
          <div 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
            onClick={() => setStatusFilter('online')}
          >
            <div className="text-sm text-gray-600 mb-1">Online Devices</div>
            <div className="text-3xl font-bold text-green-600">{onlineDevices}</div>
          </div>
          <div 
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
            onClick={() => setStatusFilter('offline')}
          >
            <div className="text-sm text-gray-600 mb-1">Offline Devices</div>
            <div className="text-3xl font-bold text-red-600">{offlineDevices}</div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search devices by ID, type, or site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          
          {/* Status Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${
                statusFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              All
            </button>
            <button
              onClick={() => setStatusFilter('online')}
              className={`px-4 py-2.5 rounded-lg font-medium transition ${
                statusFilter === 'online'
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Online
            </button>
            <button
              onClick={() => setStatusFilter('offline')}
              className={`px-4 py-2.5 rounded-lg font-medium transition ${
                statusFilter === 'offline'
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Offline
            </button>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {statusFilter !== 'all' && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>
              Showing {filteredDevices.length} {statusFilter} device{filteredDevices.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setStatusFilter('all')}
              className="text-blue-500 hover:text-blue-700 font-medium"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Alert for offline devices */}
        {offlineDevices > 0 && statusFilter === 'all' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <div className="font-semibold text-yellow-900">
                {offlineDevices} Device{offlineDevices > 1 ? 's' : ''} Offline
              </div>
              <div className="text-sm text-yellow-700">
                Please check device connectivity and notify technical support if needed
              </div>
            </div>
          </div>
        )}

        {/* Devices Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Device ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Device Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Last Active Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDevices.map((device, index) => (
                  <tr key={device.id + index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {device.id}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {device.type.toLowerCase().includes('camera') || 
                         device.type.toLowerCase().includes('anpr') ? (
                          <Camera className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Activity className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="text-sm text-gray-900">{device.type}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900">
                      {device.site}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        device.status === 'Online'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${
                          device.status === 'Online' ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        {device.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {device.lastActive}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDevices.length === 0 && (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No devices found matching your filters' 
                  : 'No devices found'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <strong>Note:</strong> Device configuration is read-only. Contact Super Admin for device management.
        </div>
      </main>
    </div>
  );
};

export default DeviceMonitoring;
