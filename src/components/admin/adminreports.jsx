"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Download, Calendar,
  FileText, TrendingUp
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';

const AdminReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSite, setFilterSite] = useState('All Sites');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const getUserRole = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          return JSON.parse(userData).role || 'client';
        } catch (e) {
          console.error('Error parsing user data:', e);
          return 'client';
        }
      }
    }
    return 'client';
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const userRole = getUserRole();
      
      // console.log('📱 Fetching reports for role:', userRole);
      // console.log('📱 Date range:', dateRange);

      // Build params object
      const params = {
        startDate: dateRange.start,
        endDate: dateRange.end
      };

      // Add filters (they will be ignored by PM endpoint but included for others)
      if (filterStatus !== 'All Status') {
        params.status = filterStatus;
      }
      if (filterSite !== 'All Sites') {
        params.site = filterSite;
      }

      // Choose endpoint based on role
      const apiEndpoint = userRole === 'project_manager'
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/trips/reports`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/reports`;

      // console.log('📱 API Endpoint:', apiEndpoint);
      // console.log('📱 Request params:', params);

      const response = await axios.get(apiEndpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: params
      });

      // console.log('📱 Raw API Response:', response.data);

      // Format trips - handle all possible field variations
      const formattedTrips = (response.data || []).map(trip => {
        // console.log('Processing trip:', trip);
        
        // Extract vehicle number from various possible fields
        const vehicleNumber = trip.vehicleNumber || 
                             trip.vehicle || 
                             trip.plateText || 
                             trip.vehicleId?.vehicleNumber || 
                             'N/A';

        // Extract entry time
        const entryTime = trip.entryTime || 
                         (trip.entryAt ? formatDateTime(trip.entryAt) : '-');

        // Extract exit time
        const exitTime = trip.exitTime || 
                        (trip.exitAt ? formatDateTime(trip.exitAt) : '-');

        // Normalize status
        const status = normalizeStatus(trip.status);

        // Extract site name
        const site = trip.site || 
                    trip.siteName || 
                    trip.siteId?.name || 
                    'N/A';

        return {
          id: trip._id || trip.id || trip.tripId || 'N/A',
          vehicleNumber,
          entryTime,
          exitTime,
          status,
          site
        };
      });

      // console.log('📱 Formatted trips:', formattedTrips);
      // console.log('📱 Total formatted:', formattedTrips.length);
      
      setTrips(formattedTrips);
    } catch (err) {
      console.error('❌ Error fetching reports:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      // Show user-friendly error
      if (err.response?.status === 401) {
        alert('Session expired. Please log in again.');
      } else {
        alert('Failed to fetch reports. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date time
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  // Helper function to normalize status
  const normalizeStatus = (status) => {
    if (!status) return 'Active';
    
    const statusMap = {
      'INSIDE': 'Active',
      'active': 'Active',
      'ACTIVE': 'Active',
      'EXITED': 'Completed',
      'completed': 'Completed',
      'COMPLETED': 'Completed'
    };
    
    return statusMap[status] || status;
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('accessToken');
      const userRole = getUserRole();

      const params = {
        startDate: dateRange.start,
        endDate: dateRange.end
      };

      if (filterStatus !== 'All Status') params.status = filterStatus;
      if (filterSite !== 'All Sites') params.site = filterSite;

      const exportEndpoint = userRole === 'project_manager'
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/trips/export`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/reports/export`;

      // console.log('📤 Export endpoint:', exportEndpoint);
      // console.log('📤 Export params:', params);

      const response = await axios.get(exportEndpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        params: params,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trips_report_${dateRange.start}_to_${dateRange.end}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      // console.log('✅ Export successful');
    } catch (err) {
      console.error('❌ Error exporting report:', err);
      alert('Failed to export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Fetch reports on mount and when date range changes
  useEffect(() => {
    fetchReports();
  }, [dateRange.start, dateRange.end]);

  // Fetch reports when filters change (but not on mount)
  useEffect(() => {
    if (!loading) {
      fetchReports();
    }
  }, [filterStatus, filterSite]);

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All Status' || trip.status === filterStatus;
    const matchesSite = filterSite === 'All Sites' || trip.site === filterSite;
    return matchesSearch && matchesStatus && matchesSite;
  });

  const totalTrips = trips.length;
  const completedTrips = trips.filter(t => t.status === 'Completed').length;
  const activeTrips = trips.filter(t => t.status === 'Active').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar and Header added here */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Header title="Reports" onMenuClick={() => setSidebarOpen(true)} />

      {/* Main Content */}
      <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Debug Info */}
       
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs sm:text-sm text-gray-600">Total Trips</div>
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalTrips}</div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs sm:text-sm text-gray-600">Completed</div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600">{completedTrips}</div>
            <div className="text-xs text-gray-500 mt-1">
              {totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0}% completion
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs sm:text-sm text-gray-600">Active</div>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-orange-600">{activeTrips}</div>
            <div className="text-xs text-gray-500 mt-1">Currently active</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Site</label>
              <select
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="All Sites">All Sites</option>
                <option value="Site A">Site A</option>
                <option value="Site B">Site B</option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleExportExcel}
                disabled={exporting || filteredTrips.length === 0}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 text-sm transition"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by vehicle number or trip ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Table - Desktop */}
        <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trip ID</th> */}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vehicle</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Entry</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Exit</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Site</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50 transition">
                    {/* <td className="px-6 py-4 font-mono text-sm text-gray-900">{trip.id}</td> */}
                    <td className="px-6 py-4 font-semibold text-gray-900">{trip.vehicleNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{trip.entryTime}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{trip.exitTime}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        trip.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{trip.site}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTrips.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No trips found</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your date range or filters</p>
            </div>
          )}
        </div>

        {/* Cards - Mobile */}
        <div className="md:hidden space-y-4">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-mono text-xs text-gray-500 mb-1">{trip.id}</div>
                  <div className="text-lg font-bold text-gray-900">{trip.vehicleNumber}</div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  trip.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {trip.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Entry:</span>
                  <span className="text-gray-900 font-medium">{trip.entryTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Exit:</span>
                  <span className="text-gray-900 font-medium">{trip.exitTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Site:</span>
                  <span className="text-gray-900 font-medium">{trip.site}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredTrips.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No trips found</p>
              <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 text-sm text-gray-600 text-center">
          Showing {filteredTrips.length} of {totalTrips} trips
        </div>
      </main>
    </div>
  );
};

export default AdminReports;