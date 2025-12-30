"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building2, Upload, Save, X, Eye, EyeOff, Monitor, Smartphone, 
  MapPin, LogOut
} from 'lucide-react';
import SuperAdminLayout from './layout';

// Settings Section Component
const SettingsSection = ({ title, description, children }) => (
  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-4 md:mb-6">
    <div className="mb-4 md:mb-6">
      <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-xs md:text-sm text-gray-600">{description}</p>
    </div>
    {children}
  </div>
);

// Input Field Component
const InputField = ({ label, type = "text", value, onChange, placeholder, required = false }) => (
  <div className="mb-4">
    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm md:text-base"
    />
  </div>
);

// Active Session Component
const ActiveSession = ({ device, location, ipAddress, lastActive, isCurrent, onRevoke }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 border border-gray-200 rounded-lg mb-3 gap-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {device.includes('Mobile') ? (
          <Smartphone className="w-5 h-5 text-purple-600" />
        ) : (
          <Monitor className="w-5 h-5 text-purple-600" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-gray-900 text-sm md:text-base truncate">{device}</div>
        <div className="text-xs md:text-sm text-gray-600 flex items-center gap-2 truncate">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{location} • {ipAddress}</span>
        </div>
        <div className="text-xs text-gray-500">{lastActive}</div>
      </div>
    </div>
    {isCurrent ? (
      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full whitespace-nowrap self-start sm:self-center">
        Current Session
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

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  // Company Details State
  const [companyData, setCompanyData] = useState({
    name: 'Nexcore Alliance',
    address: 'OFF BKC, Mumbai, Maharashtra 400070',
    supportEmail: 'support@nexcorealliance.com',
    supportPhone: '+91 897 632 2917',
    logo: null
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    dateFormat: 'DD/MM/YYYY',
    timeZone: '(GMT+5:30) India Standard Time',
    language: 'English (US)',
    dataRetention: '90'
  });

  // Security State
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/settings`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        setCompanyData(response.data.company || companyData);
        setPreferences(response.data.preferences || preferences);
        setSecurity({...security, twoFactorEnabled: response.data.twoFactorEnabled || false});
        if (response.data.company?.logoUrl) {
          setLogoPreview(response.data.company.logoUrl);
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      // Use default state values
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setCompanyData({ ...companyData, logo: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Upload logo if changed
      let logoUrl = null;
      if (companyData.logo) {
        const formData = new FormData();
        formData.append('logo', companyData.logo);
        
        const uploadResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/upload-logo`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        logoUrl = uploadResponse.data.url;
      }

      // Save all settings
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/settings`,
        {
          company: { ...companyData, logoUrl },
          preferences,
          twoFactorEnabled: security.twoFactorEnabled
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Settings saved successfully!');
      fetchSettings(); // Refresh
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      alert('Please fill all password fields');
      return;
    }

    if (security.newPassword !== security.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (security.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/change-password`,
        {
          currentPassword: security.currentPassword,
          newPassword: security.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Password changed successfully!');
      setSecurity({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: security.twoFactorEnabled
      });
    } catch (error) {
      console.error('Error changing password:', error);
      alert(error.response?.data?.message || 'Failed to change password');
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
    <SuperAdminLayout title="Settings">
      
      {/* Company Details */}
      <SettingsSection
        title="Company Details"
        description="Manage your company information and branding"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          <InputField
            label="Company Name"
            value={companyData.name}
            onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
            placeholder="Enter company name"
            required
          />
          <InputField
            label="Support Email"
            type="email"
            value={companyData.supportEmail}
            onChange={(e) => setCompanyData({...companyData, supportEmail: e.target.value})}
            placeholder="support@company.com"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          <InputField
            label="Support Phone"
            value={companyData.supportPhone}
            onChange={(e) => setCompanyData({...companyData, supportPhone: e.target.value})}
            placeholder="+91 000 000 0000"
            required
          />
          <InputField
            label="Registered Address"
            value={companyData.address}
            onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
            placeholder="Enter address"
            required
          />
        </div>

        {/* Logo Upload */}
        <div className="mb-4">
          <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
            Company Logo
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {logoPreview ? (
              <div className="relative w-24 h-24 border-2 border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setLogoPreview(null);
                    setCompanyData({...companyData, logo: null});
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 flex-shrink-0">
                <Building2 className="w-8 h-8 text-gray-400" />
              </div>
            )}
            <div>
              <label className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition inline-flex items-center gap-2 text-sm md:text-base">
                <Upload className="w-4 h-4" />
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB</p>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection
        title="Preferences"
        description="Customize your system preferences"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="mb-4">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Date Format
            </label>
            <select
              value={preferences.dateFormat}
              onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm md:text-base"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Time Zone
            </label>
            <select
              value={preferences.timeZone}
              onChange={(e) => setPreferences({...preferences, timeZone: e.target.value})}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm md:text-base"
            >
              <option value="(GMT+5:30) India Standard Time">(GMT+5:30) India Standard Time</option>
              <option value="(GMT+0:00) UTC">(GMT+0:00) UTC</option>
              <option value="(GMT-5:00) Eastern Time">(GMT-5:00) Eastern Time</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences({...preferences, language: e.target.value})}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm md:text-base"
            >
              <option value="English (US)">English (US)</option>
              <option value="English (UK)">English (UK)</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Data Retention (Days)
            </label>
            <select
              value={preferences.dataRetention}
              onChange={(e) => setPreferences({...preferences, dataRetention: e.target.value})}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm md:text-base"
            >
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
              <option value="90">90 Days (Maximum)</option>
            </select>
          </div>
        </div>
      </SettingsSection>

      {/* Security Settings */}
      <SettingsSection
        title="Security"
        description="Manage your account security and password"
      >
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm md:text-base">Change Password</h3>
          
          <InputField
            label="Current Password"
            type={showPassword ? "text" : "password"}
            value={security.currentPassword}
            onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
            placeholder="Enter current password"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <InputField
              label="New Password"
              type={showPassword ? "text" : "password"}
              value={security.newPassword}
              onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
              placeholder="Enter new password"
            />
            <InputField
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              value={security.confirmPassword}
              onChange={(e) => setSecurity({...security, confirmPassword: e.target.value})}
              placeholder="Confirm new password"
            />
          </div>

          <button
            onClick={() => setShowPassword(!showPassword)}
            className="text-xs md:text-sm text-purple-600 hover:text-purple-700 font-semibold mb-4 flex items-center gap-2"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPassword ? 'Hide' : 'Show'} Passwords
          </button>

          <button
            onClick={handlePasswordChange}
            disabled={loading}
            className="px-4 md:px-6 py-2 md:py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm md:text-base"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </div>

        {/* Two-Factor Authentication */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Two-Factor Authentication</h3>
              <p className="text-xs md:text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => setSecurity({...security, twoFactorEnabled: !security.twoFactorEnabled})}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition flex-shrink-0 ${
                security.twoFactorEnabled ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="pt-6 border-t border-gray-200 mt-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm md:text-base">Active Sessions</h3>
          <ActiveSession
            device="Chrome on Windows"
            location="Mumbai, India"
            ipAddress="192.168.1.1"
            lastActive="Active now"
            isCurrent={true}
          />
          <ActiveSession
            device="Safari on MacOS"
            location="Delhi, India"
            ipAddress="192.168.1.45"
            lastActive="2 hours ago"
            isCurrent={false}
            onRevoke={() => handleRevokeSession('session-2')}
          />
        </div>
      </SettingsSection>

      {/* System Information */}
      <SettingsSection
        title="About"
        description="System version and license information"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
            <div className="text-xs md:text-sm text-gray-600 mb-1">System Version</div>
            <div className="font-semibold text-gray-900 text-sm md:text-base">ANPR v2.5.1</div>
          </div>
          <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
            <div className="text-xs md:text-sm text-gray-600 mb-1">License Type</div>
            <div className="font-semibold text-gray-900 text-sm md:text-base">Enterprise</div>
          </div>
          <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
            <div className="text-xs md:text-sm text-gray-600 mb-1">License Expires</div>
            <div className="font-semibold text-gray-900 text-sm md:text-base">Dec 31, 2026</div>
          </div>
          <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Support</div>
            <div className="font-semibold text-gray-900 text-sm md:text-base">24/7 Premium</div>
          </div>
        </div>
      </SettingsSection>

      {/* Save Button */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
        <button className="px-4 md:px-6 py-2 md:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold text-sm md:text-base">
          Cancel
        </button>
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="px-4 md:px-6 py-2 md:py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </SuperAdminLayout>
  );
};

export default Settings;
