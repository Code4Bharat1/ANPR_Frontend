"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Plus, MapPin, Edit, Trash2, Eye, X,
  Building, User, AlertCircle, Loader
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Add/Edit Site Modal
const SiteModal = ({ isOpen, onClose, site, onSave, mode }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    status: 'Active',
    description: '',
    gates: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (site && mode === 'edit') {
      setFormData({
        name: site.name || '',
        location: site.location || '',
        address: site.address || '',
        contactPerson: site.contactPerson || '',
        contactPhone: site.contactPhone || '',
        contactEmail: site.contactEmail || '',
        status: site.status || 'Active',
        description: site.description || '',
        gates: site.gates || []
      });
    } else {
      setFormData({
        name: '',
        location: '',
        address: '',
        contactPerson: '',
        contactPhone: '',
        contactEmail: '',
        status: 'Active',
        description: '',
        gates: []
      });
    }
    setErrors({});
  }, [site, mode, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Site name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Phone number is required';
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    // Validate gates
    const mainGateCount = formData.gates.filter(g => g.isMainGate).length;
    if (mainGateCount > 1) {
      newErrors.gates = 'Only one gate can be marked as main gate';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gate management functions
  const addGate = () => {
    setFormData({
      ...formData,
      gates: [
        ...formData.gates,
        {
          gateName: '',  // ✅ Use gateName, not name
          isMainGate: formData.gates.length === 0,
          isActive: true
        }
      ]
    });
  };

  const removeGate = (index) => {
    const newGates = formData.gates.filter((_, i) => i !== index);
    setFormData({ ...formData, gates: newGates });
  };

  const updateGate = (index, field, value) => {
    const newGates = [...formData.gates];

    if (field === 'isMainGate' && value === true) {
      newGates.forEach((gate, i) => {
        if (i !== index) gate.isMainGate = false;
      });
    }

    newGates[index] = { ...newGates[index], [field]: value };
    setFormData({ ...formData, gates: newGates });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error('Error saving site:', err);
      alert(err.response?.data?.message || 'Failed to save site');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4  overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-4 shadow-2xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">
            {mode === 'edit' ? 'Edit Site' : 'Add New Site'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Site Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Site Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter site name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Location & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location/City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.location ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="e.g., Mumbai, Maharashtra"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              >
                <option value="Active">Active</option>
                <option value="Complelted">Complelted</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Enter complete address"
            />
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Person Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.contactPerson ? 'border-red-500' : 'border-gray-300'
                }`}
              placeholder="Enter contact person name"
            />
            {errors.contactPerson && (
              <p className="text-red-500 text-sm mt-1">{errors.contactPerson}</p>
            )}
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.contactPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="+91 98765 43210"
              />
              {errors.contactPhone && (
                <p className="text-red-500 text-sm mt-1">{errors.contactPhone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="email@example.com"
              />
              {errors.contactEmail && (
                <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Additional notes or description"
            />
          </div>

          {/* Gates Management */}
          <div className="border-t-2 border-gray-200 pt-5">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Gates Management
              </label>
              <button
                type="button"
                onClick={addGate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Gate
              </button>
            </div>

            {errors.gates && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {errors.gates}
                </p>
              </div>
            )}

            {formData.gates.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No gates added yet</p>
                <p className="text-gray-400 text-xs mt-1">Click "Add Gate" to add entry/exit points</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.gates.map((gate, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={gate.name}
                          onChange={(e) => updateGate(index, 'name', e.target.value)}
                          placeholder={`Gate ${index + 1} name (e.g., Main Entrance, Back Gate)`}
                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />

                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={gate.isMainGate}
                              onChange={(e) => updateGate(index, 'isMainGate', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Main Gate</span>
                            {gate.isMainGate && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                                PRIMARY
                              </span>
                            )}
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={gate.isActive}
                              onChange={(e) => updateGate(index, 'isActive', e.target.checked)}
                              className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Active</span>
                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${gate.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                              }`}>
                              {gate.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </label>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeGate(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Remove gate"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: Add all entry/exit points for your site. Mark one as the main gate for primary access.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                mode === 'edit' ? 'Update Site' : 'Create Site'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Site Modal
const ViewSiteModal = ({ isOpen, onClose, site }) => {
  if (!isOpen || !site) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-4 shadow-2xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-white">Site Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div>
              <div className="text-sm text-gray-600 font-semibold mb-1">
                Site Name
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                {site.name}
              </h3>
            </div>

            {/* Right side */}
            <span
              className={`px-4 py-2 rounded-full text-sm font-bold ${site.status === 'Active'
                ? 'bg-green-100 text-green-700'
                : site.status === 'Maintenance'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
                }`}
            >
              {site.status}
            </span>
          </div>


          {/* Site ID */}
          {/* <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="text-sm text-gray-600 font-semibold mb-1">Site ID</div>
            <div className="font-mono text-gray-900 break-all">{site._id}</div>
          </div> */}

          {/* Location Info */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Location Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-sm text-gray-600 font-semibold mb-1">City/Location</div>
                <div className="text-gray-900 font-medium">{site.location}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-sm text-gray-600 font-semibold mb-1">Full Address</div>
                <div className="text-gray-900 font-medium">{site.address || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-sm text-gray-600 font-semibold mb-1">Contact Person</div>
                <div className="text-gray-900 font-medium">{site.contactPerson || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-sm text-gray-600 font-semibold mb-1">Phone</div>
                <div className="text-gray-900 font-medium">{site.contactPhone || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-sm text-gray-600 font-semibold mb-1">Email</div>
                <div className="text-gray-900 font-medium truncate">{site.contactEmail || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Site Stats */}
          {/* <div>
            <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Site Statistics
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 text-center">
                <div className="text-3xl font-black text-blue-700">{site.assignedPMs || 0}</div>
                <div className="text-sm text-blue-700 font-semibold mt-1">Project Managers</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 text-center">
                <div className="text-3xl font-black text-green-700">{site.assignedSupervisors || 0}</div>
                <div className="text-sm text-green-700 font-semibold mt-1">Supervisors</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 text-center">
                <div className="text-3xl font-black text-purple-700">{site.totalDevices || 0}</div>
                <div className="text-sm text-purple-700 font-semibold mt-1">Devices</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200 text-center">
                <div className="text-3xl font-black text-orange-700">{site.gates?.length || 0}</div>
                <div className="text-sm text-orange-700 font-semibold mt-1">Gates</div>
              </div> 
            </div>
          </div> */}

          {/* Gates Information */}
          {site.gates && site.gates.length > 0 && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Gates ({site.gates.length})
              </h4>
              <div className="space-y-3">
                {site.gates.map((gate, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {gate.name || `Gate ${index + 1}`}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            Entry/Exit Point #{index + 1}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {gate.isMainGate && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                            MAIN GATE
                          </span>
                        )}
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${gate.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                          }`}>
                          {gate.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {site.description && (
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-3">Description</h4>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-700">
                {site.description}
              </div>
            </div>
          )}

          {/* Created Info */}
          {site.createdAt && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="text-sm text-blue-700 font-semibold">
                Created on: {new Date(site.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteModal = ({ isOpen, onClose, onConfirm, siteName, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Site</h3>
          <p className="text-gray-600 text-center mb-6">
            Are you sure you want to delete <span className="font-bold text-red-600">"{siteName}"</span>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Site Card Component
const SiteCard = ({ site, onEdit, onView, onDelete }) => (
  <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{site.name}</h3>
        {/* <div className="text-xs text-gray-500 font-mono truncate">{site._id}</div> */}
      </div>
      <span className={`ml-2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${site.status === 'Active'
        ? 'bg-green-100 text-green-700'
        : site.status === 'Maintenance'
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-gray-100 text-gray-700'
        }`}>
        {site.status}
      </span>
    </div>

    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
      <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
      <span className="font-medium truncate">{site.location}</span>
    </div>

    {/* <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-gray-100">
      <div className="text-center">
        <div className="text-xs text-gray-500 mb-1">PMs</div>
        <div className="font-bold text-blue-600 text-lg">{site.assignedPMs || 0}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-gray-500 mb-1">Supervisors</div>
        <div className="font-bold text-green-600 text-lg">{site.assignedSupervisors || 0}</div>
      </div>
      <div className="text-center">
        <div className="text-xs text-gray-500 mb-1">Gates</div>
        <div className="font-bold text-orange-600 text-lg">{site.gates?.length || 0}</div>
      </div>
      <div className="text-center"> <div className="text-xs text-gray-500 mb-1">Devices</div> <div className="font-bold text-purple-600 text-lg">{site.totalDevices || 0}</div> </div>
    </div> */}

    <div className="grid grid-cols-3 gap-2">
      <button
        onClick={() => onView(site)}
        className="px-3 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold flex items-center justify-center gap-1"
      >
        <Eye className="w-4 h-4" />
        View
      </button>
      <button
        onClick={() => onEdit(site)}
        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold flex items-center justify-center gap-1"
      >
        <Edit className="w-4 h-4" />
        Edit
      </button>
      <button
        onClick={() => onDelete(site)}
        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold flex items-center justify-center gap-1"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  </div>
);

// Main Component
const SiteManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await axios.get(`${API_URL}/api/client-admin/sites`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // console.log('✅ Sites fetched successfully:', response.data);
      setSites(response.data.data || []);
    } catch (err) {
      console.error('❌ Error fetching sites:', err);

      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      } else {
        alert(err.response?.data?.message || 'Failed to fetch sites');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async (formData) => {
    try {
      const token = localStorage.getItem('accessToken');
      // console.log('📤 Creating site with data:', formData);

      const response = await axios.post(
        `${API_URL}/api/client-admin/sites`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // console.log('✅ Site created successfully:', response.data);
      setSites(prevSites => [response.data, ...prevSites]);
      setShowAddModal(false);
      alert('Site created successfully! ✅');
    } catch (err) {
      console.error('❌ Error creating site:', err);

      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      } else if (err.response?.status === 400) {
        alert(err.response.data.message || 'Invalid site data. Please check your inputs.');
      } else {
        alert(err.response?.data?.message || 'Failed to create site. Please try again.');
      }
      throw err;
    }
  };

  const handleUpdateSite = async (formData) => {
    try {
      const token = localStorage.getItem('accessToken');
      // console.log('📤 Updating site:', selectedSite._id, formData);

      const response = await axios.put(
        `${API_URL}/api/client-admin/sites/${selectedSite._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // console.log('✅ Site updated successfully:', response.data);
      setSites(prevSites =>
        prevSites.map(site =>
          site._id === selectedSite._id ? response.data.data : site
        )
      );

      setShowEditModal(false);
      setSelectedSite(null);
      alert(response.data.message || 'Site updated successfully! ✅');
    } catch (err) {
      console.error('❌ Error updating site:', err);

      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      } else if (err.response?.status === 403) {
        alert('You do not have permission to update this site.');
      } else if (err.response?.status === 404) {
        alert('Site not found. It may have been deleted.');
        await fetchSites();
      } else if (err.response?.status === 400) {
        alert(err.response.data.message || 'Invalid site data. Please check your inputs.');
      } else {
        alert(err.response?.data?.message || 'Failed to update site. Please try again.');
      }
      throw err;
    }
  };

  const handleDeleteSite = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('accessToken');
      // console.log('🗑️ Deleting site:', selectedSite._id);

      const response = await axios.delete(
        `${API_URL}/api/client-admin/sites/${selectedSite._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // console.log('✅ Site deleted successfully:', response.data);
      setSites(prevSites => prevSites.filter(site => site._id !== selectedSite._id));

      setShowDeleteModal(false);
      setSelectedSite(null);
      alert(response.data.message || 'Site deleted successfully! ✅');
    } catch (err) {
      console.error('❌ Error deleting site:', err);

      if (err.response?.status === 401) {
        alert('Session expired. Please login again.');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      } else if (err.response?.status === 403) {
        alert('You do not have permission to delete this site.');
      } else if (err.response?.status === 404) {
        alert('Site not found. It may have already been deleted.');
        await fetchSites();
      } else if (err.response?.status === 400) {
        const errorData = err.response.data;
        alert(
          errorData.message ||
          `Cannot delete site. It is assigned to ${errorData.assignedPMs || 0} project manager(s) and ${errorData.assignedSupervisors || 0} supervisor(s).`
        );
      } else {
        alert(err.response?.data?.message || 'Failed to delete site. Please try again.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewSite = (site) => {
    setSelectedSite(site);
    setShowViewModal(true);
  };

  const filteredSites = sites.filter(site => {
    const matchesSearch =
      site.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || site.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header title="Site Management" onMenuClick={() => setSidebarOpen(true)} />

      <main className="lg:ml-72 max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        {/* <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6"> <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200 shadow-sm"> <div className="text-3xl font-black text-blue-700">{sites.length}</div> <div className="text-sm text-blue-700 font-semibold mt-1">Total Sites</div> </div> <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200 shadow-sm"> <div className="text-3xl font-black text-green-700"> {sites.filter(s => s.status === 'Active').length} </div> <div className="text-sm text-green-700 font-semibold mt-1">Active</div> </div> <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border-2 border-yellow-200 shadow-sm"> <div className="text-3xl font-black text-yellow-700"> {sites.filter(s => s.status === 'Complelted').length} </div> <div className="text-sm text-yellow-700 font-semibold mt-1">Complelted</div> </div> <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200 shadow-sm"> <div className="text-3xl font-black text-gray-700"> {sites.filter(s => s.status === 'Inactive').length} </div> <div className="text-sm text-gray-700 font-semibold mt-1">Inactive</div> </div><div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border-2 border-orange-200 shadow-sm">
          <div className="text-3xl font-black text-orange-700">
            {sites.reduce((total, site) => total + (site.gates?.length || 0), 0)}
          </div>
          <div className="text-sm text-orange-700 font-semibold mt-1">Total Gates</div>
        </div> </div> */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"> */}
        {/* <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200 shadow-sm">
            <div className="text-3xl font-black text-blue-700">{sites.length}</div>
            <div className="text-sm text-blue-700 font-semibold mt-1">Total Sites</div>
          </div> */}
        {/* <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-2 border-green-200 shadow-sm">
            <div className="text-3xl font-black text-green-700">
              {sites.filter(s => s.status === 'Active').length}
            </div>
            <div className="text-sm text-green-700 font-semibold mt-1">Active</div>
          </div> */}
        {/* <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border-2 border-orange-200 shadow-sm">
            <div className="text-3xl font-black text-orange-700">
              {sites.reduce((total, site) => total + (site.gates?.length || 0), 0)}
            </div>
            <div className="text-sm text-orange-700 font-semibold mt-1">Total Gates</div>
          </div> */}
        {/* <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200 shadow-sm">
            <div className="text-3xl font-black text-gray-700">
              {sites.filter(s => s.status === 'Inactive').length}
            </div>
            <div className="text-sm text-gray-700 font-semibold mt-1">Inactive</div>
          </div> */}
        {/* </div> */}

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sites by name, location, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Complelted">Complelted</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-bold flex items-center gap-2 shadow-lg whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Site
          </button>
        </div>

        {/* Sites Grid */}
        {filteredSites.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200">
            <MapPin className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {sites.length === 0 ? 'No sites yet' : 'No sites found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'All'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first site'}
            </p>
            {sites.length === 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Your First Site
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map((site) => (
              <SiteCard
                key={site._id}
                site={site}
                onEdit={(site) => {
                  setSelectedSite(site);
                  setShowEditModal(true);
                }}
                onView={handleViewSite}
                onDelete={(site) => {
                  setSelectedSite(site);
                  setShowDeleteModal(true);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      <SiteModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddSite}
        mode="add"
      />

      <SiteModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSite(null);
        }}
        site={selectedSite}
        onSave={handleUpdateSite}
        mode="edit"
      />

      <ViewSiteModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedSite(null);
        }}
        site={selectedSite}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedSite(null);
        }}
        onConfirm={handleDeleteSite}
        siteName={selectedSite?.name}
        loading={actionLoading}
      />
    </div>
  );
};

export default SiteManagement;