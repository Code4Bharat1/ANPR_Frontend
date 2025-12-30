"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, Menu, Search, MapPin, Users, Activity, Eye
} from 'lucide-react';
import Sidebar from './sidebar';

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/projectmanager/sites`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSites(response.data);
    } catch (err) {
      setSites([
        {
          id: 'NLH-01',
          name: 'North Logistics Hub',
          location: 'Manchester, UK',
          supervisors: 4,
          activeVehicles: 28,
          status: 'Active'
        },
        {
          id: 'WDC-04',
          name: 'Westside Distribution',
          location: 'Liverpool, UK',
          supervisors: 2,
          activeVehicles: 15,
          status: 'Active'
        },
        {
          id: 'CSF-02',
          name: 'Central Storage Facility',
          location: 'Birmingham, UK',
          supervisors: 6,
          activeVehicles: 42,
          status: 'Active'
        },
        {
          id: 'PGA-07',
          name: 'Port Gate 7',
          location: 'Felixstowe, UK',
          supervisors: 3,
          activeVehicles: 112,
          status: 'Active'
        },
        {
          id: 'TPE-01',
          name: 'Tech Park Entry A',
          location: 'Cambridge, UK',
          supervisors: 1,
          activeVehicles: 0,
          status: 'Maintenance'
        },
      ]);
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
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
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
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Sites</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                AM
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search sites by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSites.map((site) => (
              <SiteCard key={site.id} site={site} />
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

export default PMSites;
