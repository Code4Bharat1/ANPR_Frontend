"use client";
import React, { useState, useEffect } from 'react';
import {
    Menu, Bell, Plus, Search, Filter, MapPin, Users, UserCheck,
    Camera, Calendar, Edit, Eye, ChevronLeft, ChevronRight, X,
    Shield, LayoutDashboard, BarChart3, Settings, User, LogOut
} from 'lucide-react';

// Sidebar Component
const Sidebar = ({ isOpen, onClose }) => {
    const [activeItem, setActiveItem] = useState('Sites');

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Sites', icon: MapPin, path: '/sites' },
        { name: 'Users', icon: Users, path: '/users' },
        { name: 'Devices', icon: Camera, path: '/devices' },
        { name: 'Reports', icon: BarChart3, path: '/reports' },
        { name: 'Settings', icon: Settings, path: '/settings' },
        { name: 'Profile', icon: User, path: '/profile' }
    ];

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
        }
    };

    const handleNavigation = (itemName, path) => {
        setActiveItem(itemName);
        console.log(`Navigating to ${path}`);
        if (onClose) onClose();
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50
        w-72 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">AccessControl</span>
                        </div>
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            JA
                        </div>
                        <div>
                            <div className="font-semibold text-gray-900">James Anderson</div>
                            <div className="text-sm text-gray-500">Client Admin</div>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeItem === item.name;

                            return (
                                <button
                                    key={item.name}
                                    onClick={() => handleNavigation(item.name, item.path)}
                                    className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${isActive
                                            ? 'bg-blue-50 text-blue-700 font-semibold'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }
                  `}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-600'}`} />
                                    <span>{item.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-semibold">Logout</span>
                    </button>

                    <div className="mt-4 text-center text-xs text-gray-400">
                        v2.4.1 Enterprise Build
                    </div>
                </div>
            </aside>
        </>
    );
};

// Site Card Component
const SiteCard = ({ site, onEdit, onViewDetails }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
        <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{site.name}</h3>
                <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{site.location}</span>
                </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${site.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                {site.status?.toUpperCase() || 'ACTIVE'}
            </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Project Managers</div>
                <div className="font-semibold text-gray-900">
                    {site.projectManagers?.join(', ') || 'Not assigned'}
                </div>
            </div>
            <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Supervisors</div>
                <div className="font-semibold text-gray-900">
                    {site.supervisorsCount || 0} Assigned
                </div>
            </div>
            <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Devices</div>
                <div className="font-semibold text-gray-900">
                    {site.devicesCount || 0} Units
                </div>
            </div>
            <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Created</div>
                <div className="font-semibold text-gray-900">
                    {new Date(site.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}
                </div>
            </div>
        </div>

        <div className="flex gap-3">
            <button
                onClick={() => onEdit(site)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
                Edit
            </button>
            <button
                onClick={() => onViewDetails(site)}
                className="flex-1 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition font-medium"
            >
                View Details
            </button>
        </div>
    </div>
);

// Add Site Modal
const AddSiteModal = ({ isOpen, onClose, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        address: '',
        description: '',
        contactPerson: '',
        contactPhone: '',
        contactEmail: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleReset = () => {
        setFormData({
            name: '',
            location: '',
            address: '',
            description: '',
            contactPerson: '',
            contactPhone: '',
            contactEmail: ''
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Add New Site</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Site Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g., North Gate Complex"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Location *
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Manchester, UK"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Full Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Full address of the site"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                placeholder="Brief description of the site"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Contact Person
                                    </label>
                                    <input
                                        type="text"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleChange}
                                        placeholder="Site manager name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Contact Phone
                                    </label>
                                    <input
                                        type="tel"
                                        name="contactPhone"
                                        value={formData.contactPhone}
                                        onChange={handleChange}
                                        placeholder="+44 1234 567890"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        name="contactEmail"
                                        value={formData.contactEmail}
                                        onChange={handleChange}
                                        placeholder="contact@site.com"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={handleReset}
                            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Site'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Sites Page Component
const SitesPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(5);

    useEffect(() => {
        fetchSites();
    }, []);

    const fetchSites = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/sites`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSites(data.data || []);
            setError(null);
        } catch (err) {
            console.error('Error fetching sites:', err);
            setError(err.message);
            setSites([
                {
                    _id: '1',
                    name: 'North Gate Complex',
                    location: 'Manchester, UK',
                    projectManagers: ['Sarah J.', 'Mike T.'],
                    supervisorsCount: 3,
                    devicesCount: 12,
                    status: 'active',
                    createdAt: '2023-10-24T00:00:00.000Z'
                },
                {
                    _id: '2',
                    name: 'Westside Logistics Hub',
                    location: 'Birmingham, UK',
                    projectManagers: ['David Chen'],
                    supervisorsCount: 5,
                    devicesCount: 24,
                    status: 'active',
                    createdAt: '2023-09-15T00:00:00.000Z'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSite = async (formData) => {
        try {
            setSubmitLoading(true);
            const token = localStorage.getItem('accessToken');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/sites`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newSite = await response.json();
            setSites([newSite, ...sites]);
            setShowAddModal(false);
            alert('Site created successfully!');
        } catch (err) {
            console.error('Error creating site:', err);
            alert(`Error creating site: ${err.message}`);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = (site) => {
        console.log('Edit site:', site);
        alert(`Edit functionality for ${site.name} - To be implemented`);
    };

    const handleViewDetails = (site) => {
        console.log('View details:', site);
        alert(`View details for ${site.name} - To be implemented`);
    };

    const filteredSites = sites.filter(site =>
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading sites...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="lg:ml-72">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <Menu className="w-6 h-6 text-gray-700" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
                        </div>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
                            <Bell className="w-6 h-6 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-6 py-8">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full bg-blue-600 text-white rounded-xl py-4 flex items-center justify-center gap-2 font-semibold hover:bg-blue-700 transition mb-6"
                    >
                        <Plus className="w-5 h-5" />
                        Add Site
                    </button>

                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search sites..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition">
                            <Filter className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-yellow-800">
                                Demo mode: Using sample data. API Error: {error}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 mb-8">
                        {filteredSites.length === 0 ? (
                            <div className="text-center py-12">
                                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No sites found</h3>
                                <p className="text-gray-600">
                                    {searchQuery ? 'Try adjusting your search' : 'Start by adding your first site'}
                                </p>
                            </div>
                        ) : (
                            filteredSites.map((site) => (
                                <SiteCard
                                    key={site._id}
                                    site={site}
                                    onEdit={handleEdit}
                                    onViewDetails={handleViewDetails}
                                />
                            ))
                        )}
                    </div>

                    {filteredSites.length > 0 && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <AddSiteModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleAddSite}
                loading={submitLoading}
            />
        </div>
    );
};

export default SitesPage;