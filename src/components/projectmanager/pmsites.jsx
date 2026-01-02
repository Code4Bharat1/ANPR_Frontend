"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, MapPin, Eye
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';  // ✅ Import Header

const SiteCard = ({ site }) => (
  <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition">
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-bold text-gray-900 text-lg mb-1">{site.name}</h3>
        <div className="text-sm text-gray-500">{site.id}</div>
      </div>
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

    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
      <MapPin className="w-4 h-4" />
      {site.location}
    </div>

    <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-100">
      <div>
        <div className="text-xs text-gray-500 mb-1">Supervisors</div>
        <div className="font-semibold text-gray-900">{site.supervisors}</div>
      </div>
      <div>
        <div className="text-xs text-gray-500 mb-1">Active Vehicles</div>
        <div className="font-semibold text-gray-900">{site.activeVehicles}</div>
      </div>
    </div>

    <div className="flex gap-2">
      <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold">
        Assign
      </button>
      <button className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-semibold flex items-center justify-center gap-2">
        <Eye className="w-4 h-4" />
        Monitor
      </button>
    </div>
  </div>
);

const PMSites = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

      {/* ✅ Header Component with Dropdown */}
      <Header title="My Sites" onMenuClick={() => setSidebarOpen(true)} />

      {/* ✅ Main Content with proper spacing */}
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

        {/* Sites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>

        {/* Empty State */}
        {filteredSites.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No sites found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Try adjusting your search terms' : 'Sites will appear here when assigned'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PMSites;
