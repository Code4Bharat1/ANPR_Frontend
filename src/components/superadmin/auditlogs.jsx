"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, FileText, Plus, Edit, Trash2, Settings,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import SuperAdminLayout from './layout';

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
    <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${actionColor}`}>
          <ActionIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900 text-sm md:text-base">{log.userName}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${actionColor}`}>
                  {log.action}
                </span>
              </div>
              <div className="text-xs md:text-sm text-gray-600">{log.description}</div>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <div className="text-xs md:text-sm text-gray-900 font-medium">
                {new Date(log.timestamp).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 text-xs mb-2">
            <div>
              <span className="text-gray-500">Role: </span>
              <span className="font-semibold text-gray-900">{log.userRole}</span>
            </div>
            <div className="truncate">
              <span className="text-gray-500">Module: </span>
              <span className="font-semibold text-gray-900">{log.module}</span>
            </div>
            <div className="truncate">
              <span className="text-gray-500">IP: </span>
              <span className="font-mono text-gray-900">{log.ipAddress}</span>
            </div>
          </div>

          {log.changes && (
            <div className="mt-3 p-2 md:p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="text-xs font-semibold text-gray-700 mb-2">Changes:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="truncate">
                  <span className="text-gray-500">Old: </span>
                  <span className="font-mono text-red-600">{log.changes.old}</span>
                </div>
                <div className="truncate">
                  <span className="text-gray-500">New: </span>
                  <span className="font-mono text-green-600">{log.changes.new}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => onViewDetails(log)}
            className="mt-3 text-xs md:text-sm text-purple-600 hover:text-purple-700 font-semibold"
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">Audit Log Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <FileText className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <div className="text-xs md:text-sm text-gray-500 mb-1">Log ID</div>
                <div className="font-mono text-xs md:text-sm text-gray-900 break-all">{log._id}</div>
              </div>
              <div>
                <div className="text-xs md:text-sm text-gray-500 mb-1">Timestamp</div>
                <div className="text-xs md:text-sm text-gray-900">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs md:text-sm text-gray-500 mb-1">User</div>
                <div className="text-xs md:text-sm font-semibold text-gray-900">{log.userName}</div>
              </div>
              <div>
                <div className="text-xs md:text-sm text-gray-500 mb-1">User Role</div>
                <div className="text-xs md:text-sm font-semibold text-gray-900">{log.userRole}</div>
              </div>
              <div>
                <div className="text-xs md:text-sm text-gray-500 mb-1">Action</div>
                <div className="text-xs md:text-sm font-semibold text-gray-900">{log.action}</div>
              </div>
              <div>
                <div className="text-xs md:text-sm text-gray-500 mb-1">Module</div>
                <div className="text-xs md:text-sm font-semibold text-gray-900">{log.module}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">Description</h3>
            <div className="p-3 md:p-4 bg-gray-50 rounded-lg text-xs md:text-sm text-gray-900">
              {log.description}
            </div>
          </div>

          {/* Changes */}
          {log.changes && (
            <div>
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">Changes Made</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div className="p-3 md:p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-xs md:text-sm font-semibold text-red-900 mb-2">Old Value</div>
                  <div className="font-mono text-xs md:text-sm text-red-700 break-all">{log.changes.old}</div>
                </div>
                <div className="p-3 md:p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-xs md:text-sm font-semibold text-green-900 mb-2">New Value</div>
                  <div className="font-mono text-xs md:text-sm text-green-700 break-all">{log.changes.new}</div>
                </div>
              </div>
            </div>
          )}

          {/* Technical Details */}
          <div>
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">Technical Details</h3>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-100 gap-1">
                <span className="text-xs md:text-sm text-gray-600">IP Address</span>
                <span className="font-mono text-xs md:text-sm text-gray-900">{log.ipAddress}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-100 gap-1">
                <span className="text-xs md:text-sm text-gray-600">User Agent</span>
                <span className="text-xs md:text-sm text-gray-900 truncate">{log.userAgent || 'N/A'}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 gap-1">
                <span className="text-xs md:text-sm text-gray-600">Session ID</span>
                <span className="font-mono text-xs md:text-sm text-gray-900 break-all">{log.sessionId || 'N/A'}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full px-4 md:px-6 py-2.5 md:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-sm md:text-base"
          >
            Close
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
  const [totalPages, setTotalPages] = useState(5);
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
      
      // Mock data fallback
      setLogs([
        {
          _id: 'LOG-001',
          timestamp: new Date().toISOString(),
          userName: 'James Anderson',
          userRole: 'Admin',
          action: 'CREATE',
          module: 'Client Management',
          description: 'Created new client "Enterprise Corp" with Enterprise Gold package',
          ipAddress: '192.168.1.100',
          changes: {
            old: 'N/A',
            new: 'Enterprise Corp - Gold Package'
          }
        },
        {
          _id: 'LOG-002',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          userName: 'Sarah Mitchell',
          userRole: 'Super Admin',
          action: 'UPDATE',
          module: 'Device Management',
          description: 'Updated device configuration for Gate-1-Cam-01',
          ipAddress: '192.168.1.105',
          changes: {
            old: 'Status: Offline',
            new: 'Status: Online'
          }
        },
        {
          _id: 'LOG-003',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          userName: 'Mike Roberts',
          userRole: 'Admin',
          action: 'DELETE',
          module: 'Site Management',
          description: 'Deleted site "Old Warehouse Location"',
          ipAddress: '192.168.1.112',
          changes: {
            old: 'Old Warehouse Location - Active',
            new: 'Deleted'
          }
        },
        {
          _id: 'LOG-004',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          userName: 'System',
          userRole: 'System',
          action: 'UPDATE',
          module: 'System',
          description: 'Automated package expiry check completed',
          ipAddress: '127.0.0.1'
        },
        {
          _id: 'LOG-005',
          timestamp: new Date(Date.now() - 14400000).toISOString(),
          userName: 'David Chen',
          userRole: 'Admin',
          action: 'CREATE',
          module: 'User Management',
          description: 'Added new Project Manager "John Smith" to site',
          ipAddress: '192.168.1.120',
          changes: {
            old: 'N/A',
            new: 'PM: John Smith - North Gate Complex'
          }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (log) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.module?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action?.toLowerCase() === filterAction.toLowerCase();
    const matchesRole = filterRole === 'all' || log.userRole === filterRole;
    const matchesModule = filterModule === 'all' || log.module === filterModule;
    return matchesSearch && matchesAction && matchesRole && matchesModule;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminLayout title="Audit Logs">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-100">
          <div className="text-xl md:text-2xl font-bold text-gray-900">{logs.length}</div>
          <div className="text-xs md:text-sm text-gray-600">Total Logs</div>
        </div>
        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-100">
          <div className="text-xl md:text-2xl font-bold text-green-600">
            {logs.filter(l => l.action === 'CREATE').length}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Created</div>
        </div>
        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-100">
          <div className="text-xl md:text-2xl font-bold text-blue-600">
            {logs.filter(l => l.action === 'UPDATE').length}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Updated</div>
        </div>
        <div className="bg-white rounded-lg p-3 md:p-4 border border-gray-100">
          <div className="text-xl md:text-2xl font-bold text-red-600">
            {logs.filter(l => l.action === 'DELETE').length}
          </div>
          <div className="text-xs md:text-sm text-gray-600">Deleted</div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
        >
          <option value="all">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
        >
          <option value="all">All Roles</option>
          <option value="Super Admin">Super Admin</option>
          <option value="Admin">Admin</option>
          <option value="System">System</option>
        </select>
        <select
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
          className="px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
        >
          <option value="all">All Modules</option>
          <option value="Client Management">Client Management</option>
          <option value="Device Management">Device Management</option>
          <option value="Site Management">Site Management</option>
          <option value="User Management">User Management</option>
          <option value="System">System</option>
        </select>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4 mb-6">
          <p className="text-xs md:text-sm text-yellow-800">
            Demo mode: Using sample data. API Error: {error}
          </p>
        </div>
      )}

      {/* Logs List */}
      <div className="space-y-3 md:space-y-4 mb-8">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">No logs found</h3>
            <p className="text-gray-600 text-sm md:text-base">
              {searchQuery ? 'Try adjusting your search or filters' : 'No audit logs available'}
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => (
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs md:text-sm text-gray-600">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
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
