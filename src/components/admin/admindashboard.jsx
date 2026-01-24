"use client";
import { useState, useEffect } from 'react';
import {
  MapPin, Users, Camera, Activity,
  ArrowUpRight, ArrowDownRight, AlertCircle,
  TrendingUp, Database, Wifi, WifiOff, Package,
  CheckCircle, Clock, Crown, Shield, Zap,
  RefreshCw, ExternalLink, BarChart3, Cpu,
  Battery, BatteryCharging, Server, HardDrive
} from 'lucide-react';
import axios from 'axios';
import Sidebar from './sidebar';
import Header from './header';

// Dashboard Card Component with enhanced design
const DashboardCard = ({
  icon: Icon,
  value,
  label,
  bgColor,
  iconColor,
  trend,
  subtitle,
  isLoading = false,
  onClick
}) => (
  <div
    className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1.5 group ${onClick ? 'cursor-pointer hover:border-blue-300' : ''}`}
    onClick={onClick}
  >
    <div className="flex items-start justify-between mb-5">
      <div className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110`}>
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full shadow-sm ${trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    {isLoading ? (
      <div className="animate-pulse">
        <div className="h-9 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ) : (
      <>
        <div className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{value}</div>
        <div className="text-gray-600 text-sm font-semibold">{label}</div>
        {subtitle && <div className="text-xs text-gray-500 mt-3 flex items-center gap-1.5 pt-3 border-t border-gray-100">
          {subtitle.includes('healthy') && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
          {subtitle.includes('warning') && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>}
          {subtitle}
        </div>}
      </>
    )}
  </div>
);

// Enhanced Usage Bar with visual indicators
const UsageBar = ({ used, limit, label, type = 'default' }) => {
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  const isNearLimit = percentage > 80;
  const isOverLimit = used > limit;

  const getBarColor = () => {
    if (isOverLimit) return 'bg-gradient-to-r from-red-500 to-red-600';
    if (isNearLimit) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    if (type === 'warning') return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    if (type === 'success') return 'bg-gradient-to-r from-green-500 to-green-600';
    return 'bg-gradient-to-r from-blue-500 to-blue-600';
  };

  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${isOverLimit ? 'text-red-600' : 'text-gray-900'}`}>
            {used} / {limit}
          </span>
          {isOverLimit && <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />}
        </div>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner relative">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor()} relative overflow-hidden`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
        </div>
      </div>
      {isOverLimit && (
        <div className="text-xs text-red-600 mt-2 font-semibold flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Limit exceeded by {used - limit} devices
        </div>
      )}
    </div>
  );
};

// Enhanced Package Card with more features
const PackageCard = ({
  name,
  price,
  isCurrent,
  features,
  icon: Icon,
  bgGradient,
  type,
  isRecommended = false,
  onClick
}) => {
  const isPopular = name.includes("Pro") || name.includes("Core");

  return (
    <div
      className={`relative bg-white rounded-3xl p-7 shadow-md border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer group ${isCurrent ? 'border-blue-600 ring-4 ring-blue-100 shadow-xl' :
          isPopular ? 'border-indigo-300 hover:border-indigo-400' : 'border-gray-200 hover:border-gray-300'
        }`}
      onClick={() => onClick && onClick(type)}
    >
      {isCurrent && (
        <div className="absolute -top-3.5 right-6">
          <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            ACTIVE
          </span>
        </div>
      )}

      <div className={`w-16 h-16 bg-gradient-to-br ${bgGradient} rounded-2xl flex items-center justify-center mb-5 shadow-xl group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-8 h-8 text-white" />
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">{name}</h3>
      <div className="flex items-baseline gap-1.5 mb-6">
        <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">₹{price.toLocaleString()}</div>
        <div className="text-sm text-gray-500 font-medium">/month</div>
      </div>

      <div className="space-y-3.5 mb-7">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3 group/feature">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5 group-hover/feature:scale-110 transition-transform" />
            <span className="text-sm text-gray-700 font-medium">{feature}</span>
          </div>
        ))}
      </div>

      <button className={`w-full font-bold py-3.5 rounded-xl transition-all duration-300 text-sm tracking-wide ${isCurrent
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:scale-105'
        }`}>
        {isCurrent ? 'Current Plan' : 'Upgrade Now'}
      </button>
    </div>
  );
};

// Device Health Indicator Component
const DeviceHealthIndicator = ({ health, size = "medium" }) => {
  const getHealthColor = (value) => {
    if (value >= 80) return 'text-green-500 bg-green-50';
    if (value >= 60) return 'text-yellow-500 bg-yellow-50';
    if (value >= 40) return 'text-orange-500 bg-orange-50';
    return 'text-red-500 bg-red-50';
  };

  const getHealthIcon = (value) => {
    if (value >= 80) return <BatteryCharging className="w-5 h-5" />;
    if (value >= 60) return <Battery className="w-5 h-5" />;
    if (value >= 40) return <Cpu className="w-5 h-5" />;
    return <AlertCircle className="w-5 h-5" />;
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getHealthColor(health)}`}>
      {getHealthIcon(health)}
      <span className="font-semibold">{health}%</span>
    </div>
  );
};

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setRefreshing(true);

      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/client-admin/dashboard`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePackageSelect = (packageType) => {
    // console.log(`Selected package: ${packageType}`);
    // Implement package upgrade logic here
  };

  const packages = [
    {
      name: "Lite Access",
      price: 6000,
      icon: Zap,
      bgGradient: "from-blue-500 to-cyan-500",
      type: "LITE",
      features: [
        "1 PM + 2 Supervisors",
        "1 Barrier + 1 Biometric",
        "Mobile OCR Only",
        "60 Days Cloud Backup",
        "Basic Support"
      ]
    },
    {
      name: "Core Monitoring",
      price: 9000,
      icon: Shield,
      bgGradient: "from-indigo-500 to-purple-600",
      type: "CORE",
      isRecommended: true,
      features: [
        "2 PM + 3 Supervisors",
        "1 Barrier + 1 ANPR",
        "ANPR + Biometric + Mobile OCR",
        "90 Days Cloud Backup",
        "Priority Support"
      ]
    },
    {
      name: "Pro Automation",
      price: 12000,
      icon: TrendingUp,
      bgGradient: "from-purple-500 to-pink-600",
      type: "PRO",
      features: [
        "3 PM + 6 Supervisors",
        "1 Barrier + 1 ANPR + 1 Biometric",
        "Full Detection Suite",
        "90 Days Cloud + Local Server",
        "24/7 Premium Support"
      ]
    },
    {
      name: "Enterprise Local",
      price: 18000,
      icon: Crown,
      bgGradient: "from-amber-500 to-orange-600",
      type: "ENTERPRISE",
      features: [
        "3 PM + 6+ Supervisors",
        "Full Hardware Suite",
        "All Detection Methods + Local Server",
        "90 Days+ Local Server Backup",
        "Dedicated Support Team"
      ]
    }
  ];

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 font-medium text-lg">Loading your dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Preparing insights and analytics</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-20 h-20 text-red-400 mx-auto mb-6" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-6">We couldn't fetch your dashboard data. Please try again.</p>
          <button
            onClick={() => fetchDashboardData()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const getDaysRemaining = () => {
    const end = new Date(dashboardData.plan.packageEnd);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const deviceActivityRate = dashboardData.totalDevices > 0
    ? ((dashboardData.activeDevices / dashboardData.totalDevices) * 100).toFixed(1)
    : 0;

  const daysRemaining = getDaysRemaining();
  const isPlanExpiringSoon = daysRemaining <= 7;
  const hasOverLimitDevices = Object.values(dashboardData.usage.devices).some((used, index) => {
    const limits = Object.values(dashboardData.plan.limits.devices);
    return used > (limits[index] || 0);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Header
        title="Dashboard"
        onMenuClick={() => setSidebarOpen(true)}
        actions={
          <button
            onClick={() => fetchDashboardData(false)}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg border border-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />

      <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Current Plan Status Banner with warning */}
        <div className={`rounded-3xl p-8 text-white mb-8 shadow-2xl relative overflow-hidden ${isPlanExpiringSoon
            ? 'bg-gradient-to-r from-red-600 to-red-700'
            : 'bg-gradient-to-r from-blue-600 to-indigo-700'
          }`}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
          </div>
          
          <div className="flex items-center justify-between flex-wrap gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-lg">
                <Package className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-4">
                  {dashboardData.plan.packageType} Plan
                  <DeviceHealthIndicator health={parseFloat(deviceActivityRate)} />
                </h1>
                <p className="text-blue-100 opacity-90 font-medium">Your current subscription status</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right bg-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm">
                <div className="text-sm text-blue-100 opacity-90 mb-2 flex items-center gap-2 justify-end">
                  <Clock className="w-4 h-4" />
                  Time Remaining
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-4xl font-bold ${isPlanExpiringSoon ? 'text-yellow-300 animate-pulse' : 'text-white'}`}>
                    {daysRemaining}
                  </div>
                  <div className="text-xl text-blue-100">days</div>
                  {isPlanExpiringSoon && (
                    <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold animate-bounce">
                      ⚠️ Renew
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {hasOverLimitDevices && (
            <div className="mt-6 pt-5 border-t border-white/20 relative z-10">
              <div className="flex items-center gap-2 text-yellow-200 bg-white/10 rounded-xl px-4 py-3 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 animate-pulse" />
                <span className="font-semibold">Some device limits have been exceeded</span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Last updated: </span>
              <span className="text-sm font-medium text-gray-700">
                {new Date(dashboardData.lastUpdated).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              icon={MapPin}
              value={dashboardData.totalSites}
              label="Total Sites"
              bgColor="bg-gradient-to-br from-blue-50 to-blue-100"
              iconColor="text-blue-600"
              subtitle={`${dashboardData.totalSites > 0 ? 'All operational' : 'No sites configured'}`}
            />

            <DashboardCard
              icon={Users}
              value={dashboardData.totalUsers}
              label="Total Users"
              bgColor="bg-gradient-to-br from-indigo-50 to-indigo-100"
              iconColor="text-indigo-600"
              subtitle={`${dashboardData.totalProjectManagers} PMs • ${dashboardData.totalSupervisors} Supervisors`}
            />
            <DashboardCard
              icon={Camera}
              value={dashboardData.totalDevices}
              label="Total Devices"
              bgColor="bg-gradient-to-br from-orange-50 to-orange-100"
              iconColor="text-orange-600"
              subtitle={`${dashboardData.activeDevices} online • ${dashboardData.inactiveDevices} offline`}
            />
            <DashboardCard
              icon={Activity}
              value={dashboardData.todayTotal}
              label="Today's Activity"
              bgColor="bg-gradient-to-br from-emerald-50 to-emerald-100"
              iconColor="text-emerald-600"
              subtitle={`${dashboardData.todayEntries} entries • ${dashboardData.todayExits} exits`}
              trend={dashboardData.todayTotal > 0 ? 12 : 0}
            />
          </div>
        </div>

        {/* Usage Overview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* User Allocation */}
          <div className="bg-white rounded-2xl p-7 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-7">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                User Allocation
              </h3>
              <ExternalLink className="w-4 h-4 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
            </div>
            <UsageBar
              used={dashboardData.usage.pm}
              limit={dashboardData.plan.limits.pm}
              label="Project Managers"
              type={dashboardData.usage.pm >= dashboardData.plan.limits.pm ? 'warning' : 'default'}
            />
            <UsageBar
              used={dashboardData.usage.supervisor}
              limit={dashboardData.plan.limits.supervisor}
              label="Supervisors"
              type={dashboardData.usage.supervisor >= dashboardData.plan.limits.supervisor ? 'warning' : 'default'}
            />
            <div className="mt-7 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Total Users</div>
                  <div className="text-xs text-gray-500 mt-0.5">Combined allocation</div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {dashboardData.usage.pm + dashboardData.usage.supervisor} / {dashboardData.plan.limits.pm + dashboardData.plan.limits.supervisor}
                </div>
              </div>
            </div>
          </div>

          {/* Device Allocation */}
          <div className="bg-white rounded-2xl p-7 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-7">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center">
                  <Camera className="w-5 h-5 text-orange-600" />
                </div>
                Device Allocation
              </h3>
              <ExternalLink className="w-4 h-4 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" />
            </div>
            <UsageBar
              used={dashboardData.usage.devices.BARRIER || 0}
              limit={dashboardData.plan.limits.devices.BARRIER || 0}
              label="Barrier Gates"
            />
            <UsageBar
              used={dashboardData.usage.devices.BIOMETRIC || 0}
              limit={dashboardData.plan.limits.devices.BIOMETRIC || 0}
              label="Biometric Devices"
            />
            <UsageBar
              used={dashboardData.usage.devices.ANPR || 0}
              limit={dashboardData.plan.limits.devices.ANPR || 0}
              label="ANPR Cameras"
            />
            <div className="mt-7 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4">
                <div>
                  <div className="text-sm font-semibold text-gray-900">Total Devices</div>
                  <div className="text-xs text-gray-500 mt-0.5">All device types</div>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {(dashboardData.usage.devices.ANPR || 0) + (dashboardData.usage.devices.BARRIER || 0) + (dashboardData.usage.devices.BIOMETRIC || 0)} /
                  {(dashboardData.plan.limits.devices.ANPR || 0) + (dashboardData.plan.limits.devices.BARRIER || 0) + (dashboardData.plan.limits.devices.BIOMETRIC || 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Device Health Status */}
          <div className="bg-white rounded-2xl p-7 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-7">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                System Health
              </h3>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-400 hover:text-blue-600 transition-colors" />
                <HardDrive className="w-4 h-4 text-gray-400 hover:text-blue-600 transition-colors" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shadow-sm">
                    <Wifi className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Active Devices</div>
                    <div className="text-xs text-gray-500 mt-0.5">Online and responding</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {dashboardData.activeDevices}
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shadow-sm">
                    <WifiOff className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Offline Devices</div>
                    <div className="text-xs text-gray-500 mt-0.5">Requires attention</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-600">
                  {dashboardData.inactiveDevices}
                </div>
              </div>

              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 hover:shadow-md transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">System Health</div>
                    <div className="text-xs text-gray-500 mt-0.5">Overall performance</div>
                  </div>
                </div>
                <DeviceHealthIndicator health={parseFloat(deviceActivityRate)} />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity with Enhanced Design */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-7 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
                <p className="text-sm text-gray-600 mt-2">Live system events and movements</p>
              </div>
            </div>

            {dashboardData.recentActivity && dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentActivity.slice(0, 5).map((activity, index) => {
                  const formatTime12Hour = (dateString) => {
                    try {
                      const date = new Date(dateString);
                      return date.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      });
                    } catch (error) {
                      return 'Invalid time';
                    }
                  };

                  const formatDate = (dateString) => {
                    try {
                      const date = new Date(dateString);
                      return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      });
                    } catch (error) {
                      return '';
                    }
                  };

                  const activityTime = formatTime12Hour(activity.time);
                  const activityDate = formatDate(activity.time);
                  const isToday = new Date(activity.time).toDateString() === new Date().toDateString();

                  const isEntry = activity.title.includes('Vehicle') && activity.description.includes('entry') ||
                    activity.title.includes('Entry') ||
                    activity.description.toLowerCase().includes('entry');
                  const isExit = activity.title.includes('Vehicle') && activity.description.includes('exit') ||
                    activity.title.includes('Exit') ||
                    activity.description.toLowerCase().includes('exit');

                  return (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-2xl transition-all duration-300 group border border-transparent hover:border-blue-100 hover:shadow-md"
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300 ${isEntry ? 'bg-gradient-to-br from-green-100 to-green-200' :
                          isExit ? 'bg-gradient-to-br from-blue-100 to-blue-200' : 'bg-gradient-to-br from-purple-100 to-purple-200'
                        }`}>
                        {isEntry ? (
                          <ArrowUpRight className="w-6 h-6 text-green-600" />
                        ) : isExit ? (
                          <ArrowDownRight className="w-6 h-6 text-blue-600" />
                        ) : (
                          <Activity className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {activity.title}
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-sm font-bold text-gray-900">
                              {activityTime}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 font-medium">
                              {isToday ? 'Today' : activityDate}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1.5 font-medium">{activity.description}</div>
                        <div className="flex items-center gap-2 mt-3">
                          <div className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm ${isEntry ? 'bg-green-100 text-green-800' :
                              isExit ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                            {isEntry ? '↑ Entry' : isExit ? '↓ Exit' : '• Activity'}
                          </div>
                          <div className="text-xs text-gray-500">
                            • {activity.time ? new Date(activity.time).toLocaleDateString() : 'Unknown date'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                  <Activity className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-500 font-semibold text-lg">No recent activity detected</p>
                <p className="text-sm text-gray-400 mt-2">System activity will appear here automatically</p>
              </div>
            )}
          </div>
        </div>

        {/* Available Packages with Enhanced Design */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Your Plan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan for your growing needs. All plans include 24/7 support and regular updates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg, index) => (
              <PackageCard
                key={index}
                {...pkg}
                isCurrent={pkg.type === dashboardData.plan.packageType}
                onClick={handlePackageSelect}
              />
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need a custom solution? <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Contact our sales team</a>
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;