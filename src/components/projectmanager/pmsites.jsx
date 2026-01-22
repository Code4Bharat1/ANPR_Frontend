"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, MapPin, Eye, X, User, Phone, Calendar, Activity, Loader2
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const PMSites = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSite, setSelectedSite] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const response = await axios.get(
        `${API_URL}/api/project/my-sites`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSites(response.data);
      // console.log('✅ Sites loaded:', response.data);
    } catch (err) {
      console.error('❌ Error fetching sites:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiteDetails = async (siteId) => {
    try {
      setLoadingDetails(true);
      const token = localStorage.getItem("accessToken");

      // console.log('🔍 Fetching details for site:', siteId);

      const res = await axios.get(
        `${API_URL}/api/project/sites/${siteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // console.log('✅ Site details loaded:', res.data);
      setSelectedSite(res.data);
    } catch (err) {
      console.error("❌ Error fetching site details:", err);
      console.error("Error response:", err.response?.data);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = async (site) => {
    setShowModal(true);
    setSelectedSite(null);
    await fetchSiteDetails(site._id || site.id);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSite(null);
  };

  const filteredSites = sites.filter(site =>
    site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    site.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header title="My Sites" onMenuClick={() => setSidebarOpen(true)} />

      <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search sites by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Sites Table */}
        {filteredSites.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Site Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Supervisors
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSites.map((site) => (
                    <tr key={site._id || site.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{site.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {site.location}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          site.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : site.status === 'Maintenance'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {site.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {site.supervisors && Array.isArray(site.supervisors) && site.supervisors.length > 0
                            ? site.supervisors.map(s => s.name || s).join(', ')
                            : typeof site.supervisors === 'number'
                              ? `${site.supervisors} Supervisor${site.supervisors !== 1 ? 's' : ''}`
                              : 'No supervisors'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(site)}
                          className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No sites found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Try adjusting your search terms' : 'Sites will appear here when assigned'}
            </p>
          </div>
        )}
      </main>

      {/* Site Details Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900">Site Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            {loadingDetails ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Loading site details...</p>
              </div>
            ) : selectedSite ? (
              <div className="p-6 space-y-6">
                {/* Site Name & Status */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedSite.name}</h2>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    selectedSite.status === 'Active' ? 'bg-green-100 text-green-700' :
                    selectedSite.status === 'Inactive' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedSite.status}
                  </span>
                </div>

                {/* Location & Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Location</span>
                    </div>
                    <p className="font-medium text-gray-900">{selectedSite.location}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Address</span>
                    </div>
                    <p className="font-medium text-gray-900">{selectedSite.address || 'N/A'}</p>
                  </div>
                </div>

                {/* Active Vehicles On Site Section */}
                {/* <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-600" />
                      Active Vehicles On Site
                    </h3>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                      {selectedSite.activeVehicleList?.length || 0} Vehicles
                    </span>
                  </div>

                  <div className="space-y-3">
                    {selectedSite.activeVehicleList && selectedSite.activeVehicleList.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                        {selectedSite.activeVehicleList.map((vehicle, index) => (
                          <div
                            key={vehicle._id || index}
                            className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="font-bold text-gray-900 text-lg">
                                  {vehicle.vehicleNumber}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <MapPin className="w-3 h-3" />
                                  On Site
                                </div>
                              </div>
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                {vehicle.status || 'INSIDE'}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Driver:</span>
                                <span className="font-medium text-gray-900">
                                  {vehicle.driver || 'Unknown'}
                                </span>
                              </div>

                              {vehicle.vendor && vehicle.vendor !== 'N/A' && (
                                <div className="flex items-center gap-2 text-sm">
                                  <div className="w-4 h-4 text-gray-400 flex items-center justify-center">
                                    <span className="text-xs">🏢</span>
                                  </div>
                                  <span className="text-gray-600">Vendor:</span>
                                  <span className="font-medium text-gray-900">
                                    {vehicle.vendor}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-sm pt-2 border-t border-gray-100">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-600">Entry Time:</span>
                                <span className="font-medium text-indigo-600">
                                  {vehicle.entryTime}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No vehicles currently on site</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Vehicles will appear here when they enter the site
                        </p>
                      </div>
                    )}
                  </div>
                </div> */}

                {/* Traffic Site - Entry/Exit Vehicles */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Traffic Site - Vehicle Movement
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Entry Vehicles */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Entry Vehicles</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          {selectedSite.entryVehicles?.length || 0}
                        </span>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedSite.entryVehicles && selectedSite.entryVehicles.length > 0 ? (
                          selectedSite.entryVehicles.map((vehicle, index) => (
                            <div
                              key={vehicle._id || index}
                              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {vehicle.vehicleNumber}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Driver: {vehicle.driver}
                                  </p>
                                  {vehicle.vendor && vehicle.vendor !== 'N/A' && (
                                    <p className="text-xs text-gray-500">
                                      Vendor: {vehicle.vendor}
                                    </p>
                                  )}
                                  {vehicle.gate && vehicle.gate !== 'N/A' && (
                                    <p className="text-xs text-gray-500">
                                      Gate: {vehicle.gate}
                                    </p>
                                  )}
                                </div>
                                <span className="text-sm font-medium text-green-600">
                                  {vehicle.time}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No recent entries</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Exit Vehicles */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Exit Vehicles</h4>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          {selectedSite.exitVehicles?.length || 0}
                        </span>
                      </div>

                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {selectedSite.exitVehicles && selectedSite.exitVehicles.length > 0 ? (
                          selectedSite.exitVehicles.map((vehicle, index) => (
                            <div
                              key={vehicle._id || index}
                              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {vehicle.vehicleNumber}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Driver: {vehicle.driver}
                                  </p>
                                  {vehicle.vendor && vehicle.vendor !== 'N/A' && (
                                    <p className="text-xs text-gray-500">
                                      Vendor: {vehicle.vendor}
                                    </p>
                                  )}
                                  {vehicle.gate && vehicle.gate !== 'N/A' && (
                                    <p className="text-xs text-gray-500">
                                      Gate: {vehicle.gate}
                                    </p>
                                  )}
                                </div>
                                <span className="text-sm font-medium text-red-600">
                                  {vehicle.time}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No recent exits</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Traffic Summary */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-indigo-600">
                        {selectedSite.vehiclesOnSite || 0}
                      </p>
                      <p className="text-sm text-gray-600">Currently On Site</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {selectedSite.todayEntries || 0}
                      </p>
                      <p className="text-sm text-gray-600">Today&apos;s Entries</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {selectedSite.todayExits || 0}
                      </p>
                      <p className="text-sm text-gray-600">Today&apos;s Exits</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Contact Person</span>
                    </div>
                    <p className="font-medium text-gray-900">{selectedSite.contactPerson || 'Not assigned'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Contact Number</span>
                    </div>
                    <p className="font-medium text-gray-900">{selectedSite.contactPhone || 'N/A'}</p>
                  </div>
                </div>

                {/* Supervisors Information */}
                {selectedSite.supervisors && selectedSite.supervisors.length > 0 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Site Supervisors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedSite.supervisors.map((supervisor, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <div className="font-medium text-gray-900">{supervisor.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{supervisor.email}</div>
                          {supervisor.phone && (
                            <div className="text-sm text-gray-600">{supervisor.phone}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Created Date</span>
                  </div>
                  <p className="font-medium text-gray-900">
                    {selectedSite.createdAt ? new Date(selectedSite.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No site data available</p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
              <button
                onClick={closeModal}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PMSites;