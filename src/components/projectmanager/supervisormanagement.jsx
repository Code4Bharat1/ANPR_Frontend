"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Plus, User, Mail,
  Phone, Power, X, Building2, Lock,
  UserCheck, Check, Eye, Edit, MapPin,
  Clock, AlertCircle, Loader2
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Validation functions
const validatePhone = (phone) => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password) => {
  return password.length >= 6;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const SupervisorManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSites, setLoadingSites] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [currentProjectManager, setCurrentProjectManager] = useState(null);
  const [loadingCurrentPM, setLoadingCurrentPM] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    password: '',
    siteId: '',
    projectManagerId: '',
  });

  useEffect(() => {
    fetchSupervisors();
    fetchSites();
    fetchCurrentProjectManager();
  }, []);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    // You can replace this with react-hot-toast or any toast library
    if (type === 'error') {
      alert(`❌ ${message}`);
    } else {
      alert(`✅ ${message}`);
    }
  };

  // Fetch current logged-in project manager
  const fetchCurrentProjectManager = async () => {
    try {
      setLoadingCurrentPM(true);
      console.log('Fetching PM profile...');

      const response = await api.get('/api/project/profile');
      console.log('Full API Response:', response.data);

      // Store the response as-is
      setCurrentProjectManager(response.data);

      // The PM data might be in response.data.data or response.data
      const pmData = response.data.data || response.data;
      console.log('PM Data for display:', pmData);

      // IMPORTANT: We might not get _id from this endpoint
      // So we need to get it from elsewhere or the backend will handle it

      return response.data;
    } catch (err) {
      console.error('Error fetching current project manager:', err);
      alert(err.response?.data?.message || 'Failed to fetch your profile');
      return null;
    } finally {
      setLoadingCurrentPM(false);
    }
  };

  // Fetch supervisors with retry logic
  const fetchSupervisors = async (retryCount = 0) => {
    try {
      setLoading(true);
      const response = await api.get('/api/project/supervisors');

      let supervisorsData = response.data.supervisors || response.data.data || response.data || [];

      if (!Array.isArray(supervisorsData)) {
        supervisorsData = [];
      }

      setSupervisors(supervisorsData);
    } catch (err) {
      console.error('Error fetching supervisors:', err);

      // Retry logic for network errors
      if (retryCount < 2 && (!err.response || err.code === 'ECONNABORTED')) {
        console.log(`Retrying fetchSupervisors (attempt ${retryCount + 1})`);
        setTimeout(() => fetchSupervisors(retryCount + 1), 1000);
        return;
      }

      showToast(err.response?.data?.message || 'Failed to fetch supervisors', 'error');
      setSupervisors([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch sites with improved error handling
  const fetchSites = async () => {
    try {
      setLoadingSites(true);

      // Race condition prevention
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await api.get('/api/project/my-sites', {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let sitesData = response.data.data || response.data || [];

      if (!Array.isArray(sitesData)) {
        console.warn('Sites data is not an array:', sitesData);
        sitesData = [];
      }

      setSites(sitesData);

    } catch (err) {
      console.error('Error fetching sites:', err);

      if (err.name === 'AbortError') {
        showToast('Site loading timed out. Please try again.', 'error');
      } else if (err.response?.status === 401) {
        showToast('Session expired. Please login again.', 'error');
        // Optional: redirect to login
        // window.location.href = '/login';
      } else {
        showToast(err.response?.data?.message || 'Failed to fetch your assigned sites', 'error');
      }

      setSites([]);
    } finally {
      setLoadingSites(false);
    }
  };

  // Validate form data
  const validateForm = (isEdit = false) => {
    const errors = {};

    if (!formData.name?.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!isEdit && !formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password && !validatePassword(formData.password)) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.siteId) {
      errors.siteId = 'Please select a site';
    }

    if (formData.mobile && !validatePhone(formData.mobile)) {
      errors.mobile = 'Please enter a valid 10-digit phone number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open add modal
  const handleOpenAddModal = async () => {
    if (!currentProjectManager) {
      await fetchCurrentProjectManager();
    }

    // Reset form and validation errors
    setFormData({
      name: '',
      email: '',
      mobile: '',
      address: '',
      password: '',
      siteId: '',
      projectManagerId: currentProjectManager?._id || '',
    });

    setValidationErrors({});
    setShowAdd(true);
    fetchSites();
  };

  const handleCreateSupervisor = async () => {
    try {
      console.log('=== Starting supervisor creation ===');

      // Validation
      if (!formData.name?.trim()) {
        alert('Please enter supervisor name');
        return;
      }
      if (!formData.email?.trim()) {
        alert('Please enter email address');
        return;
      }
      if (!validateEmail(formData.email)) {
        alert('Please enter a valid email address');
        return;
      }
      if (!formData.password) {
        alert('Please enter password');
        return;
      }
      if (!formData.siteId) {
        alert('Please select a site');
        return;
      }

      // Prepare payload WITHOUT projectManagerId
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile || '',
        address: formData.address || '',
        password: formData.password,
        siteId: formData.siteId
        // NO projectManagerId here - backend uses req.user.id
      };

      console.log('Sending payload:', payload);

      const response = await api.post('/api/project/supervisors', payload);

      console.log('Success! Response:', response.data);
      alert('Supervisor created successfully!');

      // Close modal and reset
      setShowAdd(false);
      setFormData({
        name: '',
        email: '',
        mobile: '',
        address: '',
        password: '',
        siteId: '',
        projectManagerId: '', // Not needed
      });

      // Refresh the list
      await fetchSupervisors();

    } catch (err) {
      console.error('Error creating supervisor:', err);

      let errorMessage = 'Failed to create supervisor';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to create supervisors for this site.';
      }

      alert(`Error: ${errorMessage}`);
    }
  };
  // Update supervisor
  const handleUpdateSupervisor = async () => {
    if (!selectedSupervisor?._id) {
      showToast('No supervisor selected', 'error');
      return;
    }

    if (!validateForm(true)) {
      showToast('Please fix the validation errors', 'error');
      return;
    }

    setIsUpdating(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile || '',
        address: formData.address || '',
        siteId: formData.siteId,
      };

      // Only include password if provided
      if (formData.password && formData.password.trim() !== '') {
        if (!validatePassword(formData.password)) {
          showToast('Password must be at least 6 characters', 'error');
          setIsUpdating(false);
          return;
        }
        payload.password = formData.password;
      }

      console.log('Updating supervisor:', payload);
      await api.put(`/api/project/supervisors/${selectedSupervisor._id}`, payload);

      // Success
      setShowEdit(false);
      setSelectedSupervisor(null);
      setFormData({
        name: '',
        email: '',
        mobile: '',
        address: '',
        password: '',
        siteId: '',
        projectManagerId: currentProjectManager?._id || '',
      });
      setValidationErrors({});

      await fetchSupervisors();

      showToast('Supervisor updated successfully!');

    } catch (err) {
      console.error('Error updating supervisor:', err);

      let errorMessage = 'Failed to update supervisor';

      if (err.response?.status === 403) {
        errorMessage = 'Permission denied. You cannot update this supervisor or assign to this site.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Supervisor not found';
      } else if (err.response?.status === 409) {
        errorMessage = 'Email already exists';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      showToast(`Error: ${errorMessage}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle supervisor status
  const handleToggleStatus = async (supervisorId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this supervisor?`)) {
      return;
    }

    try {
      await api.patch(`/api/project/supervisors/${supervisorId}/enable-disable`);

      showToast(`Supervisor ${currentStatus ? 'disabled' : 'enabled'} successfully!`);
      await fetchSupervisors();

    } catch (err) {
      console.error('Error updating status:', err);
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  // Filter supervisors
  const filteredSupervisors = Array.isArray(supervisors) ? supervisors.filter(supervisor => {
    const matchesSearch = supervisor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supervisor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' ||
      (filterStatus === 'Active' && supervisor.isActive) ||
      (filterStatus === 'Inactive' && !supervisor.isActive);
    return matchesSearch && matchesStatus;
  }) : [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading supervisors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header title="Supervisor Management" onMenuClick={() => setSidebarOpen(true)} />

      <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Supervisors</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {Array.isArray(supervisors) ? supervisors.length : 0}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Active</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600">
              {Array.isArray(supervisors) ? supervisors.filter(s => s.isActive).length : 0}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Inactive</div>
            <div className="text-2xl sm:text-3xl font-bold text-red-600">
              {Array.isArray(supervisors) ? supervisors.filter(s => !s.isActive).length : 0}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search supervisors by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm sm:text-base"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button
            onClick={handleOpenAddModal}
            className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={loadingSites}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            {loadingSites ? 'Loading...' : 'Add Supervisor'}
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned Site</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Today's Trips</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSupervisors.map((supervisor) => (
                  <tr key={supervisor._id || supervisor.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{supervisor.name}</div>
                        <div className="text-sm text-gray-600">{supervisor.email}</div>
                        {supervisor.mobile && (
                          <div className="text-sm text-gray-500">{supervisor.mobile}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {supervisor.siteId?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${supervisor.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {supervisor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {supervisor.todayTrips || 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedSupervisor(supervisor);
                            setShowView(true);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg transition text-blue-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSupervisor(supervisor);
                            setFormData({
                              name: supervisor.name || '',
                              email: supervisor.email || '',
                              mobile: supervisor.mobile || '',
                              address: supervisor.address || '',
                              password: '',
                              siteId: supervisor.siteId?._id || supervisor.siteId || '',
                              projectManagerId: supervisor.projectManagerId?._id || supervisor.projectManagerId || '',
                            });
                            setValidationErrors({});
                            setShowEdit(true);
                            fetchSites();
                          }}
                          className="p-2 hover:bg-orange-50 rounded-lg transition text-orange-600"
                          title="Edit Supervisor"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(supervisor._id, supervisor.isActive)}
                          className={`p-2 hover:bg-gray-100 rounded-lg transition ${supervisor.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                            }`}
                          title={supervisor.isActive ? 'Disable Supervisor' : 'Enable Supervisor'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredSupervisors.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No supervisors found</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
              )}
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filteredSupervisors.map((supervisor) => (
            <div key={supervisor._id || supervisor.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{supervisor.name}</h3>
                  <p className="text-sm text-gray-600">{supervisor.email}</p>
                  {supervisor.mobile && (
                    <p className="text-sm text-gray-500">{supervisor.mobile}</p>
                  )}
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${supervisor.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
                  }`}>
                  {supervisor.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="text-sm text-gray-600">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  {supervisor.siteId?.name || '-'}
                </div>
                <div className="text-sm text-gray-600">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Today's Trips: <span className="font-semibold">{supervisor.todayTrips || 0}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedSupervisor(supervisor);
                    setShowView(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-semibold text-sm transition"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => {
                    setSelectedSupervisor(supervisor);
                    setFormData({
                      name: supervisor.name || '',
                      email: supervisor.email || '',
                      mobile: supervisor.mobile || '',
                      address: supervisor.address || '',
                      password: '',
                      siteId: supervisor.siteId?._id || supervisor.siteId || '',
                      projectManagerId: supervisor.projectManagerId?._id || supervisor.projectManagerId || '',
                    });
                    setValidationErrors({});
                    setShowEdit(true);
                    fetchSites();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg font-semibold text-sm transition"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(supervisor._id || supervisor.id, supervisor.isActive)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition ${supervisor.isActive
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredSupervisors.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No supervisors found</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* View Supervisor Modal */}
      {showView && selectedSupervisor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Supervisor Details</h2>
              <button
                onClick={() => {
                  setShowView(false);
                  setSelectedSupervisor(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-base font-semibold text-gray-900 mt-1">{selectedSupervisor.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-base text-gray-900 mt-1">{selectedSupervisor.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-base text-gray-900 mt-1">{selectedSupervisor.mobile || '-'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-base text-gray-900 mt-1">{selectedSupervisor.address || '-'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedSupervisor.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                    }`}>
                    {selectedSupervisor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Assigned Site</label>
                <p className="text-base text-gray-900 bg-gray-50 px-3 py-2 rounded mt-1">
                  {selectedSupervisor.siteId?.name || '-'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Today's Trips</label>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {selectedSupervisor.todayTrips || 0}
                </p>
              </div>

              {selectedSupervisor.projectManagerId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Project Manager</label>
                  <p className="text-base text-gray-900 bg-blue-50 px-3 py-2 rounded mt-1">
                    {selectedSupervisor.projectManagerId.name || '-'}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowView(false);
                  setSelectedSupervisor(null);
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supervisor Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Add Supervisor
              </h2>
              <button
                onClick={() => setShowAdd(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Name Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="Enter supervisor name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border ${validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="supervisor@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border ${validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  placeholder="9876543210"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border ${validationErrors.mobile ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
                {validationErrors.mobile && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.mobile}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">Enter 10-digit number (optional)</p>
              </div>

              {/* Address Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <textarea
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4" />
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    placeholder="Enter password (min. 6 characters)"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-4 py-2.5 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border ${validationErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.password}
                  </p>
                )}
              </div>

              {/* Project Manager Info */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <UserCheck className="w-4 h-4" />
                  Your Profile (Project Manager)
                </label>
                {loadingCurrentPM ? (
                  <div className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-600">Loading your profile...</span>
                  </div>
                ) : currentProjectManager ? (
                  <div className="w-full border border-gray-300 bg-blue-50 px-4 py-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-blue-700">{currentProjectManager.name}</div>
                        <div className="text-sm text-blue-600">{currentProjectManager.email}</div>
                      </div>
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-xs text-blue-500 mt-1">
                      You are creating a supervisor under your management
                    </div>
                  </div>
                ) : (
                  <div className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
                    Unable to load your profile. Supervisor will be created under your account.
                  </div>
                )}
              </div>

              {/* Site Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4" />
                  Assigned Site <span className="text-red-500">*</span>
                </label>
                {loadingSites ? (
                  <div className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-600">Loading sites...</span>
                  </div>
                ) : sites.length === 0 ? (
                  <div className="border border-gray-300 rounded-lg p-4 text-center">
                    <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-1">No sites assigned to you</p>
                    <p className="text-xs text-gray-400">Contact admin to get sites assigned</p>
                  </div>
                ) : (
                  <>
                    <select
                      value={formData.siteId}
                      onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border ${validationErrors.siteId ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    >
                      <option value="">Select Site</option>
                      {sites.map((site) => (
                        <option key={site._id || site.id} value={site._id || site.id}>
                          {site.name || site.siteName}
                        </option>
                      ))}
                    </select>
                    {validationErrors.siteId && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.siteId}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAdd(false)}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSupervisor}
                disabled={
                  !formData.name?.trim() ||
                  !formData.email?.trim() ||
                  !formData.password ||
                  !formData.siteId
                  // REMOVED: !formData.projectManagerId
                }
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Create Supervisor
              </button> 
            </div>
          </div>
        </div>
      )}

      {/* Edit Supervisor Modal */}
      {showEdit && selectedSupervisor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Edit Supervisor
              </h2>
              <button
                onClick={() => {
                  setShowEdit(false);
                  setSelectedSupervisor(null);
                  setValidationErrors({});
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="John Doe"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border ${validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="john@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border ${validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  placeholder="9876543210"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border ${validationErrors.mobile ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
                {validationErrors.mobile && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.mobile}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <textarea
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4" />
                  Password (Leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    placeholder="Enter new password (min. 6 characters)"
                    type={showEditPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full px-4 py-2.5 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border ${validationErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {validationErrors.password}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">Leave blank to keep current password</p>
              </div>

              {/* Site Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4" />
                  Assigned Site <span className="text-red-500">*</span>
                </label>
                {loadingSites ? (
                  <div className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-gray-50 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span className="text-sm text-gray-600">Loading sites...</span>
                  </div>
                ) : sites.length === 0 ? (
                  <div className="border border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
                    No sites available
                  </div>
                ) : (
                  <>
                    <select
                      value={formData.siteId}
                      onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border ${validationErrors.siteId ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    >
                      <option value="">Select Site</option>
                      {sites.map((site) => (
                        <option key={site._id || site.id} value={site._id || site.id}>
                          {site.name || site.siteName}
                        </option>
                      ))}
                    </select>
                    {validationErrors.siteId && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validationErrors.siteId}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEdit(false);
                  setSelectedSupervisor(null);
                  setValidationErrors({});
                }}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSupervisor}
                disabled={
                  !formData.name ||
                  !formData.email ||
                  !formData.siteId ||
                  isUpdating ||
                  Object.keys(validationErrors).length > 0
                }
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Supervisor'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorManagement;