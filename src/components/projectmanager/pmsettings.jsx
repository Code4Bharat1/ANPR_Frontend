"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Globe,
  Lock,
  Save,
} from "lucide-react";
import Sidebar from "./sidebar";
import Header from './header';  // ✅ Import Header

const PMSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const [preferences, setPreferences] = useState({
    dateFormat: "DD/MM/YYYY",
    timeZone: "(GMT+00:00) UTC",
    language: "English (US)",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    weeklyReports: true,
  });

  /* ======================================================
     LOAD SETTINGS ON PAGE LOAD
  ====================================================== */
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/project/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data?.preferences) {
        setPreferences(res.data.preferences);
      }

      if (res.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setPageLoading(false);
    }
  };

  /* ======================================================
     SAVE SETTINGS
  ====================================================== */
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/project/settings`,
        { notifications },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Settings saved successfully!");
    } catch (err) {
      console.error("Settings update failed:", err);
      alert("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ✅ Header Component with Dropdown */}
      <Header title="Settings" onMenuClick={() => setSidebarOpen(true)} />

      {/* ✅ Main Content with proper spacing */}
      <main className="lg:ml-72 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Preferences Section (Commented out) */}
        {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Preferences
              </h2>
              <p className="text-sm text-gray-600">
                Customize your application settings
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date Format
              </label>
              <select
                value={preferences.dateFormat}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    dateFormat: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Time Zone
              </label>
              <select
                value={preferences.timeZone}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    timeZone: e.target.value,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
              >
                <option value="(GMT+00:00) UTC">
                  (GMT+00:00) UTC
                </option>
                <option value="(GMT+5:30) IST">
                  (GMT+5:30) IST
                </option>
                <option value="(GMT-5:00) EST">
                  (GMT-5:00) EST
                </option>
              </select>
            </div>
          </div>
        </div> */}

        {/* Security Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Security
              </h2>
              <p className="text-sm text-gray-600">
                Manage your account security
              </p>
            </div>
          </div>

          <button className="w-full px-4 py-2.5 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition font-semibold">
            Change Password
          </button>
        </div>

        {/* Notifications Section
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Notification Preferences
              </h2>
              <p className="text-sm text-gray-600">
                Manage how you receive notifications
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { key: 'emailAlerts', label: 'Email Alerts', description: 'Receive email notifications for important updates' },
              { key: 'smsAlerts', label: 'SMS Alerts', description: 'Get SMS notifications for critical events' },
              { key: 'pushNotifications', label: 'Push Notifications', description: 'Enable browser push notifications' },
              { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly summary reports via email' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{item.label}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={notifications[item.key]}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div> */}

        {/* Save Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition">
            Cancel
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default PMSettings;
