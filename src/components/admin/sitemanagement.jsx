"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, Menu, Search, Filter, Plus, MapPin, Users, 
  Camera, MoreVertical, Edit, Trash2, Eye
} from 'lucide-react';
import Sidebar from './sidebar';

// Site Card Component
const SiteCard = ({ site, onEdit, onView }) => (
  <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-bold text-gray-900 text-lg mb-1">{site.name}</h3>
        <div className="text-sm text-gray-500">{site.id}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          site.status === 'Active' 
            ? 'bg-green-100 text-green-700' 
            : site.status === 'Maintenance'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-gray-100 text-gray-700'
        }`}>
          {site.status}
        </span>
      </div>
    </div>

    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
      <MapPin className="w-4 h-4" />
      {site.location}
    </div>

    <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-100">
      <div>
        <div className="text-xs text-gray-500 mb-1">Assigned PMs</div>
        <div className="font-semibold text-gray-900">{site.assignedPMs}</div>
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-1">Supervisors</div>
        <div className="font-semibold text-gray-900">{site.assignedSupervisors}</div>
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-1">Devices</div>
        <div className="font-semibold text-gray-900">{site.totalDevices}</div>
      </div>
    </div>

    <div className="flex gap-2">
      <button
        onClick={() => onView(site)}
        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" />
        View
      </button>
      <button
        onClick={() => onEdit(site)}
        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold flex items-center justify-center gap-2"
      >
        <Edit className="w-4 h-4" />
        Edit
      </button>
    </div>
  </div>
);

const SiteManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/sites`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSites(response.data);
    } catch (err) {
      console.error('Error fetching sites:', err);
      // Mock data
      setSites([
        {
          id: 'SITE-001',
          name: 'North City Plaza',
          location: 'Manchester, UK',
          assignedPMs: 2,
          assignedSupervisors: 12,
          totalDevices: 24,
          status: 'Active'
        },
        {
          id: 'SITE-002',
          name: 'Westside Logistics Hub',
          location: 'Liverpool, UK',
          assignedPMs: 3,
          assignedSupervisors: 8,
          totalDevices: 16,
          status: 'Active'
        },
        {
          id: 'SITE-003',
          name: 'Central Station Parking',
          location: 'Birmingham, UK',
          assignedPMs: 4,
          assignedSupervisors: 24,
          totalDevices: 48,
          status: 'Maintenance'
        },
        {
          id: 'SITE-004',
          name: 'Airport Cargo Zone',
          location: 'London, UK',
          assignedPMs: 1,
          assignedSupervisors: 42,
          totalDevices: 84,
          status: 'Active'
        },
        {
          id: 'SITE-005',
          name: 'East Retail Park',
          location: 'Leeds, UK',
          assignedPMs: 0,
          assignedSupervisors: 6,
          totalDevices: 12,
          status: 'Inactive'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || site.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (site) => {
    console.log('Edit site:', site);
    // Add edit logic
  };

  const handleView = (site) => {
    console.log('View site:', site);
    // Add view logic
  };

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
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Sites</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search sites by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Site
            </button>
          </div>

          {/* Sites Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onEdit={handleEdit}
                onView={handleView}
              />
            ))}
          </div>

          {filteredSites.length === 0 && (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sites found</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SiteManagement;
