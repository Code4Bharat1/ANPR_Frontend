"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Plus, User, Eye, Edit, MapPin, X, AlertCircle, CheckCircle
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';  // ✅ Import Header

const SupervisorManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [supervisors, setSupervisors] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [showAddModal, setShowAddModal] = useState(false);
  const [alert, setAlert] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    siteId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Create axios instance with base configuration
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add request interceptor to include token automatically
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch supervisors
      const supervisorsRes = await axiosInstance.get('/api/project/supervisors');
      setSupervisors(supervisorsRes.data);
      console.log(supervisorsRes.data);
      

      // Fetch sites
      const sitesRes = await axiosInstance.get('/api/project/sites');
      setSites(sitesRes.data);
    } catch (err) {
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
    
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format';
    }
    if (!formData.siteId) errors.siteId = 'Please select a site';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);

      const response = await axiosInstance.post('/api/project/supervisors', formData);
      
      setSupervisors([...supervisors, response.data]);
      showAlert('success', 'Supervisor added successfully!');
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to add supervisor');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      siteId: ''
    });
    setFormErrors({});
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axiosInstance.patch(`/api/project/supervisors/${id}/enable-disable`);
      
      setSupervisors(supervisors.map(sup => 
        sup._id === id ? { ...sup, isActive: !currentStatus } : sup
      ));
      showAlert('success', 'Status updated successfully!');
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredSupervisors = supervisors.filter(sup => {
    const matchesSearch = sup.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All Status' || 
      (filterStatus === 'Active' && sup.isActive) || 
      (filterStatus === 'Inactive' && !sup.isActive);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: supervisors.length,
    active: supervisors.filter(s => s.isActive).length,
    trips: supervisors.reduce((sum, s) => sum + (s.todayTrips || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading supervisors...</p>
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
      <Header title="Supervisors" onMenuClick={() => setSidebarOpen(true)} />

      {/* ✅ Main Content with proper spacing */}
      <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Total Supervisors</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Active Supervisors</div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sm:col-span-2 lg:col-span-1">
            <div className="text-sm text-gray-600 mb-1">Total Supervisor Trips</div>
            <div className="text-3xl font-bold text-gray-900">{stats.trips}</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search supervisors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          {/* <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 sm:px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Supervisor
          </button> */}
        </div>

        {/* Table - Desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Assigned Site</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Today Trips</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSupervisors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No supervisors found</p>
                    </td>
                  </tr>
                ) : (
                  filteredSupervisors.map((sup) => (
                    <tr key={sup._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="font-semibold text-gray-900">{sup.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{sup.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {sup.siteId?.name || 'Not Assigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(sup._id, sup.isActive)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                            sup.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {sup.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{sup.todayTrips || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-indigo-600 transition" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition" title="Edit">
                            <Edit className="w-4 h-4" />
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

        {/* Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {filteredSupervisors.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No supervisors found</p>
            </div>
          ) : (
            filteredSupervisors.map((sup) => (
              <div key={sup._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{sup.name}</div>
                      <div className="text-sm text-gray-600">{sup.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(sup._id, sup.isActive)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      sup.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {sup.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                
                <div className="space-y-2 mb-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {sup.siteId?.name || 'Not Assigned'}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Today's Trips:</span>
                    <span className="font-semibold text-gray-900">{sup.todayTrips || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Add Supervisor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Add New Supervisor</h2>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
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
                  placeholder="supervisor@example.com"
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Site *</label>
                <select
                  value={formData.siteId}
                  onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                  className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none ${
                    formErrors.siteId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a site</option>
                  {sites.map((site) => (
                    <option key={site._id} value={site._id}>{site.name}</option>
                  ))}
                </select>
                {formErrors.siteId && <p className="text-red-500 text-xs mt-1">{formErrors.siteId}</p>}
              </div>

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
                  {submitting ? 'Adding...' : 'Add Supervisor'}
                </button>
              </div>
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

export default SupervisorManagement;
