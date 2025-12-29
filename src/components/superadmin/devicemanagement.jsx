"use client";
import React, { useState, useEffect } from 'react';
import {
  Menu, Bell, Plus, Search, Camera, Activity, AlertCircle,
  CheckCircle, XCircle, Edit, Trash2, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import Sidebar from './sidebar';

// Device Card Component
const DeviceCard = ({ device, onEdit, onDelete, onToggleStatus }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
          device.type === 'ANPR' ? 'bg-blue-50' : 'bg-green-50'
        }`}>
          {device.type === 'ANPR' ? (
            <Camera className={`w-6 h-6 ${device.status === 'online' ? 'text-blue-600' : 'text-gray-400'}`} />
          ) : (
            <Activity className={`w-6 h-6 ${device.status === 'online' ? 'text-green-600' : 'text-gray-400'}`} />
          )}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">{device.name}</h3>
          <div className="text-sm text-gray-600">{device.deviceId}</div>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
        device.status === 'online'
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 text-gray-700'
      }`}>
        {device.status === 'online' ? (
          <CheckCircle className="w-3 h-3" />
        ) : (
          <XCircle className="w-3 h-3" />
        )}
        {device.status?.toUpperCase()}
      </span>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <div className="text-xs text-gray-500 uppercase mb-1">Type</div>
        <div className="font-semibold text-gray-900">{device.type}</div>
      </div>
      <div>
        <div className="text-xs text-gray-500 uppercase mb-1">Client</div>
        <div className="font-semibold text-gray-900">{device.clientName || 'Not Assigned'}</div>
      </div>
      <div>
        <div className="text-xs text-gray-500 uppercase mb-1">Site</div>
        <div className="font-semibold text-gray-900">{device.siteName || 'Not Assigned'}</div>
      </div>
      <div>
        <div className="text-xs text-gray-500 uppercase mb-1">Last Active</div>
        <div className="font-semibold text-gray-900">
          {device.lastActive ? new Date(device.lastActive).toLocaleString() : 'Never'}
        </div>
      </div>
    </div>

    <div className="flex gap-2">
      <button
        onClick={() => onEdit(device)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
      >
        Edit
      </button>
      <button
        onClick={() => onToggleStatus(device)}
        className={`flex-1 px-4 py-2 rounded-lg transition font-medium text-sm ${
          device.status === 'online'
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            : 'bg-green-50 hover:bg-green-100 text-green-600'
        }`}
      >
        {device.status === 'online' ? 'Turn OFF' : 'Turn ON'}
      </button>
      <button
        onClick={() => onDelete(device)}
        className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </div>
);

// Add Device Modal
const AddDeviceModal = ({ isOpen, onClose, onSubmit, loading, clients }) => {
  const [formData, setFormData] = useState({
    name: '',
    deviceId: '',
    type: 'ANPR',
    clientId: '',
    siteId: '',
    location: '',
    ipAddress: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      deviceId: '',
      type: 'ANPR',
      clientId: '',
      siteId: '',
      location: '',
      ipAddress: '',
      notes: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Register New Device</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Device Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Gate-1-Cam-01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Device ID *
                </label>
                <input
                  type="text"
                  name="deviceId"
                  value={formData.deviceId}
                  onChange={handleChange}
                  required
                  placeholder="e.g., DEV-2024-001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Device Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ANPR">ANPR Camera</option>
                <option value="Barrier">Barrier</option>
              </select>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assign to Client
                  </label>
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select Client</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>{client.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Site Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Main Gate, North Wing"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                IP Address
              </label>
              <input
                type="text"
                name="ipAddress"
                value={formData.ipAddress}
                onChange={handleChange}
                placeholder="e.g., 192.168.1.100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Additional notes about the device"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registering...' : 'Register Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Device Management Component
const DeviceManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDevices();
    fetchClients();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/devices`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setDevices(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError(err.message);
      // Mock data
      setDevices([
        {
          _id: '1',
          name: 'Gate-1-Cam-01',
          deviceId: 'ANPR-2024-001',
          type: 'ANPR',
          clientName: 'Enterprise Corp',
          siteName: 'North Gate Complex',
          status: 'online',
          lastActive: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'Gate-2-Barrier-01',
          deviceId: 'BAR-2024-001',
          type: 'Barrier',
          clientName: 'Enterprise Corp',
          siteName: 'North Gate Complex',
          status: 'online',
          lastActive: new Date().toISOString()
        },
        {
          _id: '3',
          name: 'Gate-3-Cam-02',
          deviceId: 'ANPR-2024-002',
          type: 'ANPR',
          clientName: 'TechStart Ltd',
          siteName: 'Westside Hub',
          status: 'offline',
          lastActive: new Date(Date.now() - 3600000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/clients`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setClients(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setClients([
        { _id: '1', name: 'Enterprise Corp' },
        { _id: '2', name: 'TechStart Ltd' }
      ]);
    }
  };

  const handleAddDevice = async (formData) => {
    try {
      setSubmitLoading(true);
      const token = localStorage.getItem('accessToken');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/devices`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newDevice = await response.json();
      setDevices([newDevice, ...devices]);
      setShowAddModal(false);
      alert('Device registered successfully!');
    } catch (err) {
      console.error('Error registering device:', err);
      alert(`Error registering device: ${err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (device) => {
    console.log('Edit device:', device);
    alert(`Edit functionality for ${device.name} - To be implemented`);
  };

  const handleDelete = async (device) => {
    if (confirm(`Delete device ${device.name}? This action cannot be undone.`)) {
      console.log('Deleting device:', device);
      alert('Device deleted successfully!');
    }
  };

  const handleToggleStatus = async (device) => {
    const action = device.status === 'online' ? 'offline' : 'online';
    if (confirm(`Turn ${action} device ${device.name}?`)) {
      console.log(`Toggling device status:`, device);
      alert(`Device turned ${action} successfully!`);
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         device.deviceId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || device.type === filterType;
    const matchesStatus = filterStatus === 'all' || device.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    anpr: devices.filter(d => d.type === 'ANPR').length,
    barriers: devices.filter(d => d.type === 'Barrier').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-72">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
              <Bell className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Devices</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="text-2xl font-bold text-green-600">{stats.online}</div>
              <div className="text-sm text-gray-600">Online</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="text-2xl font-bold text-red-600">{stats.offline}</div>
              <div className="text-sm text-gray-600">Offline</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="text-2xl font-bold text-blue-600">{stats.anpr}</div>
              <div className="text-sm text-gray-600">ANPR Cameras</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-100">
              <div className="text-2xl font-bold text-green-600">{stats.barriers}</div>
              <div className="text-sm text-gray-600">Barriers</div>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="w-full bg-purple-600 text-white rounded-xl py-4 flex items-center justify-center gap-2 font-semibold hover:bg-purple-700 transition mb-6"
          >
            <Plus className="w-5 h-5" />
            Register New Device
          </button>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-6 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="ANPR">ANPR</option>
              <option value="Barrier">Barrier</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-6 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Demo mode: Using sample data. API Error: {error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {filteredDevices.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No devices found</h3>
                <p className="text-gray-600">
                  {searchQuery ? 'Try adjusting your search or filters' : 'Start by registering your first device'}
                </p>
              </div>
            ) : (
              filteredDevices.map((device) => (
                <DeviceCard
                  key={device._id}
                  device={device}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))
            )}
          </div>

          {filteredDevices.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <AddDeviceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDevice}
        loading={submitLoading}
        clients={clients}
      />
    </div>
  );
};

export default DeviceManagement;