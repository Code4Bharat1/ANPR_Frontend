"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  User, Mail, Phone, Shield, Clock, 
  MapPin, Edit2, Save, Camera, X
} from 'lucide-react';

import Sidebar from './sidebar';
import Header from './header';

const AdminProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    role: '',
    email: '',
    phone: '',
    accountStatus: 'Active',
    lastLogin: '—',
    location: ''
  });

  const [companyData, setCompanyData] = useState({
    name: '',
    address: '',
    supportEmail: '',
    supportPhone: ''
  });

  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        console.error("No access token found");
        setPageLoading(false);
        return;
      }

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { role, data } = res.data;

      // Set profile data
      setProfileData({
        fullName: data.name || '',
        role: role === 'client' ? 'Client Super Admin' 
              : role === 'client_admin' ? 'Client Admin'
              : role === 'admin' ? 'System Admin' 
              : role,
        email: data.email || '',
        phone: data.phone || '',
        accountStatus: 'Active',
        lastLogin: data.lastLogin || '—',
        location: data.location || ''
      });

      // Set company data (for client roles)
      if (data.company) {
        setCompanyData({
          name: data.company.name || '',
          address: data.company.address || '',
          supportEmail: data.company.supportEmail || '',
          supportPhone: data.company.supportPhone || ''
        });
      }

      // Set preferences
      if (data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      if (err.response?.status === 401) {
        console.error("Unauthorized - please login again");
      }
    } finally {
      setPageLoading(false);
    }
  };

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
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        alert('No access token found. Please login again.');
        return;
      }

      // Prepare data according to backend structure
      const updateData = {
        profile: {
          fullName: profileData.fullName,
          email: profileData.email,
          phone: profileData.phone,
          location: profileData.location
        },
        company: companyData,
        preferences: preferences
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/profile`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      alert('Profile updated successfully!');
      setIsEditing(false);
      
      // Refresh profile data
      fetchProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      alert(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Header - Same as Dashboard */}
      <Header title="My Profile" onMenuClick={() => setSidebarOpen(true)} />

      {/* Main Content */}
      <main className="lg:ml-72 max-w-6xl mx-auto px-6 py-8">
        
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 mb-6 text-white">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-blue-600 text-4xl font-bold overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profileData.fullName.charAt(0) || 'A'
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition border-4 border-white">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2">{profileData.fullName}</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Shield className="w-5 h-5" />
                <span className="text-blue-100">{profileData.role}</span>
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
                {profileData.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {profileData.location}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center gap-2"
            >
              {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Profile Information */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-600">Full Name</div>
                        <div className="font-semibold text-gray-900">{profileData.fullName}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-600">Role</div>
                        <div className="font-semibold text-gray-900">{profileData.role}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-600">Email Address</div>
                        <div className="font-semibold text-gray-900">{profileData.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-600">Mobile Number</div>
                        <div className="font-semibold text-gray-900">{profileData.phone}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="text-sm text-gray-600">Location</div>
                        <div className="font-semibold text-gray-900">{profileData.location || 'Not specified'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Company Details - Only show for client roles */}
            {(companyData.name || isEditing) && (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Company Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={companyData.name}
                      onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Registered Address</label>
                    <input
                      type="text"
                      value={companyData.address}
                      onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-600"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Support Email</label>
                      <input
                        type="email"
                        value={companyData.supportEmail}
                        onChange={(e) => setCompanyData({...companyData, supportEmail: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Support Number</label>
                      <input
                        type="tel"
                        value={companyData.supportPhone}
                        onChange={(e) => setCompanyData({...companyData, supportPhone: e.target.value})}
                        disabled={!isEditing}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Account Status */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Account Status</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="font-semibold text-gray-900">{profileData.accountStatus}</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Last Login</div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-900">{profileData.lastLogin}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminProfile;
