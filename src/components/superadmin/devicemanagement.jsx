"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Search, Camera, Activity, CheckCircle, XCircle, Trash2,
  ChevronLeft, ChevronRight, X
} from 'lucide-react';
import SuperAdminLayout from './layout';

const DeviceCard = ({ device, onEdit, onToggleStatus, onDelete }) => {
  // Device type ko properly extract karein
  const deviceType = device.devicetype || device.type || 'ANPR';
  const isANPR = deviceType === 'ANPR';
  const deviceName = device.name || device.deviceId || 'Unnamed Device';

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isANPR ? 'bg-blue-50' : 'bg-green-50'}`}>
            {isANPR ? (
              <Camera className={`w-5 h-5 md:w-6 md:h-6 ${device.status === 'online' ? 'text-blue-600' : 'text-gray-400'}`} />
            ) : (
              <Activity className={`w-5 h-5 md:w-6 md:h-6 ${device.status === 'online' ? 'text-green-600' : 'text-gray-400'}`} />
            )}
          </div>
          <div className="min-w-0">
            {/* ✅ Yeh line uncomment karein aur proper fallback add karein */}
            <h3 className="text-base md:text-lg font-bold text-gray-900 truncate">{deviceName}</h3>
            <div className="text-xs md:text-sm text-gray-600 truncate">{device.deviceId}</div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 whitespace-nowrap self-start ${device.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {device.status === 'online' ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          {device.status?.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500 uppercase mb-1">Type</div>
          <div className="font-semibold text-gray-900 text-sm md:text-base">
            {deviceType} {/* ✅ Yeh line change karein */}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 uppercase mb-1">Client</div>
          <div className="font-semibold text-gray-900 text-sm md:text-base truncate">
            {device.clientName ?? 'Not Assigned'}
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <div className="text-xs text-gray-500 uppercase mb-1">Site</div>
          <div className="font-semibold text-gray-900 text-sm md:text-base truncate">
            {device.siteName ?? 'Not Assigned'}
          </div>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <div className="text-xs text-gray-500 uppercase mb-1">Last Active</div>
          <div className="font-semibold text-gray-900 text-sm md:text-base truncate">
            {device.lastActive ? new Date(device.lastActive).toLocaleString() : 'Never'}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => onEdit(device)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(device)}
          className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
        <button
          onClick={() => onToggleStatus(device)}
          className={`flex-1 px-4 py-2 rounded-lg transition font-medium text-sm ${device.status === 'online' ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-green-50 hover:bg-green-100 text-green-600'}`}
        >
          {device.status === 'online' ? 'Turn OFF' : 'Turn ON'}
        </button>
      </div>
    </div>
  );
};
const EditDeviceModal = ({ isOpen, onClose, onSubmit, loading, device, clients, sites }) => {
  const [formData, setFormData] = useState({
    deviceType: 'ANPR',
    clientId: '',
    siteId: '',
    ipAddress: '',
    notes: ''
  });

  useEffect(() => {
    if (!device) return;

    setFormData({
      deviceType: device.type ?? 'ANPR',
      clientId: device.clientId ?? '',
      siteId: device.siteId ?? '',
      ipAddress: device.ipAddress ?? '',
      notes: device.notes ?? ''
    });
  }, [device]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Edit Device</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Serial Number
              </label>
              <div className="text-base font-medium text-gray-900">
                {device?.deviceId}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Device Type *
              </label>
              <select
                name="deviceType"
                value={formData.deviceType}
                onChange={handleChange}
                required
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
              >
                <option value="ANPR">ANPR Camera</option>
                <option value="BARRIER">Barrier</option>
              </select>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Assignment</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assign to Client *
                  </label>
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                  >
                    <option value="">Select Client</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>
                        {client.companyName || client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assign to Site *
                  </label>
                  <select
                    name="siteId"
                    value={formData.siteId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                  >
                    <option value="">Select Site</option>
                    {sites.map(site => (
                      <option key={site._id} value={site._id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
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
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
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
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              {loading ? 'Updating...' : 'Update Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddDeviceModal = ({ isOpen, onClose, onSubmit, loading, clients, sites }) => {
  const [formData, setFormData] = useState({
    deviceName: '',
    serialNumber: '',
    deviceType: 'ANPR',
    clientId: '',
    siteId: '',
    ipAddress: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Real-time validation on field blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name);
  };

  // Validate single field
  const validateField = (fieldName) => {
    let newErrors = { ...errors };
    const value = formData[fieldName];

    switch (fieldName) {
      case 'deviceName':
        if (!value.trim()) {
          newErrors.deviceName = "Device name is required";
        } else if (value.trim().length < 3) {
          newErrors.deviceName = "Device name must be at least 3 characters";
        } else {
          delete newErrors.deviceName;
        }
        break;

      case 'serialNumber':
        if (!value.trim()) {
          newErrors.serialNumber = "Serial number is required";
        } else if (value.trim().length < 5) {
          newErrors.serialNumber = "Serial number must be at least 5 characters";
        } else {
          delete newErrors.serialNumber;
        }
        break;

      case 'deviceType':
        if (!value) {
          newErrors.deviceType = "Device type is required";
        } else {
          delete newErrors.deviceType;
        }
        break;

      case 'clientId':
        if (!value) {
          newErrors.clientId = "Client selection is required";
        } else {
          delete newErrors.clientId;
        }
        break;

      case 'siteId':
        if (!value) {
          newErrors.siteId = "Site selection is required";
        } else {
          delete newErrors.siteId;
        }
        break;

      case 'ipAddress':
        if (!value.trim()) {
          newErrors.ipAddress = "IP address is required";
        } else if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(value)) {
          newErrors.ipAddress = "Enter a valid IP address (e.g., 192.168.1.100)";
        } else {
          // Validate each octet is between 0-255
          const octets = value.split('.');
          const isValid = octets.length === 4 && 
            octets.every(octet => {
              const num = parseInt(octet, 10);
              return num >= 0 && num <= 255 && octet === num.toString();
            });
          
          if (!isValid) {
            newErrors.ipAddress = "Invalid IP address format";
          } else {
            delete newErrors.ipAddress;
          }
        }
        break;

      case 'notes':
        if (value.trim().length > 500) {
          newErrors.notes = "Notes cannot exceed 500 characters";
        } else {
          delete newErrors.notes;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  // Full form validation
  const validate = () => {
    const newErrors = {};

    // Device Name validation
    if (!formData.deviceName.trim()) {
      newErrors.deviceName = "Device name is required";
    } else if (formData.deviceName.trim().length < 3) {
      newErrors.deviceName = "Device name must be at least 3 characters";
    }

    // Serial Number validation
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = "Serial number is required";
    } else if (formData.serialNumber.trim().length < 5) {
      newErrors.serialNumber = "Serial number must be at least 5 characters";
    }

    // Device Type validation
    if (!formData.deviceType) {
      newErrors.deviceType = "Device type is required";
    }

    // Client validation
    if (!formData.clientId) {
      newErrors.clientId = "Client selection is required";
    }

    // Site validation
    if (!formData.siteId) {
      newErrors.siteId = "Site selection is required";
    }

    // IP Address validation
    if (!formData.ipAddress.trim()) {
      newErrors.ipAddress = "IP address is required";
    } else if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(formData.ipAddress)) {
      newErrors.ipAddress = "Enter a valid IP address (e.g., 192.168.1.100)";
    } else {
      // Validate each octet is between 0-255
      const octets = formData.ipAddress.split('.');
      const isValid = octets.length === 4 && 
        octets.every(octet => {
          const num = parseInt(octet, 10);
          return num >= 0 && num <= 255 && octet === num.toString();
        });
      
      if (!isValid) {
        newErrors.ipAddress = "Invalid IP address format";
      }
    }

    // Notes validation
    if (formData.notes.trim().length > 500) {
      newErrors.notes = "Notes cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Real-time validation for already touched fields
    if (touched[name]) {
      validateField(name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (!validate()) return;

    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      deviceName: '',
      serialNumber: '',
      deviceType: 'ANPR',
      clientId: '',
      siteId: '',
      ipAddress: '',
      notes: ''
    });
    setErrors({});
    setTouched({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Register New Device</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Device Information Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Device Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Device Name *
                </label>
                <input
                  type="text"
                  name="deviceName"
                  value={formData.deviceName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="e.g., Entrance Camera"
                  className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base ${
                    errors.deviceName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.deviceName && (
                  <p className="text-red-500 text-xs mt-1">{errors.deviceName}</p>
                )}
              </div>

              {/* Serial Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Serial Number *
                </label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="e.g., DEV-2024-001"
                  className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base ${
                    errors.serialNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.serialNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.serialNumber}</p>
                )}
              </div>

              {/* Device Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Device Type *
                </label>
                <select
                  name="deviceType"
                  value={formData.deviceType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base ${
                    errors.deviceType ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="ANPR">ANPR Camera</option>
                  <option value="BARRIER">Barrier</option>
                </select>
                {errors.deviceType && (
                  <p className="text-red-500 text-xs mt-1">{errors.deviceType}</p>
                )}
              </div>
            </div>

            {/* Assignment Section */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Assignment</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assign to Client *
                  </label>
                  <select
                    name="clientId"
                    value={formData.clientId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base ${
                      errors.clientId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Client</option>
                    {clients.map(client => (
                      <option key={client._id} value={client._id}>
                        {client.companyName || client.name}
                      </option>
                    ))}
                  </select>
                  {errors.clientId && (
                    <p className="text-red-500 text-xs mt-1">{errors.clientId}</p>
                  )}
                </div>

                {/* Site Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assign to Site *
                  </label>
                  <select
                    name="siteId"
                    value={formData.siteId}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base ${
                      errors.siteId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Site</option>
                    {sites.map(site => (
                      <option key={site._id} value={site._id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                  {errors.siteId && (
                    <p className="text-red-500 text-xs mt-1">{errors.siteId}</p>
                  )}
                </div>
              </div>
            </div>

            {/* IP Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                IP Address *
              </label>
              <input
                type="text"
                name="ipAddress"
                value={formData.ipAddress}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="e.g., 192.168.1.100"
                className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base ${
                  errors.ipAddress ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.ipAddress ? (
                <p className="text-red-500 text-xs mt-1">{errors.ipAddress}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Format: xxx.xxx.xxx.xxx (0-255 per octet)</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={3}
                placeholder="Additional notes about the device"
                className={`w-full px-3 md:px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base ${
                  errors.notes ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.notes ? (
                  <p className="text-red-500 text-xs">{errors.notes}</p>
                ) : (
                  <p className="text-xs text-gray-500">Optional - Maximum 500 characters</p>
                )}
                <p className={`text-xs ${formData.notes.length > 450 ? 'text-orange-500' : 'text-gray-500'}`}>
                  {formData.notes.length}/500
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-sm md:text-base"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading || Object.keys(errors).length > 0}
                className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {loading ? 'Registering...' : 'Register Device'}
              </button>
            </div>
          </div>  
        </form>
      </div>
    </div>
  );
};

const DeviceManagement = () => {
  const [devices, setDevices] = useState([]);
  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDevices();
    fetchClients();
    fetchSites();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) throw new Error('No authentication token found');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/devices`,
        { headers: getAuthHeaders() }
      );
      // console.log(response);

      setDevices(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError(err.response?.data?.message || err.message);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/clients`,
        { headers: getAuthHeaders() }
      );
      setClients(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/sites`,
        { headers: getAuthHeaders() }
      );
      setSites(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching sites:', err);
    }
  };

  const handleAddDevice = async (formData) => {
    try {
      setSubmitLoading(true);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/devices/register`,
        formData,
        { headers: getAuthHeaders() }
      );
      alert('Device registered successfully!');
      setShowAddModal(false);
      fetchDevices();
    } catch (err) {
      console.error('Error registering device:', err);
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (device) => {
    setSelectedDevice(device);
    setShowEditModal(true);
  };

  const handleUpdateDevice = async (formData) => {
    try {
      setSubmitLoading(true);
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/devices/${selectedDevice._id}`,
        formData,
        { headers: getAuthHeaders() }
      );
      alert('Device updated successfully!');
      setShowEditModal(false);
      setSelectedDevice(null);
      fetchDevices();
    } catch (err) {
      console.error('Error updating device:', err);
      alert(`Error: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleStatus = async (device) => {
    const action = device.status === 'online' ? 'offline' : 'online';
    if (confirm(`Turn ${action} device ${device.name}?`)) {
      try {
        await axios.patch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/devices/${device._id}/toggle`,
          {},
          { headers: getAuthHeaders() }
        );
        alert(`Device turned ${action} successfully!`);
        fetchDevices();
      } catch (err) {
        console.error('Error toggling device status:', err);
        alert(`Error: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const handleDelete = async (device) => {
    if (confirm(`Are you sure you want to delete device ${device.name}? This action cannot be undone.`)) {
      try {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/api/devices/${device._id}`,
          { headers: getAuthHeaders() }
        );
        alert('Device deleted successfully!');
        fetchDevices();
      } catch (err) {
        console.error('Error deleting device:', err);
        alert(`Error: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const filteredDevices = devices.filter(device => {
  const query = searchQuery.toLowerCase();

  const matchesSearch =
    device.name?.toLowerCase().includes(query) ||          // device name
    device.deviceId?.toLowerCase().includes(query) ||      // device id
    device.clientName?.toLowerCase().includes(query) ||    // client name
    device.siteName?.toLowerCase().includes(query);        // site name

  const matchesType = filterType === 'all' || device.type === filterType;
  const matchesStatus = filterStatus === 'all' || device.status === filterStatus;

  return matchesSearch && matchesType && matchesStatus;
});

  const stats = {
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    offline: devices.filter(d => d.status === 'offline').length,
    anpr: devices.filter(d => d.type === 'ANPR').length,
    barriers: devices.filter(d => d.type === 'BARRIER').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminLayout title="Device Management">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-100">
          <div className="text-xl md:text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs md:text-sm text-gray-600">Total Devices</div>
        </div>
        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-100">
          <div className="text-xl md:text-2xl font-bold text-green-600">{stats.online}</div>
          <div className="text-xs md:text-sm text-gray-600">Online</div>
        </div>
        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-100">
          <div className="text-xl md:text-2xl font-bold text-red-600">{stats.offline}</div>
          <div className="text-xs md:text-sm text-gray-600">Offline</div>
        </div>
        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-100">
          <div className="text-xl md:text-2xl font-bold text-blue-600">{stats.anpr}</div>
          <div className="text-xs md:text-sm text-gray-600">ANPR Cameras</div>
        </div>
        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-100">
          <div className="text-xl md:text-2xl font-bold text-green-600">{stats.barriers}</div>
          <div className="text-xs md:text-sm text-gray-600">Barriers</div>
        </div>
      </div>

      <button
        onClick={() => setShowAddModal(true)}
        className="w-full bg-purple-600 text-white rounded-xl py-3 md:py-4 flex items-center justify-center gap-2 font-semibold hover:bg-purple-700 transition mb-6 text-sm md:text-base"
      >
        <Plus className="w-4 h-4 md:w-5 md:h-5" />
        Register New Device
      </button>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
        >
          <option value="all">All Types</option>
          <option value="ANPR">ANPR</option>
          <option value="BARRIER">Barrier</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
        >
          <option value="all">All Status</option>
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 mb-6">
          <p className="text-xs md:text-sm text-red-800">
            Error loading devices: {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
        {filteredDevices.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Camera className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No devices found</h3>
            <p className="text-gray-600 text-sm md:text-base">
              {searchQuery ? 'Try adjusting your search or filters' : 'Start by registering your first device'}
            </p>
          </div>
        ) : (
          filteredDevices.map((device) => (
            <DeviceCard
              key={device._id}
              device={device}
              onEdit={handleEdit}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {filteredDevices.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Showing {filteredDevices.length} device{filteredDevices.length !== 1 ? 's' : ''}
        </div>
      )}

      <AddDeviceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddDevice}
        loading={submitLoading}
        clients={clients}
        sites={sites}
      />

      <EditDeviceModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDevice(null);
        }}
        onSubmit={handleUpdateDevice}
        loading={submitLoading}
        device={selectedDevice}
        clients={clients}
        sites={sites}
      />
    </SuperAdminLayout>
  );
};

export default DeviceManagement;