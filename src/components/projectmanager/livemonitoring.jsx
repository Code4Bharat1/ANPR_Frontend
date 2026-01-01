"use client";
import { useState, useEffect } from 'react';
import { 
  Bell, Menu, MapPin, Activity, AlertCircle, CheckCircle, Camera, Truck, Users, Clock
} from 'lucide-react';
import Sidebar from './sidebar';


const LiveMonitoring = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liveData, setLiveData] = useState({
    vehicles: [],
    barriers: [],
    activities: [],
    stats: {
      activeVehicles: 0,
      totalBarriers: 0,
      activeBarriers: 0,
      pendingExits: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState('all');
  const [sites, setSites] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchLiveData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [selectedSite]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      // Fetch sites for filter
      const sitesRes = await fetch(`${API_URL}/api/project/sites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (sitesRes.ok) {
        const sitesData = await sitesRes.json();
        setSites(sitesData);
      }

      await fetchLiveData();
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const params = new URLSearchParams();
      if (selectedSite !== 'all') params.append('siteId', selectedSite);

      // Fetch live vehicles
      const vehiclesRes = await fetch(
        `${API_URL}/api/projectmanager/live-monitoring/vehicles?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch live barriers
      const barriersRes = await fetch(
        `${API_URL}/api/projectmanager/live-monitoring/barriers?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch recent activities
      const activitiesRes = await fetch(
        `${API_URL}/api/projectmanager/live-monitoring/activities?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (vehiclesRes.ok && barriersRes.ok && activitiesRes.ok) {
        const vehicles = await vehiclesRes.json();
        const barriers = await barriersRes.json();
        const activities = await activitiesRes.json();

        setLiveData({
          vehicles,
          barriers,
          activities,
          stats: {
            activeVehicles: vehicles.filter(v => v.status === 'inside').length,
            totalBarriers: barriers.length,
            activeBarriers: barriers.filter(b => b.isOnline).length,
            pendingExits: vehicles.filter(v => v.status === 'pending_exit').length
          }
        });
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Error fetching live data:', err);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'entry':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'exit':
        return <Activity className="w-5 h-5 text-blue-600" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityBgColor = (type) => {
    switch (type) {
      case 'entry':
        return 'bg-green-100';
      case 'exit':
        return 'bg-blue-100';
      case 'alert':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  const formatTimestamp = (date) => {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Live Monitoring</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-green-700">Live</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-4 h-4" />
                Updated: {formatTimestamp(lastUpdate)}
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-6 h-6 text-gray-600" />
                {liveData.stats.pendingExits > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                PM
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Active Vehicles</div>
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{liveData.stats.activeVehicles}</div>
              <div className="text-xs text-gray-500 mt-1">Currently inside sites</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Total Barriers</div>
                <Camera className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{liveData.stats.totalBarriers}</div>
              <div className="text-xs text-gray-500 mt-1">Across all sites</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Active Barriers</div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">{liveData.stats.activeBarriers}</div>
              <div className="text-xs text-gray-500 mt-1">Online and functional</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Pending Exits</div>
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-600">{liveData.stats.pendingExits}</div>
              <div className="text-xs text-gray-500 mt-1">Awaiting approval</div>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
            >
              <option value="all">All Sites</option>
              {sites.map((site) => (
                <option key={site._id} value={site._id}>{site.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {liveData.activities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No recent activities</p>
                    </div>
                  ) : (
                    liveData.activities.map((activity) => (
                      <div key={activity._id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActivityBgColor(activity.type)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            {activity.type === 'entry' ? 'Vehicle Entry' : 
                             activity.type === 'exit' ? 'Vehicle Exit' : 
                             activity.type === 'alert' ? 'Alert' : 'Activity'}
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            Vehicle: <span className="font-mono font-semibold">{activity.vehicleNumber}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {activity.siteId?.name || 'Unknown Site'} - {activity.gate || 'N/A'}
                            </span>
                            <span>{formatTimestamp(activity.timestamp)}</span>
                          </div>
                          {activity.message && (
                            <div className="mt-2 text-sm text-red-600 font-medium">{activity.message}</div>
                          )}
                          {activity.supervisorId && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                              <Users className="w-3 h-3" />
                              Supervisor: {activity.supervisorId.name}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Barrier Status */}
            <div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Barrier Status</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {liveData.barriers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No barriers found</p>
                    </div>
                  ) : (
                    liveData.barriers.map((barrier) => (
                      <div key={barrier._id} className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-semibold text-gray-900">{barrier.barrierId || barrier._id}</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            barrier.isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {barrier.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-1">{barrier.siteId?.name || 'Unknown Site'}</div>
                        <div className="text-xs text-gray-500">
                          {barrier.gate || 'N/A'} • Last ping: {barrier.lastPing ? formatTimestamp(barrier.lastPing) : 'Never'}
                        </div>
                        {barrier.location && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {barrier.location}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Live Vehicles Section */}
          <div className="mt-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Live Vehicles</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vehicle Number</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Site</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Entry Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {liveData.vehicles.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                          No active vehicles
                        </td>
                      </tr>
                    ) : (
                      liveData.vehicles.map((vehicle) => (
                        <tr key={vehicle._id} className="hover:bg-gray-50 transition">
                          <td className="px-4 py-3 font-mono font-semibold text-gray-900">
                            {vehicle.vehicleNumber}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {vehicle.siteId?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                              vehicle.status === 'inside' ? 'bg-green-100 text-green-700' :
                              vehicle.status === 'pending_exit' ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {vehicle.status === 'inside' ? 'Inside' :
                               vehicle.status === 'pending_exit' ? 'Pending Exit' :
                               vehicle.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {vehicle.entryTime ? new Date(vehicle.entryTime).toLocaleString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {vehicle.entryTime ? formatTimestamp(vehicle.entryTime) : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LiveMonitoring;