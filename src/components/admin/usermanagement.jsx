"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Plus, User, Mail,
  Phone, Power, X, Building2, Lock,
  UserCheck, UserX, Check, Users, Eye, Edit, MapPin
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const UserManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [sites, setSites] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [projectManagers, setProjectManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSites, setLoadingSites] = useState(false);
  const [loadingSupervisors, setLoadingSupervisors] = useState(false);
  const [loadingPMs, setLoadingPMs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeTab, setActiveTab] = useState('Project Managers');
  const [showAdd, setShowAdd] = useState(false);
  const [showView, setShowView] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    role: 'Project Managers',
    password: '',
    assignedSites: [],
    siteId: '',
    assignedSupervisors: [],
    projectManagerId: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      role: activeTab,
      assignedSites: [],
      siteId: '',
      assignedSupervisors: [],
      projectManagerId: '',
    }));
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'Project Managers'
        ? '/api/client-admin/project-managers'
        : '/api/client-admin/supervisors';

      const response = await api.get(endpoint);

      let usersData = [];
      if (activeTab === 'Project Managers') {
        usersData = response.data.projectManagers || response.data.data || response.data || [];
      } else {
        usersData = response.data.supervisors || response.data.data || response.data || [];
      }

      if (!Array.isArray(usersData)) {
        usersData = [];
      }

      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
      alert(err.response?.data?.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      setLoadingSites(true);
      const response = await api.get('/api/client-admin/sites');

      const sitesData = response.data.data || response.data.sites || response.data || [];
      setSites(Array.isArray(sitesData) ? sitesData : []);
    } catch (err) {
      console.error('Error fetching sites:', err);
      setSites([]);
    } finally {
      setLoadingSites(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      setLoadingSupervisors(true);
      const response = await api.get('/api/client-admin/supervisors');

      const supervisorsData = response.data.supervisors || response.data.data || response.data || [];
      setSupervisors(Array.isArray(supervisorsData) ? supervisorsData : []);
    } catch (err) {
      console.error('Error fetching supervisors:', err);
      setSupervisors([]);
    } finally {
      setLoadingSupervisors(false);
    }
  };

  const fetchProjectManagers = async () => {
    try {
      setLoadingPMs(true);
      const response = await api.get('/api/client-admin/project-managers');

      const pmsData = response.data.projectManagers || response.data.data || response.data || [];
      setProjectManagers(Array.isArray(pmsData) ? pmsData : []);
    } catch (err) {
      console.error('Error fetching project managers:', err);
      setProjectManagers([]);
    } finally {
      setLoadingPMs(false);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      address: '',
      role: activeTab,
      password: '',
      assignedSites: [],
      siteId: '',
      assignedSupervisors: [],
      projectManagerId: '',
    });
    setShowAdd(true);
    fetchSites();

    if (activeTab === 'Project Managers') {
      fetchSupervisors();
    } else {
      fetchProjectManagers();
    }
  };

  const handleToggleSite = (siteId) => {
    if (activeTab === 'Project Managers') {
      setFormData(prev => ({
        ...prev,
        assignedSites: prev.assignedSites.includes(siteId)
          ? prev.assignedSites.filter(id => id !== siteId)
          : [...prev.assignedSites, siteId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        siteId: siteId
      }));
    }
  };

  const handleToggleSupervisor = (supervisorId) => {
    setFormData(prev => ({
      ...prev,
      assignedSupervisors: prev.assignedSupervisors.includes(supervisorId)
        ? prev.assignedSupervisors.filter(id => id !== supervisorId)
        : [...prev.assignedSupervisors, supervisorId]
    }));
  };

  const handleCreateUser = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        password: formData.password,
      };

      if (activeTab === 'Project Managers') {
        payload.assignedSites = formData.assignedSites;
        if (formData.assignedSupervisors.length > 0) {
          payload.assignedSupervisors = formData.assignedSupervisors;
        }
      } else {
        payload.siteId = formData.siteId;
        payload.projectManagerId = formData.projectManagerId;
      }

      const endpoint = activeTab === 'Project Managers'
        ? '/api/client-admin/project-managers'
        : '/api/client-admin/supervisors';

      await api.post(endpoint, payload);

      alert('User created successfully!');

      setFormData({
        name: '',
        email: '',
        mobile: '',
        address: '',
        role: activeTab,
        password: '',
        assignedSites: [],
        siteId: '',
        assignedSupervisors: [],
        projectManagerId: '',
      });

      setShowAdd(false);
      await fetchUsers();

    } catch (err) {
      console.error('Error creating user:', err);
      alert(err.response?.data?.message || err.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      if (activeTab === 'Project Managers') {
        payload.assignedSites = formData.assignedSites;
        if (formData.assignedSupervisors.length > 0) {
          payload.assignedSupervisors = formData.assignedSupervisors;
        }
      } else {
        payload.siteId = formData.siteId;
        payload.projectManagerId = formData.projectManagerId;
      }

      const endpoint = activeTab === 'Project Managers'
        ? `/api/client-admin/pm/${selectedUser._id}`
        : `/api/client-admin/supervisor/${selectedUser._id}`;

      await api.put(endpoint, payload);

      alert('User updated successfully!');

      setFormData({
        name: '',
        email: '',
        mobile: '',
        address: '',
        role: activeTab,
        password: '',
        assignedSites: [],
        siteId: '',
        assignedSupervisors: [],
        projectManagerId: '',
      });

      setShowEdit(false);
      setSelectedUser(null);
      await fetchUsers();

    } catch (err) {
      console.error('Error updating user:', err);
      alert(err.response?.data?.message || err.message || 'Failed to update user');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const endpoint = activeTab === 'Project Managers'
        ? `/api/client-admin/pm/${userId}/status`
        : `/api/client-admin/supervisor/${userId}/status`;

      await api.patch(endpoint, {
        status: currentStatus === 'Active' ? 'Inactive' : 'Active'
      });

      alert('Status updated successfully!');
      await fetchUsers();

    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header title="User Management" onMenuClick={() => setSidebarOpen(true)} />

      <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">
              {activeTab === 'Project Managers' ? 'Total Project Managers' : 'Total Supervisors'}
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {Array.isArray(users) ? users.length : 0}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Active</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600">
              {Array.isArray(users) ? users.filter(u => u.status === 'Active').length : 0}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Inactive</div>
            <div className="text-2xl sm:text-3xl font-bold text-red-600">
              {Array.isArray(users) ? users.filter(u => u.status !== 'Active').length : 0}
            </div>
          </div>
        </div>

        <div className="mb-6 border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-4 sm:gap-6 min-w-max">
            <button
              onClick={() => setActiveTab('Project Managers')}
              className={`pb-3 px-1 font-semibold transition whitespace-nowrap ${activeTab === 'Project Managers'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Project Managers
            </button>
            <button
              onClick={() => setActiveTab('Supervisors')}
              className={`pb-3 px-1 font-semibold transition whitespace-nowrap ${activeTab === 'Supervisors'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Supervisors
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
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
            className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add User
          </button>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Assigned Sites
                  </th>
                  {activeTab === 'Project Managers' && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Assigned Supervisors
                    </th>
                  )}
                  {activeTab === 'Supervisors' && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Project Manager
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id || user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {user.assignedSites?.length > 0
                        ? `${user.assignedSites.length} sites`
                        : user.siteId?.name || '-'}
                    </td>
                    {activeTab === 'Project Managers' && (
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.assignedSupervisors?.length > 0
                          ? `${user.assignedSupervisors.length} supervisors`
                          : '-'}
                      </td>
                    )}
                    {activeTab === 'Supervisors' && (
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.projectManagerId?.name || '-'}
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowView(true);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg transition text-blue-600"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setFormData({
                              name: user.name || '',
                              email: user.email || '',
                              mobile: user.mobile || '',
                              address: user.address || '',
                              role: activeTab,
                              password: '',
                              assignedSites: user.assignedSites?.map(s => s._id || s) || [],
                              siteId: user.siteId?._id || user.siteId || '',
                              assignedSupervisors: user.assignedSupervisors?.map(s => s._id || s) || [],
                              projectManagerId: user.projectManagerId?._id || user.projectManagerId || '',
                            });
                            setShowEdit(true);
                            fetchSites();
                            if (activeTab === 'Project Managers') {
                              fetchSupervisors();
                            } else {
                              fetchProjectManagers();
                            }
                          }}
                          className="p-2 hover:bg-orange-50 rounded-lg transition text-orange-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user._id, user.status || 'Active')}
                          className={`p-2 hover:bg-gray-100 rounded-lg transition ${user.status === 'Active' ? 'text-red-600' : 'text-green-600'
                            }`}
                          title={user.status === 'Active' ? 'Disable' : 'Enable'}
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

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {filteredUsers.map((user) => (
            <div key={user._id || user.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${user.status === 'Active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
                  }`}>
                  {user.status || 'Active'}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="text-sm text-gray-600">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  {user.assignedSites?.length > 0
                    ? `${user.assignedSites.length} sites`
                    : user.siteId?.name || '-'}
                </div>
                {activeTab === 'Project Managers' && (
                  <div className="text-sm text-gray-600">
                    <Users className="w-4 h-4 inline mr-1" />
                    {user.assignedSupervisors?.length > 0
                      ? `${user.assignedSupervisors.length} supervisors`
                      : 'No supervisors'}
                  </div>
                )}
                {activeTab === 'Supervisors' && (
                  <div className="text-sm text-gray-600">
                    <User className="w-4 h-4 inline mr-1" />
                    PM: {user.projectManagerId?.name || '-'}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowView(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-semibold text-sm transition"
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      mobile: user.mobile || '',
                      address: user.address || '',
                      role: activeTab,
                      password: '',
                      assignedSites: user.assignedSites?.map(s => s._id || s) || [],
                      siteId: user.siteId?._id || user.siteId || '',
                      assignedSupervisors: user.assignedSupervisors?.map(s => s._id || s) || [],
                      projectManagerId: user.projectManagerId?._id || user.projectManagerId || '',
                    });
                    setShowEdit(true);
                    fetchSites();
                    if (activeTab === 'Project Managers') {
                      fetchSupervisors();
                    } else {
                      fetchProjectManagers();
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg font-semibold text-sm transition"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(user._id || user.id, user.status || 'Active')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition ${user.status === 'Active'
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </main>

      {/* View User Modal */}
      {showView && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => {
                  setShowView(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-base font-semibold text-gray-900 mt-1">{selectedUser.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-base text-gray-900 mt-1">{selectedUser.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-base text-gray-900 mt-1">{selectedUser.mobile || '-'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <p className="text-base text-gray-900 mt-1">{selectedUser.address || '-'}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedUser.status === 'Active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                    }`}>
                    {selectedUser.status || 'Active'}
                  </span>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Assigned Sites</label>
                <div className="mt-1">
                  {selectedUser.assignedSites?.length > 0 ? (
                    <div className="space-y-1">
                      {selectedUser.assignedSites.map((site, index) => (
                        <p key={index} className="text-sm text-gray-900 bg-gray-50 px-3 py-1.5 rounded">
                          • {site.name || site}
                        </p>
                      ))}
                    </div>
                  ) : selectedUser.siteId?.name ? (
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-1.5 rounded">
                      {selectedUser.siteId.name}
                    </p>
                  ) : (
                    <p className="text-base text-gray-900">-</p>
                  )}
                </div>
              </div>

              {activeTab === 'Project Managers' && selectedUser.assignedSupervisors?.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Assigned Supervisors</label>
                  <div className="mt-1 space-y-1">
                    {selectedUser.assignedSupervisors.map((supervisor, index) => (
                      <p key={index} className="text-sm text-gray-900 bg-blue-50 px-3 py-1.5 rounded">
                        • {supervisor.name || supervisor}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'Supervisors' && selectedUser.projectManagerId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Project Manager</label>
                  <p className="text-base text-gray-900 bg-blue-50 px-3 py-2 rounded mt-1">
                    {selectedUser.projectManagerId.name || '-'}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowView(false);
                  setSelectedUser(null);
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Add {activeTab.slice(0, -1)}
              </h2>
              <button
                onClick={() => setShowAdd(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  placeholder="John Doe"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  placeholder="john@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  placeholder="+91 98765 43210"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <input
                  placeholder="Enter password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {activeTab === 'Supervisors' && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Project Manager <span className="text-red-500">*</span>
                  </label>
                  {loadingPMs ? (
                    <div className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-gray-50 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-gray-600">Loading...</span>
                    </div>
                  ) : (
                    <select
                      value={formData.projectManagerId}
                      onChange={(e) => setFormData({ ...formData, projectManagerId: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Project Manager</option>
                      {projectManagers.map((pm) => (
                        <option key={pm._id || pm.id} value={pm._id || pm.id}>
                          {pm.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4" />
                  {activeTab === 'Project Managers' ? 'Assigned Sites (Multiple)' : 'Assigned Site'}
                </label>

                {loadingSites ? (
                  <div className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-gray-50 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-sm text-gray-600">Loading sites...</span>
                  </div>
                ) : sites.length === 0 ? (
                  <div className="border border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
                    No sites available
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                    {sites.map((site) => {
                      const siteId = site._id || site.id;
                      const siteName = site.name || site.siteName;
                      const isSelected = activeTab === 'Project Managers'
                        ? formData.assignedSites.includes(siteId)
                        : formData.siteId === siteId;

                      return (
                        <div
                          key={siteId}
                          onClick={() => handleToggleSite(siteId)}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-blue-50' : ''
                            }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                            }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm ${isSelected ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                            {siteName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'Project Managers' && formData.assignedSites.length > 0 && (
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    {formData.assignedSites.length} site(s) selected
                  </p>
                )}
              </div>

              {activeTab === 'Project Managers' && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4" />
                    Assign Supervisors (Optional)
                  </label>
                  {loadingSupervisors ? (
                    <div className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-gray-50 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-gray-600">Loading supervisors...</span>
                    </div>
                  ) : supervisors.length === 0 ? (
                    <div className="border border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
                      No supervisors available
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                      {supervisors.map((supervisor) => {
                        const supervisorId = supervisor._id || supervisor.id;
                        const isSelected = formData.assignedSupervisors.includes(supervisorId);

                        return (
                          <div
                            key={supervisorId}
                            onClick={() => handleToggleSupervisor(supervisorId)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-blue-50' : ''
                              }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                              }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <span className={`text-sm ${isSelected ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                                {supervisor.name}
                              </span>
                              <p className="text-xs text-gray-500">{supervisor.email}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {formData.assignedSupervisors.length > 0 && (
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      {formData.assignedSupervisors.length} supervisor(s) selected
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAdd(false)}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                disabled={
                  !formData.name ||
                  !formData.email ||
                  !formData.password ||
                  (activeTab === 'Project Managers' && formData.assignedSites.length === 0) ||
                  (activeTab === 'Supervisors' && (!formData.siteId || !formData.projectManagerId))
                }
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEdit && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Edit {activeTab.slice(0, -1)}
              </h2>
              <button
                onClick={() => {
                  setShowEdit(false);
                  setSelectedUser(null);
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
                  Full Name
                </label>
                <input
                  placeholder="John Doe"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  placeholder="john@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <input
                  placeholder="+91 98765 43210"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
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

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4" />
                  Password (Leave blank to keep current)
                </label>
                <input
                  placeholder="Enter new password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {activeTab === 'Supervisors' && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Project Manager <span className="text-red-500">*</span>
                  </label>
                  {loadingPMs ? (
                    <div className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-gray-50 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-gray-600">Loading...</span>
                    </div>
                  ) : (
                    <select
                      value={formData.projectManagerId}
                      onChange={(e) => setFormData({ ...formData, projectManagerId: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Project Manager</option>
                      {projectManagers.map((pm) => (
                        <option key={pm._id || pm.id} value={pm._id || pm.id}>
                          {pm.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4" />
                  {activeTab === 'Project Managers' ? 'Assigned Sites (Multiple)' : 'Assigned Site'}
                </label>

                {loadingSites ? (
                  <div className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-gray-50 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-sm text-gray-600">Loading sites...</span>
                  </div>
                ) : sites.length === 0 ? (
                  <div className="border border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
                    No sites available
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                    {sites.map((site) => {
                      const siteId = site._id || site.id;
                      const siteName = site.name || site.siteName;
                      const isSelected = activeTab === 'Project Managers'
                        ? formData.assignedSites.includes(siteId)
                        : formData.siteId === siteId;

                      return (
                        <div
                          key={siteId}
                          onClick={() => handleToggleSite(siteId)}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-blue-50' : ''
                            }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                            }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm ${isSelected ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                            {siteName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeTab === 'Project Managers' && formData.assignedSites.length > 0 && (
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    {formData.assignedSites.length} site(s) selected
                  </p>
                )}
              </div>

              {activeTab === 'Project Managers' && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4" />
                    Assign Supervisors (Optional)
                  </label>
                  {loadingSupervisors ? (
                    <div className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-gray-50 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      <span className="text-sm text-gray-600">Loading supervisors...</span>
                    </div>
                  ) : supervisors.length === 0 ? (
                    <div className="border border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
                      No supervisors available
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                      {supervisors.map((supervisor) => {
                        const supervisorId = supervisor._id || supervisor.id;
                        const isSelected = formData.assignedSupervisors.includes(supervisorId);

                        return (
                          <div
                            key={supervisorId}
                            onClick={() => handleToggleSupervisor(supervisorId)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-blue-50' : ''
                              }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                              }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <span className={`text-sm ${isSelected ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                                {supervisor.name}
                              </span>
                              <p className="text-xs text-gray-500">{supervisor.email}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {formData.assignedSupervisors.length > 0 && (
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      {formData.assignedSupervisors.length} supervisor(s) selected
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowEdit(false);
                  setSelectedUser(null);
                }}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                disabled={
                  !formData.name ||
                  !formData.email ||
                  (activeTab === 'Project Managers' && formData.assignedSites.length === 0) ||
                  (activeTab === 'Supervisors' && (!formData.siteId || !formData.projectManagerId))
                }
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
