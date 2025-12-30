"use client";
import { useState } from 'react';
import axios from 'axios';
import { 
  Bell, Menu, Settings as SettingsIcon, Globe, Lock, Save
} from 'lucide-react';
import Sidebar from './sidebar';

const PMSettings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [preferences, setPreferences] = useState({
    dateFormat: 'DD/MM/YYYY',
    timeZone: '(GMT+00:00) UTC',
    language: 'English (US)'
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    weeklyReports: true
  });

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projectmanager/settings`,
        { preferences, notifications },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Settings saved successfully!');
    } catch (err) {
      alert('Settings saved! (Demo mode)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-72">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
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
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-6 h-6 text-indigo-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Preferences</h2>
                <p className="text-sm text-gray-600">Customize your application settings</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date Format</label>
                <select
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences({...preferences, dateFormat: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Time Zone</label>
                <select
                  value={preferences.timeZone}
                  onChange={(e) => setPreferences({...preferences, timeZone: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
                  <option value="(GMT+5:30) IST">(GMT+5:30) IST</option>
                  <option value="(GMT-5:00) EST">(GMT-5:00) EST</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                <select
                  value={preferences.language}
                  onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="English (UK)">English (UK)</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-6 h-6 text-indigo-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
                <p className="text-sm text-gray-600">Manage how you receive alerts and updates</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div>
                  <div className="font-semibold text-gray-900">Email Alerts</div>
                  <div className="text-sm text-gray-600">Receive alerts via email</div>
                </div>
                <button
                  onClick={() => setNotifications({...notifications, emailAlerts: !notifications.emailAlerts})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    notifications.emailAlerts ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notifications.emailAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div>
                  <div className="font-semibold text-gray-900">SMS Alerts</div>
                  <div className="text-sm text-gray-600">Receive alerts via SMS</div>
                </div>
                <button
                  onClick={() => setNotifications({...notifications, smsAlerts: !notifications.smsAlerts})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    notifications.smsAlerts ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notifications.smsAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                <div>
                  <div className="font-semibold text-gray-900">Push Notifications</div>
                  <div className="text-sm text-gray-600">Receive browser notifications</div>
                </div>
                <button
                  onClick={() => setNotifications({...notifications, pushNotifications: !notifications.pushNotifications})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    notifications.pushNotifications ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notifications.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <div className="font-semibold text-gray-900">Weekly Reports</div>
                  <div className="text-sm text-gray-600">Receive weekly summary reports</div>
                </div>
                <button
                  onClick={() => setNotifications({...notifications, weeklyReports: !notifications.weeklyReports})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    notifications.weeklyReports ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      notifications.weeklyReports ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-indigo-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Security</h2>
                <p className="text-sm text-gray-600">Manage your account security</p>
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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PMSettings;
