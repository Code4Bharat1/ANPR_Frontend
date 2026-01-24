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
import { useRouter } from 'next/navigation';

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

const SupervisorsPage = () => {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [sites, setSites] = useState([]);
    const [projectManagers, setProjectManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSites, setLoadingSites] = useState(false);
    const [loadingPMs, setLoadingPMs] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [showAdd, setShowAdd] = useState(false);
    const [showView, setShowView] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [editErrors, setEditErrors] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
const [userToDelete, setUserToDelete] = useState(null);
    const [touched, setTouched] = useState({});
    const [editTouched, setEditTouched] = useState({});
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
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/client-admin/supervisors');

            let usersData = response.data.supervisors || response.data.data || response.data || [];

            if (!Array.isArray(usersData)) {
                usersData = [];
            }

            setUsers(usersData);
        } catch (err) {
            console.error('Error fetching supervisors:', err);
            alert(err.response?.data?.message || 'Failed to fetch supervisors');
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
            password: '',
            siteId: '',
            projectManagerId: '',
        });
        setShowPassword(false);
        setErrors({});
        setTouched({});
        setShowAdd(true);
        fetchSites();
        fetchProjectManagers();
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
                if (!value) {
                    newErrors.projectManagerId = "Project Manager is required";
                } else {
                    delete newErrors.projectManagerId;
                }
                break;

            case 'siteId':
                if (!value) {
                    newErrors.siteId = "Site is required";
                } else {
                    delete newErrors.siteId;
                }
                break;

            default:
                break;
        }

        setErrors(newErrors);
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
        setFormData({ ...formData, siteId });
        if (touched.siteId) {
            validateAddField('siteId');
        }
        setErrors({ ...errors, siteId: null });
    };

    // Handle Create User - FIXED VERSION
    const handleCreateUser = async () => {
        try {
            // 1. Mark all fields as touched to show all errors
            const allTouched = {
                name: true,
                email: true,
                mobile: true,
                address: true,
                password: true,
                projectManagerId: true,
                siteId: true
            };
            setTouched(allTouched);

            // 2. Direct validation (without dependency on errors state)
            const validationErrors = {};

            // Name validation
            if (!formData.name.trim()) {
                validationErrors.name = "Full name is required";
            } else if (formData.name.trim().length < 3) {
                validationErrors.name = "Name must be at least 3 characters";
            } else if (formData.name.trim().length > 100) {
                validationErrors.name = "Name cannot exceed 100 characters";
            }

            // Email validation
            if (!formData.email.trim()) {
                validationErrors.email = "Email is required";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                validationErrors.email = "Invalid email format";
            } else if (formData.email.length > 100) {
                validationErrors.email = "Email cannot exceed 100 characters";
            }

            // Mobile validation
            if (!formData.mobile.trim()) {
                validationErrors.mobile = "Phone number is required";
            } else {
                const phoneDigits = formData.mobile.replace(/\D/g, '');
                if (phoneDigits.length < 10) {
                    validationErrors.mobile = "Phone number must have at least 10 digits";
                } else if (phoneDigits.length > 15) {
                    validationErrors.mobile = "Phone number cannot exceed 15 digits";
                }
            }

            // Address validation
            if (!formData.address.trim()) {
                validationErrors.address = "Address is required";
            } else if (formData.address.trim().length < 10) {
                validationErrors.address = "Address must be at least 10 characters";
            } else if (formData.address.trim().length > 500) {
                validationErrors.address = "Address cannot exceed 500 characters";
            }

            // Password validation
            if (!formData.password) {
                validationErrors.password = "Password is required";
            }
            else if (formData.password.length < 8) {
                validationErrors.password = "Password must be at least 8 characters";
            }

            // Supervisor specific validation
            if (!formData.projectManagerId) {
                validationErrors.projectManagerId = "Project Manager is required";
            }
            if (!formData.siteId) {
                validationErrors.siteId = "Site is required";
            }

            // 3. Set errors and check if form is valid
            setErrors(validationErrors);

            // If there are validation errors, stop here
            if (Object.keys(validationErrors).length > 0) {
                console.log('Form validation failed with errors:', validationErrors);

                // Scroll to top of modal to show errors
                setTimeout(() => {
                    const modalContent = document.querySelector('.max-h-\\[90vh\\]');
                    if (modalContent) {
                        modalContent.scrollTop = 0;
                    }
                }, 100);

                return;
            }

            // 4. Prepare payload (only if validation passed)
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                mobile: formData.mobile.replace(/\D/g, ''),
                address: formData.address.trim(),
                password: formData.password,
                siteId: formData.siteId,
                projectManagerId: formData.projectManagerId,
            };

            console.log("📤 Sending payload to API:", payload);

            const response = await api.post("/api/client-admin/supervisors", payload);
            console.log("✅ API Response:", response.data);

            alert("Supervisor created successfully!");

            // 5. Reset form state
            setFormData({
                name: "",
                email: "",
                mobile: "",
                address: "",
                password: "",
                siteId: "",
                projectManagerId: "",
            });

            setErrors({});
            setTouched({});
            setShowPassword(false);
            setShowAdd(false);

            // 6. Refresh the users list
            await fetchUsers();

        } catch (err) {
            console.error("❌ API Error:", err);

            // Enhanced error handling
            if (err.response) {
                const serverMessage = err.response.data?.message || err.response.data?.error || "Server error";

                if (err.response.status === 400) {
                    if (err.response.data?.errors) {
                        const serverErrors = {};
                        Object.keys(err.response.data.errors).forEach(key => {
                            serverErrors[key] = err.response.data.errors[key].message || err.response.data.errors[key];
                        });
                        setErrors(serverErrors);

                        // Scroll to show errors
                        setTimeout(() => {
                            const modalContent = document.querySelector('.max-h-\\[90vh\\]');
                            if (modalContent) {
                                modalContent.scrollTop = 0;
                            }
                        }, 100);

                    } else if (err.response.data?.error?.includes('email')) {
                        setErrors({ ...errors, email: "This email is already registered. Please use a different email." });
                    } else {
                        alert(`Validation Error: ${serverMessage}`);
                    }
                } else if (err.response.status === 409) {
                    setErrors({ ...errors, email: "This email is already registered." });
                } else if (err.response.status === 422) {
                    const validationErrors = err.response.data?.errors || {};
                    setErrors(validationErrors);

                    // Scroll to show errors
                    setTimeout(() => {
                        const modalContent = document.querySelector('.max-h-\\[90vh\\]');
                        if (modalContent) {
                            modalContent.scrollTop = 0;
                        }
                    }, 100);

                } else {
                    alert(`Error ${err.response.status}: ${serverMessage}`);
                }
            } else if (err.request) {
                alert("Network error: Unable to reach server. Please check your internet connection.");
            } else {
                alert(`Error: ${err.message}`);
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
                if (!value) {
                    newErrors.projectManagerId = "Project Manager is required";
                } else {
                    delete newErrors.projectManagerId;
                }
                break;

            case 'siteId':
                if (!value) {
                    newErrors.siteId = "Site is required";
                } else {
                    delete newErrors.siteId;
                }
                break;

            default:
                break;
        }

        setEditErrors(newErrors);
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
        setFormData({ ...formData, siteId });
        if (editTouched.siteId) {
            validateEditField('siteId');
        }
        setEditErrors({ ...editErrors, siteId: null });
    };

    // Handle Update User - FIXED VERSION
    const handleUpdateUser = async () => {
        try {
            // 1. Mark all fields as touched
            const allTouched = {
                name: true,
                email: true,
                mobile: true,
                address: true,
                projectManagerId: true,
                siteId: true
            };
            setEditTouched(allTouched);

            // 2. Direct validation
            const validationErrors = {};

            // Name validation
            if (!formData.name.trim()) {
                validationErrors.name = "Full name is required";
            }

            // Email validation
            if (!formData.email.trim()) {
                validationErrors.email = "Email is required";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                validationErrors.email = "Invalid email format";
            }

            // Mobile validation
            if (!formData.mobile.trim()) {
                validationErrors.mobile = "Phone number is required";
            } else {
                const phoneDigits = formData.mobile.replace(/\D/g, '');
                if (phoneDigits.length < 10) {
                    validationErrors.mobile = "Phone number must have at least 10 digits";
                }
            }

            // Address validation
            if (!formData.address.trim()) {
                validationErrors.address = "Address is required";
            }

            // Password validation (if provided)
            if (formData.password && formData.password.length < 6) {
                validationErrors.password = "Password must be at least 6 characters";
            }

            // Supervisor specific validation
            if (!formData.projectManagerId) {
                validationErrors.projectManagerId = "Project Manager is required";
            }
            if (!formData.siteId) {
                validationErrors.siteId = "Site is required";
            }

            // 3. Set errors and check
            setEditErrors(validationErrors);

            if (Object.keys(validationErrors).length > 0) {
                console.log('Edit form validation failed:', validationErrors);
                return;
            }

            // 4. Prepare payload
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                mobile: formData.mobile.replace(/\D/g, ''),
                address: formData.address.trim(),
                siteId: formData.siteId,
                projectManagerId: formData.projectManagerId,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            console.log('Updating Supervisor with payload:', payload);

            await api.put(`/api/client-admin/supervisor/${selectedUser._id}`, payload);

            alert('Supervisor updated successfully!');

            // 5. Reset form state
            setFormData({
                name: '',
                email: '',
                mobile: '',
                address: '',
                password: '',
                siteId: '',
                projectManagerId: '',
            });

            setShowEditPassword(false);
            setEditErrors({});
            setEditTouched({});
            setShowEdit(false);
            setSelectedUser(null);

            // 6. Refresh the users list
            await fetchUsers();

        } catch (err) {
            console.error('Error updating supervisor:', err);
            const errorMsg = err.response?.data?.message || 'Failed to update supervisor';
            if (err.response?.data?.error?.includes('email')) {
                setEditErrors({ ...editErrors, email: "This email is already registered" });
            } else {
                alert(errorMsg);
            }
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
            await api.patch(`/api/client-admin/supervisor/${userId}/status`, { status: newStatus });
            await fetchUsers();
            alert('Status updated successfully!');
        } catch (err) {
            console.error('Error updating status:', err);
            alert(err.response?.data?.message || 'Failed to update status');
        }
    };
    // Add this function in your component, after the handleToggleStatus function
    // const handleDeleteUser = async (userId) => {
    //     if (!window.confirm('Are you sure you want to delete this supervisor? This action cannot be undone.')) {
    //         return;
    //     }

    //     try {
    //         await api.delete(`/api/client-admin/supervisors/${userId}`);
    //         alert('Supervisor deleted successfully!');
    //         await fetchUsers(); // Refresh the list
    //     } catch (err) {
    //         console.error('Error deleting supervisor:', err);
    //         alert(err.response?.data?.message || 'Failed to delete supervisor');
    //     }
    // };
    const handleDeleteUser = async (userId) => {
  setUserToDelete(userId);
  setShowDeleteConfirm(true);
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
                    <p className="text-gray-600">Loading supervisors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <Header title="Supervisors" onMenuClick={() => setSidebarOpen(true)} />

            <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
                        <div className="text-xs sm:text-sm text-gray-600 mb-1">
                            Total Supervisors
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

                {/* Navigation to Project Managers */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/admin/users')}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center gap-2"
                    >
                        <User className="w-4 h-4" />
                        Go to Project Managers
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search supervisors..."
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
                        Add Supervisor
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
                                        Assigned Site
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Project Manager
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
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {user.siteId?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {user.projectManagerId && typeof user.projectManagerId === 'object'
                                                ? user.projectManagerId.name
                                                : '-'}
                                        </td>
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
                                                            password: '',
                                                            siteId: user.siteId?._id || user.siteId || '',
                                                            projectManagerId: user.projectManagerId?._id || user.projectManagerId || '',
                                                        });
                                                        setShowEditPassword(false);
                                                        setEditErrors({});
                                                        setEditTouched({});
                                                        setShowEdit(true);
                                                        fetchSites();
                                                        fetchProjectManagers();
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
                                                <button
                                                    onClick={() => handleDeleteUser(user._id)}
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

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No supervisors found</p>
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
                                    {user.siteId?.name || 'No site assigned'}
                                </div>
                                <div className="text-sm text-gray-600">
                                    <User className="w-4 h-4 inline mr-1" />
                                    PM: {user.projectManagerId?.name || '-'}
                                </div>
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
                                            password: '',
                                            siteId: user.siteId?._id || user.siteId || '',
                                            projectManagerId: user.projectManagerId?._id || user.projectManagerId || '',
                                        });
                                        setShowEditPassword(false);
                                        setEditErrors({});
                                        setEditTouched({});
                                        setShowEdit(true);
                                        fetchSites();
                                        fetchProjectManagers();
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
                                <button
                                    onClick={() => handleDeleteUser(user._id || user.id)}
                                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold text-sm transition"
                                    title="Delete"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredUsers.length === 0 && (
                        <div className="bg-white rounded-xl p-12 text-center">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No supervisors found</p>
                        </div>
                    )}
                </div>
            </main>

            {/* View User Modal */}
            {showView && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${selectedUser.status === 'Active' ? 'bg-white/20' : 'bg-gray-600/20'}`}>
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Supervisor Details</h2>
                                    <p className="text-sm text-white/80">Supervisor</p>
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
                                    Assigned Site
                                </h3>
                                <div className="mt-1">
                                    {selectedUser.siteId?.name ? (
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

                            {/* Project Manager Information */}
                            {selectedUser.projectManagerId && (
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
                                    setSelectedUser(selectedUser);
                                    setFormData({
                                        name: selectedUser.name || '',
                                        email: selectedUser.email || '',
                                        mobile: selectedUser.mobile || '',
                                        address: selectedUser.address || '',
                                        password: '',
                                        siteId: selectedUser.siteId?._id || selectedUser.siteId || '',
                                        projectManagerId: selectedUser.projectManagerId?._id || selectedUser.projectManagerId || '',
                                    });
                                    setShowEditPassword(false);
                                    setEditErrors({});
                                    setEditTouched({});
                                    setShowView(false);
                                    setShowEdit(true);
                                    fetchSites();
                                    fetchProjectManagers();
                                }}
                                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Supervisor
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

            {/* Add Supervisor Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Add Supervisor
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
                                {errors.email && (
                                    <div className="mt-1 flex items-start gap-1">
                                        <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-500 text-xs">{errors.email}</p>
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
                                    placeholder="9876543210"
                                    type="tel"
                                    value={formData.mobile}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        handleAddFieldChange('mobile', value);
                                    }}
                                    onBlur={handleAddBlur}
                                    className={`w-full border ${errors.mobile ? 'border-red-500 bg-red-50' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                                />
                                {errors.mobile && (
                                    <div className="mt-1 flex items-start gap-1">
                                        <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-500 text-xs">{errors.mobile}</p>
                                    </div>
                                )}
                                {!errors.mobile && formData.mobile && (
                                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                        <span>Enter 10-digit phone number</span>
                                        <span className={formData.mobile.length < 10 ? 'text-orange-500 font-medium' : 'text-green-500 font-medium'}>
                                            {formData.mobile.length}/10 digits
                                        </span>
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
                                {!errors.address && formData.address && (
                                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                        <span>Minimum 10 characters required</span>
                                        <span className={formData.address.trim().length < 10 ? 'text-orange-500 font-medium' : 'text-green-500 font-medium'}>
                                            {formData.address.trim().length}/10
                                        </span>
                                    </div>
                                )}
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
                                {/* {errors.password && (
                                    <div className="mt-1 flex items-start gap-1">
                                        <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-500 text-xs">{errors.password}</p>
                                    </div>
                                )} */}
                                {/* {!errors.password && formData.password && (
                                    <div className="text-xs text-gray-500 mt-1 flex justify-between">
                                        <span>Minimum 8 characters with uppercase, lowercase, number</span>
                                        <span className={formData.password.length < 8 ? 'text-orange-500 font-medium' : 'text-green-500 font-medium'}>
                                            {formData.password.length}/8
                                        </span>
                                    </div>
                                )} */}
                            </div>

                            {/* Project Manager Selection */}
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

                            {/* Site Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Building2 className="w-4 h-4" />
                                    Assigned Site
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
                                        <div className={`border ${errors.siteId ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg max-h-48 overflow-y-auto`}>
                                            {sites.map((site) => {
                                                const siteId = site._id || site.id;
                                                const siteName = site.name || site.siteName;
                                                const isSelected = formData.siteId === siteId;

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
                                        {errors.siteId && (
                                            <div className="mt-1 flex items-start gap-1">
                                                <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                                <p className="text-red-500 text-xs">{errors.siteId}</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {formData.siteId && (
                                    <div className="mt-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
                                        <p className="text-xs text-blue-700 font-medium">
                                            <Check className="w-3 h-3 inline mr-1" />
                                            1 site selected
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ✅ ERROR SUMMARY SECTION */}


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
                                className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 border-2 border-blue-600"
                            >
                                Create Supervisor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Supervisor Modal */}
            {showEdit && selectedUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Edit Supervisor
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
                                    className={`w-full border ${editErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                                />
                                {editErrors.name && (
                                    <div className="mt-1 flex items-start gap-1">
                                        <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-500 text-xs">{editErrors.name}</p>
                                    </div>
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
                                    className={`w-full border ${editErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                                />
                                {editErrors.email && (
                                    <div className="mt-1 flex items-start gap-1">
                                        <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-500 text-xs">{editErrors.email}</p>
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
                                    onChange={(e) => handleEditFieldChange('mobile', e.target.value)}
                                    onBlur={handleEditBlur}
                                    className={`w-full border ${editErrors.mobile ? 'border-red-500 bg-red-50' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                                />
                                {editErrors.mobile && (
                                    <div className="mt-1 flex items-start gap-1">
                                        <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-500 text-xs">{editErrors.mobile}</p>
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
                                    placeholder="Enter full address"
                                    value={formData.address}
                                    onChange={(e) => handleEditFieldChange('address', e.target.value)}
                                    onBlur={handleEditBlur}
                                    rows={3}
                                    className={`w-full border ${editErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors`}
                                />
                                {editErrors.address && (
                                    <div className="mt-1 flex items-start gap-1">
                                        <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-500 text-xs">{editErrors.address}</p>
                                    </div>
                                )}
                            </div>

                            {/* Password (Optional) */}
                            <div>
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
                                        className={`w-full border ${editErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 transition-colors`}
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
                                    <div className="mt-1 flex items-start gap-1">
                                        <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-red-500 text-xs">{editErrors.password}</p>
                                    </div>
                                )}
                            </div>

                            {/* Project Manager Selection */}
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
                                            className={`w-full border ${editErrors.projectManagerId ? 'border-red-500 bg-red-50' : 'border-gray-300'} px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                                        >
                                            <option value="">Select Project Manager</option>
                                            {projectManagers.map((pm) => (
                                                <option key={pm._id || pm.id} value={pm._id || pm.id}>
                                                    {pm.name}
                                                </option>
                                            ))}
                                        </select>
                                        {editErrors.projectManagerId && (
                                            <div className="mt-1 flex items-start gap-1">
                                                <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                                <p className="text-red-500 text-xs">{editErrors.projectManagerId}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Site Selection */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                    <Building2 className="w-4 h-4" />
                                    Assigned Site
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
                                        <div className={`border ${editErrors.siteId ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-lg max-h-48 overflow-y-auto`}>
                                            {sites.map((site) => {
                                                const siteId = site._id || site.id;
                                                const siteName = site.name || site.siteName;
                                                const isSelected = formData.siteId === siteId;

                                                return (
                                                    <div
                                                        key={siteId}
                                                        onClick={() => handleEditToggleSite(siteId)}
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
                                        {editErrors.siteId && (
                                            <div className="mt-1 flex items-start gap-1">
                                                <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                                <p className="text-red-500 text-xs">{editErrors.siteId}</p>
                                            </div>
                                        )}
                                    </>
                                )}

                                {formData.siteId && (
                                    <div className="mt-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg">
                                        <p className="text-xs text-blue-700 font-medium">
                                            <Check className="w-3 h-3 inline mr-1" />
                                            1 site selected
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Edit Error Summary */}
                        {Object.keys(editErrors).length > 0 && (
                            <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <p className="text-sm font-semibold text-red-700">
                                        Please fix {Object.keys(editErrors).length} error{Object.keys(editErrors).length > 1 ? 's' : ''}:
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    {Object.entries(editErrors).map(([field, error]) => (
                                        <div key={field} className="text-xs text-red-600 flex items-center gap-2">
                                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                            <span className="capitalize">
                                                {field === 'projectManagerId' ? 'Project Manager' :
                                                    field === 'siteId' ? 'Site' : field}:
                                            </span>
                                            <span>{error}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="sticky bottom-0 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-gray-200">
                            <button
                                onClick={() => {
                                    setShowEdit(false);
                                    setSelectedUser(null);
                                    setEditErrors({});
                                    setEditTouched({});
                                }}
                                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-colors bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 border-2 border-blue-600"
                            >
                                Update Supervisor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
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
                await api.delete(`/api/client-admin/supervisors/${userToDelete}`);
                alert('Supervisor deleted successfully!');
                await fetchUsers();
              } catch (err) {
                console.error('Error deleting supervisor:', err);
                alert(err.response?.data?.message || 'Failed to delete supervisor');
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

export default SupervisorsPage;