"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Mail, Phone, Shield, Clock, Calendar, MapPin, Edit2, Save, X, 
  Monitor, Smartphone, LogOut, CheckCircle, Camera
} from 'lucide-react';
import SuperAdminLayout from './layout';

// Profile Section Component
const ProfileSection = ({ title, children }) => (
  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-4 md:mb-6">
    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">{title}</h2>
    {children}
  </div>
);

// Info Row Component
const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between py-3 md:py-4 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-purple-600" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs md:text-sm text-gray-600">{label}</div>
        <div className="font-semibold text-gray-900 text-sm md:text-base truncate">{value}</div>
      </div>
    </div>
  </div>
);

// Activity Log Item
const ActivityLogItem = ({ action, timestamp, module }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-gray-900 text-sm md:text-base">{action}</div>
      <div className="text-xs md:text-sm text-gray-600 truncate">{module}</div>
      <div className="text-xs text-gray-500 mt-1">{timestamp}</div>
    </div>
  </div>
);

// Active Session Component
const SessionCard = ({ device, location, ipAddress, lastActive, isCurrent, onRevoke }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border border-gray-200 rounded-lg mb-3 gap-3">
    <div className="flex items-center gap-3 min-w-0 flex-1">
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {device.includes('Mobile') || device.includes('iPhone') ? (
          <Smartphone className="w-5 h-5 text-purple-600" />
        ) : (
          <Monitor className="w-5 h-5 text-purple-600" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-gray-900 text-sm md:text-base">{device}</div>
        <div className="text-xs md:text-sm text-gray-600 flex items-center gap-2 truncate">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{location} • {ipAddress}</span>
        </div>
        <div className="text-xs text-gray-500">{lastActive}</div>
      </div>
    </div>
    {isCurrent ? (
      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
        <CheckCircle className="w-3 h-3" />
        Current
      </span>
    ) : (
      <button 
        onClick={onRevoke}
        className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition self-start sm:self-center"
      >
        <LogOut className="w-4 h-4" />
      </button>
    )}
  </div>
);

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const [profileData, setProfileData] = useState({
    fullName: 'Admin User',
    role: 'Super Administrator',
    email: 'admin@nexcorealliance.com',
    phone: '+91 897 632 2917',
    accountStatus: 'Active',
    lastLogin: 'Dec 30, 2025 at 10:36 AM',
    createdAt: 'Jan 15, 2024',
    location: 'Mumbai, Maharashtra, India'
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchProfile();
    // fetchRecentActivity();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/profile`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        setProfileData(response.data);
        if (response.data.profileImageUrl) {
          setProfileImage(response.data.profileImageUrl);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      // Use default state
    }
  };

  // const fetchRecentActivity = async () => {
  //   try {
  //     const token = localStorage.getItem('accessToken');
  //     const response = await axios.get(
  //       `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/recent-activity`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     setRecentActivity(response.data || []);
  //   } catch (err) {
  //     console.error('Error fetching activity:', err);
  //     // Fallback data
  //     setRecentActivity([
  //       { action: "Updated client package", module: "Client Management", timestamp: "2 hours ago" },
  //       { action: "Registered new device", module: "Device Management", timestamp: "5 hours ago" },
  //       { action: "Exported analytics report", module: "Analytics", timestamp: "Yesterday" },
  //       { action: "Changed system settings", module: "Settings", timestamp: "2 days ago" },
  //       { action: "Added new client", module: "Client Management", timestamp: "3 days ago" }
  //     ]);
  //   }
  // };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      try {
        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('profileImage', file);

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/upload-profile-image`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        if (response.data.url) {
          setProfileImage(response.data.url);
          alert('Profile image updated successfully!');
        }
      } catch (err) {
        console.error('Error uploading image:', err);
        alert('Failed to upload image');
      }
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/profile/change-password`,
        profileData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile(); // Refresh
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    if (confirm('Are you sure you want to revoke this session?')) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/revoke-session`,
          { sessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Session revoked successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to revoke session');
      }
    }
  };

  return (
    <SuperAdminLayout title="My Profile">
      
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 md:p-8 mb-6 text-white">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Picture */}
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center text-purple-600 text-3xl md:text-4xl font-bold overflow-hidden">
  {profileImage ? (
    <img
      src={profileImage}
      alt="Profile"
      className="w-full h-full object-cover"
    />
  ) : (
    profileData.fullName?.charAt(0) || 'A'
  )}
</div>


          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 truncate">{profileData.fullName}</h2>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <Shield className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <span className="text-purple-100 text-sm md:text-base">{profileData.role}</span>
            </div>
            <div className="flex flex-col md:flex-row flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="truncate">{profileData.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span>{profileData.phone}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                <span className="truncate">{profileData.location}</span>
              </div>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 md:px-6 py-2 md:py-2.5 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center gap-2 text-sm md:text-base flex-shrink-0"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2">
          {/* Profile Information */}
          <ProfileSection title="Profile Information">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm md:text-base"
                  />
                </div>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="w-full px-4 md:px-6 py-2 md:py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <div>
                <InfoRow icon={User} label="Full Name" value={profileData.fullName} />
                <InfoRow icon={Shield} label="Role" value={profileData.role} />
                <InfoRow icon={Mail} label="Email Address" value={profileData.email} />
                <InfoRow icon={Phone} label="Phone Number" value={profileData.phone} />
                <InfoRow icon={MapPin} label="Location" value={profileData.location} />
              </div>
            )}
          </ProfileSection>

          {/* Account Security */}
          <ProfileSection title="Active Sessions">
            <SessionCard
              device="Chrome on Windows"
              location="Mumbai, India"
              ipAddress="192.168.1.100"
              lastActive="Active now"
              isCurrent={true}
            />
            <SessionCard
              device="Safari on iPhone"
              location="Mumbai, India"
              ipAddress="192.168.1.45"
              lastActive="2 hours ago"
              isCurrent={false}
              onRevoke={() => handleRevokeSession('session-2')}
            />
            <SessionCard
              device="Firefox on MacOS"
              location="Delhi, India"
              ipAddress="103.45.67.89"
              lastActive="Yesterday"
              isCurrent={false}
              onRevoke={() => handleRevokeSession('session-3')}
            />
          </ProfileSection>
        </div>

        {/* Right Column */}
        <div>
          {/* Account Stats */}
          <ProfileSection title="Account Details">
            <div className="space-y-4">
              <div className="p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs md:text-sm text-green-800 font-semibold">Account Status</span>
                </div>
                <div className="text-xl md:text-2xl font-bold text-green-900">{profileData.accountStatus}</div>
              </div>

              <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 mb-1">
                  <Clock className="w-4 h-4" />
                  Last Login
                </div>
                <div className="font-semibold text-gray-900 text-sm md:text-base">{profileData.lastLogin}</div>
              </div>

              <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  Member Since
                </div>
                <div className="font-semibold text-gray-900 text-sm md:text-base">{profileData.createdAt}</div>
              </div>
            </div>
          </ProfileSection>

          {/* Recent Activity */}
          <ProfileSection title="Recent Activity">
            <div className="max-h-96 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <ActivityLogItem
                  key={index}
                  action={activity.action}
                  module={activity.module}
                  timestamp={activity.timestamp}
                />
              ))}
            </div>
          </ProfileSection>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default Profile;
