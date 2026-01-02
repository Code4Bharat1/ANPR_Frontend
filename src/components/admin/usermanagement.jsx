"use client";
import { useState, useEffect } from 'react';
import { 
  Bell, Menu, Search, Plus, User, Mail, 
  Phone, Power, X, Building2, Lock,
  UserCheck, UserX, Check, Users
} from 'lucide-react';
import Sidebar from './sidebar';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
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
      const token = localStorage.getItem('accessToken');

      const endpoint = activeTab === 'Project Managers' 
        ? '/api/client-admin/project-managers'
        : '/api/client-admin/supervisors';

      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (activeTab === 'Project Managers') {
        setUsers(data.projectManagers || data || []);
      } else {
        setUsers(data.supervisors || data || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      setLoadingSites(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        alert('Please login first');
        return;
      }

      const response = await fetch(`${API_URL}/api/client-admin/sites`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      setSites(data.data || data.sites || []);
    } catch (err) {
      console.error('Error fetching sites:', err);
    } finally {
      setLoadingSites(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      setLoadingSupervisors(true);
      const token = localStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/api/client-admin/supervisors`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      setSupervisors(data.supervisors || data || []);
    } catch (err) {
      console.error('Error fetching supervisors:', err);
    } finally {
      setLoadingSupervisors(false);
    }
  };

  const fetchProjectManagers = async () => {
    try {
      setLoadingPMs(true);
      const token = localStorage.getItem('accessToken');

      const response = await fetch(`${API_URL}/api/client-admin/project-managers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      setProjectManagers(data.projectManagers || data || []);
    } catch (err) {
      console.error('Error fetching project managers:', err);
    } finally {
      setLoadingPMs(false);
    }
  };

  const handleOpenAddModal = () => {
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
      const token = localStorage.getItem('accessToken');

      const payload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
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

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }

      alert('User created successfully!');
      setShowAdd(false);
      setFormData({
        name: '',
        email: '',
        mobile: '',
        role: activeTab,
        password: '',
        assignedSites: [],
        siteId: '',
        assignedSupervisors: [],
        projectManagerId: '',
      });

      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to create user');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const endpoint = activeTab === 'Project Managers'
        ? `/api/client-admin/project-managers/${userId}/status`
        : `/api/client-admin/supervisors/${userId}/status`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: currentStatus === 'Active' ? 'Inactive' : 'Active' 
        })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      fetchUsers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPMs = users.filter(u => u.role === 'project_manager').length;
  const totalSupervisors = users.filter(u => u.role === 'supervisor').length;
  const activeUsers = users.filter(u => u.status === 'Active').length;

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
      <div className="lg:ml-72">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Users</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                AD
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Project Managers</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalPMs}</div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Supervisors</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalSupervisors}</div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 sm:col-span-2 lg:col-span-1">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Active Users</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{activeUsers}</div>
            </div>
          </div>

          <div className="mb-6 border-b border-gray-200 overflow-x-auto">
            <div className="flex gap-4 sm:gap-6 min-w-max">
              <button
                onClick={() => setActiveTab('Project Managers')}
                className={`pb-3 px-1 font-semibold transition whitespace-nowrap ${
                  activeTab === 'Project Managers'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Project Managers
              </button>
              <button
                onClick={() => setActiveTab('Supervisors')}
                className={`pb-3 px-1 font-semibold transition whitespace-nowrap ${
                  activeTab === 'Supervisors'
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

          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Assigned Sites
                    </th>
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
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.assignedSites?.length > 0 
                          ? `${user.assignedSites.length} sites`
                          : user.siteId?.name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleToggleStatus(user._id || user.id, user.status || 'Active')}
                          className={`p-2 hover:bg-gray-100 rounded-lg transition ${
                            user.status === 'Active' ? 'text-red-600' : 'text-green-600'
                          }`}
                          title={user.status === 'Active' ? 'Disable' : 'Enable'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
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

          <div className="md:hidden space-y-4">
            {filteredUsers.map((user) => (
              <div key={user._id || user.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    user.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.status || 'Active'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {user.role}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <Building2 className="w-4 h-4 inline mr-1" />
                    {user.assignedSites?.length > 0 
                      ? `${user.assignedSites.length} sites`
                      : user.siteId?.name || '-'}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleToggleStatus(user._id || user.id, user.status || 'Active')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      user.status === 'Active'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {user.status === 'Active' ? (
                      <>
                        <UserX className="w-4 h-4" />
                        Disable
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Enable
                      </>
                    )}
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
      </div>

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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value })
                  }
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
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
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'border-gray-300'
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
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 ${
                              isSelected ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                              isSelected 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'border-gray-300'
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
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;