"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Plus, User, Mail,
  Phone, Power, X, Building2, Lock,
  UserCheck, Check, Eye, Edit, MapPin,
  Clock, AlertCircle, Loader2, Calendar, Shield, Briefcase,
  EyeOff
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const validatePhone = (phone) => {
  // Check if phone is falsy (null, undefined, empty string)
  if (!phone && phone !== 0) return true; // Changed this line
  
  // Convert to string if it's a number
  const phoneStr = String(phone);
  
  // Check if it's an empty string after conversion
  if (phoneStr.trim() === '') return true;
  
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phoneStr); // Test on string version
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
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [currentProjectManager, setCurrentProjectManager] = useState(null);
  const [loadingCurrentPM, setLoadingCurrentPM] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    siteId: '',
    projectManagerId: '',
    password: '', // Sirf password rakho
    // confirmPassword: '', // Remove karo
  });

  useEffect(() => {
    fetchSupervisors();
    fetchSites();
    fetchCurrentProjectManager();
  }, []);

  const clearError = () => {
    setErrorMessage('');
  };

  const showToast = (message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transform transition-transform duration-300 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
      }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const fetchCurrentProjectManager = async () => {
    try {
      setLoadingCurrentPM(true);
      const response = await api.get('/api/project/profile');
      setCurrentProjectManager(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching current project manager:', err);
      showToast(err.response?.data?.message || 'Failed to fetch your profile', 'error');
      return null;
    } finally {
      setLoadingCurrentPM(false);
    }
  };

  const fetchSupervisors = async () => {
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
      showToast(err.response?.data?.message || 'Failed to fetch supervisors', 'error');
      setSupervisors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      setLoadingSites(true);
      const response = await api.get('/api/project/my-sites');
      let sitesData = response.data.data || response.data || [];

      if (!Array.isArray(sitesData)) {
        sitesData = [];
      }

      setSites(sitesData);
    } catch (err) {
      console.error('Error fetching sites:', err);
      showToast(err.response?.data?.message || 'Failed to fetch your assigned sites', 'error');
      setSites([]);
    } finally {
      setLoadingSites(false);
    }
  };

  const handleOpenAddModal = async () => {
    if (!currentProjectManager) {
      await fetchCurrentProjectManager();
    }

    setFormData({
      name: '',
      email: '',
      mobile: '',
      address: '',
      siteId: '',
      projectManagerId: currentProjectManager?._id || '',
    });

    setValidationErrors({});
    setErrorMessage('');
    setShowAdd(true);

    await fetchSites();
  };

 const handleCreateSupervisor = async () => {
  try {
    setIsCreating(true);
    setErrorMessage('');
    
    // Validation
    if (!formData.name?.trim()) {
      setErrorMessage('Please enter supervisor name');
      return;
    }
    if (!formData.email?.trim()) {
      setErrorMessage('Please enter email address');
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    if (!formData.siteId) {
      setErrorMessage('Please select a site');
      return;
    }
    if (formData.mobile && !validatePhone(formData.mobile)) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      return;
    }
    // PASSWORD VALIDATION
    if (!formData.password || formData.password.trim() === '') {
      setErrorMessage('Please enter a password');
      return;
    }
    if (formData.password.length < 8) { // Changed from 6 to 8
      setErrorMessage('Password must be at least 8 characters long');
      return;
    }

    // Prepare payload
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      mobile: formData.mobile || '',
      address: formData.address || '',
      siteId: formData.siteId,
      password: formData.password,
    };

    if (currentProjectManager?._id) {
      payload.projectManagerId = currentProjectManager._id;
    }

    console.log('Creating supervisor with payload:', { ...payload, password: '***' });

    const response = await api.post('/api/project/supervisors', payload);
    
    console.log('Response:', response.data);
    
    if (response.data.success || response.data._id) {
      showToast('Supervisor created successfully!');
      
      // Close modal and reset
      setShowAdd(false);
      setFormData({
        name: '',
        email: '',
        mobile: '',
        address: '',
        siteId: '',
        projectManagerId: '',
        password: '',
      });
      setShowPassword(false);

      // Refresh the list
      await fetchSupervisors();
    } else {
      throw new Error(response.data.message || 'Failed to create supervisor');
    }

  } catch (err) {
    console.error('Error creating supervisor:', err);
    
    let errorMessage = 'Failed to create supervisor';
    
    if (err.response?.status === 400) {
      if (err.response.data?.error?.includes('password')) {
        errorMessage = 'Password is required. Please enter a valid password.';
      } else {
        errorMessage = err.response.data?.message || 'Invalid request data';
      }
    } else if (err.response?.status === 401) {
      errorMessage = 'Session expired. Please login again.';
      setTimeout(() => window.location.href = '/login', 2000);
    } else if (err.response?.status === 403) {
      errorMessage = 'You do not have permission to create supervisors for this site.';
    } else if (err.response?.status === 404) {
      errorMessage = 'Site not found. Please select a valid site.';
    } else if (err.response?.status === 409) {
      errorMessage = 'A supervisor with this email already exists.';
    } else if (err.response?.status === 500) {
      errorMessage = 'Server error. Please try again later or contact support.';
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setErrorMessage(errorMessage);
    showToast(errorMessage, 'error');
    
  } finally {
    setIsCreating(false);
  }
};

  const handleUpdateSupervisor = async () => {
  if (!selectedSupervisor?._id) {
    setErrorMessage('No supervisor selected');
    return;
  }

  try {
    setIsUpdating(true);
    setErrorMessage('');

    if (!formData.name?.trim()) {
      setErrorMessage('Please enter supervisor name');
      return;
    }
    if (!formData.email?.trim()) {
      setErrorMessage('Please enter email address');
      return;
    }
    if (!validateEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }
    if (!formData.siteId) {
      setErrorMessage('Please select a site');
      return;
    }
    if (formData.mobile && !validatePhone(formData.mobile)) {
      setErrorMessage('Please enter a valid 10-digit phone number');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      mobile: formData.mobile || '',
      address: formData.address || '',
      siteId: formData.siteId,
    };

    console.log('Updating supervisor with payload:', payload);

    const response = await api.put(`/api/project/supervisors/${selectedSupervisor._id}`, payload);
    
    // DEBUG: Check what the response actually contains
    console.log('Update response:', response.data);
    
    // More flexible success check
    if (response.status === 200 || response.status === 201) {
      // If we get a success status, consider it successful
      showToast('Supervisor updated successfully!');
      
      setShowEdit(false);
      setSelectedSupervisor(null);
      setFormData({
        name: '',
        email: '',
        mobile: '',
        address: '',
        siteId: '',
        projectManagerId: currentProjectManager?._id || '',
      });

      await fetchSupervisors();
    } else {
      // If response has a message, use it
      throw new Error(response.data.message || 'Failed to update supervisor');
    }

  } catch (err) {
    console.error('Error updating supervisor:', err);
    
    let errorMessage = 'Failed to update supervisor';

    if (err.response?.status === 400) {
      errorMessage = err.response.data?.message || 'Invalid request data';
    } else if (err.response?.status === 401) {
      errorMessage = 'Session expired. Please login again.';
      setTimeout(() => window.location.href = '/login', 2000);
    } else if (err.response?.status === 403) {
      errorMessage = 'Permission denied. You cannot update this supervisor or assign to this site.';
    } else if (err.response?.status === 404) {
      errorMessage = 'Supervisor not found';
    } else if (err.response?.status === 409) {
      errorMessage = 'Email already exists';
    } else if (err.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message;
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    setErrorMessage(errorMessage);
    showToast(errorMessage, 'error');
    
  } finally {
    setIsUpdating(false);
  }
};

  const handleToggleStatus = async (supervisorId, currentStatus) => {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'disable' : 'enable'} this supervisor?`)) {
      return;
    }

    try {
      const response = await api.patch(`/api/project/supervisors/${supervisorId}/enable-disable`);

      if (response.data.success || response.data.isActive !== undefined) {
        showToast(`Supervisor ${currentStatus ? 'disabled' : 'enabled'} successfully!`);
        await fetchSupervisors();
      } else {
        throw new Error('Failed to update status');
      }

    } catch (err) {
      console.error('Error updating status:', err);

      let errorMessage = 'Failed to update status';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      showToast(errorMessage, 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  const filteredSupervisors = Array.isArray(supervisors) ? supervisors.filter(supervisor => {
    const matchesSearch = supervisor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supervisor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' ||
      (filterStatus === 'Active' && supervisor.isActive) ||
      (filterStatus === 'Inactive' && !supervisor.isActive);
    return matchesSearch && matchesStatus;
  }) : [];

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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSupervisors.map((supervisor) => (
                  <tr key={supervisor._id} className="hover:bg-gray-50 transition">
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
                              siteId: supervisor.siteId?._id || supervisor.siteId || '',
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
            <div key={supervisor._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
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
                      siteId: supervisor.siteId?._id || supervisor.siteId || '',
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
                  onClick={() => handleToggleStatus(supervisor._id, supervisor.isActive)}
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

      {/* YEH HAI VIEW MODAL BHAI - Abhi add kiya hai */}
      {showView && selectedSupervisor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
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

            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedSupervisor.name}</h3>
                  <p className="text-gray-600">{selectedSupervisor.email}</p>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedSupervisor.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                      }`}>
                      {selectedSupervisor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <p className="text-gray-900 font-medium pl-6">
                    {selectedSupervisor.mobile || 'Not Provided'}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Calendar className="w-4 h-4" />
                    Created On
                  </label>
                  <p className="text-gray-900 font-medium pl-6">
                    {formatDate(selectedSupervisor.createdAt)}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <MapPin className="w-4 h-4" />
                  Address
                </label>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-gray-900">
                    {selectedSupervisor.address || 'No address provided'}
                  </p>
                </div>
              </div>

              {/* Site Details */}
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                  <Building2 className="w-4 h-4" />
                  Assigned Site
                </label>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <p className="font-medium text-blue-700">
                      {selectedSupervisor.siteId?.name || 'Not Assigned'}
                    </p>
                  </div>
                  {selectedSupervisor.siteId?.address && (
                    <p className="text-sm text-blue-600 mt-1 ml-7">
                      {selectedSupervisor.siteId.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Project Manager */}
              {selectedSupervisor.projectManagerId && (
                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Briefcase className="w-4 h-4" />
                    Reporting To (Project Manager)
                  </label>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">
                          {selectedSupervisor.projectManagerId.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-green-600">
                          {selectedSupervisor.projectManagerId.email || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                {/* <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Shield className="w-4 h-4" />
                    Supervisor ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-1.5 rounded">
                    {selectedSupervisor._id?.substring(0, 8) || 'N/A'}
                  </p>
                </div> */}

                <div className="space-y-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Clock className="w-4 h-4" />
                    Last Updated
                  </label>
                  <p className="text-gray-900 font-medium">
                    {formatDate(selectedSupervisor.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowView(false);
                  setSelectedSupervisor(null);
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supervisor Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Supervisor</h2>
              <button
                onClick={() => setShowAdd(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Error Message */}
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-medium">{errorMessage}</p>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-sm text-red-600 hover:text-red-800 mt-2"
                  >
                    Clear error
                  </button>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter supervisor name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="supervisor@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={formData.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, mobile: value });
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.mobile ? `${formData.mobile.length}/10 digits` : 'Enter 10-digit number (optional)'}
                </p>
              </div>

              {/* Address Field */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Address *
                </label>
                <textarea
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4" />
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    Minimum 8 characters required
                  </p>
                  <p className={`text-xs font-medium ${formData && formData.password && formData.password.length >= 8
                      ? 'text-green-600'
                      : 'text-red-500'
                    }`}>
                    {formData && formData.password ? formData.password.length : 0}/8 characters
                  </p>
                </div>
                {formData && formData.password && formData.password.length > 0 && formData.password.length < 8 && (
                  <p className="text-xs text-red-500 mt-1">
                    Password must be at least 8 characters
                  </p>
                )}
              </div>


              {/* Site Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4" />
                  Assigned Site *
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
                  <select
                    value={formData.siteId}
                    onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Site</option>
                    {sites.map((site) => (
                      <option key={site._id} value={site._id}>
                        {site.name || site.siteName}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Project Manager Info */}
              {currentProjectManager && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <label className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-2">
                    <UserCheck className="w-4 h-4" />
                    Your Profile
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">{currentProjectManager.name}</p>
                      <p className="text-sm text-blue-600">{currentProjectManager.email}</p>
                    </div>
                  </div>
                  <p className="text-xs text-blue-500 mt-2">
                    This supervisor will be created under your management
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAdd(false)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSupervisor}
                disabled={isCreating || loadingSites}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Supervisor'
                )}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Edit Supervisor Modal */}
      {showEdit && selectedSupervisor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Edit Supervisor</h2>
              <button
                onClick={() => {
                  setShowEdit(false);
                  setSelectedSupervisor(null);
                  setErrorMessage('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-medium">{errorMessage}</p>
                  </div>
                  <button
                    onClick={clearError}
                    className="text-sm text-red-600 hover:text-red-800 mt-2"
                  >
                    Clear error
                  </button>
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter supervisor name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="supervisor@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={formData.mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, mobile: value });
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.mobile ? `${formData.mobile.length}/10 digits` : 'Enter 10-digit number (optional)'}
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Address *
                </label>
                <textarea
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4" />
                  Assigned Site *
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
                  <select
                    value={formData.siteId}
                    onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Site</option>
                    {sites.map((site) => (
                      <option key={site._id} value={site._id}>
                        {site.name || site.siteName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEdit(false);
                  setSelectedSupervisor(null);
                  setErrorMessage('');
                }}
                className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSupervisor}
                disabled={isUpdating || loadingSites}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
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