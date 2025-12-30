"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, Menu, MapPin, Activity, AlertCircle, CheckCircle, Camera
} from 'lucide-react';
import Sidebar from './sidebar';

const LiveMonitoring = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState('All Sites');

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 5000); // Refresh every 5s
    return () => clearInterval(interval);
  }, [selectedSite]);

  const fetchLiveData = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projectmanager/monitoring`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: { site: selectedSite }
        }
      );

      setLiveData(response.data);
    } catch (err) {
      setLiveData({
        activeVehicles: 28,
        totalBarriers: 24,
        activeBarriers: 23,
        pendingExits: 5,
        recentActivities: [
          {
            id: 1,
            type: 'entry',
            vehicleNumber: 'KA-01-MJ-2023',
            site: 'North Logistics Hub',
            gate: 'Gate 1',
            timestamp: '2 mins ago'
          },
          {
            id: 2,
            type: 'exit',
            vehicleNumber: 'TN-09-BC-9921',
            site: 'Westside Distribution',
            gate: 'Gate 2',
            timestamp: '5 mins ago'
          },
          {
            id: 3,
            type: 'alert',
            vehicleNumber: 'MH-02-X-4421',
            site: 'Port Gate 7',
            gate: 'Gate 3',
            timestamp: '8 mins ago',
            message: 'Barrier stuck open'
          },
          {
            id: 4,
            type: 'entry',
            vehicleNumber: 'DL-3C-AB-1234',
            site: 'Central Storage',
            gate: 'Gate 1',
            timestamp: '10 mins ago'
          },
          {
            id: 5,
            type: 'exit',
            vehicleNumber: 'KA-53-Z-8888',
            site: 'North Logistics Hub',
            gate: 'Gate 2',
            timestamp: '12 mins ago'
          },
        ],
        barrierStatus: [
          { id: 'BAR-001', site: 'North Logistics Hub', gate: 'Gate 1', status: 'Online', lastPing: 'Just now' },
          { id: 'BAR-002', site: 'North Logistics Hub', gate: 'Gate 2', status: 'Online', lastPing: '1 min ago' },
          { id: 'BAR-003', site: 'Westside Distribution', gate: 'Gate 1', status: 'Online', lastPing: 'Just now' },
          { id: 'BAR-004', site: 'Port Gate 7', gate: 'Gate 3', status: 'Offline', lastPing: '15 mins ago' },
          { id: 'BAR-005', site: 'Central Storage', gate: 'Gate 1', status: 'Online', lastPing: '2 mins ago' },
        ]
      });
    } finally {
      setLoading(false);
    }
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
          
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Active Vehicles</div>
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{liveData?.activeVehicles || 0}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Total Barriers</div>
                <Camera className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900">{liveData?.totalBarriers || 0}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Active Barriers</div>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600">{liveData?.activeBarriers || 0}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600">Pending Exits</div>
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-orange-600">{liveData?.pendingExits || 0}</div>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
            >
              <option value="All Sites">All Sites</option>
              <option value="North Logistics Hub">North Logistics Hub</option>
              <option value="Westside Distribution">Westside Distribution</option>
              <option value="Port Gate 7">Port Gate 7</option>
              <option value="Central Storage">Central Storage</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Recent Activities */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h2>
                <div className="space-y-4">
                  {liveData?.recentActivities?.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === 'entry' ? 'bg-green-100' :
                        activity.type === 'exit' ? 'bg-blue-100' : 'bg-red-100'
                      }`}>
                        {activity.type === 'entry' ? (
                          <CheckCircle className={`w-5 h-5 ${activity.type === 'entry' ? 'text-green-600' : ''}`} />
                        ) : activity.type === 'exit' ? (
                          <Activity className="w-5 h-5 text-blue-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">
                          {activity.type === 'entry' ? 'Vehicle Entry' : 
                           activity.type === 'exit' ? 'Vehicle Exit' : 'Alert'}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">
                          Vehicle: <span className="font-mono font-semibold">{activity.vehicleNumber}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {activity.site} - {activity.gate}
                          </span>
                          <span>{activity.timestamp}</span>
                        </div>
                        {activity.message && (
                          <div className="mt-2 text-sm text-red-600 font-medium">{activity.message}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Barrier Status */}
            <div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Barrier Status</h2>
                <div className="space-y-4">
                  {liveData?.barrierStatus?.map((barrier) => (
                    <div key={barrier.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-gray-900">{barrier.id}</div>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          barrier.status === 'Online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {barrier.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{barrier.site}</div>
                      <div className="text-xs text-gray-500">{barrier.gate} • Last ping: {barrier.lastPing}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LiveMonitoring;
 