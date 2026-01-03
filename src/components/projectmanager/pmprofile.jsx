"use client";
import { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Edit2, Save, Camera, X, 
  Building2, Users, TrendingUp, Package, Loader2, AlertCircle, CheckCircle
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';  // ✅ Import Header

const PMProfile = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState({
    assignedSites: 0,
    totalSupervisors: 0,
    totalTrips: 0,
    activeVendors: 0
  });

  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    role: '',
    createdAt: ''
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: ''
  });

  // Fetch profile data
  useEffect(() => {
    fetchProfileData();
    fetchStats();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setError('Please login to continue');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/project/profile`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        const data = result.data;
        setProfileData(data);
        setFormData({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          location: data.location
        });
        
        if (data.profileImage) {
          setProfileImage(data.profileImage);
        }
      } else {
        setError(result.message || 'Failed to load profile data');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/project/profile/stats`,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaveLoading(true);
      setError(null);
      setSuccessMessage('');

      const token = localStorage.getItem('accessToken');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/project/profile`,
        {
          method: 'PUT',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setProfileData(prev => ({
          ...prev,
          ...result.data
        }));
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(result.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData({
      fullName: profileData.fullName,
      email: profileData.email,
      phone: profileData.phone,
      location: profileData.location
    });
    setIsEditing(false);
    setError(null);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ✅ Header Component - Custom styling for profile page */}
      <div className="lg:ml-72">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            {/* Left Section - Title */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
              >
                <User className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">My Profile</h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Manage your account settings</p>
              </div>
            </div>

            {/* Right Section - Use Header component's dropdown */}
            <Header 
              title="" 
              onMenuClick={() => setSidebarOpen(true)}
              hideTitle={true}
            />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
          
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-slide-in">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-green-800 font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-slide-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm sm:text-base text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6">
              {/* Profile Image */}
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full flex items-center justify-center text-indigo-600 text-2xl sm:text-4xl font-bold overflow-hidden shadow-2xl ring-4 ring-white/50">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(profileData.fullName || 'User')}</span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition border-2 sm:border-4 border-white shadow-lg group-hover:scale-110 transform">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Profile Info */}
              <div className="text-center w-full">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 break-words">{profileData.fullName || 'Loading...'}</h2>
                <div className="inline-block px-3 sm:px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
                  {profileData.role === 'project_manager' ? 'Project Manager' : 'Admin'}
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm justify-center">
                  <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{profileData.email || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{profileData.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">{profileData.location || 'Not provided'}</span>
                  </div>
                </div>
                {profileData.createdAt && (
                  <div className="mt-3 text-xs sm:text-sm text-white/80">
                    Member since {formatDate(profileData.createdAt)}
                  </div>
                )}
              </div>

              {/* Edit Button */}
              <button
                onClick={() => isEditing ? handleCancelEdit() : setIsEditing(true)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-white text-indigo-600 rounded-lg sm:rounded-xl hover:bg-gray-50 transition font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Profile Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  Profile Information
                </h2>
                
                {isEditing ? (
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition text-sm sm:text-base"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition text-sm sm:text-base"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition text-sm sm:text-base"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition text-sm sm:text-base"
                        placeholder="Enter your location"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { label: 'Full Name', value: profileData.fullName, icon: User },
                      { label: 'Email Address', value: profileData.email, icon: Mail },
                      { label: 'Phone Number', value: profileData.phone, icon: Phone },
                      { label: 'Location', value: profileData.location, icon: MapPin }
                    ].map((item, index) => (
                      <div key={index} className="py-3 sm:py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 sm:px-3 rounded-lg transition">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                          <item.icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          {item.label}
                        </div>
                        <div className="font-semibold text-gray-900 text-base sm:text-lg break-words">
                          {item.value || 'Not provided'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isEditing && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-4 sm:mt-6">
                    <button
                      onClick={handleCancelEdit}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 font-semibold transition text-sm sm:text-base"
                      disabled={saveLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saveLoading}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition transform hover:scale-105 disabled:transform-none text-sm sm:text-base"
                    >
                      {saveLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
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

export default PMProfile;
