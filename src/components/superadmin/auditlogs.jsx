"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, FileText, Plus, Edit, Trash2, Settings,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import SuperAdminLayout from './layout';

const ITEMS_PER_PAGE = 15;

// Action Icon Map
const getActionIcon = (action) => {
  switch (action.toLowerCase()) {
    case 'create':
    case 'add':
      return Plus;
    case 'edit':
    case 'update':
      return Edit;
    case 'delete':
      return Trash2;
    case 'configure':
    case 'settings':
      return Settings;
    default:
      return FileText;
  }
};

// Action Color Map
const getActionColor = (action) => {
  switch (action.toLowerCase()) {
    case 'create':
    case 'add':
      return 'bg-green-100 text-green-700';
    case 'edit':
    case 'update':
      return 'bg-blue-100 text-blue-700';
    case 'delete':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

// Audit Log Item Component
const AuditLogItem = ({ log, onViewDetails }) => {
  const ActionIcon = getActionIcon(log.action);
  const actionColor = getActionColor(log.action);

  return (
    <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-200 transition-all duration-200">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${actionColor} shadow-sm`}>
          <ActionIcon className="w-6 h-6" />
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-bold text-gray-900 text-base">{log.userName}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap ${actionColor}`}>
                  {log.action}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{log.description}</p>
            </div>
            <div className="text-left sm:text-right flex-shrink-0 bg-gray-50 px-3 py-2 rounded-lg">
              <div className="text-sm text-gray-900 font-semibold">
                {new Date(log.timestamp).toLocaleDateString('en-IN', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {new Date(log.timestamp).toLocaleTimeString('en-IN', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 font-medium">Role:</span>
              <span className="font-semibold text-gray-900 px-2 py-1 bg-purple-50 rounded">{log.userRole}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <span className="text-gray-500 font-medium">Module:</span>
              <span className="font-semibold text-gray-900">{log.module}</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <span className="text-gray-500 font-medium">IP:</span>
              <span className="font-mono text-gray-900 text-xs">{log.ipAddress}</span>
            </div>
          </div>

          {log.changes && (
            <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-green-50 rounded-lg border border-gray-200">
              <div className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Changes:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 font-medium whitespace-nowrap">Old:</span>
                  <span className="font-mono text-red-700 font-semibold break-all">{log.changes.old}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-500 font-medium whitespace-nowrap">New:</span>
                  <span className="font-mono text-green-700 font-semibold break-all">{log.changes.new}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => onViewDetails(log)}
            className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-bold hover:underline transition"
          >
            View Full Details →
          </button>
        </div>
      </div>
    </div>
  );
};

// Log Details Modal
const LogDetailsModal = ({ log, isOpen, onClose }) => {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Audit Log Details</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/20 rounded-lg transition text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Log ID</div>
                <div className="font-mono text-sm text-gray-900 break-all">{log._id}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Timestamp</div>
                <div className="text-sm text-gray-900 font-semibold">
                  {new Date(log.timestamp).toLocaleString('en-IN')}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">User</div>
                <div className="text-sm font-bold text-gray-900">{log.userName}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">User Role</div>
                <div className="text-sm font-bold text-purple-600">{log.userRole}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Action</div>
                <div className="text-sm font-bold text-gray-900">{log.action}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Module</div>
                <div className="text-sm font-bold text-gray-900">{log.module}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
              Description
            </h3>
            <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 text-sm text-gray-900 leading-relaxed">
              {log.description}
            </div>
          </div>

          {/* Changes */}
          {log.changes && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                Changes Made
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 rounded-xl border-2 border-red-200">
                  <div className="text-sm font-bold text-red-900 mb-2 uppercase tracking-wide">Old Value</div>
                  <div className="font-mono text-sm text-red-700 break-all bg-white p-3 rounded-lg">{log.changes.old}</div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <div className="text-sm font-bold text-green-900 mb-2 uppercase tracking-wide">New Value</div>
                  <div className="font-mono text-sm text-green-700 break-all bg-white p-3 rounded-lg">{log.changes.new}</div>
                </div>
              </div>
            </div>
          )}

          {/* Technical Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
              Technical Details
            </h3>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between py-3 px-4 border-b border-gray-200">
                <span className="text-sm text-gray-600 font-semibold">IP Address</span>
                <span className="font-mono text-sm text-gray-900 font-bold">{log.ipAddress}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4 border-b border-gray-200">
                <span className="text-sm text-gray-600 font-semibold">User Agent</span>
                <span className="text-sm text-gray-900 truncate max-w-xs">{log.userAgent || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between py-3 px-4">
                <span className="text-sm text-gray-600 font-semibold">Session ID</span>
                <span className="font-mono text-sm text-gray-900">{log.sessionId || 'N/A'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all font-bold shadow-lg hover:shadow-xl"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Audit Logs Component
const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/audit-logs`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setLogs(response.data.data || response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err.response?.data?.message || err.message);
      
      // Mock data fallback - 50 items for proper pagination testing
      const mockLogs = [];
      const users = ['James Anderson', 'Sarah Mitchell', 'Mike Roberts', 'David Chen', 'Emily Taylor', 'John Smith', 'Lisa Brown', 'Tom Wilson'];
      const roles = ['Admin', 'Super Admin', 'System', 'Manager'];
      const actions = ['CREATE', 'UPDATE', 'DELETE', 'CONFIGURE'];
      const modules = ['Client Management', 'Device Management', 'Site Management', 'User Management', 'System', 'Analytics'];
      
      for (let i = 0; i < 50; i++) {
        mockLogs.push({
          _id: `LOG-${String(i + 1).padStart(3, '0')}`,
          timestamp: new Date(Date.now() - i * 1800000).toISOString(),
          userName: users[i % users.length],
          userRole: roles[i % roles.length],
          action: actions[i % actions.length],
          module: modules[i % modules.length],
          description: `${users[i % users.length]} performed ${actions[i % actions.length].toLowerCase()} operation on ${modules[i % modules.length]} module`,
          ipAddress: `192.168.${Math.floor(i / 10)}.${100 + (i % 50)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          sessionId: `SESSION-${String(i + 1).padStart(5, '0')}`,
          changes: i % 3 === 0 ? {
            old: `Previous state for item ${i}`,
            new: `Updated state for item ${i}`
          } : null
        });
      }
      
      setLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.module?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action?.toLowerCase() === filterAction.toLowerCase();
    const matchesRole = filterRole === 'all' || log.userRole === filterRole;
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    return matchesSearch && matchesAction && matchesRole && matchesModule;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterAction, filterRole, filterModule]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminLayout title="Audit Logs">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all">
          <div className="text-3xl font-black text-gray-900">{logs.length}</div>
          <div className="text-sm text-gray-600 font-semibold mt-1">Total Logs</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 md:p-5 border border-green-200 shadow-sm hover:shadow-md transition-all">
          <div className="text-3xl font-black text-green-700">
            {logs.filter(l => l.action === 'CREATE').length}
          </div>
          <div className="text-sm text-green-700 font-semibold mt-1">Created</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 md:p-5 border border-blue-200 shadow-sm hover:shadow-md transition-all">
          <div className="text-3xl font-black text-blue-700">
            {logs.filter(l => l.action === 'UPDATE').length}
          </div>
          <div className="text-sm text-blue-700 font-semibold mt-1">Updated</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 md:p-5 border border-red-200 shadow-sm hover:shadow-md transition-all">
          <div className="text-3xl font-black text-red-700">
            {logs.filter(l => l.action === 'DELETE').length}
          </div>
          <div className="text-sm text-red-700 font-semibold mt-1">Deleted</div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
        >
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="configure">Configure</option>
        </select>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
        >
          <option value="all">All Roles</option>
          <option value="Super Admin">Super Admin</option>
          <option value="Admin">Admin</option>
          <option value="System">System</option>
          <option value="Manager">Manager</option>
        </select>
        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all font-medium"
        >
          <option value="all">All Modules</option>
          <option value="Client Management">Client Management</option>
          <option value="Device Management">Device Management</option>
          <option value="Site Management">Site Management</option>
          <option value="User Management">User Management</option>
          <option value="System">System</option>
          <option value="Analytics">Analytics</option>
        </select>
      </div>

      {error && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-4 mb-6 shadow-sm">
          <p className="text-sm text-yellow-900 font-semibold">
            ⚠️ Demo mode: Using sample data (50 logs). API Error: {error}
          </p>
        </div>
      )}

      {/* Results Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600 font-semibold">
          Showing <span className="text-purple-600 font-bold">{startIndex + 1}-{Math.min(endIndex, filteredLogs.length)}</span> of <span className="text-purple-600 font-bold">{filteredLogs.length}</span> logs
          {(searchQuery || filterAction !== 'all' || filterRole !== 'all' || filterModule !== 'all') && 
            <span className="text-purple-600"> (filtered from {logs.length})</span>
          }
        </div>
        <div className="text-sm text-gray-600 font-semibold">
          Page <span className="text-purple-600 font-bold">{currentPage}</span> of <span className="text-purple-600 font-bold">{totalPages}</span>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4 mb-6">
        {paginatedLogs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-200 shadow-sm">
            <FileText className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No logs found</h3>
            <p className="text-gray-600">
              {searchQuery || filterAction !== 'all' || filterRole !== 'all' || filterModule !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No audit logs available'}
            </p>
          </div>
        ) : (
          paginatedLogs.map((log) => (
            <AuditLogItem
              key={log._id}
              log={log}
              onViewDetails={handleViewDetails}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredLogs.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 font-medium">
              Displaying <span className="font-bold text-gray-900">{paginatedLogs.length}</span> items per page (Total: <span className="font-bold text-purple-600">{filteredLogs.length}</span>)
            </div>
            
            <div className="flex items-center gap-2">
              {/* First Page */}
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 border-2 border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all"
                title="First Page"
              >
                <ChevronsLeft className="w-5 h-5" />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border-2 border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all"
                title="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Page Numbers */}
              <div className="hidden md:flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-400 font-bold">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[44px] px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg scale-110'
                          : 'bg-white border-2 border-gray-300 text-gray-700 hover:bg-purple-50 hover:border-purple-400 hover:scale-105'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>

              {/* Mobile: Current Page Display */}
              <div className="md:hidden px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-bold text-sm shadow-lg">
                {currentPage} / {totalPages}
              </div>

              {/* Next Page */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border-2 border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all"
                title="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 border-2 border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 transition-all"
                title="Last Page"
              >
                <ChevronsRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <LogDetailsModal
        log={selectedLog}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </SuperAdminLayout>
  );
};

export default AuditLogs;
