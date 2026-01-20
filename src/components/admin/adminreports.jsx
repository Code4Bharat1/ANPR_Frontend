"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Download, Calendar,
  FileText, TrendingUp, Filter,
  ChevronDown, ChevronUp, X,
  BarChart3, Car, MapPin,
  Clock, AlertCircle, CheckCircle,
  RefreshCw, Eye, MoreVertical,
  Printer, Mail, Share2
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';

// Table Header Component
const TableHeader = ({ children, sortable = false, onSort, sortDirection }) => (
  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
    {sortable ? (
      <button 
        onClick={onSort}
        className="flex items-center gap-1 hover:text-gray-900 transition-colors"
      >
        {children}
        {sortDirection === 'asc' ? (
          <ChevronUp className="w-3 h-3" />
        ) : sortDirection === 'desc' ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3 opacity-30" />
        )}
      </button>
    ) : children}
  </th>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Completed': {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      icon: CheckCircle
    },
    'Active': {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: Clock
    },
    'Pending': {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      icon: Clock
    },
    'Cancelled': {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      icon: AlertCircle
    }
  };

  const config = statusConfig[status] || statusConfig['Active'];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

// Time Badge Component
const TimeBadge = ({ time, label, variant = 'default' }) => {
  const variantConfig = {
    default: 'bg-gray-100 text-gray-700',
    entry: 'bg-green-50 text-green-700 border border-green-200',
    exit: 'bg-blue-50 text-blue-700 border border-blue-200',
    warning: 'bg-orange-50 text-orange-700 border border-orange-200'
  };

  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-900">{time}</span>
      <span className={`text-xs px-2 py-0.5 rounded ${variantConfig[variant]} mt-1 inline-block`}>
        {label}
      </span>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${color.bg} rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${color.icon}`} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
          trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {trend >= 0 ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-gray-600 text-sm font-medium">{title}</div>
    {subtitle && <div className="text-xs text-gray-500 mt-2">{subtitle}</div>}
  </div>
);

// Filter Chip Component
const FilterChip = ({ label, value, onRemove }) => (
  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">
    <span>{label}: {value}</span>
    <button
      onClick={onRemove}
      className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
);

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
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

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
      
      // Build params object
      const params = {
        startDate: dateRange.start,
        endDate: dateRange.end
      };

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

      const response = await axios.get(apiEndpoint, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: params
      });

      // Format trips
      const formattedTrips = (response.data || []).map(trip => {
        const vehicleNumber = trip.vehicleNumber || 
                             trip.vehicle || 
                             trip.plateText || 
                             trip.vehicleId?.vehicleNumber || 
                             'N/A';

        const entryTime = trip.entryTime || 
                         (trip.entryAt ? formatDateTime(trip.entryAt) : '-');

        const exitTime = trip.exitTime || 
                        (trip.exitAt ? formatDateTime(trip.exitAt) : '-');

        const status = normalizeStatus(trip.status);

        const site = trip.site || 
                    trip.siteName || 
                    trip.siteId?.name || 
                    'N/A';

        const duration = calculateDuration(trip.entryAt, trip.exitAt);

        return {
          id: trip._id || trip.id || trip.tripId || 'N/A',
          vehicleNumber,
          entryTime,
          exitTime,
          status,
          site,
          duration,
          entryAt: trip.entryAt,
          exitAt: trip.exitAt,
          rawData: trip
        };
      });

      setTrips(formattedTrips);
      
      // Update active filters
      const filters = [];
      if (filterStatus !== 'All Status') {
        filters.push({ type: 'status', label: 'Status', value: filterStatus });
      }
      if (filterSite !== 'All Sites') {
        filters.push({ type: 'site', label: 'Site', value: filterSite });
      }
      if (dateRange.start !== dateRange.end) {
        filters.push({ 
          type: 'date', 
          label: 'Date Range', 
          value: `${dateRange.start} to ${dateRange.end}` 
        });
      }
      setActiveFilters(filters);
      
    } catch (err) {
      console.error('Error fetching reports:', err);
      alert(err.response?.data?.message || 'Failed to fetch reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return dateString;
    }
  };

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

const calculateDuration = (entryTime, exitTime, status) => {
  if (!entryTime) return '--:--';

  const start = new Date(entryTime).getTime();
  const end =
    status === 'active' || status === 'INSIDE'
      ? Date.now()                     // 🔥 live duration
      : exitTime
        ? new Date(exitTime).getTime()
        : null;

  if (!start || !end || end <= start) return '--:--';

  const diff = end - start;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}h ${minutes}m`;
};


  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
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
      const timestamp = new Date().toISOString().split('T')[0];
      link.href = url;
      link.setAttribute('download', `trips_report_${timestamp}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('Failed to export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // const handleExportPDF = () => {
  //   alert('PDF export feature coming soon!');
  // };

  // const handlePrint = () => {
  //   window.print();
  // };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Trips Report',
        text: `Trips report from ${dateRange.start} to ${dateRange.end}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleRefresh = () => {
    fetchReports();
  };

  const handleClearFilters = () => {
    setFilterSite('All Sites');
    setFilterStatus('All Status');
    setDateRange({
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    });
    setSearchTerm('');
    setActiveFilters([]);
  };

  const handleRemoveFilter = (index) => {
    const filter = activeFilters[index];
    if (filter.type === 'status') {
      setFilterStatus('All Status');
    } else if (filter.type === 'site') {
      setFilterSite('All Sites');
    } else if (filter.type === 'date') {
      setDateRange({
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      });
    }
    const newFilters = [...activeFilters];
    newFilters.splice(index, 1);
    setActiveFilters(newFilters);
  };

  // Fetch reports on mount and when date range changes
  useEffect(() => {
    fetchReports();
  }, [dateRange.start, dateRange.end]);

  // Fetch reports when filters change
  useEffect(() => {
    if (!loading) {
      fetchReports();
    }
  }, [filterStatus, filterSite]);

  // Filter trips based on search and filters
  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All Status' || trip.status === filterStatus;
    const matchesSite = filterSite === 'All Sites' || trip.site === filterSite;
    return matchesSearch && matchesStatus && matchesSite;
  });

  // Sort trips AFTER filteredTrips is defined
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    if (aVal < bVal) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aVal > bVal) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const totalTrips = trips.length;
  const completedTrips = trips.filter(t => t.status === 'Completed').length;
  const activeTrips = trips.filter(t => t.status === 'Active').length;
  const avgDuration = trips.length > 0
    ? Math.round(trips.reduce((acc, trip) => {
        const duration = trip.duration ? parseInt(trip.duration) : 0;
        return acc + duration;
      }, 0) / trips.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 font-medium text-lg">Loading reports...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching and analyzing trip data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Header 
        title="Trip Reports" 
        onMenuClick={() => setSidebarOpen(true)}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg border border-gray-200 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        }
      />

      <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Stats Overview */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Trips"
              value={totalTrips}
              icon={BarChart3}
              color={{ bg: 'bg-blue-50', icon: 'text-blue-600' }}
              subtitle={`${dateRange.start} to ${dateRange.end}`}
            />
            <StatCard
              title="Completed"
              value={completedTrips}
              icon={CheckCircle}
              color={{ bg: 'bg-green-50', icon: 'text-green-600' }}
              trend={totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0}
              subtitle={`${totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0}% completion rate`}
            />
            <StatCard
              title="Active"
              value={activeTrips}
              icon={Clock}
              color={{ bg: 'bg-orange-50', icon: 'text-orange-600' }}
              subtitle="Currently in progress"
            />
            <StatCard
              title="Avg Duration"
              value={avgDuration ? `${avgDuration}m` : 'N/A'}
              icon={Clock}
              color={{ bg: 'bg-purple-50', icon: 'text-purple-600' }}
              subtitle="Average trip duration"
            />
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Filters & Controls
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={handleClearFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-3">Active Filters:</div>
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <FilterChip
                    key={index}
                    label={filter.label}
                    value={filter.value}
                    onRemove={() => handleRemoveFilter(index)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Filter Controls */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Site</label>
                <select
                  value={filterSite}
                  onChange={(e) => setFilterSite(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                >
                  <option value="All Sites">All Sites</option>
                  <option value="Site A">Site A</option>
                  <option value="Site B">Site B</option>
                  <option value="Site C">Site C</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                >
                  <option value="All Status">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          )}

          {/* Search and Action Buttons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by vehicle number, trip ID, or site..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                disabled={exporting || filteredTrips.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {exporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Excel
                  </>
                )}
              </button>
              {/* <div className="relative group">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 px-3 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 hidden group-hover:block z-10">
                  <button
                    onClick={handleExportPDF}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Export as PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Print Report
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Report
                  </button>
                </div>
              </div> */}
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Trip Records</h3>
            <p className="text-sm text-gray-600">
              Showing {filteredTrips.length} of {totalTrips} trips
              {activeFilters.length > 0 && ' with applied filters'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">View:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'card' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase w-20">
                      S.No.
                    </th>
                    <TableHeader 
                      sortable 
                      onSort={() => handleSort('vehicleNumber')}
                      sortDirection={sortConfig.key === 'vehicleNumber' ? sortConfig.direction : null}
                    >
                      Vehicle
                    </TableHeader>
                    <TableHeader 
                      sortable 
                      onSort={() => handleSort('entryAt')}
                      sortDirection={sortConfig.key === 'entryAt' ? sortConfig.direction : null}
                    >
                      Entry Time
                    </TableHeader>
                    <TableHeader 
                      sortable 
                      onSort={() => handleSort('exitAt')}
                      sortDirection={sortConfig.key === 'exitAt' ? sortConfig.direction : null}
                    >
                      Exit Time
                    </TableHeader>
                    <TableHeader 
                      sortable 
                      onSort={() => handleSort('status')}
                      sortDirection={sortConfig.key === 'status' ? sortConfig.direction : null}
                    >
                      Status
                    </TableHeader>
                    <TableHeader 
                      sortable 
                      onSort={() => handleSort('site')}
                      sortDirection={sortConfig.key === 'site' ? sortConfig.direction : null}
                    >
                      Site
                    </TableHeader>
                    <TableHeader>Duration</TableHeader>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedTrips.map((trip, index) => (
                    <tr key={trip.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm font-medium text-gray-900">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <Car className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{trip.vehicleNumber}</div>
                            {/* <div className="text-xs text-gray-500">ID: {trip.id.substring(0, 8)}...</div> */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <TimeBadge 
                          time={trip.entryTime.split(',')[0]} 
                          label="Entry" 
                          variant="entry"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <TimeBadge 
                          time={trip.exitTime === '-' ? '--:--' : trip.exitTime.split(',')[0]} 
                          label="Exit" 
                          variant={trip.exitTime === '-' ? 'warning' : 'exit'}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={trip.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm text-gray-900 truncate max-w-[200px]">
                            {trip.site}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {trip.duration || '--:--'}
                          </span>
                          <span className="text-xs text-gray-500">Duration</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {sortedTrips.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">No trips found</h4>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  No trips match your current filters. Try adjusting your search criteria or date range.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Card View */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTrips.map((trip, index) => (
              <div key={trip.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Car className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{trip.vehicleNumber}</div>
                      <div className="text-xs text-gray-500">#{index + 1}</div>
                    </div>
                  </div>
                  <StatusBadge status={trip.status} />
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Entry Time</div>
                      <div className="text-sm font-medium text-gray-900">{trip.entryTime.split(',')[0]}</div>
                      <div className="text-xs text-green-600 mt-1">Entry</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Exit Time</div>
                      <div className="text-sm font-medium text-gray-900">
                        {trip.exitTime === '-' ? '--:--' : trip.exitTime.split(',')[0]}
                      </div>
                      <div className={`text-xs mt-1 ${
                        trip.exitTime === '-' ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        {trip.exitTime === '-' ? 'Not Exited' : 'Exit'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-900">{trip.site}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {trip.duration || '--:--'}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {sortedTrips.length === 0 && (
              <div className="md:col-span-2 lg:col-span-3">
                <div className="bg-white rounded-xl p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No trips found</p>
                  <p className="text-sm text-gray-400 mt-2">Try adjusting your filters</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReports;