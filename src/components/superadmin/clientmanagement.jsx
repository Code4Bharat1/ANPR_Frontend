"use client";
import React, { useState, useEffect } from 'react';
import {
  Menu, Bell, Plus, Search, Filter, Users, Calendar, Edit, Eye,
  ChevronLeft, ChevronRight, X, UserCheck, UserX, Package, Shield
} from 'lucide-react';
import Sidebar from './sidebar';

// Client Card Component
const ClientCard = ({ client, onEdit, onViewDetails, onActivate, onDeactivate }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{client.name}</h3>
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span className="text-sm">{client.email}</span>
        </div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        client.status === 'active'
          ? 'bg-green-100 text-green-700'
          : 'bg-red-100 text-red-700'
      }`}>
        {client.status?.toUpperCase() || 'ACTIVE'}
      </span>
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4">
      <div>
        <div className="text-xs text-gray-500 uppercase mb-1">Package</div>
        <div className="font-semibold text-gray-900">{client.package || 'Enterprise Gold'}</div>
      </div>
      <div>
        <div className="text-xs text-gray-500 uppercase mb-1">Sites</div>
        <div className="font-semibold text-gray-900">{client.sitesCount || 0} Sites</div>
      </div>
      <div>
        <div className="text-xs text-gray-500 uppercase mb-1">Package Start</div>
        <div className="font-semibold text-gray-900">
          {new Date(client.packageStartDate || Date.now()).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </div>
      <div>
        <div className="text-xs text-gray-500 uppercase mb-1">Package End</div>
        <div className="font-semibold text-gray-900">
          {new Date(client.packageEndDate || Date.now()).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </div>
    </div>

    <div className="flex gap-3">
      <button
        onClick={() => onEdit(client)}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
      >
        Edit
      </button>
      {client.status === 'active' ? (
        <button
          onClick={() => onDeactivate(client)}
          className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium"
        >
          Deactivate
        </button>
      ) : (
        <button
          onClick={() => onActivate(client)}
          className="flex-1 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition font-medium"
        >
          Activate
        </button>
      )}
    </div>
  </div>
);

// Add Client Modal
const AddClientModal = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    package: 'basic',
    packageStartDate: '',
    packageEndDate: '',
    address: ''
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
      email: '',
      phone: '',
      company: '',
      package: 'basic',
      packageStartDate: '',
      packageEndDate: '',
      address: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Add New Client</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Client Information */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., John Anderson"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="client@company.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 8900"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company Ltd."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Package Information */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Package Type *
                  </label>
                  <select
                    name="package"
                    value={formData.package}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="basic">Basic</option>
                    <option value="standard">Standard</option>
                    <option value="premium">Premium</option>
                    <option value="enterprise">Enterprise Gold</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="packageStartDate"
                      value={formData.packageStartDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="packageEndDate"
                      value={formData.packageEndDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                placeholder="Full address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Client Management Component
const ClientManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(5);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/clients`,
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
      setClients(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err.message);
      // Mock data
      setClients([
        {
          _id: '1',
          name: 'Enterprise Corp',
          email: 'admin@enterprise.com',
          company: 'Enterprise Corporation',
          package: 'Enterprise Gold',
          sitesCount: 12,
          packageStartDate: '2024-01-01',
          packageEndDate: '2024-12-31',
          status: 'active'
        },
        {
          _id: '2',
          name: 'TechStart Ltd',
          email: 'contact@techstart.com',
          company: 'TechStart Limited',
          package: 'Premium',
          sitesCount: 5,
          packageStartDate: '2024-03-15',
          packageEndDate: '2025-03-14',
          status: 'active'
        },
        {
          _id: '3',
          name: 'Global Industries',
          email: 'info@globalind.com',
          company: 'Global Industries Inc',
          package: 'Standard',
          sitesCount: 3,
          packageStartDate: '2023-12-01',
          packageEndDate: '2024-01-15',
          status: 'expired'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (formData) => {
    try {
      setSubmitLoading(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/clients`,
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

      const newClient = await response.json();
      setClients([newClient, ...clients]);
      setShowAddModal(false);
      alert('Client created successfully!');
    } catch (err) {
      console.error('Error creating client:', err);
      alert(`Error creating client: ${err.message}`);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (client) => {
    console.log('Edit client:', client);
    alert(`Edit functionality for ${client.name} - To be implemented`);
  };

  const handleActivate = async (client) => {
    if (confirm(`Activate client ${client.name}?`)) {
      console.log('Activating client:', client);
      alert('Client activated successfully!');
    }
  };

  const handleDeactivate = async (client) => {
    if (confirm(`Deactivate client ${client.name}?`)) {
      console.log('Deactivating client:', client);
      alert('Client deactivated successfully!');
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clients...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Client Management</h1>
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
            className="w-full bg-purple-600 text-white rounded-xl py-4 flex items-center justify-center gap-2 font-semibold hover:bg-purple-700 transition mb-6"
          >
            <Plus className="w-5 h-5" />
            Add Client
          </button>

          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-6 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                Demo mode: Using sample data. API Error: {error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 mb-8">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients found</h3>
                <p className="text-gray-600">
                  {searchQuery ? 'Try adjusting your search' : 'Start by adding your first client'}
                </p>
              </div>
            ) : (
              filteredClients.map((client) => (
                <ClientCard
                  key={client._id}
                  client={client}
                  onEdit={handleEdit}
                  onActivate={handleActivate}
                  onDeactivate={handleDeactivate}
                />
              ))
            )}
          </div>

          {filteredClients.length > 0 && (
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

      <AddClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddClient}
        loading={submitLoading}
      />
    </div>
  );
};

export default ClientManagement;