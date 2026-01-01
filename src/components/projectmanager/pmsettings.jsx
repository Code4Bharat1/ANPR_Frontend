"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Bell,
  Menu,
  Globe,
  Lock,
  Save,
} from "lucide-react";
import Sidebar from "./sidebar";

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
        {  notifications },
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
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-72">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Settings
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                AM
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-8">
          {/* Preferences */}
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

          {/* Security */}
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

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-semibold flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PMSettings;
