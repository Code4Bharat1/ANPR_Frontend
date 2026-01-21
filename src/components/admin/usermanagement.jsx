"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Plus, User, Mail,
  Phone, Power, X, Building2, Lock,
  UserCheck, UserX, Check, Users, Eye, Edit, MapPin, EyeOff,
  AlertCircle,
  Info
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
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({}); // Separate errors for edit modal
  const [touched, setTouched] = useState({});
  const [editTouched, setEditTouched] = useState({}); // Separate touched for edit modal
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
      password: '',
    }));
    setShowPassword(false);
    setShowEditPassword(false);
    setErrors({});
    setEditErrors({});
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
    setShowPassword(false);
    setErrors({});
    setTouched({});
    setShowAdd(true);
    fetchSites();

    if (activeTab === 'Project Managers') {
      fetchSupervisors();
    } else {
      fetchProjectManagers();
    }
  };

  // Add Modal Validation
  const handleAddBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    validateAddField(name);
  };

  const validateAddField = (fieldName) => {
    let newErrors = { ...errors };
    const value = formData[fieldName];

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = "Full name is required";
        } else if (value.trim().length < 3) {
          newErrors.name = "Name must be at least 3 characters";
        } else if (value.trim().length > 100) {
          newErrors.name = "Name cannot exceed 100 characters";
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Invalid email format";
        } else if (value.length > 100) {
          newErrors.email = "Email cannot exceed 100 characters";
        } else {
          delete newErrors.email;
        }
        break;

      case 'mobile':
        if (!value.trim()) {
          newErrors.mobile = "Phone number is required";
        } else {
          const phoneDigits = value.replace(/\D/g, '');
          if (phoneDigits.length < 10) {
            newErrors.mobile = "Phone number must have at least 10 digits";
          } else if (phoneDigits.length > 15) {
            newErrors.mobile = "Phone number cannot exceed 15 digits";
          } else {
            delete newErrors.mobile;
          }
        }
        break;

      case 'address':
        if (!value.trim()) {
          newErrors.address = "Address is required";
        } else if (value.trim().length < 10) {
          newErrors.address = "Address must be at least 10 characters";
        } else if (value.trim().length > 500) {
          newErrors.address = "Address cannot exceed 500 characters";
        } else {
          delete newErrors.address;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else if (value.length > 50) {
          newErrors.password = "Password cannot exceed 50 characters";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors.password = "Password must contain uppercase, lowercase, and number";
        } else {
          delete newErrors.password;
        }
        break;

      case 'projectManagerId':
        if (activeTab === 'Supervisors' && !value) {
          newErrors.projectManagerId = "Project Manager is required";
        } else {
          delete newErrors.projectManagerId;
        }
        break;

      default:
        break;
    }

    // Validate assignedSites for Project Managers
    if (activeTab === 'Project Managers') {
      if (formData.assignedSites.length === 0) {
        newErrors.assignedSites = "Select at least one site";
      } else {
        delete newErrors.assignedSites;
      }
    }

    // Validate siteId for Supervisors
    if (activeTab === 'Supervisors' && !formData.siteId) {
      newErrors.siteId = "Site is required";
    } else if (activeTab === 'Supervisors') {
      delete newErrors.siteId;
    }

    setErrors(newErrors);
  };

  // Add Modal Full Validation
  const validateAddForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Mobile validation
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Phone number is required";
    } else {
      const phoneDigits = formData.mobile.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        newErrors.mobile = "Phone number must have at least 10 digits";
      }
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    // Project Manager specific validation
    if (activeTab === "Project Managers") {
      if (!formData.assignedSites.length) {
        newErrors.assignedSites = "Select at least one site";
      }
    }

    // Supervisor specific validation
    if (activeTab === "Supervisors") {
      if (!formData.projectManagerId) {
        newErrors.projectManagerId = "Project Manager is required";
      }
      if (!formData.siteId) {
        newErrors.siteId = "Site is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add Modal Field Change
  const handleAddFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (touched[field]) {
      validateAddField(field);
    }
  };

  // Add Modal Toggle Site
  const handleAddToggleSite = (siteId) => {
    if (activeTab === "Project Managers") {
      const newSites = formData.assignedSites.includes(siteId)
        ? formData.assignedSites.filter(id => id !== siteId)
        : [...formData.assignedSites, siteId];
      setFormData({ ...formData, assignedSites: newSites });
      if (touched.assignedSites) {
        validateAddField('assignedSites');
      }
    } else {
      setFormData({ ...formData, siteId });
      if (touched.siteId) {
        validateAddField('siteId');
      }
    }
    setErrors({ ...errors, assignedSites: null, siteId: null });
  };

  // Add Modal Toggle Supervisor
  const handleAddToggleSupervisor = (supervisorId) => {
    const newSupervisors = formData.assignedSupervisors.includes(supervisorId)
      ? formData.assignedSupervisors.filter(id => id !== supervisorId)
      : [...formData.assignedSupervisors, supervisorId];
    setFormData({ ...formData, assignedSupervisors: newSupervisors });
  };

  // Handle Create User
  const handleCreateUser = async () => {
    const allTouched = {
      name: true,
      email: true,
      mobile: true,
      address: true,
      password: true,
      projectManagerId: activeTab === 'Supervisors',
      assignedSites: activeTab === 'Project Managers',
      siteId: activeTab === 'Supervisors'
    };
    setTouched(allTouched);

    if (!validateAddForm()) {
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.replace(/\D/g, ''),
        address: formData.address.trim(),
        password: formData.password,
      };

      if (activeTab === "Project Managers") {
        payload.assignedSites = formData.assignedSites;
        if (formData.assignedSupervisors.length) {
          payload.assignedSupervisors = formData.assignedSupervisors;
        }
      } else {
        payload.siteId = formData.siteId;
        payload.projectManagerId = formData.projectManagerId;
      }

      const endpoint = activeTab === "Project Managers"
        ? "/api/client-admin/project-managers"
        : "/api/client-admin/supervisors";

      await api.post(endpoint, payload);

      alert("User created successfully!");

      setFormData({
        name: "",
        email: "",
        mobile: "",
        address: "",
        password: "",
        assignedSites: [],
        assignedSupervisors: [],
        siteId: "",
        projectManagerId: "",
      });

      setErrors({});
      setTouched({});
      setShowPassword(false);
      setShowAdd(false);
      fetchUsers();

    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to create user";
      if (err.response?.data?.error?.includes('email')) {
        setErrors({ ...errors, email: "This email is already registered" });
      } else {
        alert(errorMsg);
      }
    }
  };

  // Edit Modal Validation
  const handleEditBlur = (e) => {
    const { name } = e.target;
    setEditTouched({ ...editTouched, [name]: true });
    validateEditField(name);
  };

  const validateEditField = (fieldName) => {
    let newErrors = { ...editErrors };
    const value = formData[fieldName];

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = "Full name is required";
        } else if (value.trim().length < 3) {
          newErrors.name = "Name must be at least 3 characters";
        } else {
          delete newErrors.name;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = "Invalid email format";
        } else {
          delete newErrors.email;
        }
        break;

      case 'mobile':
        if (!value.trim()) {
          newErrors.mobile = "Phone number is required";
        } else {
          const phoneDigits = value.replace(/\D/g, '');
          if (phoneDigits.length < 10) {
            newErrors.mobile = "Phone number must have at least 10 digits";
          } else {
            delete newErrors.mobile;
          }
        }
        break;

      case 'address':
        if (!value.trim()) {
          newErrors.address = "Address is required";
        } else if (value.trim().length < 10) {
          newErrors.address = "Address must be at least 10 characters";
        } else {
          delete newErrors.address;
        }
        break;

      case 'password':
        if (value && value.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
        } else {
          delete newErrors.password;
        }
        break;

      case 'projectManagerId':
        if (activeTab === 'Supervisors' && !value) {
          newErrors.projectManagerId = "Project Manager is required";
        } else {
          delete newErrors.projectManagerId;
        }
        break;

      default:
        break;
    }

    // Validate assignedSites for Project Managers
    if (activeTab === 'Project Managers') {
      if (formData.assignedSites.length === 0) {
        newErrors.assignedSites = "Select at least one site";
      } else {
        delete newErrors.assignedSites;
      }
    }

    // Validate siteId for Supervisors
    if (activeTab === 'Supervisors' && !formData.siteId) {
      newErrors.siteId = "Site is required";
    } else if (activeTab === 'Supervisors') {
      delete newErrors.siteId;
    }

    setEditErrors(newErrors);
  };

  // Edit Modal Full Validation
  const validateEditForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Mobile validation
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Phone number is required";
    } else {
      const phoneDigits = formData.mobile.replace(/\D/g, '');
      if (phoneDigits.length < 10) {
        newErrors.mobile = "Phone number must have at least 10 digits";
      }
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    // Password validation (if provided)
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Project Manager specific validation
    if (activeTab === "Project Managers") {
      if (!formData.assignedSites.length) {
        newErrors.assignedSites = "Select at least one site";
      }
    }

    // Supervisor specific validation
    if (activeTab === "Supervisors") {
      if (!formData.projectManagerId) {
        newErrors.projectManagerId = "Project Manager is required";
      }
      if (!formData.siteId) {
        newErrors.siteId = "Site is required";
      }
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Edit Modal Field Change
  const handleEditFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (editTouched[field]) {
      validateEditField(field);
    }
  };

  // Edit Modal Toggle Site
  const handleEditToggleSite = (siteId) => {
    if (activeTab === "Project Managers") {
      const newSites = formData.assignedSites.includes(siteId)
        ? formData.assignedSites.filter(id => id !== siteId)
        : [...formData.assignedSites, siteId];
      setFormData({ ...formData, assignedSites: newSites });
      if (editTouched.assignedSites) {
        validateEditField('assignedSites');
      }
    } else {
      setFormData({ ...formData, siteId });
      if (editTouched.siteId) {
        validateEditField('siteId');
      }
    }
    setEditErrors({ ...editErrors, assignedSites: null, siteId: null });
  };

  // Edit Modal Toggle Supervisor
  const handleEditToggleSupervisor = (supervisorId) => {
    const newSupervisors = formData.assignedSupervisors.includes(supervisorId)
      ? formData.assignedSupervisors.filter(id => id !== supervisorId)
      : [...formData.assignedSupervisors, supervisorId];
    setFormData({ ...formData, assignedSupervisors: newSupervisors });
  };

  // Handle Update User
  const handleUpdateUser = async () => {
    const allTouched = {
      name: true,
      email: true,
      mobile: true,
      address: true,
      password: true,
      projectManagerId: activeTab === 'Supervisors',
      assignedSites: activeTab === 'Project Managers',
      siteId: activeTab === 'Supervisors'
    };
    setEditTouched(allTouched);

    if (!validateEditForm()) {
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.replace(/\D/g, ''),
        address: formData.address.trim(),
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
        ? `/api/client-admin/project-managers/${selectedUser._id}`
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
      
      setShowEditPassword(false);
      setEditErrors({});
      setEditTouched({});
      setShowEdit(false);
      setSelectedUser(null);
      await fetchUsers();

    } catch (err) {
      console.error('Error updating user:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update user';
      if (err.response?.data?.error?.includes('email')) {
        setEditErrors({ ...editErrors, email: "This email is already registered" });
      } else {
        alert(errorMsg);
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const endpoint = activeTab === 'Project Managers'
        ? `/api/client-admin/pm/${userId}/status`
        : `/api/client-admin/supervisor/${userId}/status`;

      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';

      const response = await api.patch(endpoint, { status: newStatus });

      await fetchUsers();

      alert('Status updated successfully!');

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
                        {user.supervisors?.length > 0
                          ? `${user.supervisors.length} supervisors`
                          : '-'}
                      </td>
                    )}
                    {activeTab === 'Supervisors' && (
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.projectManagerId && typeof user.projectManagerId === 'object'
                          ? user.projectManagerId.name
                          : '-'}
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
                              supervisors: user.supervisors?.map(s => s._id || s) || [],
                              projectManagerId: user.projectManagerId?._id || user.projectManagerId || '',
                            });
                            setShowEditPassword(false);
                            setEditErrors({});
                            setEditTouched({});
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
                    {user.supervisors?.length > 0
                      ? `${user.supervisors.length} supervisors`
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
                      supervisors: user.supervisors?.map(s => s._id || s) || [],
                      projectManagerId: user.projectManagerId?._id || user.projectManagerId || '',
                    });
                    setShowEditPassword(false);
                    setEditErrors({});
                    setEditTouched({});
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

      {/* View User Modal - No Changes Needed */}
{showView && selectedUser && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${selectedUser.status === 'Active' ? 'bg-white/20' : 'bg-gray-600/20'}`}>
            {activeTab === 'Project Managers' ? (
              <User className="w-6 h-6 text-white" />
            ) : (
              <Users className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">User Details</h2>
            <p className="text-sm text-white/80">{activeTab.slice(0, -1)}</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowView(false);
            setSelectedUser(null);
          }}
          className="p-2 hover:bg-white/20 rounded-lg transition text-white"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Name</label>
              <p className="text-sm font-semibold text-gray-900 mt-1">{selectedUser.name}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Status</label>
              <p className="mt-1">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${selectedUser.status === 'Active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
                  }`}>
                  {selectedUser.status || 'Active'}
                </span>
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Email</label>
              <p className="text-sm text-gray-900 mt-1 break-all">{selectedUser.email}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Phone</label>
              <p className="text-sm text-gray-900 mt-1">{selectedUser.mobile || '-'}</p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Address
          </h3>
          <p className="text-sm text-gray-900 whitespace-pre-line">
            {selectedUser.address || 'No address provided'}
          </p>
        </div>

        {/* Site Information */}
        <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            {activeTab === 'Project Managers' ? 'Assigned Sites' : 'Assigned Site'}
          </h3>
          <div className="mt-1">
            {selectedUser.assignedSites?.length > 0 ? (
              <div className="space-y-2">
                {selectedUser.assignedSites.map((site, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{site.name || site}</p>
                      {site.location && (
                        <p className="text-xs text-gray-500">{site.location}</p>
                      )}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-blue-600 font-medium">
                  Total: {selectedUser.assignedSites.length} site(s)
                </p>
              </div>
            ) : selectedUser.siteId?.name ? (
              <div className="flex items-center gap-2 p-3 bg-white border border-gray-200 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedUser.siteId.name}</p>
                  {selectedUser.siteId.location && (
                    <p className="text-xs text-gray-500">{selectedUser.siteId.location}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No site assigned</p>
            )}
          </div>
        </div>

        {/* Supervisor/Manager Information */}
        {activeTab === 'Project Managers' && (
          <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Assigned Supervisors
            </h3>
            <div className="mt-1">
              {/* Check multiple possible fields for supervisors */}
              {selectedUser.assignedSupervisors?.length > 0 ? (
                <div className="space-y-2">
                  {selectedUser.assignedSupervisors.map((supervisor, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {supervisor.name || supervisor}
                        </p>
                        {/* <p className="text-xs text-gray-500">{supervisor.email || 'No email'}</p> */}
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-blue-600 font-medium">
                    Total: {selectedUser.assignedSupervisors.length} supervisor(s)
                  </p>
                </div>
              ) : selectedUser.supervisors?.length > 0 ? (
                <div className="space-y-2">
                  {selectedUser.supervisors.map((supervisor, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {supervisor.name || supervisor}
                        </p>
                        {/* <p className="text-xs text-gray-500">{supervisor.email || 'No email'}</p> */}
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-blue-600 font-medium">
                    Total: {selectedUser.supervisors.length} supervisor(s)
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No supervisors assigned</p>
              )}
            </div>
          </div>
        )}

        {/* Project Manager Information (for Supervisors) */}
        {activeTab === 'Supervisors' && selectedUser.projectManagerId && (
          <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Project Manager
            </h3>
            <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedUser.projectManagerId.name || '-'}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedUser.projectManagerId.email || 'No email'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Additional Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Created At</label>
              <p className="text-sm text-gray-900 mt-1">
                {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Last Updated</label>
              <p className="text-sm text-gray-900 mt-1">
                {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-gray-50 flex justify-between items-center p-6 border-t border-gray-200">
        <button
          onClick={() => {
            // Option to edit directly from view
            setSelectedUser(selectedUser);
            setFormData({
              name: selectedUser.name || '',
              email: selectedUser.email || '',
              mobile: selectedUser.mobile || '',
              address: selectedUser.address || '',
              role: activeTab,
              password: '',
              assignedSites: selectedUser.assignedSites?.map(s => s._id || s) || [],
              siteId: selectedUser.siteId?._id || selectedUser.siteId || '',
              assignedSupervisors: selectedUser.assignedSupervisors?.map(s => s._id || s) || 
                                  selectedUser.supervisors?.map(s => s._id || s) || [],
              projectManagerId: selectedUser.projectManagerId?._id || selectedUser.projectManagerId || '',
            });
            setShowEditPassword(false);
            setEditErrors({});
            setEditTouched({});
            setShowView(false);
            setShowEdit(true);
            fetchSites();
            if (activeTab === 'Project Managers') {
              fetchSupervisors();
            } else {
              fetchProjectManagers();
            }
          }}
          className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit User
        </button>
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
          onClick={() => {
            setShowAdd(false);
            setErrors({});
            setTouched({});
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Full Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4" />
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="John Doe"
            type="text"
            value={formData.name}
            onChange={(e) => handleAddFieldChange('name', e.target.value)}
            onBlur={handleAddBlur}
            className={`w-full border ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
          />
          {errors.name && (
            <div className="mt-1 flex items-start gap-1">
              <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-xs">{errors.name}</p>
            </div>
          )}
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-gray-500">
              Minimum 3 characters
            </div>
            <div className={`text-xs ${formData.name.length > 90 ? 'text-orange-500' : 'text-gray-500'}`}>
              {formData.name.length}/100
            </div>
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4" />
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="john@example.com"
            type="email"
            value={formData.email}
            onChange={(e) => handleAddFieldChange('email', e.target.value)}
            onBlur={handleAddBlur}
            className={`w-full border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
          />
          {errors.email ? (
            <div className="mt-1 flex items-start gap-1">
              <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-xs">{errors.email}</p>
            </div>
          ) : (
            <div className="text-xs text-gray-500 mt-1">
              Enter a valid email address
            </div>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4" />
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="+91 98765 43210"
            type="tel"
            value={formData.mobile}
            onChange={(e) => handleAddFieldChange('mobile', e.target.value)}
            onBlur={handleAddBlur}
            className={`w-full border ${errors.mobile ? 'border-red-500 bg-red-50' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
          />
          {errors.mobile ? (
            <div className="mt-1 flex items-start gap-1">
              <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-xs">{errors.mobile}</p>
            </div>
          ) : (
            <div className="text-xs text-gray-500 mt-1">
              10 digits required
            </div>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4" />
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Enter full address with street, city, state, and zip code"
            value={formData.address}
            onChange={(e) => handleAddFieldChange('address', e.target.value)}
            onBlur={handleAddBlur}
            rows={3}
            className={`w-full border ${errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors`}
          />
          {errors.address && (
            <div className="mt-1 flex items-start gap-1">
              <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-xs">{errors.address}</p>
            </div>
          )}
          <div className="flex justify-between items-center mt-1">
            <div className="text-xs text-gray-500">
              Minimum 10 characters
            </div>
            <div className={`text-xs ${formData.address.length > 450 ? 'text-orange-500' : 'text-gray-500'}`}>
              {formData.address.length}/500
            </div>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Lock className="w-4 h-4" />
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              placeholder="Enter strong password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleAddFieldChange('password', e.target.value)}
              onBlur={handleAddBlur}
              className={`w-full border ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 transition-colors`}
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
            <div className="mt-1 flex items-start gap-1">
              <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-500 text-xs">{errors.password}</p>
            </div>
          ) : (
            <div className="mt-1">
              <div className="flex items-center gap-2 mb-1">
                <div className={`h-1 flex-1 rounded ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <div className={`h-1 flex-1 rounded ${/(?=.*[a-z])/.test(formData.password) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <div className={`h-1 flex-1 rounded ${/(?=.*[A-Z])/.test(formData.password) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                <div className={`h-1 flex-1 rounded ${/(?=.*\d)/.test(formData.password) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              </div>
              <div className="text-xs text-gray-500">
                Must contain uppercase, lowercase, number and minimum 8 characters
              </div>
            </div>
          )}
        </div>

        {/* Project Manager Selection (for Supervisors) */}
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
              <>
                <select
                  value={formData.projectManagerId}
                  onChange={(e) => handleAddFieldChange('projectManagerId', e.target.value)}
                  onBlur={handleAddBlur}
                  className={`w-full border ${errors.projectManagerId ? 'border-red-500 bg-red-50' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                >
                  <option value="">Select Project Manager</option>
                  {projectManagers.map((pm) => (
                    <option key={pm._id || pm.id} value={pm._id || pm.id}>
                      {pm.name}
                    </option>
                  ))}
                </select>
                {errors.projectManagerId && (
                  <div className="mt-1 flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-500 text-xs">{errors.projectManagerId}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Site Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Building2 className="w-4 h-4" />
            {activeTab === 'Project Managers' ? 'Assigned Sites (Multiple)' : 'Assigned Site'}
            <span className="text-red-500">*</span>
          </label>

          {loadingSites ? (
            <div className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-gray-50 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-sm text-gray-600">Loading sites...</span>
            </div>
          ) : sites.length === 0 ? (
            <div className="border border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
              <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              No sites available
            </div>
          ) : (
            <>
              <div className={`border ${errors.assignedSites || errors.siteId ? 'border-red-500' : 'border-gray-300'} rounded-lg max-h-48 overflow-y-auto`}>
                {sites.map((site) => {
                  const siteId = site._id || site.id;
                  const siteName = site.name || site.siteName;
                  const isSelected = activeTab === 'Project Managers'
                    ? formData.assignedSites.includes(siteId)
                    : formData.siteId === siteId;

                  return (
                    <div
                      key={siteId}
                      onClick={() => handleAddToggleSite(siteId)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-blue-50 border-blue-100' : ''}`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                          {siteName}
                        </span>
                        {site.location && (
                          <p className="text-xs text-gray-500 mt-0.5">{site.location}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {(errors.assignedSites || errors.siteId) && (
                <div className="mt-1 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-500 text-xs">{errors.assignedSites || errors.siteId}</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'Project Managers' && formData.assignedSites.length > 0 && (
            <div className="mt-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs text-blue-700 font-medium">
                <Check className="w-3 h-3 inline mr-1" />
                {formData.assignedSites.length} site(s) selected
              </p>
            </div>
          )}
        </div>

        {/* Supervisor Selection (for Project Managers) */}
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
                <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
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
                      onClick={() => handleAddToggleSupervisor(supervisorId)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-blue-50 border-blue-100' : ''}`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
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
              <div className="mt-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
                <p className="text-xs text-blue-700 font-medium">
                  <Check className="w-3 h-3 inline mr-1" />
                  {formData.assignedSupervisors.length} supervisor(s) selected
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-200">
        <button
          onClick={() => {
            setShowAdd(false);
            setErrors({});
            setTouched({});
          }}
          className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateUser}
          disabled={Object.keys(errors).length > 0}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors ${Object.keys(errors).length > 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed border-2 border-gray-300'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 border-2 border-blue-600'
            }`}
        >
          {Object.keys(errors).length > 0 ? (
            <span className="flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Fix Errors First
            </span>
          ) : (
            'Create User'
          )}
        </button>
      </div>

      {/* Error Summary (if there are multiple errors) */}
      {Object.keys(errors).length > 0 && (
        <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm font-medium text-red-700">
              Please fix the following errors:
            </p>
          </div>
          <ul className="text-xs text-red-600 space-y-1">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="flex items-start gap-1">
                <span className="text-red-500">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
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
                  setEditErrors({});
                  setEditTouched({});
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4" />
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="John Doe"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleEditFieldChange('name', e.target.value)}
                  onBlur={handleEditBlur}
                  className={`w-full border ${editErrors.name ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {editErrors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {editErrors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="john@example.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleEditFieldChange('email', e.target.value)}
                  onBlur={handleEditBlur}
                  className={`w-full border ${editErrors.email ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {editErrors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {editErrors.email}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4" />
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  placeholder="+91 98765 43210"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleEditFieldChange('mobile', e.target.value)}
                  onBlur={handleEditBlur}
                  className={`w-full border ${editErrors.mobile ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                {editErrors.mobile && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {editErrors.mobile}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4" />
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Enter full address"
                  value={formData.address}
                  onChange={(e) => handleEditFieldChange('address', e.target.value)}
                  onBlur={handleEditBlur}
                  rows={3}
                  className={`w-full border ${editErrors.address ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                />
                {editErrors.address && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {editErrors.address}
                  </p>
                )}
              </div>

              {/* Password (Optional) */}
              {/* <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4" />
                  Password (Leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    placeholder="Enter new password (optional)"
                    type={showEditPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleEditFieldChange('password', e.target.value)}
                    onBlur={handleEditBlur}
                    className={`w-full border ${editErrors.password ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showEditPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {editErrors.password && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {editErrors.password}
                  </p>
                )}
              </div> */}

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
                    <>
                      <select
                        value={formData.projectManagerId}
                        onChange={(e) => handleEditFieldChange('projectManagerId', e.target.value)}
                        onBlur={handleEditBlur}
                        className={`w-full border ${editErrors.projectManagerId ? 'border-red-500' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        <option value="">Select Project Manager</option>
                        {projectManagers.map((pm) => (
                          <option key={pm._id || pm.id} value={pm._id || pm.id}>
                            {pm.name}
                          </option>
                        ))}
                      </select>
                      {editErrors.projectManagerId && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {editErrors.projectManagerId}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Site Selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4" />
                  {activeTab === 'Project Managers' ? 'Assigned Sites (Multiple)' : 'Assigned Site'}
                  <span className="text-red-500">*</span>
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
                  <>
                    <div className={`border ${editErrors.assignedSites || editErrors.siteId ? 'border-red-500' : 'border-gray-300'} rounded-lg max-h-48 overflow-y-auto`}>
                      {sites.map((site) => {
                        const siteId = site._id || site.id;
                        const siteName = site.name || site.siteName;
                        const isSelected = activeTab === 'Project Managers'
                          ? formData.assignedSites.includes(siteId)
                          : formData.siteId === siteId;

                        return (
                          <div
                            key={siteId}
                            onClick={() => handleEditToggleSite(siteId)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-blue-50' : ''}`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm ${isSelected ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                              {siteName}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {(editErrors.assignedSites || editErrors.siteId) && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {editErrors.assignedSites || editErrors.siteId}
                      </p>
                    )}
                  </>
                )}

                {activeTab === 'Project Managers' && formData.assignedSites.length > 0 && (
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    {formData.assignedSites.length} site(s) selected
                  </p>
                )}
              </div>

              {/* Supervisor Selection (for Project Managers) */}
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
                            onClick={() => handleEditToggleSupervisor(supervisorId)}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-blue-50' : ''}`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
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
                  setEditErrors({});
                  setEditTouched({});
                }}
                className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                // disabled={Object.keys(editErrors).length > 0}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg ${Object.keys(editErrors).length > 0
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                  }`}
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