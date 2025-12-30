"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Server, Building2, User, Database, HardDrive, Lock, 
  Wifi, Globe, Save, Edit2, CheckCircle, AlertTriangle,
  Activity, Cpu, MemoryStick, RefreshCw, Shield, Key
} from 'lucide-react';
import SuperAdminLayout from './layout';

// Section Component
const ConfigSection = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-purple-600" />
      </div>
      <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>
    </div>
    {children}
  </div>
);

// Input Field Component
const InputField = ({ label, type = "text", value, onChange, placeholder, required = false, disabled = false }) => (
  <div className="mb-4">
    <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-sm md:text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
    />
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  const styles = {
    online: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
    offline: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertTriangle }
  };

  const style = styles[status] || styles.offline;
  const Icon = style.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Resource Monitor Component
const ResourceMonitor = ({ label, value, icon: Icon, color }) => (
  <div className="p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <span className="font-bold text-gray-900">{value}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

const ServerSetup = () => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [serverStatus, setServerStatus] = useState('online');

  // Client Details State
  const [clientDetails, setClientDetails] = useState({
    clientName: 'Rajesh Kumar',
    clientCompanyName: 'Nexcore Alliance Pvt. Ltd.',
    clientEmail: 'rajesh@nexcorealliance.com',
    clientPhone: '+91 897 632 2917',
    registeredDate: 'Jan 15, 2024'
  });

  // Server Configuration State
  const [serverConfig, setServerConfig] = useState({
    // Basic Server Info
    serverName: 'ANPR-PROD-01',
    serverIp: '192.168.1.100',
    publicIp: '103.45.67.89',
    port: '8080',
    sslPort: '8443',
    environment: 'production',
    region: 'Mumbai, India',

    // Database Configuration
    dbHost: 'localhost',
    dbPort: '5432',
    dbName: 'anpr_database',
    dbUser: 'anpr_admin',
    dbMaxConnections: '100',

    // API Configuration
    apiUrl: 'https://api.nexcorealliance.com',
    apiVersion: 'v2.5.1',
    apiKey: '********************************',
    webhookUrl: 'https://webhook.nexcorealliance.com',

    // Storage Configuration
    storageType: 'AWS S3',
    storageBucket: 'anpr-media-storage',
    storageRegion: 'ap-south-1',
    maxUploadSize: '50', // MB
    dataRetention: '90', // days

    // Backup Configuration
    backupEnabled: true,
    backupFrequency: 'daily',
    backupTime: '02:00 AM',
    backupLocation: '/backups/anpr',
    lastBackup: 'Dec 30, 2025 at 2:00 AM',

    // Security Configuration
    sslEnabled: true,
    sslCertExpiry: 'Mar 15, 2026',
    twoFactorEnabled: true,
    passwordPolicy: 'strong',
    sessionTimeout: '30', // minutes

    // Email Configuration
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@nexcorealliance.com',
    smtpSecure: 'TLS'
  });

  // Server Resources State
  const [serverResources, setServerResources] = useState({
    cpuUsage: 45,
    ramUsage: 62,
    diskUsage: 38,
    networkUsage: 28
  });

  useEffect(() => {
    fetchServerConfig();
    fetchServerResources();
    
    // Update resources every 5 seconds
    const interval = setInterval(fetchServerResources, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchServerConfig = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/server-config`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        setClientDetails(response.data.client || clientDetails);
        setServerConfig(response.data.server || serverConfig);
        setServerStatus(response.data.status || 'online');
      }
    } catch (err) {
      console.error('Error fetching server config:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServerResources = async () => {
    try {
      const token = localStorage.getItem('accessToken');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/server-resources`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data) {
        setServerResources(response.data);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      // Simulate random fluctuation for demo
      setServerResources({
        cpuUsage: Math.floor(Math.random() * 30) + 40,
        ramUsage: Math.floor(Math.random() * 20) + 55,
        diskUsage: Math.floor(Math.random() * 15) + 35,
        networkUsage: Math.floor(Math.random() * 25) + 20
      });
    }
  };

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/server-config`,
        {
          client: clientDetails,
          server: serverConfig
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Server configuration saved successfully!');
      setIsEditing(false);
      fetchServerConfig();
    } catch (error) {
      console.error('Error saving config:', error);
      alert(error.response?.data?.message || 'Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/superadmin/test-connection`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(response.data.message || 'Connection successful!');
    } catch (error) {
      alert('Connection test failed!');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm md:text-base">Loading server configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <SuperAdminLayout title="Server Setup">
      
      {/* Server Status Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 md:p-8 mb-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Server className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-1">{serverConfig.serverName}</h2>
              <p className="text-purple-100 text-sm md:text-base">{serverConfig.environment.toUpperCase()} Environment</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <StatusBadge status={serverStatus} />
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-6 py-2.5 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center gap-2"
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
              {isEditing ? 'Save Changes' : 'Edit Configuration'}
            </button>
          </div>
        </div>
      </div>

      {/* Server Resources Monitor */}
      <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Server Resources</h2>
          </div>
          <button
            onClick={fetchServerResources}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ResourceMonitor 
            label="CPU Usage" 
            value={serverResources.cpuUsage} 
            icon={Cpu}
            color="bg-blue-500"
          />
          <ResourceMonitor 
            label="RAM Usage" 
            value={serverResources.ramUsage} 
            icon={MemoryStick}
            color="bg-green-500"
          />
          <ResourceMonitor 
            label="Disk Usage" 
            value={serverResources.diskUsage} 
            icon={HardDrive}
            color="bg-yellow-500"
          />
          <ResourceMonitor 
            label="Network" 
            value={serverResources.networkUsage} 
            icon={Wifi}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Client Details */}
      <ConfigSection title="Client Details" icon={Building2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <InputField
            label="Client Name"
            value={clientDetails.clientName}
            onChange={(e) => setClientDetails({...clientDetails, clientName: e.target.value})}
            disabled={!isEditing}
            required
          />
          <InputField
            label="Company Name"
            value={clientDetails.clientCompanyName}
            onChange={(e) => setClientDetails({...clientDetails, clientCompanyName: e.target.value})}
            disabled={!isEditing}
            required
          />
          <InputField
            label="Email Address"
            type="email"
            value={clientDetails.clientEmail}
            onChange={(e) => setClientDetails({...clientDetails, clientEmail: e.target.value})}
            disabled={!isEditing}
            required
          />
          <InputField
            label="Phone Number"
            value={clientDetails.clientPhone}
            onChange={(e) => setClientDetails({...clientDetails, clientPhone: e.target.value})}
            disabled={!isEditing}
            required
          />
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Registered Date</div>
            <div className="font-semibold text-gray-900">{clientDetails.registeredDate}</div>
          </div>
        </div>
      </ConfigSection>

      {/* Server Configuration */}
      <ConfigSection title="Server Configuration" icon={Server}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <InputField
            label="Server Name"
            value={serverConfig.serverName}
            onChange={(e) => setServerConfig({...serverConfig, serverName: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="Server IP Address"
            value={serverConfig.serverIp}
            onChange={(e) => setServerConfig({...serverConfig, serverIp: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="Public IP Address"
            value={serverConfig.publicIp}
            onChange={(e) => setServerConfig({...serverConfig, publicIp: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="HTTP Port"
            value={serverConfig.port}
            onChange={(e) => setServerConfig({...serverConfig, port: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="SSL Port"
            value={serverConfig.sslPort}
            onChange={(e) => setServerConfig({...serverConfig, sslPort: e.target.value})}
            disabled={!isEditing}
          />
          <div className="mb-4">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Environment
            </label>
            <select
              value={serverConfig.environment}
              onChange={(e) => setServerConfig({...serverConfig, environment: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm md:text-base disabled:bg-gray-100"
            >
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>
          </div>
          <InputField
            label="Region/Location"
            value={serverConfig.region}
            onChange={(e) => setServerConfig({...serverConfig, region: e.target.value})}
            disabled={!isEditing}
          />
        </div>
      </ConfigSection>

      {/* Database Configuration */}
      <ConfigSection title="Database Configuration" icon={Database}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <InputField
            label="Database Host"
            value={serverConfig.dbHost}
            onChange={(e) => setServerConfig({...serverConfig, dbHost: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="Database Port"
            value={serverConfig.dbPort}
            onChange={(e) => setServerConfig({...serverConfig, dbPort: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="Database Name"
            value={serverConfig.dbName}
            onChange={(e) => setServerConfig({...serverConfig, dbName: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="Database User"
            value={serverConfig.dbUser}
            onChange={(e) => setServerConfig({...serverConfig, dbUser: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="Max Connections"
            type="number"
            value={serverConfig.dbMaxConnections}
            onChange={(e) => setServerConfig({...serverConfig, dbMaxConnections: e.target.value})}
            disabled={!isEditing}
          />
        </div>
      </ConfigSection>

      {/* API Configuration */}
      <ConfigSection title="API Configuration" icon={Globe}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <InputField
            label="API Base URL"
            value={serverConfig.apiUrl}
            onChange={(e) => setServerConfig({...serverConfig, apiUrl: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="API Version"
            value={serverConfig.apiVersion}
            onChange={(e) => setServerConfig({...serverConfig, apiVersion: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="API Key"
            type="password"
            value={serverConfig.apiKey}
            onChange={(e) => setServerConfig({...serverConfig, apiKey: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="Webhook URL"
            value={serverConfig.webhookUrl}
            onChange={(e) => setServerConfig({...serverConfig, webhookUrl: e.target.value})}
            disabled={!isEditing}
          />
        </div>
      </ConfigSection>

      {/* Storage Configuration */}
      <ConfigSection title="Storage Configuration" icon={HardDrive}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="mb-4">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Storage Type
            </label>
            <select
              value={serverConfig.storageType}
              onChange={(e) => setServerConfig({...serverConfig, storageType: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm md:text-base disabled:bg-gray-100"
            >
              <option value="AWS S3">AWS S3</option>
              <option value="Google Cloud Storage">Google Cloud Storage</option>
              <option value="Azure Blob Storage">Azure Blob Storage</option>
              <option value="Local Storage">Local Storage</option>
            </select>
          </div>
          <InputField
            label="Storage Bucket/Container"
            value={serverConfig.storageBucket}
            onChange={(e) => setServerConfig({...serverConfig, storageBucket: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="Storage Region"
            value={serverConfig.storageRegion}
            onChange={(e) => setServerConfig({...serverConfig, storageRegion: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="Max Upload Size (MB)"
            type="number"
            value={serverConfig.maxUploadSize}
            onChange={(e) => setServerConfig({...serverConfig, maxUploadSize: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="Data Retention (Days)"
            type="number"
            value={serverConfig.dataRetention}
            onChange={(e) => setServerConfig({...serverConfig, dataRetention: e.target.value})}
            disabled={!isEditing}
          />
        </div>
      </ConfigSection>

      {/* Backup Configuration */}
      <ConfigSection title="Backup Configuration" icon={RefreshCw}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="mb-4">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Backup Enabled
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setServerConfig({...serverConfig, backupEnabled: !serverConfig.backupEnabled})}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  serverConfig.backupEnabled ? 'bg-purple-600' : 'bg-gray-300'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    serverConfig.backupEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700">
                {serverConfig.backupEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Backup Frequency
            </label>
            <select
              value={serverConfig.backupFrequency}
              onChange={(e) => setServerConfig({...serverConfig, backupFrequency: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm md:text-base disabled:bg-gray-100"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <InputField
            label="Backup Time"
            value={serverConfig.backupTime}
            onChange={(e) => setServerConfig({...serverConfig, backupTime: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="Backup Location"
            value={serverConfig.backupLocation}
            onChange={(e) => setServerConfig({...serverConfig, backupLocation: e.target.value})}
            disabled={!isEditing}
          />
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-xs md:text-sm text-green-800 font-semibold">Last Backup</span>
            </div>
            <div className="font-semibold text-gray-900 text-sm md:text-base">{serverConfig.lastBackup}</div>
          </div>
        </div>
      </ConfigSection>

      {/* Security Configuration */}
      <ConfigSection title="Security Configuration" icon={Shield}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="mb-4">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              SSL Enabled
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setServerConfig({...serverConfig, sslEnabled: !serverConfig.sslEnabled})}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  serverConfig.sslEnabled ? 'bg-purple-600' : 'bg-gray-300'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    serverConfig.sslEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700">
                {serverConfig.sslEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          <InputField
            label="SSL Certificate Expiry"
            value={serverConfig.sslCertExpiry}
            onChange={(e) => setServerConfig({...serverConfig, sslCertExpiry: e.target.value})}
            disabled={!isEditing}
          />

          <div className="mb-4">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Two-Factor Authentication
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setServerConfig({...serverConfig, twoFactorEnabled: !serverConfig.twoFactorEnabled})}
                disabled={!isEditing}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  serverConfig.twoFactorEnabled ? 'bg-purple-600' : 'bg-gray-300'
                } ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    serverConfig.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-700">
                {serverConfig.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Password Policy
            </label>
            <select
              value={serverConfig.passwordPolicy}
              onChange={(e) => setServerConfig({...serverConfig, passwordPolicy: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm md:text-base disabled:bg-gray-100"
            >
              <option value="basic">Basic (8+ characters)</option>
              <option value="medium">Medium (10+ with numbers)</option>
              <option value="strong">Strong (12+ with special chars)</option>
            </select>
          </div>

          <InputField
            label="Session Timeout (minutes)"
            type="number"
            value={serverConfig.sessionTimeout}
            onChange={(e) => setServerConfig({...serverConfig, sessionTimeout: e.target.value})}
            disabled={!isEditing}
          />
        </div>
      </ConfigSection>

      {/* Email Configuration */}
      <ConfigSection title="Email Configuration" icon={Key}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <InputField
            label="SMTP Host"
            value={serverConfig.smtpHost}
            onChange={(e) => setServerConfig({...serverConfig, smtpHost: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="SMTP Port"
            value={serverConfig.smtpPort}
            onChange={(e) => setServerConfig({...serverConfig, smtpPort: e.target.value})}
            disabled={!isEditing}
          />
          <InputField
            label="SMTP User"
            value={serverConfig.smtpUser}
            onChange={(e) => setServerConfig({...serverConfig, smtpUser: e.target.value})}
            disabled={!isEditing}
          />
          <div className="mb-4">
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              SMTP Security
            </label>
            <select
              value={serverConfig.smtpSecure}
              onChange={(e) => setServerConfig({...serverConfig, smtpSecure: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 md:px-4 py-2 md:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm md:text-base disabled:bg-gray-100"
            >
              <option value="TLS">TLS</option>
              <option value="SSL">SSL</option>
              <option value="None">None</option>
            </select>
          </div>
        </div>
      </ConfigSection>

      {/* Action Buttons */}
      {isEditing && (
        <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
          <button
            onClick={() => setIsEditing(false)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleTestConnection}
            disabled={loading}
            className="px-6 py-3 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition font-semibold disabled:opacity-50"
          >
            Test Connection
          </button>
          <button
            onClick={handleSaveConfig}
            disabled={loading}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      )}
    </SuperAdminLayout>
  );
};

export default ServerSetup;
