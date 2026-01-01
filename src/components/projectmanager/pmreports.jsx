"use client";
import { useState, useEffect } from 'react';
import { 
  Bell, Menu, Search, Download, FileText, Calendar, Loader, CheckCircle, AlertCircle
} from 'lucide-react';
import Sidebar from './sidebar';


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
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Alert */}
      {alert && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
          alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white animate-slide-in`}>
          {alert.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{alert.message}</span>
        </div>
      )}

      <div className="lg:ml-72">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Trip Reports</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                PM
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-600 mb-1">Total Trips</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-600 mb-1">Completed Trips</div>
              <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-sm text-gray-600 mb-1">Active Trips</div>
              <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
              <div className="md:col-span-2 flex items-end">
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

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by trip ID, vehicle number, or vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trip ID</th>
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
                        <td className="px-6 py-4 font-semibold text-indigo-600">{report.tripId}</td>
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

          {/* Summary */}
          {filteredReports.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              Showing {filteredReports.length} of {reports.length} trip(s)
            </div>
          )}
        </main>
      </div>

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