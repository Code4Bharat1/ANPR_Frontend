  "use client";
  import { useState, useEffect } from 'react';
  import axios from 'axios';
  import { 
    Search, MapPin, Eye, X, User, Phone, Calendar, Activity
  } from 'lucide-react';
  import Sidebar from './sidebar';
  import Header from './header';

  const PMSites = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sites, setSites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSite, setSelectedSite] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
      fetchSites();
    }, []);

    const fetchSites = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/project/sites`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setSites(response.data);
        console.log(response.data);
      } catch (err) {
        console.error('Error fetching sites:', err);
      } finally {
        setLoading(false);
      }
    };

    const handleViewDetails = (site) => {
      setSelectedSite(site);
      setShowModal(true);
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
                      {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Supervisors
                      </th> */}
                      {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Active Vehicles
                      </th> */}
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredSites.map((site) => (
                      <tr key={site.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-bold text-gray-900">{site.name}</div>
                            {/* <div className="text-sm text-gray-500">{site.id}</div> */}
                          </div>
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
                        {/* <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{site.supervisors}</div>
                        </td> */}
                        {/* <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{site.activeVehicles}</div>
                        </td> */}
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
      {showModal && selectedSite && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Site Details</h2>
          <button 
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Site Name & Status */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedSite.name}</h3>
              {/* <p className="text-sm text-gray-500">{selectedSite.id}</p> */}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              selectedSite.status === 'Active' 
                ? 'bg-green-100 text-green-700' 
                : selectedSite.status === 'Maintenance'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {selectedSite.status}
            </span>
          </div>

          {/* Address */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500 mb-1">Location</div>
                <div className="text-gray-900 font-medium">{selectedSite.location}</div>
              </div>
            </div>
            
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500 mb-1">Address</div>
                <div className="text-gray-900 font-medium">{selectedSite.address}</div>
              </div>
            </div>
            
          </div>

          {/* NEW: Site Activity - Live Vehicle Condition */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-gray-900">Site Activity - Live Vehicle Status</h4>
            </div>
            <div className="space-y-3">
              {selectedSite.liveVehicles && selectedSite.liveVehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedSite.liveVehicles.map((vehicle, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium text-gray-900">{vehicle.vehicleNumber}</div>
                          <div className="text-xs text-gray-500">{vehicle.type}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          vehicle.status === 'Working' ? 'bg-green-100 text-green-700' :
                          vehicle.status === 'Idle' ? 'bg-yellow-100 text-yellow-700' :
                          vehicle.status === 'Maintenance' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {vehicle.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-600">Driver: <span className="font-medium">{vehicle.driver || 'N/A'}</span></div>
                        <div className="text-gray-600">Fuel: <span className="font-medium">{vehicle.fuelLevel}%</span></div>
                        <div className="text-gray-600">Hours Today: <span className="font-medium">{vehicle.hoursOperated}h</span></div>
                        <div className="text-gray-600">Last Update: <span className="font-medium">{vehicle.lastUpdate}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No live vehicle data available</p>
                </div>
              )}
            </div>
          </div>

          {/* NEW: Traffic Site - Exit/Entry Vehicles */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-gray-900">Traffic Site - Vehicle Movement</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Entry Vehicles */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-green-700">Entry Vehicles</h5>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {selectedSite.entryVehicles?.length || 0}
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedSite.entryVehicles && selectedSite.entryVehicles.length > 0 ? (
                    selectedSite.entryVehicles.slice(0, 5).map((vehicle, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{vehicle.vehicleNumber}</span>
                        <span className="text-gray-500 text-xs">{vehicle.time}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No recent entries</p>
                  )}
                  {selectedSite.entryVehicles && selectedSite.entryVehicles.length > 5 && (
                    <p className="text-indigo-600 text-sm font-medium text-center pt-2">
                      +{selectedSite.entryVehicles.length - 5} more entries
                    </p>
                  )}
                </div>
              </div>

              {/* Exit Vehicles */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-red-700">Exit Vehicles</h5>
                  <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded-full">
                    {selectedSite.exitVehicles?.length || 0}
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedSite.exitVehicles && selectedSite.exitVehicles.length > 0 ? (
                    selectedSite.exitVehicles.slice(0, 5).map((vehicle, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{vehicle.vehicleNumber}</span>
                        <span className="text-gray-500 text-xs">{vehicle.time}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No recent exits</p>
                  )}
                  {selectedSite.exitVehicles && selectedSite.exitVehicles.length > 5 && (
                    <p className="text-indigo-600 text-sm font-medium text-center pt-2">
                      +{selectedSite.exitVehicles.length - 5} more exits
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Traffic Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{selectedSite.vehiclesOnSite || 0}</div>
                  <div className="text-xs text-gray-500">Currently On Site</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{selectedSite.todayEntries || 0}</div>
                  <div className="text-xs text-gray-500">Today's Entries</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-700">{selectedSite.todayExits || 0}</div>
                  <div className="text-xs text-gray-500">Today's Exits</div>
                </div>
              </div>
            </div>
          </div>

          {/* Supervisor & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 mb-1">Contact Person</div>
                  <div className="text-gray-900 font-medium">
                    {selectedSite.contactPerson || 'Not assigned'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-xs text-gray-500 mb-1">Contact Number</div>
                  <div className="text-gray-900 font-medium">
                    {selectedSite.contactPhone || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Total Supervisors</div>
              <div className="text-2xl font-bold text-gray-900">{selectedSite.supervisors}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Active Vehicles</div>
              <div className="text-2xl font-bold text-gray-900">{selectedSite.activeVehicles}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Total Vehicles</div>
              <div className="text-2xl font-bold text-gray-900">{selectedSite.totalVehicles || 0}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-1">Site Utilization</div>
              <div className="text-2xl font-bold text-gray-900">
                {selectedSite.utilization ? `${selectedSite.utilization}%` : 'N/A'}
              </div>
            </div>
          </div> */}

          {/* Created Date */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <div className="text-xs text-gray-500 mb-1">Created Date</div>
                <div className="text-gray-900 font-medium">
                  {selectedSite.createdAt 
                    ? new Date(selectedSite.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info if available */}
          {selectedSite.description && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-xs text-gray-500 mb-2">Description</div>
              <div className="text-gray-900">{selectedSite.description}</div>
            </div>
          )}
        </div>

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