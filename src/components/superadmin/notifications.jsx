"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, CheckCircle, AlertTriangle, Info, DollarSign, Users, 
  Camera, MapPin, Trash2, Check, X, Filter, Search, MoreVertical
} from 'lucide-react';
import SuperAdminLayout from './layout';

// Notification Type Icons & Colors
const getNotificationStyle = (type) => {
  const styles = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    error: {
      icon: X,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    payment: {
      icon: DollarSign,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    client: {
      icon: Users,
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      borderColor: 'border-indigo-200'
    },
    device: {
      icon: Camera,
      bgColor: 'bg-teal-100',
      iconColor: 'text-teal-600',
      borderColor: 'border-teal-200'
    }
  };

  return styles[type] || styles.info;
};

// Single Notification Card
const NotificationCard = ({ notification, onMarkRead, onDelete, onToggleMenu }) => {
  const [showMenu, setShowMenu] = useState(false);
  const style = getNotificationStyle(notification.type);
  const Icon = style.icon;

  return (
    <div className={`bg-white rounded-lg p-4 md:p-5 border-l-4 ${style.borderColor} shadow-sm hover:shadow-md transition ${
      notification.unread ? 'bg-purple-50' : ''
    }`}>
      <div className="flex items-start gap-3 md:gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${style.bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 md:w-6 md:h-6 ${style.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-sm md:text-base">
              {notification.title}
              {notification.unread && (
                <span className="inline-block w-2 h-2 bg-purple-600 rounded-full ml-2"></span>
              )}
            </h3>
            
            {/* Actions Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded transition"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => {
                      onMarkRead(notification.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 hover:bg-gray-50 text-left text-sm flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {notification.unread ? 'Mark as read' : 'Mark as unread'}
                  </button>
                  <button
                    onClick={() => {
                      onDelete(notification.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 hover:bg-red-50 text-left text-sm text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-sm md:text-base text-gray-700 mb-2">{notification.message}</p>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
            <span>{notification.time}</span>
            {notification.module && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {notification.module}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Notifications Component
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(response.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      
      // Fallback mock data
      setNotifications([
        {
          id: 1,
          title: "New Client Registered",
          message: "Enterprise Corp has successfully registered with Gold Package",
          time: "5 minutes ago",
          unread: true,
          type: "client",
          module: "Client Management"
        },
        {
          id: 2,
          title: "Payment Received",
          message: "₹50,000 received from TechStart Ltd for package renewal",
          time: "1 hour ago",
          unread: true,
          type: "payment",
          module: "Billing"
        },
        {
          id: 3,
          title: "System Update Available",
          message: "ANPR version 2.5.2 is ready for installation",
          time: "2 hours ago",
          unread: true,
          type: "warning",
          module: "System"
        },
        {
          id: 4,
          title: "Device Added",
          message: "12 new ANPR cameras added to Mumbai Site by Admin",
          time: "3 hours ago",
          unread: false,
          type: "device",
          module: "Device Management"
        },
        {
          id: 5,
          title: "Package Expiring Soon",
          message: "Global Industries package expires in 7 days",
          time: "5 hours ago",
          unread: false,
          type: "warning",
          module: "Client Management"
        },
        {
          id: 6,
          title: "Backup Completed",
          message: "Daily system backup completed successfully",
          time: "Yesterday",
          unread: false,
          type: "success",
          module: "System"
        },
        {
          id: 7,
          title: "New User Added",
          message: "Project Manager 'John Smith' added to North Gate Complex",
          time: "Yesterday",
          unread: false,
          type: "client",
          module: "User Management"
        },
        {
          id: 8,
          title: "Device Offline Alert",
          message: "Gate-1-Cam-05 has been offline for 30 minutes",
          time: "2 days ago",
          unread: false,
          type: "error",
          module: "Device Management"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('accessToken');
      const notification = notifications.find(n => n.id === id);

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/notifications/${id}/${notification.unread ? 'read' : 'unread'}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, unread: !n.unread } : n
      ));
    } catch (err) {
      console.error('Error toggling notification:', err);
      // Optimistic update
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, unread: !n.unread } : n
      ));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(notifications.map(n => ({ ...n, unread: false })));
    } catch (err) {
      console.error('Error marking all as read:', err);
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        const token = localStorage.getItem('accessToken');

        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/superadmin/notifications/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotifications(notifications.filter(n => n.id !== id));
      } catch (err) {
        console.error('Error deleting notification:', err);
        setNotifications(notifications.filter(n => n.id !== id));
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('accessToken');

        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/superadmin/notifications/clear-all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setNotifications([]);
      } catch (err) {
        console.error('Error clearing notifications:', err);
        setNotifications([]);
      }
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'unread' ? notification.unread :
      filter === 'read' ? !notification.unread : true;

    const matchesSearch = 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminLayout title="Notifications">
      
      {/* Stats & Actions Bar */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
                <div className="text-sm text-gray-600">Total Notifications</div>
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                {unreadCount} unread
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-semibold text-sm flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition ${
                filter === 'unread'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2.5 rounded-lg font-semibold text-sm transition ${
                filter === 'read'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {searchQuery 
                ? 'No notifications match your search' 
                : filter === 'unread' 
                ? 'You\'re all caught up!' 
                : 'No notifications to display'}
            </p>
          </div>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default Notifications;
