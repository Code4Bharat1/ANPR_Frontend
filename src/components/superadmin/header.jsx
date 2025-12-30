"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Bell, Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';

const Header = ({ title = "Dashboard", onMenuClick }) => {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userData, setUserData] = useState({
    name: 'User',
    email: 'user@example.com',
    role: 'Admin',
    initials: 'U',
    profileImage: null
  });
  const [loading, setLoading] = useState(true);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchUserData();
    fetchNotifications();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Try to get from API
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        const { fullName, email, role, profileImageUrl } = response.data;
        setUserData({
          name: fullName || 'User',
          email: email || 'user@example.com',
          role: role || 'Admin',
          initials: getInitials(fullName || 'User'),
          profileImage: profileImageUrl || null
        });
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      
      // Fallback to localStorage
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUserData({
          name: parsed.name || 'User',
          email: parsed.email || 'user@example.com',
          role: parsed.role || 'Admin',
          initials: getInitials(parsed.name || 'User'),
          profileImage: parsed.profileImage || null
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/notifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(response.data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      
      // Fallback data
      setNotifications([
        { 
          id: 1, 
          title: "New client registered", 
          message: "Enterprise Corp has been added",
          time: "5m ago", 
          unread: true,
          type: "info"
        },
        { 
          id: 2, 
          title: "System update available", 
          message: "Version 2.5.2 is ready",
          time: "1h ago", 
          unread: true,
          type: "warning"
        },
        { 
          id: 3, 
          title: "Payment received", 
          message: "₹50,000 from TechStart Ltd",
          time: "2h ago", 
          unread: false,
          type: "success"
        }
      ]);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, unread: false } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/superadmin/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setNotifications(notifications.map(n => ({ ...n, unread: false })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      sessionStorage.clear();
      router.push('/login');
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        
        {/* Left Section */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
          >
            <Menu className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
          </button>
          <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">{title}</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-gray-100 rounded-lg transition relative"
            >
              <Bell className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-xs flex items-center justify-center px-1 font-semibold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-purple-600 hover:text-purple-700 font-semibold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => {
                          if (notification.unread) {
                            markAsRead(notification.id);
                          }
                        }}
                        className={`w-full px-4 py-3 hover:bg-gray-50 transition text-left ${
                          notification.unread ? 'bg-purple-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                            notification.unread ? 'bg-purple-600' : 'bg-gray-300'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            {notification.message && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      No notifications
                    </div>
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="px-4 py-2 border-t border-gray-200">
                    <button 
                      onClick={() => {
                        router.push('/superadmin/notifications');
                        setShowNotifications(false);
                      }}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm md:text-base overflow-hidden">
                {userData.profileImage ? (
                  <img 
                    src={userData.profileImage} 
                    alt={userData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userData.initials
                )}
              </div>
              <ChevronDown className="w-4 h-4 text-gray-600 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="font-semibold text-gray-900 text-sm truncate">{userData.name}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">{userData.email}</p>
                  {userData.role && (
                    <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                      {userData.role}
                    </span>
                  )}
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      router.push('/superadmin/profile');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2.5 hover:bg-gray-50 transition flex items-center gap-3 text-left"
                  >
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700 font-medium">My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push('/superadmin/settings');
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2.5 hover:bg-gray-50 transition flex items-center gap-3 text-left"
                  >
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700 font-medium">Settings</span>
                  </button>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-200 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 hover:bg-red-50 transition flex items-center gap-3 text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600 font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
