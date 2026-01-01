"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Bell, Menu, Building2, Upload, X, Globe, Shield, 
  Info, Save, Lock
} from 'lucide-react';
import Sidebar from './sidebar';

const AdminSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [companyData, setCompanyData] = useState({
    name: '',
    address: '',
    supportEmail: '',
    logo: null
  });

  


 

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/settings`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { data } = response.data;

      setCompanyData(data.company);
      
      // Set logo preview if exists
      if (data.company.logo) {
        setLogoPreview(`${process.env.NEXT_PUBLIC_API_URL}${data.company.logo}`);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        setLogoFile(file);
      };
      reader.readAsDataURL(file);

      // Upload immediately
      await uploadLogoToServer(file);
    }
  };

  const uploadLogoToServer = async (file) => {
    try {
      const token = localStorage.getItem('accessToken');
      const formData = new FormData();
      formData.append('logo', file);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/settings/logo`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setCompanyData({
        ...companyData,
        logo: response.data.logoUrl
      });

      alert('Logo uploaded successfully!');
    } catch (err) {
      console.error('Error uploading logo:', err);
      alert('Failed to upload logo');
    }
  };

  const handleDeleteLogo = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/settings/logo`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setLogoPreview(null);
      setLogoFile(null);
      setCompanyData({ ...companyData, logo: null });
      
      alert('Logo deleted successfully!');
    } catch (err) {
      console.error('Error deleting logo:', err);
      alert('Failed to delete logo');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/settings`,
        {
          company: {
            name: companyData.name,
            address: companyData.address,
            supportEmail: companyData.supportEmail
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Settings saved successfully!');
      fetchSettings(); // Refresh to get updated data
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-72">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settings</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition relative">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                AD
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          
          {/* Company Profile */}
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-start gap-3 mb-6">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Company Profile</h2>
                <p className="text-xs sm:text-sm text-gray-600">Manage your organization's public information and branding</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => setCompanyData({...companyData, name: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Headquarters Address</label>
                <input
                  type="text"
                  value={companyData.address}
                  onChange={(e) => setCompanyData({...companyData, address: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Support Email</label>
                <input
                  type="email"
                  value={companyData.supportEmail}
                  onChange={(e) => setCompanyData({...companyData, supportEmail: e.target.value})}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">Company Logo</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {logoPreview ? (
                    <div className="relative w-20 h-20 border-2 border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      <button
                        onClick={handleDeleteLogo}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 flex-shrink-0">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer transition inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Recommended 200x200px (PNG, JPG, Max 5MB)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          

          {/* Save Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button 
              onClick={fetchSettings}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold text-sm sm:text-base"
            >
              Cancel Changes
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;