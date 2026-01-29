"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Download,
  FileText,
  Calendar,
  Loader,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Sidebar from "./sidebar";
import Header from "./header";
import {
  Eye,
  X,
  Loader2,
  Camera,
  Video,
  ChevronDown,
  ChevronUp,
  LogIn,
  LogOut,
  Timer,
  Building2,
  Filter,
} from "lucide-react";
import axios from "axios";

const PMReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // New state for site filtering
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("all");
  const [loadingSites, setLoadingSites] = useState(false);

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

  // Create axios instance with base config
  const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    timeout: 30000,
  });

  // Add request interceptor to include token
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        showAlert("error", "Session expired. Please login again.");
      }
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    fetchReports();
    fetchSites();
  }, [dateRange]);

  useEffect(() => {
    applyFilters();
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, selectedSite, reports]);

  // Calculate paginated data
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredReports.slice(startIndex, endIndex);
  }, [filteredReports, currentPage, itemsPerPage]);

  // Calculate total pages
  useEffect(() => {
    const total = Math.ceil(filteredReports.length / itemsPerPage);
    setTotalPages(total > 0 ? total : 1);
    
    // Adjust current page if it exceeds total pages
    if (currentPage > total && total > 0) {
      setCurrentPage(total);
    }
  }, [filteredReports, itemsPerPage, currentPage]);

  // Fetch sites using axios
  const fetchSites = async () => {
  try {
    setLoadingSites(true);
    const response = await axiosInstance.get("/api/project/my-sites");

    // console.log("Sites API response:", response.data);

    // 🔥 MOST IMPORTANT FIX
    if (Array.isArray(response.data)) {
      setSites(response.data);
    } else if (Array.isArray(response.data.data)) {
      setSites(response.data.data);
    } else {
      setSites([]);
    }

  } catch (err) {
    console.error("Error fetching sites:", err);
    showAlert("error", "Failed to fetch sites");
    setSites([]);
  } finally {
    setLoadingSites(false);
  }
};


  // Apply filters
  const applyFilters = () => {
    let filtered = [...reports];

    // Apply site filter
    if (selectedSite !== "all") {
      filtered = filtered.filter(
        (report) => report.siteId?._id === selectedSite
      );
    }

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.vehicleId?.vehicleNumber?.toLowerCase().includes(term) ||
          report.vendorId?.name?.toLowerCase().includes(term) ||
          report.tripId?.toLowerCase().includes(term) ||
          report.createdBy?.name?.toLowerCase().includes(term) ||
          report.siteId?.name?.toLowerCase().includes(term)
      );
    }

    setFilteredReports(filtered);
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleViewDetails = async (report) => {
    setSelectedTrip(report);
    setShowDetailsModal(true);
    setMediaLoading(true);

    try {
      // Reset media states
      setResolvedEntryMedia({ photos: {}, video: null });
      setResolvedExitMedia({ photos: {}, video: null });

      // ENTRY MEDIA
      if (report.entryMedia) {
        const entryPhotos = {};
        
        // Process entry photos
        const photoPromises = photoFields.map(async (field) => {
          const mediaKey = report.entryMedia.photos?.[field.key];
          if (!mediaKey) return null;

          try {
            const response = await axiosInstance.get("/api/uploads/get-file", {
              params: { key: mediaKey },
            });
            entryPhotos[field.key] = response.data.url;
          } catch (error) {
            console.error(`Error loading ${field.label} photo:`, error);
          }
        });

        await Promise.all(photoPromises);

        // Process entry video
        let entryVideo = null;
        if (report.entryMedia.video) {
          try {
            const response = await axiosInstance.get("/api/uploads/get-file", {
              params: { key: report.entryMedia.video },
            });
            entryVideo = response.data.url;
          } catch (error) {
            console.error("Error loading entry video:", error);
          }
        }

        setResolvedEntryMedia({ photos: entryPhotos, video: entryVideo });
      }

      // EXIT MEDIA
      if (report.exitMedia) {
        const exitPhotos = {};
        
        // Process exit photos
        const exitPhotoPromises = photoFields.map(async (field) => {
          const mediaKey = report.exitMedia.photos?.[field.key];
          if (!mediaKey) return null;

          try {
            const response = await axiosInstance.get("/api/uploads/get-file", {
              params: { key: mediaKey },
            });
            exitPhotos[field.key] = response.data.url;
          } catch (error) {
            console.error(`Error loading exit ${field.label} photo:`, error);
          }
        });

        await Promise.all(exitPhotoPromises);

        // Process exit video
        let exitVideo = null;
        if (report.exitMedia.video) {
          try {
            const response = await axiosInstance.get("/api/uploads/get-file", {
              params: { key: report.exitMedia.video },
            });
            exitVideo = response.data.url;
          } catch (error) {
            console.error("Error loading exit video:", error);
          }
        }

        setResolvedExitMedia({ photos: exitPhotos, video: exitVideo });
      }
    } catch (err) {
      console.error("Media resolve failed:", err);
      showAlert("error", "Failed to load media");
    } finally {
      setMediaLoading(false);
    }
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

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  // Fetch reports using axios
  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/project/reports/trip", {
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
      });

      if (response.data) {
        setReports(response.data);
        setFilteredReports(response.data);
        setCurrentPage(1); // Reset to first page when new data loads
        showAlert("success", "Reports loaded successfully");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      showAlert("error", err.response?.data?.message || "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  // Export reports using axios
  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const response = await axiosInstance.get("/api/project/reports/export", {
        params: {
          startDate: dateRange.start,
          endDate: dateRange.end,
        },
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `trip_reports_${dateRange.start}_to_${dateRange.end}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showAlert("success", "Report exported successfully!");
    } catch (err) {
      console.error("Export error:", err);
      showAlert("error", err.response?.data?.message || "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const calculateDuration = (entryTime, exitTime) => {
    if (!exitTime || exitTime === "--") return "-";

    const diff = new Date(exitTime) - new Date(entryTime);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString || dateString === "--") return "-";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = {
    total: reports.length,
    completed: reports.filter((r) => r.status === "completed").length,
    active: reports.filter((r) => r.status === "active").length,
    filtered: filteredReports.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Alert Notification */}
      {alert && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${alert.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white animate-slide-in`}
        >
          {alert.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{alert.message}</span>
        </div>
      )}

      {/* Header */}
      <Header title="Trip Reports" onMenuClick={() => setSidebarOpen(true)} />

      {/* Main Content */}
      <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Total Trips</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.total}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Completed Trips</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.completed}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Active Trips</div>
            <div className="text-3xl font-bold text-blue-600">
              {stats.active}
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Showing</div>
            <div className="text-3xl font-bold text-indigo-600">
              {stats.filtered}
            </div>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
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
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
            </div>
            
            {/* Site Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Filter by Site
              </label>
              <select
                value={selectedSite}
                onChange={(e) => setSelectedSite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              >
                <option value="all">All Sites</option>
                {loadingSites ? (
                  <option>Loading sites...</option>
                ) : (
                  sites.map((site) => (
                    <option key={site._id} value={site._id}>
                      {site.name || site.siteName || "Unnamed Site"}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <div className="sm:col-span-2 lg:col-span-2 flex items-end">
              <button
                onClick={handleExportExcel}
                disabled={exporting || filteredReports.length === 0}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {exporting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by trip ID, vehicle number, vendor, supervisor, or site..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSite("all");
                }}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Search Info */}
          {(searchTerm || selectedSite !== "all") && (
            <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
              <Filter className="w-4 h-4" />
              <span>
                {selectedSite !== "all" && `Site: ${sites.find(s => s._id === selectedSite)?.name || selectedSite}`}
                {searchTerm && selectedSite !== "all" && " • "}
                {searchTerm && `Search: "${searchTerm}"`}
              </span>
              <span className="ml-auto font-medium">
                {filteredReports.length} results
              </span>
            </div>
          )}
        </div>

        {/* Reports Table Header with Items Per Page */}
        <div className="bg-white rounded-t-xl p-4 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Trip Reports
            </h3>
            <p className="text-sm text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length} entries
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none text-sm"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>
          </div>
        </div>

        {/* Reports Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    S.No.
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Vehicle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Supervisor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Site
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Entry Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Exit Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {paginatedReports.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">
                        No reports found
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {searchTerm || selectedSite !== "all" 
                          ? "Try adjusting your search filters" 
                          : "Try adjusting your date range"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedReports.map((report, index) => (
                    <tr
                      key={report._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                        {((currentPage - 1) * itemsPerPage) + index + 1}
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-900">
                        {report.vehicleId?.vehicleNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {report.createdBy?.name ? 
                          report.createdBy.name.charAt(0).toUpperCase() + report.createdBy.name.slice(1) 
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {report.vendorId?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {report.siteId?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateTime(report.entryTime)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateTime(report.exitTime)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {calculateDuration(report.entryTime, report.exitTime)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewDetails(report)}
                          className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition font-medium text-sm flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {paginatedReports.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-semibold">{Math.min(currentPage * itemsPerPage, filteredReports.length)}</span> of{" "}
                <span className="font-semibold">{filteredReports.length}</span> entries
              </div>
              
              <div className="flex items-center gap-2">
                {/* First Page */}
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="First Page"
                >
                  <ChevronsLeft className="w-4 h-4 text-gray-600" />
                </button>

                {/* Previous Page */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-lg border flex items-center justify-center text-sm font-medium transition ${
                          currentPage === pageNum
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Next Page"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  title="Last Page"
                >
                  <ChevronsRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Jump to Page */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Go to:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      goToPage(page);
                    }
                  }}
                  className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none text-sm"
                />
                <span className="text-sm text-gray-600">/ {totalPages}</span>
              </div>
            </div>
          )}
        </div>

        {/* Reports Cards - Mobile/Tablet */}
        <div className="lg:hidden space-y-4">
          {paginatedReports.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No reports found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm || selectedSite !== "all" 
                  ? "Try adjusting your search filters" 
                  : "Try adjusting your date range"}
              </p>
            </div>
          ) : (
            paginatedReports.map((report, index) => (
              <div
                key={report._id}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-600 text-sm">
                      # {((currentPage - 1) * itemsPerPage) + index + 1}
                    </div>
                    <div className="font-mono text-sm text-gray-900 mt-1">
                      {report.vehicleId?.vehicleNumber || "N/A"}
                    </div>
                  </div>
                  {getStatusBadge(report.status)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Supervisor:</span>
                    <span className="font-medium text-gray-900">
                      {report.createdBy?.name ? 
                        report.createdBy.name.charAt(0).toUpperCase() + report.createdBy.name.slice(1) 
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor:</span>
                    <span className="font-medium text-gray-900">
                      {report.vendorId?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Site:</span>
                    <span className="font-medium text-gray-900">
                      {report.siteId?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Entry:</span>
                    <span className="font-medium text-gray-900">
                      {formatDateTime(report.entryTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exit:</span>
                    <span className="font-medium text-gray-900">
                      {formatDateTime(report.exitTime)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-gray-900">
                      {calculateDuration(report.entryTime, report.exitTime)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleViewDetails(report)}
                    className="mt-4 w-full px-4 py-2.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition font-medium text-sm flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Mobile Pagination */}
          {paginatedReports.length > 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="text-sm text-gray-600">
                  {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredReports.length)} of {filteredReports.length}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                
                <select
                  value={currentPage}
                  onChange={(e) => goToPage(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Page {i + 1}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">Items per page:</div>
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        {paginatedReports.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-xl p-4 text-center">
            <div className="text-sm text-gray-600">
              Showing <span className="font-bold text-indigo-600">{paginatedReports.length}</span> of{" "}
              <span className="font-bold text-gray-900">{filteredReports.length}</span> filtered trips (Total: {reports.length})
              {selectedSite !== "all" && (
                <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  Site: {sites.find(s => s._id === selectedSite)?.name || selectedSite}
                </span>
              )}
              {searchTerm && (
                <span className="ml-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  Search: "{searchTerm}"
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Enhanced Details Modal - same as before */}
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
                            {selectedTrip.vehicleId?.vehicleNumber}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedTrip.vehicleId?.vehicleType || "Unknown Type"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-600 font-medium mb-2">
                            VENDOR
                          </div>
                          <div className="font-semibold text-gray-900 mb-1">
                            {selectedTrip.vendorId?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-600">
                            Driver: {selectedTrip.vehicleId?.driverName || "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-blue-600 font-medium mb-2">TRIP INFO</div>
                          <div className="font-semibold text-gray-900 mb-1">{selectedTrip.tripId || 'N/A'}</div>
                          <div className="text-sm text-gray-600">Material: {selectedTrip.loadStatus || 'N/A'}</div>
                          <div className="text-sm text-gray-600">Type: {selectedTrip.purpose || 'N/A'}</div>
                          <div className="text-sm text-gray-600">Count: {selectedTrip.countofmaterials || 'N/A'}</div>
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
                    {selectedTrip.exitMedia && (
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

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PMReports;