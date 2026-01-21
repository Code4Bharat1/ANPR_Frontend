"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus, Search, Users, ChevronLeft, ChevronRight, X, Menu, Eye, EyeOff
} from 'lucide-react';
import SuperAdminLayout from './layout';

// Client Card Component
const ClientCard = ({ client, onEdit, onActivate, onDeactivate }) => (
  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
      <div className="flex-1 min-w-0">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 truncate">
          Client Name : {client.clientname}
        </h3>
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 truncate">
          Company Name : {client.companyName}
        </h3>
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm truncate">{client.email}</span>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap self-start ${client.isActive
        ? 'bg-green-100 text-green-700'
        : 'bg-red-100 text-red-700'
        }`}>
        {client.isActive ? 'ACTIVE' : 'INACTIVE'}
      </span>
    </div>

    <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
      <div>
        <div className="text-xs text-gray-500 uppercase mb-1">Package</div>
        <div className="font-semibold text-gray-900 text-sm md:text-base truncate">
          {client.packageType || 'N/A'}
        </div>
      </div>
      <div>
        <div>
          <div className="text-xs text-gray-500 uppercase mb-1">Sites</div>
          <div className="font-semibold text-gray-900 text-sm md:text-base">
            {client.siteCount || 0} Sites
          </div>
        </div>
      </div>
      <div>
        <div className="text-xs text-gray-500 uppercase mb-1">Package Start</div>
        <div className="font-semibold text-gray-900 text-sm md:text-base">
          {client.packageStart ? new Date(client.packageStart).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) : 'N/A'}
        </div>
      </div>
      <div>
        <div className="text-xs text-gray-500 uppercase mb-1">Package End</div>
        <div className="font-semibold text-gray-900 text-sm md:text-base">
          {client.packageEnd ? new Date(client.packageEnd).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) : 'N/A'}
        </div>
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
      <button
        onClick={() => onEdit(client)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm md:text-base"
      >
        Edit
      </button>
      {client.isActive ? (
        <button
          onClick={() => onDeactivate(client)}
          className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm md:text-base"
        >
          Deactivate
        </button>
      ) : (
        <button
          onClick={() => onActivate(client)}
          className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-medium text-sm md:text-base"
        >
          Activate
        </button>
      )}
    </div>
  </div>
);

// Edit Client Modal
const EditClientModal = ({ isOpen, onClose, onSubmit, loading, client }) => {
  const [formData, setFormData] = useState({
    clientname: '',
    companyName: '',
    email: '',
    phone: '',
    packageType: 'LITE',
    packageStart: '',
    packageEnd: '',
    address: ''
  });

  useEffect(() => {
    if (client) {
      setFormData({
        clientname: client.clientname || '',
        companyName: client.companyName || '',
        email: client.email || '',
        phone: client.phone || '',
        packageType: client.packageType || 'LITE',
        packageStart: client.packageStart ? client.packageStart.split('T')[0] : '',
        packageEnd: client.packageEnd ? client.packageEnd.split('T')[0] : '',
        address: client.address || ''
      });
    }
  }, [client]);

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
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Edit Client</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                name="clientname"
                value={formData.clientname}
                onChange={handleChange}
                required
                className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Package Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Package Type *
                  </label>
                  <select
                    name="packageType"
                    value={formData.packageType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                  >
                    <option value="LITE">Lite Access</option>
                    <option value="CORE">Core Monitoring</option>
                    <option value="PRO">Pro Automation</option>
                    <option value="ENTERPRISE">Enterprise Local</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="packageStart"
                      value={formData.packageStart}
                      onChange={handleChange}
                      required
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="packageEnd"
                      value={formData.packageEnd}
                      onChange={handleChange}
                      required
                      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
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
              {loading ? 'Updating...' : 'Update Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Client Modal
const AddClientModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    clientname: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    packageType: 'LITE',
    packageStart: '',
    packageEnd: '',
    address: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
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
      case 'clientname':
        if (value.trim().length < 3) {
          newErrors.clientname = "Client name must be at least 3 characters";
        } else {
          delete newErrors.clientname;
        }
        break;

      case 'companyName':
        if (value.trim().length < 3) {
          newErrors.companyName = "Company name must be at least 3 characters";
        } else {
          delete newErrors.companyName;
        }
        break;

      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Enter a valid email address";
        } else {
          delete newErrors.email;
        }
        break;

      case 'phone':
        if (value && !/^\d{10}$/.test(value.replace(/\D/g, ''))) {
          newErrors.phone = "Phone number must be 10 digits";
        } else {
          delete newErrors.phone;
        }
        break;

      case 'password':
        if (value.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else {
          delete newErrors.password;
        }
        break;

      case 'packageStart':
        if (!value) {
          newErrors.packageStart = "Start date is required";
        } else {
          delete newErrors.packageStart;
        }
        break;

      case 'packageEnd':
        if (!value) {
          newErrors.packageEnd = "End date is required";
        } else if (formData.packageStart && new Date(value) <= new Date(formData.packageStart)) {
          newErrors.packageEnd = "End date must be after start date";
        } else {
          delete newErrors.packageEnd;
        }
        break;

      case 'address':
        if (value.trim().length < 10) {
          newErrors.address = "Address must be at least 10 characters";
        } else {
          delete newErrors.address;
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

    if (formData.clientname.trim().length < 3) {
      newErrors.clientname = "Client name must be at least 3 characters";
    }

    if (formData.companyName.trim().length < 3) {
      newErrors.companyName = "Company name must be at least 3 characters";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.packageStart) {
      newErrors.packageStart = "Start date is required";
    }

    if (!formData.packageEnd) {
      newErrors.packageEnd = "End date is required";
    }

    if (
      formData.packageStart &&
      formData.packageEnd &&
      new Date(formData.packageEnd) <= new Date(formData.packageStart)
    ) {
      newErrors.packageEnd = "End date must be after start date";
    }

    if (formData.address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters";
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
      clientname: '',
      companyName: '',
      email: '',
      phone: '',
      password: '',
      packageType: 'LITE',
      packageStart: '',
      packageEnd: '',
      address: ''
    });
    setErrors({});
    setTouched({});
    setShowPassword(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Add New Client</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Client Name Field with Error */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                name="clientname"
                value={formData.clientname}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="e.g., John Doe"
                className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base ${
                  errors.clientname ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.clientname && (
                <p className="text-red-500 text-xs mt-1">{errors.clientname}</p>
              )}
            </div>

            {/* Company Name Field with Error */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                placeholder="e.g., Acme Corporation"
                className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base ${
                  errors.companyName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.companyName && (
                <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email Field with Error */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="client@company.com"
                  className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone Field with Error */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+1 234 567 8900"
                  className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Password Field with Error */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="Minimum 8 characters"
                  className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10 text-sm md:text-base ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password ? (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Package Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Package Type *
                  </label>
                  <select
                    name="packageType"
                    value={formData.packageType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
                  >
                    <option value="LITE">Lite Access</option>
                    <option value="CORE">Core Monitoring</option>
                    <option value="PRO">Pro Automation</option>
                    <option value="ENTERPRISE">Enterprise Local</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Package Start Date with Error */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="packageStart"
                      value={formData.packageStart}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base ${
                        errors.packageStart ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.packageStart && (
                      <p className="text-red-500 text-xs mt-1">{errors.packageStart}</p>
                    )}
                  </div>

                  {/* Package End Date with Error */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="packageEnd"
                      value={formData.packageEnd}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base ${
                        errors.packageEnd ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.packageEnd && (
                      <p className="text-red-500 text-xs mt-1">{errors.packageEnd}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Field with Error */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                rows={2}
                required
                placeholder="Full address"
                className={`w-full px-3 md:px-4 py-2 md:py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Submit Button - Disable if there are errors */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
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
              {loading ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Client Management Component
const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchClients();
  }, []);

 const fetchClients = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('accessToken');

    if (!token) {
      // Redirect to login immediately
      window.location.href = '/login';
      return; // Important: Stop execution
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/clients`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    setClients(response.data.data || response.data || []);
    setError(null);
  } catch (err) {
    console.error('Error fetching clients:', err);
    
    // Handle authentication errors (401, 403)
    if (err.response?.status === 401 || err.response?.status === 403) {
      // Clear storage and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    
    setError(err.response?.data?.message || err.message);
  } finally {
    setLoading(false);
  }
};
  

  const handleAddClient = async (formData) => {
    try {
      setSubmitLoading(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const payload = {
        clientname: formData.clientname,
        companyName: formData.companyName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: "client",
        packageType: formData.packageType,
        packageStart: formData.packageStart,
        packageEnd: formData.packageEnd,
        address: formData.address
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/clients`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setShowAddModal(false);
      alert('Client created successfully!');
      fetchClients();
    } catch (err) {
      console.error('Error creating client:', err);
      alert(`Error creating client: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const handleUpdateClient = async (formData) => {
    try {
      setSubmitLoading(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/clients/${selectedClient._id}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setShowEditModal(false);
      setSelectedClient(null);
      alert('Client updated successfully!');
      fetchClients();
    } catch (err) {
      console.error('Error updating client:', err);
      alert(`Error updating client: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleActivate = async (client) => {
    if (confirm(`Activate client ${client.companyName || client.name}?`)) {
      try {
        const token = localStorage.getItem('accessToken');

        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/clients/${client._id}`,
          { isActive: true },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        alert('Client activated successfully!');
        fetchClients();
      } catch (err) {
        console.error('Error activating client:', err);
        alert(`Error activating client: ${err.response?.data?.message || err.message}`);
      }
    }
  };

const handleDeactivate = async (client) => {
  if (confirm(`Deactivate client ${client.companyName}?`)) {
    try {
      const token = localStorage.getItem("accessToken");

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/clients/${client._id}`,
        { isActive: false },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Client deactivated successfully!");
      fetchClients();
    } catch (err) {
      console.error("Error deactivating client:", err.response?.data || err);
      alert(err.response?.data?.message || "Server error");
    }
  }
};


  const filteredClients = clients.filter(client => {
  const searchTerm = searchQuery.toLowerCase();

  const matchesSearch =
    client.companyName?.toLowerCase().includes(searchTerm) ||
    client.clientname?.toLowerCase().includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm);

  const matchesFilter =
    filterStatus === 'all' ||
    (filterStatus === 'active' && client.isActive) ||
    (filterStatus === 'inactive' && !client.isActive);

  return matchesSearch && matchesFilter;
});


  // Calculate stats
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.isActive).length;
  const inactiveClients = clients.filter(c => !c.isActive).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminLayout title="Client Management">
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full bg-purple-600 text-white rounded-xl py-3 md:py-4 flex items-center justify-center gap-2 font-semibold hover:bg-purple-700 transition mb-6 text-sm md:text-base"
      >
        <Plus className="w-4 h-4 md:w-5 md:h-5" />
        Add Client
      </button>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm md:text-base font-medium opacity-90">Total Clients</div>
            <Users className="w-5 h-5 md:w-6 md:h-6 opacity-80" />
          </div>
          <div className="text-3xl md:text-4xl font-bold">{totalClients}</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm md:text-base font-medium opacity-90">Active</div>
            <div className="w-5 h-5 md:w-6 md:h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="text-3xl md:text-4xl font-bold">{activeClients}</div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 md:p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm md:text-base font-medium opacity-90">Inactive</div>
            <div className="w-5 h-5 md:w-6 md:h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <X className="w-3 h-3 md:w-4 md:h-4" />
            </div>
          </div>
          <div className="text-3xl md:text-4xl font-bold">{inactiveClients}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4 mb-6">
          <p className="text-xs md:text-sm text-red-800">
            Error loading clients: {error}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:gap-6 mb-8">
        {filteredClients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600 text-sm md:text-base">
              {searchQuery ? 'Try adjusting your search' : 'Start by adding your first client'}
            </p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <ClientCard
              key={client._id}
              client={client}
              onEdit={handleEdit}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
            />
          ))
        )}
      </div>

      {filteredClients.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600">
            Showing {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
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

      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddClient}
        loading={submitLoading}
      />

      <EditClientModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedClient(null);
        }}
        onSubmit={handleUpdateClient}
        loading={submitLoading}
        client={selectedClient}
      />
    </SuperAdminLayout>
  );
};

export default ClientManagement;