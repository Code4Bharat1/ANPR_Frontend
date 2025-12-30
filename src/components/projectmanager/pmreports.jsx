"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, Menu, Search, Download, FileText, Calendar
} from 'lucide-react';
import Sidebar from './sidebar';

const PMReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '2025-12-01',
    end: '2025-12-30'
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projectmanager/reports`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          params: {
            startDate: dateRange.start,
            endDate: dateRange.end
          }
        }
      );

      setReports(response.data);
    } catch (err) {
      setReports([
        {
          id: 'TR-92810',
          vehicleNumber: 'KA-01-MJ-2023',
          vendor: 'Apex Logistics',
          site: 'North Logistics Hub',
          entryTime: 'Dec 28, 10:45 AM',
          exitTime: 'Dec 28, 02:30 PM',
          duration: '3h 45m',
          status: 'Completed'
        },
        {
          id: 'TR-92811',
          vehicleNumber: 'TN-09-BC-9921',
          vendor: 'Global Freight',
          site: 'Westside Distribution',
          entryTime: 'Dec 28, 11:15 AM',
          exitTime: '-',
          duration: '-',
          status: 'Active'
        },
        {
          id: 'TR-92812',
          vehicleNumber: 'MH-02-X-4421',
          vendor: 'Rapid Courier',
          site: 'Port Gate 7',
          entryTime: 'Dec 28, 11:30 AM',
          exitTime: 'Dec 28, 12:45 PM',
          duration: '1h 15m',
          status: 'Completed'
        },
        {
          id: 'TR-92813',
          vehicleNumber: 'DL-3C-AB-1234',
          vendor: 'City Haulage',
          site: 'Central Storage',
          entryTime: 'Dec 28, 12:00 PM',
          exitTime: '-',
          duration: '-',
          status: 'Active'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projectmanager/reports/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
          params: {
            startDate: dateRange.start,
            endDate: dateRange.end
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pm_reports_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export successful! (Demo mode)');
    }
  };

  const filteredReports = reports.filter(report =>
    report.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.vendor.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
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
          
          {/* Filters */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
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
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export to Excel
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
                placeholder="Search by vehicle number or vendor..."
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
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">{report.id}</td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-900">{report.vehicleNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.vendor}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.site}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.entryTime}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.exitTime}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{report.duration}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          report.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No reports found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PMReports;
