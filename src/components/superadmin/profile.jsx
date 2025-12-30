"use client";
import React, { useState, useEffect } from 'react';
import { 
  Bell, Menu, User, Mail, Phone, Shield, Clock, 
  Calendar, MapPin, Edit2, Save, X, Upload, Monitor,
  Smartphone, LogOut, CheckCircle, Camera
} from 'lucide-react';
import Sidebar from './sidebar';

// Profile Section Component
const ProfileSection = ({ title, children }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
    <h2 className="text-xl font-bold text-gray-900 mb-6">{title}</h2>
    {children}
  </div>
);

// Info Row Component
const InfoRow = ({ icon: Icon, label, value, editable = false, onEdit }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-purple-600" />
      </div>
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="font-semibold text-gray-900">{value}</div>
      </div>
    </div>
    {editable && (
      <button
        onClick={onEdit}
        className="p-2 hover:bg-gray-100 rounded-lg transition text-purple-600"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    )}
  </div>
);

// Activity Log Item
const ActivityLogItem = ({ action, timestamp, module }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
    <div className="flex-1">
      <div className="font-semibold text-gray-900">{action}</div>
      <div className="text-sm text-gray-600">{module}</div>
      <div className="text-xs text-gray-500 mt-1">{timestamp}</div>
    </div>
  </div>
);

// Active Session Component
const SessionCard = ({ device, location, ipAddress, lastActive, isCurrent }) => (
  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
        {device.includes('Mobile') ? (
          <Smartphone className="w-5 h-5 text-purple-600" />
        ) : (
          <Monitor className="w-5 h-5 text-purple-600" />
        )}
      </div>
      <div>
        <div className="font-semibold text-gray-900">{device}</div>
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <MapPin className="w-3 h-3" />
          {location} • {ipAddress}
        </div>
        <div className="text-xs text-gray-500">{lastActive}</div>
      </div>
    </div>
    {isCurrent ? (
      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Current
      </span>
    ) : (
      <button className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition">
        <LogOut className="w-4 h-4" />
      </button>
    )}
  </div>
);

const Profile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-72">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                SA
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          
          {/* Profile Header Card */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 mb-6 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-purple-600 text-4xl font-bold overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    profileData.fullName.charAt(0)
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition border-4 border-white">
                  <Camera className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">{profileData.fullName}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <Shield className="w-5 h-5" />
                  <span className="text-purple-100">{profileData.role}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profileData.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {profileData.phone}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {profileData.location}
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-2.5 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center gap-2"
              >
                {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2">
              {/* Profile Information */}
              <ProfileSection title="Profile Information">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={profileData.location}
                        onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="w-full px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <InfoRow
                      icon={User}
                      label="Full Name"
                      value={profileData.fullName}
                    />
                    <InfoRow
                      icon={Shield}
                      label="Role"
                      value={profileData.role}
                    />
                    <InfoRow
                      icon={Mail}
                      label="Email Address"
                      value={profileData.email}
                    />
                    <InfoRow
                      icon={Phone}
                      label="Phone Number"
                      value={profileData.phone}
                    />
                    <InfoRow
                      icon={MapPin}
                      label="Location"
                      value={profileData.location}
                    />
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
                />
                <SessionCard
                  device="Firefox on MacOS"
                  location="Delhi, India"
                  ipAddress="103.45.67.89"
                  lastActive="Yesterday"
                  isCurrent={false}
                />
              </ProfileSection>
            </div>

            {/* Right Column */}
            <div>
              {/* Account Stats */}
              <ProfileSection title="Account Details">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-800 font-semibold">Account Status</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">{profileData.accountStatus}</div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Clock className="w-4 h-4" />
                      Last Login
                    </div>
                    <div className="font-semibold text-gray-900">{profileData.lastLogin}</div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4" />
                      Member Since
                    </div>
                    <div className="font-semibold text-gray-900">{profileData.createdAt}</div>
                  </div>
                </div>
              </ProfileSection>

              {/* Recent Activity */}
              <ProfileSection title="Recent Activity">
                <div className="max-h-96 overflow-y-auto">
                  <ActivityLogItem
                    action="Updated client package"
                    module="Client Management"
                    timestamp="2 hours ago"
                  />
                  <ActivityLogItem
                    action="Registered new device"
                    module="Device Management"
                    timestamp="5 hours ago"
                  />
                  <ActivityLogItem
                    action="Exported analytics report"
                    module="Analytics"
                    timestamp="Yesterday"
                  />
                  <ActivityLogItem
                    action="Changed system settings"
                    module="Settings"
                    timestamp="2 days ago"
                  />
                  <ActivityLogItem
                    action="Added new client"
                    module="Client Management"
                    timestamp="3 days ago"
                  />
                </div>
              </ProfileSection>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
