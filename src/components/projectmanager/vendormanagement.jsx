"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Plus, Package, Eye, Edit, Mail, Phone, X, AlertCircle, CheckCircle, Building, Trash2,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';  // ✅ Import Header

const VendorManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [alert, setAlert] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    assignedSites: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Configure axios defaults
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  // Create axios instance with default config
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add request interceptor to include token
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch vendors
      const vendorsRes = await axiosInstance.get('/api/project/vendors');
      setVendors(vendorsRes.data);
      // console.log(vendorsRes.data);

      // Fetch sites for dropdown
      const sitesRes = await axiosInstance.get('/api/project/my-sites');
      setSites(sitesRes.data);
      // console.log(sitesRes.data);
      
    } catch (err) {
      console.error('Fetch error:', err);
      showAlert('error', err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Vendor name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone number must be 10 digits';
    }
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (formData.assignedSites.length === 0) errors.assignedSites = 'Select at least one site';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      const response = await axiosInstance.post('/api/project/vendors', formData);
      
      setVendors([...vendors, response.data]);
      showAlert('success', 'Vendor added successfully!');
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Submit error:', err);
      showAlert('error', err.response?.data?.message || 'Failed to add vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditVendor = (vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      assignedSites: vendor.assignedSites?.map(site => site._id) || []
    });
    setShowEditModal(true);
  };

  const handleUpdateVendor = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      const response = await axiosInstance.patch(
        `/api/project/vendors/${selectedVendor._id}`,
        formData
      );
      
      // Update vendor in state
      setVendors(vendors.map(v => 
        v._id === selectedVendor._id ? response.data : v
      ));
      
      showAlert('success', 'Vendor updated successfully!');
      setShowEditModal(false);
      setSelectedVendor(null);
      resetForm();
    } catch (err) {
      console.error('Update error:', err);
      showAlert('error', err.response?.data?.message || 'Failed to update vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewVendor = (vendor) => {
    setSelectedVendor(vendor);
    setShowViewModal(true);
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      await axiosInstance.delete(`/api/project/vendors/${vendorId}`);
      
      // Remove vendor from state
      setVendors(vendors.filter(v => v._id !== vendorId));
      showAlert('success', 'Vendor deleted successfully!');
    } catch (err) {
      console.error('Delete error:', err);
      showAlert('error', err.response?.data?.message || 'Failed to delete vendor');
    }
  };

  const handleToggleStatus = async (vendorId, currentStatus) => {
    try {
      const response = await axiosInstance.patch(
        `/api/project/vendors/${vendorId}/toggle-status`,
        { isActive: !currentStatus }
      );
      
      // Update vendor in state
      setVendors(vendors.map(v => 
        v._id === vendorId ? { ...v, isActive: !currentStatus } : v
      ));
      
      showAlert('success', `Vendor ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      console.error('Toggle status error:', err);
      showAlert('error', err.response?.data?.message || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      assignedSites: []
    });
    setFormErrors({});
  };

  const toggleSiteSelection = (siteId) => {
    setFormData(prev => ({
      ...prev,
      assignedSites: prev.assignedSites.includes(siteId)
        ? prev.assignedSites.filter(id => id !== siteId)
        : [...prev.assignedSites, siteId]
    }));
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

 const stats = {
  total: vendors.length,
  active: vendors.filter(v => v.isActive).length,
  inactive: vendors.filter(v => !v.isActive).length,
  trips: vendors.reduce((sum, v) => sum + (v.totalTrips || 0), 0),
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Alert Notification */}
      {alert && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
          alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-slide-in`}>
          {alert.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{alert.message}</span>
        </div>
      )}

      {/* ✅ Header Component with Dropdown */}
      <Header title="Vendors" onMenuClick={() => setSidebarOpen(true)} />

      {/* ✅ Main Content with proper spacing */}
      <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Total Vendors</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Active Vendors</div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Inactive Vendors</div>
            <div className="text-3xl font-bold text-green-600">{stats.inactive}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sm:col-span-2 lg:col-span-1">
            <div className="text-sm text-gray-600 mb-1">Total Trips</div>
            <div className="text-3xl font-bold text-gray-900">{stats.trips}</div>
          </div>
        </div>

        {/* Search & Add Button */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search vendor name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 sm:px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add New Vendor
          </button>
        </div>

        {/* Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vendor Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Address</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Assigned Sites</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total Trips</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No vendors found</p>
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Package className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="font-semibold text-gray-900">{vendor.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3 h-3" />
                            {vendor.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3 h-3" />
                            {vendor.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{vendor.address}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {vendor.assignedSites?.length || 0} Sites
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(vendor._id, vendor.isActive)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                            vendor.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {vendor.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{vendor.totalTrips || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditVendor(vendor)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-indigo-600 transition" 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleViewVendor(vendor)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition" 
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteVendor(vendor._id)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-red-600 transition" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cards - Mobile/Tablet */}
        <div className="lg:hidden space-y-4">
          {filteredVendors.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No vendors found</p>
            </div>
          ) : (
            filteredVendors.map((vendor) => (
              <div key={vendor._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{vendor.name}</div>
                      <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mt-1">
                        {vendor.assignedSites?.length || 0} Sites
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(vendor._id, vendor.isActive)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                      vendor.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {vendor.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                
                <div className="space-y-2 mb-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-3.5 h-3.5" />
                    {vendor.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-3.5 h-3.5" />
                    {vendor.phone}
                  </div>
                  <div className="text-gray-600">{vendor.address}</div>
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Total Trips:</span>
                    <span className="font-semibold text-gray-900">{vendor.totalTrips || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditVendor(vendor)}
                    className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleViewVendor(vendor)}
                    className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button 
                    onClick={() => handleDeleteVendor(vendor._id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Add New Vendor</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter vendor name"
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="vendor@example.com"
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1234567890"
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none ${
                      formErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter address"
                  />
                  {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Sites * (Select multiple)</label>
                <div className={`border rounded-lg p-4 max-h-48 overflow-y-auto ${
                  formErrors.assignedSites ? 'border-red-500' : 'border-gray-300'
                }`}>
                  {sites.length === 0 ? (
                    <p className="text-gray-500 text-sm">No sites available</p>
                  ) : (
                    <div className="space-y-2">
                      {sites.map((site) => (
                        <label key={site._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.assignedSites.includes(site._id)}
                            onChange={() => toggleSiteSelection(site._id)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-600"
                          />
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{site.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formErrors.assignedSites && <p className="text-red-500 text-xs mt-1">{formErrors.assignedSites}</p>}
                {formData.assignedSites.length > 0 && (
                  <p className="text-indigo-600 text-xs mt-2">{formData.assignedSites.length} site(s) selected</p>
                )}
              </div>

              {/* UNCOMMENTED BUTTONS - यहाँ buttons uncomment हैं */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Vendor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Edit Vendor</h2>
              <button onClick={() => { setShowEditModal(false); resetForm(); setSelectedVendor(null); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter vendor name"
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="vendor@example.com"
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1234567890"
                  />
                  {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none ${
                      formErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter address"
                  />
                  {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Sites * (Select multiple)</label>
                <div className={`border rounded-lg p-4 max-h-48 overflow-y-auto ${
                  formErrors.assignedSites ? 'border-red-500' : 'border-gray-300'
                }`}>
                  {sites.length === 0 ? (
                    <p className="text-gray-500 text-sm">No sites available</p>
                  ) : (
                    <div className="space-y-2">
                      {sites.map((site) => (
                        <label key={site._id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.assignedSites.includes(site._id)}
                            onChange={() => toggleSiteSelection(site._id)}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-600"
                          />
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{site.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {formErrors.assignedSites && <p className="text-red-500 text-xs mt-1">{formErrors.assignedSites}</p>}
                {formData.assignedSites.length > 0 && (
                  <p className="text-indigo-600 text-xs mt-2">{formData.assignedSites.length} site(s) selected</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowEditModal(false); resetForm(); setSelectedVendor(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateVendor}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Vendor'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Vendor Modal - Enhanced */}
      {showViewModal && selectedVendor && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-modal-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Vendor Details</h2>
                <p className="text-sm text-gray-600 mt-1">Complete vendor information with trip statistics</p>
              </div>
              <button
                onClick={() => { setShowViewModal(false); setSelectedVendor(null); }}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Vendor Header with Stats */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Package className="w-8 h-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedVendor.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${selectedVendor.isActive
                        ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-700"
                        : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700"
                      }`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${selectedVendor.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      {selectedVendor.isActive ? "Active" : "Inactive"}
                    </span>

                    {/* Quick Stats */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Building className="w-4 h-4 text-gray-500" />
                        {selectedVendor.assignedSites?.length || 0} sites
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {selectedVendor.totalTrips || 0} trips
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <h4 className="font-semibold text-gray-900">Email</h4>
                  </div>
                  <p className="text-gray-700 break-all">{selectedVendor.email || "—"}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="w-5 h-5 text-gray-500" />
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                  </div>
                  <p className="text-gray-700">{selectedVendor.phone || "—"}</p>
                </div>
              </div>

              {/* Address */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin  className="w-5 h-5 text-gray-500" />
                  <h4 className="font-semibold text-gray-900">Address</h4>
                </div>
                <p className="text-gray-700">{selectedVendor.address || "—"}</p>
              </div>

              {/* Overall Trip Statistics */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Trip Statistics Overview
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {selectedVendor.totalTrips || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Trips</div>
                    <div className="text-xs text-gray-500 mt-1">All time</div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-green-600">
                      {selectedVendor.activeTrips || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Active Trips</div>
                    <div className="text-xs text-gray-500 mt-1">Currently inside</div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-amber-600">
                      {selectedVendor.todayTrips || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Today's Trips</div>
                    <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-purple-600">
                      {selectedVendor.assignedSites?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Assigned Sites</div>
                    <div className="text-xs text-gray-500 mt-1">Active locations</div>
                  </div>
                </div>
              </div>

              {/* Assigned Sites */}
              {selectedVendor.assignedSites?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Assigned Sites ({selectedVendor.assignedSites.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedVendor.assignedSites.map(site => (
                      <div key={site._id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-indigo-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">{site.name}</div>
                            {site.location && (
                              <div className="text-sm text-gray-600 mt-1 truncate">{site.location}</div>
                            )}
                          </div>
                          <Building className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>

                        {/* Site-wise trip stats if available */}
                        {selectedVendor.siteWiseTrips && selectedVendor.siteWiseTrips.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              {(() => {
                                const siteTrip = selectedVendor.siteWiseTrips.find(t => t.siteId === site._id);
                                return siteTrip ? (
                                  <>
                                    <div className="text-center">
                                      <div className="font-semibold text-gray-900">{siteTrip.totalTrips || 0}</div>
                                      <div className="text-gray-500">Total</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="font-semibold text-amber-600">{siteTrip.todayTrips || 0}</div>
                                      <div className="text-gray-500">Today</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="font-semibold text-green-600">{siteTrip.activeTrips || 0}</div>
                                      <div className="text-gray-500">Active</div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="col-span-3 text-center text-gray-500 text-sm">
                                    No trips recorded
                                  </div>
                                );
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Site-wise Trip Statistics */}
              {/* {selectedVendor.siteWiseTrips && selectedVendor.siteWiseTrips.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Site-wise Trip Details
            </h4>
            <div className="space-y-3">
              {selectedVendor.siteWiseTrips.map((siteTrip, index) => {
                // Find site name from assignedSites array
                const site = selectedVendor.assignedSites?.find(s => s._id === siteTrip.siteId);
                const siteName = site?.name || `Site ${index + 1}`;
                
                return (
                  <div key={siteTrip.siteId || index} className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-indigo-500" />
                        <div>
                          <div className="font-semibold text-gray-900">{siteName}</div>
                          {site?.location && (
                            <div className="text-xs text-gray-500">{site.location}</div>
                          )}
                        </div>
                      </div>
                      { <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-medium">
                        Site ID: {siteTrip.siteId?.substring(0, 6)}...
                      </span> }
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{siteTrip.totalTrips || 0}</div>
                        <div className="text-sm text-gray-600">Total Trips</div>
                        <div className="text-xs text-gray-500 mt-1">All time</div>
                      </div>
                      
                      <div className="text-center p-3 bg-amber-50 rounded-lg">
                        <div className="text-2xl font-bold text-amber-600">{siteTrip.todayTrips || 0}</div>
                        <div className="text-sm text-gray-600">Today's Trips</div>
                        <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{siteTrip.activeTrips || 0}</div>
                        <div className="text-sm text-gray-600">Active Trips</div>
                        <div className="text-xs text-gray-500 mt-1">Currently inside</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )} */}

              {/* Additional Vendor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Manager (if available) */}
                {selectedVendor.projectManagerId && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <h4 className="font-semibold text-gray-900">Project Manager</h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-900 font-medium">{selectedVendor.projectManagerId.name}</p>
                      <p className="text-gray-600 text-sm">{selectedVendor.projectManagerId.email}</p>
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <h4 className="font-semibold text-gray-900">Joined Date</h4>
                  </div>
                  <p className="text-gray-700">
                    {selectedVendor.createdAt
                      ? new Date(selectedVendor.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                      : "—"
                    }
                  </p>
                  {selectedVendor.createdAt && (
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(selectedVendor.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* No Data Messages */}
              {(!selectedVendor.siteWiseTrips || selectedVendor.siteWiseTrips.length === 0) && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    <div>
                      <h5 className="font-semibold text-amber-800">No Trip Data Available</h5>
                      <p className="text-amber-700 text-sm mt-1">
                        This vendor hasn't recorded any trips yet. Trip statistics will appear here once trips are logged.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              {/* <button
                onClick={() => handleEditVendor(selectedVendor)}
                className="flex-1 px-4 py-3 border-2 border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 transition font-semibold flex items-center justify-center gap-2"
              >
                <Edit className="w-5 h-5" />
                Edit Vendor
              </button> */}
              <button
                onClick={() => { setShowViewModal(false); setSelectedVendor(null); }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition font-semibold"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VendorManagement;