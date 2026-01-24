"use client";
import { useState, useEffect, useCallback } from 'react';
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
  if (!phone && phone !== 0) return true;
  const phoneStr = String(phone);
  if (phoneStr.trim() === '') return true;
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phoneStr);
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    siteId: '',
    projectManagerId: '',
    password: '',
  });

  useEffect(() => {
    fetchSupervisors();
    fetchSites();
    fetchCurrentProjectManager();
  }, []);

  const clearError = () => {
    setErrorMessage('');
  };

  const showToast = useCallback((message, type = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium z-50 transform transition-transform duration-300 ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }, []);

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
      password: '',
    });

    setValidationErrors({});
    setErrorMessage('');
    setShowPassword(false);
    setShowAdd(true);

    await fetchSites();
  };

  // const handleCreateSupervisor = async () => {
  //   console.log('🚀 START: handleCreateSupervisor');

  //   try {
  //     setIsCreating(true);
  //     setErrorMessage('');

  //     // Validation...

  //     const payload = {
  //       name: formData.name.trim(),
  //       email: formData.email.trim().toLowerCase(),
  //       mobile: formData.mobile || '',
  //       address: formData.address || '',
  //       siteId: formData.siteId,
  //       password: formData.password,
  //     };

  //     if (currentProjectManager?._id) {
  //       payload.projectManagerId = currentProjectManager._id;
  //     }

  //     console.log('📤 Sending API request...');
  //     const response = await api.post('/api/project/supervisors', payload);

  //     console.log('✅ API Response:', response.data);

  //     if (response.data.success || response.data._id) {
  //       console.log('🎉 SUCCESS: Supervisor created');

  //       // Show success toast
  //       showToast('Supervisor created successfully!');

  //       // 🔥 FORCE MODAL CLOSE - multiple ways
  //       console.log('🔴 Setting showAdd to false');
  //       setShowAdd(false);

  //       // Extra safety - call again in next tick
  //       setTimeout(() => {
  //         setShowAdd(false);
  //       }, 0);

  //       // Reset form
  //       setTimeout(() => {
  //         setFormData({
  //           name: '',
  //           email: '',
  //           mobile: '',
  //           address: '',
  //           siteId: '',
  //           projectManagerId: currentProjectManager?._id || '',
  //           password: '',
  //         });
  //         setShowPassword(false);
  //         setErrorMessage('');

  //         // Refresh list
  //         fetchSupervisors();

  //         console.log('🔄 Form reset and list refreshed');
  //       }, 200);

  //       return true; // Return success

  //     } else {
  //       throw new Error(response.data.message || 'Failed to create supervisor');
  //     }

  //   } catch (err) {
  //     console.error('❌ ERROR in handleCreateSupervisor:', err);

  //     let errorMessage = 'Failed to create supervisor';

  //     if (err.response?.status === 400) {
  //       errorMessage = err.response.data?.message || 'Invalid request data';
  //     } else if (err.response?.status === 401) {
  //       errorMessage = 'Session expired. Please login again.';
  //       setTimeout(() => window.location.href = '/login', 2000);
  //     } else if (err.response?.status === 409) {
  //       errorMessage = 'A supervisor with this email already exists.';
  //     } else if (err.response?.data?.message) {
  //       errorMessage = err.response.data.message;
  //     } else if (err.message) {
  //       errorMessage = err.message;
  //     }

  //     setErrorMessage(errorMessage);
  //     showToast(errorMessage, 'error');

  //     return false; // Return failure

  //   } finally {
  //     console.log('🏁 END: handleCreateSupervisor');
  //     setIsCreating(false);
  //   }
  // };


  const handleCreateSupervisor = async () => {
    console.log('🚀 START: handleCreateSupervisor');

    try {
      setIsCreating(true);
      setErrorMessage('');

      /* ================= VALIDATION ================= */
      if (!formData.name.trim()) {
        throw new Error('Please enter supervisor name');
      }

      if (!formData.email.trim()) {
        throw new Error('Please enter email address');
      }

      if (!validateEmail(formData.email)) {
        throw new Error('Please enter a valid email address');
      }

      if (!formData.password || formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      if (!formData.siteId) {
        throw new Error('Please select a site');
      }

      /* ================= PAYLOAD ================= */
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

      console.log('📤 Sending API request...', payload);

      /* ================= API CALL ================= */
      const response = await api.post('/api/project/supervisors', payload);

      console.log('✅ API Response:', response.data);

      /* ================= SUCCESS CHECK ================= */
      if (
        response.status === 200 ||
        response.status === 201 ||
        response.data?.data?._id
      ) {
        console.log('🎉 SUCCESS: Supervisor created');

        showToast('Supervisor created successfully!');

        /* Close modal */
        setShowAdd(false);

        /* Reset form */
        setFormData({
          name: '',
          email: '',
          mobile: '',
          address: '',
          siteId: '',
          projectManagerId: currentProjectManager?._id || '',
          password: '',
        });

        setShowPassword(false);
        setErrorMessage('');

        /* Refresh list */
        await fetchSupervisors();

        return; // 🔥 VERY IMPORTANT
      }

      /* ================= REAL FAILURE ================= */
      throw new Error(response.data?.message || 'Failed to create supervisor');

    } catch (err) {
      console.error('❌ ERROR in handleCreateSupervisor:', err);

      let msg = 'Failed to create supervisor';

      if (err.response?.status === 400) {
        msg = err.response.data?.message || msg;
      } else if (err.response?.status === 401) {
        msg = 'Session expired. Please login again.';
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (err.response?.status === 403) {
        msg = err.response.data?.message || 'You are not allowed to assign supervisor to this site';
      } else if (err.response?.status === 409) {
        msg = 'A supervisor with this email already exists';
      } else if (err.message) {
        msg = err.message;
      }

      setErrorMessage(msg);
      showToast(msg, 'error');

    } finally {
      console.log('🏁 END: handleCreateSupervisor');
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

      console.log('Update response:', response.data);

      if (response.status === 200 || response.status === 201) {
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
        setErrorMessage('');

        setTimeout(() => {
          fetchSupervisors();
        }, 500);

      } else {
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
  // Add this delete handler function in your React component
  // const handleDeleteUser = async (userId) => {
  //   if (!window.confirm('Are you sure you want to delete this supervisor? This action cannot be undone.')) {
  //     return;
  //   }

  //   try {
  //     await api.delete(`/api/client-admin/supervisors/${userId}`);
  //     alert('Supervisor deleted successfully!');
  //     await fetchUsers(); // Refresh the list
  //   } catch (err) {
  //     console.error('Error deleting supervisor:', err);
  //     alert(err.response?.data?.message || 'Failed to delete supervisor');
  //   }
  // };

   const handleDeleteUser = async (userId) => {
  setUserToDelete(userId);
  setShowDeleteConfirm(true);
};

  // Update your desktop table actions column:

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
                        <button
                          onClick={() => handleDeleteUser(supervisor._id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
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
                <button
                  onClick={() => handleDeleteUser(supervisor._id)}
                  className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                  title="Delete"
                >
                  <X className="w-4 h-4" />
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

      {/* View Modal */}
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
      {/* {showAdd && (
  <div 
    key={`add-modal-${Date.now()}`}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    onClick={(e) => {
      // Background पर click करने पर modal बंद करें
      if (e.target === e.currentTarget) {
        setShowAdd(false);
      }
    }}
  > */}
      {showAdd && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAdd(false);
            }
          }}
        >

          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Add Supervisor</h2>
              <button
                onClick={() => {
                  console.log('❌ Closing modal manually');
                  setShowAdd(false);
                  setErrorMessage('');
                  setFormData({
                    name: '',
                    email: '',
                    mobile: '',
                    address: '',
                    siteId: '',
                    projectManagerId: currentProjectManager?._id || '',
                    password: '',
                  });
                  setShowPassword(false);
                }}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById('create-btn')?.click();
                    }
                  }}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById('create-btn')?.click();
                    }
                  }}
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById('create-btn')?.click();
                    }
                  }}
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
                  onKeyDown={(e) => {
                    if (e.ctrlKey && e.key === 'Enter') {
                      e.preventDefault();
                      document.getElementById('create-btn')?.click();
                    }
                  }}
                />
              </div>

              {/* Password Field */}
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById('create-btn')?.click();
                      }
                    }}
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
                  <p className={`text-xs font-medium ${formData.password && formData.password.length >= 8
                    ? 'text-green-600'
                    : 'text-red-500'
                    }`}>
                    {formData.password ? formData.password.length : 0}/8 characters
                  </p>
                </div>
                {formData.password && formData.password.length > 0 && formData.password.length < 8 && (
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        document.getElementById('create-btn')?.click();
                      }
                    }}
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
                onClick={() => {
                  console.log('❌ Cancel button clicked - closing modal');
                  setShowAdd(false);
                  setErrorMessage('');
                  setFormData({
                    name: '',
                    email: '',
                    mobile: '',
                    address: '',
                    siteId: '',
                    projectManagerId: currentProjectManager?._id || '',
                    password: '',
                  });
                  setShowPassword(false);
                }}
                className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isCreating}
              >
                Cancel
              </button>
              {/* <button
          id="create-btn"
          onClick={async () => {
            console.log('✅ Create button clicked');
            
            // Prevent multiple clicks
            if (isCreating) return;
            
            try {
              // Directly call the creation logic here
              await handleCreateSupervisor();
            } catch (error) {
              console.error('❌ Error in create handler:', error);
            }
          }}
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
        </button> */}
              <button
                id="create-btn"
                onClick={async () => {
                  if (isCreating) return;
                  await handleCreateSupervisor(); // ✅ correct
                }}
                disabled={isCreating || loadingSites}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
              >
                {isCreating ? 'Creating...' : 'Create Supervisor'}
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

      {showDeleteConfirm && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Delete Supervisor</h3>
            <p className="text-sm text-gray-600">This action cannot be undone</p>
          </div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">
            <span className="font-semibold">Warning:</span> Deleting this supervisor will:
          </p>
          <ul className="text-sm text-red-600 mt-2 space-y-1 pl-4">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Remove them from all assigned sites</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Remove them from all associated trips</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">•</span>
              <span>Permanently delete their account</span>
            </li>
          </ul>
        </div>

        <p className="text-gray-700 mb-6">
          Are you sure you want to delete this supervisor? This action is permanent and cannot be reversed.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              setShowDeleteConfirm(false);
              setUserToDelete(null);
            }}
            className="px-5 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              try {
                // Use the project manager API endpoint
                await api.delete(`/api/project/supervisors/${userToDelete}`);
                
                // Use showToast instead of alert
                showToast('Supervisor deleted successfully!');
                
                // Refresh the supervisors list
                await fetchSupervisors(); // Changed from fetchUsers()
              } catch (err) {
                console.error('Error deleting supervisor:', err);
                
                // Use showToast for error as well
                const errorMsg = err.response?.data?.message || 'Failed to delete supervisor';
                showToast(errorMsg, 'error');
              } finally {
                setShowDeleteConfirm(false);
                setUserToDelete(null);
              }
            }}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default SupervisorManagement;