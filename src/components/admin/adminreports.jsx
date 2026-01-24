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
  Printer, Mail, Share2,
  LogIn,
  Timer,
  LogOut,
  Camera,
  Video,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
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
        <div className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
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

// Pagination Component
// Pagination Component को AdminReports function के अंदर लिखें
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    let prev = 0;
    for (const i of range) {
      if (prev) {
        if (i - prev === 2) {
          rangeWithDots.push(prev + 1);
        } else if (i - prev !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  };

  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <span>Page {currentPage} of {totalPages}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((pageNum, index) => (
          pageNum === '...' ? (
            <span key={`dots-${index}`} className="px-2 text-gray-500">...</span>
          ) : (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[40px] h-10 px-3 rounded-md border font-medium transition-colors ${
                currentPage === pageNum
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {pageNum}
            </button>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>

      <div className="text-sm text-gray-700">
        Showing {startItem} to {endItem} of {totalItems} results
      </div>
    </div>
  );
};

const AdminReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sites, setSites] = useState([]);
  const [loadingSites, setLoadingSites] = useState(false);
  const [filterSite, setFilterSite] = useState('All Sites');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 7))
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [resolvedEntryMedia, setResolvedEntryMedia] = useState({
    photos: {},
    video: null,
  });
  const [resolvedExitMedia, setResolvedExitMedia] = useState({
    photos: {},
    video: null,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filteredTrips, setFilteredTrips] = useState([]);

  const [expandedSections, setExpandedSections] = useState({
    entryEvidence: true,
    exitEvidence: true,
  });

  const photoFields = [
    {
      key: "frontView",
      label: "Front View",
      description: "Vehicle front side",
    },
    { key: "backView", label: "Back View", description: "Vehicle rear side" },
    { key: "loadView", label: "Load Area", description: "Cargo/load area" },
    {
      key: "driverView",
      label: "Driver",
      description: "Driver identification",
    },
  ];

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

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoadingSites(true);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/sites`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setSites(res.data.data || res.data);
      } catch (error) {
        console.error(
          "Failed to fetch sites:",
          error.response?.status,
          error.message
        );
      } finally {
        setLoadingSites(false);
      }
    };
    fetchSites();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const userRole = getUserRole();

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
      console.log(formattedTrips);
      
      
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
      setCurrentPage(1); // Reset to first page when new data loads

    } catch (err) {
      console.error('Error fetching reports:', err);
      alert(err.response?.data?.message || 'Failed to fetch reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort trips based on search and filters
// Filter and sort trips based on search and filters
  useEffect(() => {
    let result = trips.filter(trip => {
      const searchLower = searchTerm.toLowerCase();
      
      // Search across multiple fields
      const matchesSearch = searchTerm === '' || 
        trip.vehicleNumber?.toLowerCase().includes(searchLower) ||
        trip.id?.toLowerCase().includes(searchLower) ||
        trip.site?.toLowerCase().includes(searchLower) ||
        trip.rawData?.tripId?.toLowerCase().includes(searchLower) ||
        trip.rawData?.projectManager?.name?.toLowerCase().includes(searchLower) ||
        trip.rawData?.createdBy?.name?.toLowerCase().includes(searchLower) ||
        trip.rawData?.vendorId?.name?.toLowerCase().includes(searchLower) ||
        trip.rawData?.vehicleId?.driverName?.toLowerCase().includes(searchLower);
      
      const matchesStatus = filterStatus === 'All Status' || trip.status === filterStatus;
      const matchesSite = filterSite === 'All Sites' || trip.site === filterSite;
      return matchesSearch && matchesStatus && matchesSite;
    });

    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
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
    }

    setFilteredTrips(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [trips, searchTerm, filterStatus, filterSite, sortConfig]);

  // Calculate pagination values
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTrips = filteredTrips.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const handleViewDetails = async (report) => {
    setSelectedTrip(report);
    setShowDetailsModal(true);
    setMediaLoading(true);

    try {
      const token = localStorage.getItem("accessToken");
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // ENTRY MEDIA
      if (report.rawData?.entryMedia) {
        const entryPhotos = {};
        for (const key in report.rawData?.entryMedia.photos || {}) {
          const mediaKey = report.rawData?.entryMedia.photos[key];
          if (!mediaKey) continue;

          try {
            const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
              params: { key: mediaKey },
              headers: { Authorization: `Bearer ${token}` },
            });
            entryPhotos[key] = res.data.url;
          } catch { }
        }

        let entryVideo = null;
        if (report.rawData?.entryMedia.video) {
          const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
            params: { key: report.rawData?.entryMedia.video },
            headers: { Authorization: `Bearer ${token}` },
          });
          entryVideo = res.data.url;
        }

        setResolvedEntryMedia({ photos: entryPhotos, video: entryVideo });
      }

      // EXIT MEDIA
      if (report.rawData?.exitMedia) {
        const exitPhotos = {};
        for (const key in report.rawData?.exitMedia.photos || {}) {
          const mediaKey = report.rawData?.exitMedia.photos[key];
          if (!mediaKey) continue;

          try {
            const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
              params: { key: mediaKey },
              headers: { Authorization: `Bearer ${token}` },
            });
            exitPhotos[key] = res.data.url;
          } catch { }
        }

        let exitVideo = null;
        if (report.rawData?.exitMedia.video) {
          const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
            params: { key: report.rawData?.exitMedia.video },
            headers: { Authorization: `Bearer ${token}` },
          });
          exitVideo = res.data.url;
        }

        setResolvedExitMedia({ photos: exitPhotos, video: exitVideo });
      }
    } catch (err) {
      console.error("Media resolve failed:", err);
    } finally {
      setMediaLoading(false);
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

    if (!start || !end || end <= start) return 'Ongoing';

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

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusBadge = (status) => {
    const configs = {
      completed: {
        bg: "bg-gradient-to-r from-green-100 to-green-50",
        text: "text-green-700",
        label: "Completed",
        icon: CheckCircle,
      },
      active: {
        bg: "bg-gradient-to-r from-blue-100 to-blue-50",
        text: "text-blue-700",
        label: "Inside",
        icon: Clock,
      },
      inside: {
        bg: "bg-gradient-to-r from-blue-100 to-blue-50",
        text: "text-blue-700",
        label: "Inside",
        icon: Clock,
      },
    };

    const config = configs[status?.toLowerCase()] || configs.active;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
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

  const totalTrips = trips.length;
  const completedTrips = trips.filter(t => t.status === 'Completed').length;
  const activeTrips = trips.filter(t => t.status === 'Active').length;

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.start}
            max={dateRange.end || new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              const newStart = e.target.value;
              const today = new Date().toISOString().split('T')[0];
              
              // Future date नहीं select कर सकते
              if (newStart > today) {
                setDateRange({ ...dateRange, start: today });
                return;
              }
              
              setDateRange({ ...dateRange, start: newStart });
              
              // अगर end date start से पहले है, तो end date को update करें
              if (dateRange.end && newStart > dateRange.end) {
                setDateRange(prev => ({ 
                  ...prev, 
                  end: newStart 
                }));
              }
            }}
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
              dateRange.start > (dateRange.end || '') || 
              dateRange.start > new Date().toISOString().split('T')[0]
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            }`}
          />
          {(dateRange.start > (dateRange.end || '') || 
            dateRange.start > new Date().toISOString().split('T')[0]) && (
            <p className="text-xs text-red-600 mt-1">
              {dateRange.start > new Date().toISOString().split('T')[0] 
                ? "Cannot select future dates" 
                : "Start date cannot be after end date"}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            End Date
          </label>
          <input
            type="date"
            value={dateRange.end}
            min={dateRange.start}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => {
              const newEnd = e.target.value;
              const today = new Date().toISOString().split('T')[0];
              
              // Future date नहीं select कर सकते
              if (newEnd > today) {
                setDateRange({ ...dateRange, end: today });
                return;
              }
              
              // End date start date से पहले नहीं हो सकती
              if (newEnd < dateRange.start) {
                setDateRange({ ...dateRange, end: dateRange.start });
                return;
              }
              
              setDateRange({ ...dateRange, end: newEnd });
            }}
            className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
              dateRange.end < dateRange.start || 
              dateRange.end > new Date().toISOString().split('T')[0]
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            }`}
          />
          {(dateRange.end < dateRange.start || 
            dateRange.end > new Date().toISOString().split('T')[0]) && (
            <p className="text-xs text-red-600 mt-1">
              {dateRange.end > new Date().toISOString().split('T')[0]
                ? "Cannot select future dates"
                : "End date cannot be before start date"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Site</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white appearance-none"
            >
              <option value="All Sites">All Sites</option>
              {sites.map((site) => (
                <option key={site._id} value={site._id}>
                  {site.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
          </div>
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
          </select>
        </div>
      </div>
      
      {/* Date validation message */}
      {(dateRange.start > dateRange.end || 
        dateRange.start > new Date().toISOString().split('T')[0] || 
        dateRange.end > new Date().toISOString().split('T')[0]) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Please fix the following date issues:</p>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                {dateRange.start > dateRange.end && (
                  <li>End date cannot be earlier than start date</li>
                )}
                {dateRange.start > new Date().toISOString().split('T')[0] && (
                  <li>Start date cannot be in the future</li>
                )}
                {dateRange.end > new Date().toISOString().split('T')[0] && (
                  <li>End date cannot be in the future</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Quick date range buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
        <span className="text-sm text-gray-700 font-medium">Quick Select:</span>
        <button
          type="button"
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            setDateRange({ start: today, end: today });
          }}
          className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition border border-blue-200"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => {
            const end = new Date().toISOString().split('T')[0];
            const start = new Date();
            start.setDate(start.getDate() - 7);
            setDateRange({ 
              start: start.toISOString().split('T')[0], 
              end 
            });
          }}
          className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition border border-blue-200"
        >
          Last 7 Days
        </button>
        <button
          type="button"
          onClick={() => {
            const end = new Date().toISOString().split('T')[0];
            const start = new Date();
            start.setDate(start.getDate() - 30);
            setDateRange({ 
              start: start.toISOString().split('T')[0], 
              end 
            });
          }}
          className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition border border-blue-200"
        >
          Last 30 Days
        </button>
        <button
          type="button"
          onClick={() => {
            const end = new Date().toISOString().split('T')[0];
            const start = new Date();
            start.setMonth(start.getMonth() - 1);
            setDateRange({ 
              start: start.toISOString().split('T')[0], 
              end 
            });
          }}
          className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition border border-blue-200"
        >
          Last Month
        </button>
        <button
          type="button"
          onClick={() => {
            const end = new Date().toISOString().split('T')[0];
            const start = new Date(new Date().getFullYear(), 0, 1);
            setDateRange({ 
              start: start.toISOString().split('T')[0], 
              end 
            });
          }}
          className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition border border-blue-200"
        >
          This Year
        </button>
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
          placeholder="Search by vehicle number, trip ID, site name, or driver..."
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
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </div>
  </div>
</div>
        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Trip Records</h3>
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTrips.length)} of {filteredTrips.length} trips
              {activeFilters.length > 0 && ' with applied filters'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">View:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                    }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('card')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'card' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'
                    }`}
                >
                  Cards
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <>
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
                      <TableHeader>Project Manager</TableHeader>
                      <TableHeader>Supervisor</TableHeader>
                      <TableHeader>Action</TableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentTrips.map((trip, index) => (
                      <tr key={trip.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {startIndex + index + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                              <Car className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{trip.vehicleNumber}</div>
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
                              {trip.duration || 'Ongoing'}
                            </span>
                            <span className="text-xs text-gray-500">Duration</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {trip.rawData?.projectManager?.name || '--'}
                            </span>
                            <span className="text-xs text-gray-500">Project Manager</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {trip.rawData?.createdBy?.name || '--'}
                            </span>
                            <span className="text-xs text-gray-500">Supervisor</span>
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => handleViewDetails(trip)}
                            className="mt-4 w-full px-4 py-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredTrips.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}

              {currentTrips.length === 0 && (
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
          </>
        )}

        {/* Card View */}
        {viewMode === 'card' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentTrips.map((trip, index) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Car className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">
                          {trip.vehicleNumber}
                        </div>
                        <div className="text-xs text-gray-500">#{startIndex + index + 1}</div>
                      </div>
                    </div>
                    <StatusBadge status={trip.status} />
                  </div>

                  {/* Body */}
                  <div className="space-y-4">
                    {/* Entry / Exit */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Entry Time</div>
                        <div className="text-sm font-medium text-gray-900">
                          {trip.entryTime?.split(',')[0]}
                        </div>
                        <div className="text-xs text-green-600 mt-1">Entry</div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Exit Time</div>
                        <div className="text-sm font-medium text-gray-900">
                          {trip.exitTime === '-' ? '--:--' : trip.exitTime?.split(',')[0]}
                        </div>
                        <div
                          className={`text-xs mt-1 ${trip.exitTime === '-' ? 'text-orange-600' : 'text-blue-600'
                            }`}
                        >
                          {trip.exitTime === '-' ? 'Not Exited' : 'Exit'}
                        </div>
                      </div>
                    </div>

                    {/* Project Manager & Supervisor */}
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          Project Manager
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {trip.rawData?.projectManager?.name || '--'}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">Supervisor</div>
                        <div className="text-sm font-medium text-gray-900">
                          {trip.rawData?.createdBy?.name || '--'}
                        </div>
                      </div>
                    </div>

                    {/* Site + Duration */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{trip.site}</span>
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        {trip.duration || 'Ongoing'}
                      </div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleViewDetails(trip)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination for Card View */}
            {filteredTrips.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <span>Showing {startIndex + 1} to {Math.min(endIndex, filteredTrips.length)} of {filteredTrips.length} trips</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentTrips.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No trips found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Try adjusting your filters
                </p>
              </div>
            )}
          </>
        )}

        {/* Enhanced Details Modal */}
        {showDetailsModal && selectedTrip && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-white">Trip Details</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="text-blue-100 text-sm">
                      {selectedTrip.vehicleId?.vehicleNumber}
                    </div>
                    {getStatusBadge(selectedTrip.status)}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setResolvedEntryMedia({ photos: {}, video: null });
                    setResolvedExitMedia({ photos: {}, video: null });
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
                {mediaLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading media...</p>
                  </div>
                ) : (
                  <>
                    {/* Vehicle Info Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs text-blue-600 font-medium mb-2">
                            VEHICLE INFORMATION
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {selectedTrip.rawData?.vehicleId?.vehicleNumber}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedTrip.rawData?.vehicleId?.vehicleType || "Unknown Type"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-600 font-medium mb-2">
                            VENDOR
                          </div>
                          <div className="font-semibold text-gray-900 mb-1">
                            {selectedTrip.rawData?.vendorId?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-600">
                            Driver: {selectedTrip.rawData?.vehicleId?.driverName || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-600 font-medium mb-2">TRIP INFO</div>
                          <div className="font-semibold text-gray-900 mb-1">{selectedTrip.rawData?.tripId || 'N/A'}</div>
                          <div className="text-sm text-gray-600">Material: {selectedTrip.rawData?.loadStatus || 'N/A'}</div>
                          <div className="text-sm text-gray-600">Type: {selectedTrip.rawData?.purpose || 'N/A'}</div>
                          <div className="text-sm text-gray-600">Count: {selectedTrip.rawData?. countofmaterials || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-r from-green-50 to-white border border-green-100 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <LogIn className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">
                              Entry Time
                            </div>
                            <div className="font-bold text-gray-900">
                              {formatDateTime(selectedTrip.entryTime)
                                ?.split(",")[1]
                                ?.trim() || "N/A"}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatDateTime(selectedTrip.entryTime)?.split(
                            ",",
                          )[0] || "N/A"}
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Timer className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">
                              Duration
                            </div>
                            <div className="font-bold text-gray-900">
                              {calculateDuration(
                                selectedTrip.entryTime,
                                selectedTrip.exitTime,
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Time spent inside premises
                        </div>
                      </div>

                      <div
                        className={`${selectedTrip.exitTime && selectedTrip.exitTime !== "--" ? "bg-gradient-to-r from-red-50 to-white border border-red-100" : "bg-gradient-to-r from-blue-50 to-white border border-blue-100"} rounded-xl p-4`}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-10 h-10 ${selectedTrip.exitTime && selectedTrip.exitTime !== "--" ? "bg-red-100" : "bg-blue-100"} rounded-lg flex items-center justify-center`}
                          >
                            <LogOut
                              className={`w-5 h-5 ${selectedTrip.exitTime && selectedTrip.exitTime !== "--" ? "text-red-600" : "text-blue-600"}`}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-700">
                              Exit Time
                            </div>
                            <div className="font-bold text-gray-900">
                              {selectedTrip.exitTime &&
                                selectedTrip.exitTime !== "--"
                                ? formatDateTime(selectedTrip.exitTime)
                                  .split(",")[1]
                                  ?.trim()
                                : "--"}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedTrip.exitTime &&
                            selectedTrip.exitTime !== "--"
                            ? formatDateTime(selectedTrip.exitTime).split(
                              ",",
                            )[0]
                            : "Still Inside"}
                        </div>
                      </div>
                    </div>

                    {/* Entry Evidence Section */}
                    <div className="border border-gray-200 rounded-xl p-5">
                      <button
                        onClick={() => toggleSection("entryEvidence")}
                        className="w-full flex items-center justify-between mb-4"
                      >
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            Entry Evidence
                          </h3>
                          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                            4 Photos Required
                          </span>
                        </div>
                        {expandedSections.entryEvidence ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>

                      {expandedSections.entryEvidence && (
                        <>
                          <div className="mb-6">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {photoFields.map((photo) => {
                                const photoUrl =
                                  resolvedEntryMedia.photos[photo.key];
                                return (
                                  <div
                                    key={photo.key}
                                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                  >
                                    {photoUrl ? (
                                      <div
                                        className="cursor-pointer"
                                        onClick={() =>
                                          window.open(photoUrl, "_blank")
                                        }
                                      >
                                        <img
                                          src={photoUrl}
                                          alt={photo.label}
                                          className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="p-2 bg-gradient-to-t from-black/80 to-transparent relative -mt-12">
                                          <div className="text-white text-xs font-medium">
                                            {photo.label}
                                          </div>
                                          <div className="text-white/70 text-xs">
                                            {photo.description}
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="h-32 flex flex-col items-center justify-center p-4 bg-gray-50">
                                        <Camera className="w-8 h-8 text-gray-300 mb-2" />
                                        <div className="text-xs text-center">
                                          <div className="font-medium text-gray-500">
                                            {photo.label}
                                          </div>
                                          <div className="text-gray-400 mt-1">
                                            Not available
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {resolvedEntryMedia.video && (
                            <button
                              onClick={() =>
                                window.open(resolvedEntryMedia.video, "_blank")
                              }
                              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                            >
                              <Video className="w-5 h-5" />
                              View Entry Video Evidence
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Exit Evidence Section (if available) */}
                    {selectedTrip.rawData?.exitMedia && (
                      <div className="border border-gray-200 rounded-xl p-5">
                        <button
                          onClick={() => toggleSection("exitEvidence")}
                          className="w-full flex items-center justify-between mb-4"
                        >
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              Exit Evidence
                            </h3>
                            <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full">
                              4 Photos Required
                            </span>
                          </div>
                          {expandedSections.exitEvidence ? (
                            <ChevronUp className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          )}
                        </button>

                        {expandedSections.exitEvidence && (
                          <>
                            <div className="mb-6">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {photoFields.map((photo) => {
                                  const photoUrl =
                                    resolvedExitMedia.photos[photo.key];
                                  return (
                                    <div
                                      key={photo.key}
                                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                      {photoUrl ? (
                                        <div
                                          className="cursor-pointer"
                                          onClick={() =>
                                            window.open(photoUrl, "_blank")
                                          }
                                        >
                                          <img
                                            src={photoUrl}
                                            alt={`Exit ${photo.label}`}
                                            className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300"
                                          />
                                          <div className="p-2 bg-gradient-to-t from-black/80 to-transparent relative -mt-12">
                                            <div className="text-white text-xs font-medium">
                                              {photo.label}
                                            </div>
                                            <div className="text-white/70 text-xs">
                                              {photo.description}
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="h-32 flex flex-col items-center justify-center p-4 bg-gray-50">
                                          <Camera className="w-8 h-8 text-gray-300 mb-2" />
                                          <div className="text-xs text-center">
                                            <div className="font-medium text-gray-500">
                                              {photo.label}
                                            </div>
                                            <div className="text-gray-400 mt-1">
                                              Not available
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {resolvedExitMedia.video && (
                              <button
                                onClick={() =>
                                  window.open(resolvedExitMedia.video, "_blank")
                                }
                                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                              >
                                <Video className="w-5 h-5" />
                                View Exit Video Evidence
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Close Button */}
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setResolvedEntryMedia({ photos: {}, video: null });
                        setResolvedExitMedia({ photos: {}, video: null });
                      }}
                      className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminReports;