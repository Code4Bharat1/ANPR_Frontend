"use client";
import { useState, useEffect } from 'react';
import { 
  Search, Download, FileText, Calendar, Loader, CheckCircle, AlertCircle
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';  // ✅ Import Header

const PMReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end
      });

      const response = await fetch(
        `${API_URL}/api/project/reports/trip?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        showAlert('error', 'Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      showAlert('error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const token = localStorage.getItem('accessToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end
      });

      const response = await fetch(
        `${API_URL}/api/project/reports/export?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `trip_reports_${dateRange.start}_to_${dateRange.end}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        showAlert('success', 'Report exported successfully!');
      } else {
        showAlert('error', 'Failed to export report');
      }
    } catch (err) {
      console.error('Export error:', err);
      showAlert('error', 'Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const calculateDuration = (entryTime, exitTime) => {
    if (!exitTime) return '-';
    
    const diff = new Date(exitTime) - new Date(entryTime);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReports = reports.filter(report =>
    report.vehicleId?.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.vendorId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.tripId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: reports.length,
    completed: reports.filter(r => r.status === 'completed').length,
    active: reports.filter(r => r.status === 'active').length
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
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
          alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-slide-in`}>
          {alert.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{alert.message}</span>
        </div>
      )}

      {/* ✅ Header Component with Dropdown */}
      <Header title="Trip Reports" onMenuClick={() => setSidebarOpen(true)} />

      {/* ✅ Main Content with proper spacing */}
      <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Total Trips</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Completed Trips</div>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sm:col-span-2 lg:col-span-1">
            <div className="text-sm text-gray-600 mb-1">Active Trips</div>
            <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
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
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
              />
            </div>
            <div className="sm:col-span-2 flex items-end">
              <button
                onClick={handleExportExcel}
                disabled={exporting || reports.length === 0}
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
                    Export to Excel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by trip ID, vehicle number, or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Reports Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {/* <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trip ID</th> */}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vehicle</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Vendor</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Site</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Entry Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Exit Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg font-medium">No reports found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your date range or search filters</p>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50 transition">
                      {/* <td className="px-6 py-4 font-semibold text-indigo-600">{report.tripId}</td> */}
                      <td className="px-6 py-4 font-mono text-sm text-gray-900">
                        {report.vehicleId?.vehicleNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {report.vendorId?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {report.siteId?.name || 'N/A'}
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
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          report.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          report.status === 'active' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {report.status === 'completed' ? 'Completed' :
                           report.status === 'active' ? 'Active' :
                           report.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reports Cards - Mobile/Tablet */}
        <div className="lg:hidden space-y-4">
          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No reports found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your date range or search filters</p>
            </div>
          ) : (
            filteredReports.map((report) => (
              <div key={report._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-indigo-600 mb-1">{report.tripId}</div>
                    <div className="font-mono text-sm text-gray-900">{report.vehicleId?.vehicleNumber || 'N/A'}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    report.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    report.status === 'active' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {report.status === 'completed' ? 'Completed' : report.status === 'active' ? 'Active' : report.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor:</span>
                    <span className="font-medium text-gray-900">{report.vendorId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Site:</span>
                    <span className="font-medium text-gray-900">{report.siteId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Entry:</span>
                    <span className="font-medium text-gray-900">{formatDateTime(report.entryTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Exit:</span>
                    <span className="font-medium text-gray-900">{formatDateTime(report.exitTime)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold text-gray-900">{calculateDuration(report.entryTime, report.exitTime)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredReports.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 text-center">
            Showing {filteredReports.length} of {reports.length} trip(s)
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
