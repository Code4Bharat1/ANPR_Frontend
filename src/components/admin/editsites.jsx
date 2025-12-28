"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, X } from 'lucide-react';

const EditSitePage = ({ siteId, onBack, onSave }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    siteCode: '',
    status: 'active'
  });

  useEffect(() => {
    if (siteId) {
      fetchSiteDetails();
    }
  }, [siteId]);

  const fetchSiteDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/sites/${siteId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setFormData({
        name: data.name || '',
        location: data.location || '',
        siteCode: data.siteCode || '',
        status: data.status || 'active'
      });
    } catch (err) {
      console.error('Error fetching site details:', err);
      // Mock data for demonstration
      setFormData({
        name: 'North Gate Complex',
        location: 'Manchester, UK',
        siteCode: 'NG-001',
        status: 'active'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleToggleStatus = () => {
    setFormData({
      ...formData,
      status: formData.status === 'active' ? 'inactive' : 'active'
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('accessToken');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/sites/${siteId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const updatedSite = await response.json();
      alert('Site updated successfully!');
      
      if (onSave) {
        onSave(updatedSite);
      }
      
      if (onBack) {
        onBack();
      }
    } catch (err) {
      console.error('Error updating site:', err);
      alert(`Error updating site: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to discard changes?')) {
      if (onBack) {
        onBack();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading site details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center gap-4 px-6 py-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Site</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Form Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="space-y-6">
            {/* Site Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">
                Site Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter site name"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Enter location"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Site Code and Status Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Site Code */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-3">
                  Site Code <span className="text-gray-400">(Opt)</span>
                </label>
                <input
                  type="text"
                  name="siteCode"
                  value={formData.siteCode}
                  onChange={handleChange}
                  placeholder="e.g., NG-001"
                  className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-3">
                  Status
                </label>
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                  <span className="text-lg font-medium text-gray-900">
                    {formData.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={handleToggleStatus}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                      formData.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        formData.status === 'active' ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-blue-600 text-white rounded-xl py-4 font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleCancel}
            disabled={saving}
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl py-4 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </main>
    </div>
  );
};

// Demo wrapper component to show how to use it
const DemoEditSite = () => {
  const [showEditPage, setShowEditPage] = useState(true);

  const handleBack = () => {
    console.log('Going back to sites list');
    setShowEditPage(false);
  };

  const handleSave = (updatedSite) => {
    console.log('Site updated:', updatedSite);
  };

  if (!showEditPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Redirecting to Sites List...</h2>
          <button
            onClick={() => setShowEditPage(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Edit Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <EditSitePage
      siteId="123" // Pass actual site ID from router/props
      onBack={handleBack}
      onSave={handleSave}
    />
  );
};

export default DemoEditSite;