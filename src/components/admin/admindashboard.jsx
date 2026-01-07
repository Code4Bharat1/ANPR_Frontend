"use client";
import { useState, useEffect } from 'react';
import {
  MapPin, Users, Camera, Activity,
  ArrowUpRight, ArrowDownRight, AlertCircle,
  TrendingUp, Database, Wifi, WifiOff, Package,
  CheckCircle, Clock, Crown, Shield, Zap
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';

const DashboardCard = ({ icon: Icon, value, label, bgColor, iconColor, trend, subtitle }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-sm font-semibold ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-gray-600 text-sm font-medium">{label}</div>
    {subtitle && <div className="text-xs text-gray-500 mt-2">{subtitle}</div>}
  </div>
);

const UsageBar = ({ used, limit, label }) => {
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  const isNearLimit = percentage > 80;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-semibold text-gray-900">{used} / {limit}</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isNearLimit ? 'bg-red-500' : 'bg-blue-600'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

const PackageCard = ({ 
  name, 
  price, 
  isCurrent, 
  features, 
  icon: Icon,
  bgGradient,
  recommended 
}) => (
  <div className={`relative bg-white rounded-xl p-6 shadow-sm border-2 transition-all hover:shadow-lg ${
    isCurrent ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200'
  } ${recommended ? 'ring-2 ring-amber-400' : ''}`}>
    {recommended && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
          RECOMMENDED
        </span>
      </div>
    )}
    {isCurrent && (
      <div className="absolute -top-3 right-4">
        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          ACTIVE
        </span>
      </div>
    )}
    
    <div className={`w-12 h-12 bg-gradient-to-br ${bgGradient} rounded-lg flex items-center justify-center mb-4`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    
    <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
    <div className="text-3xl font-bold text-gray-900 mb-1">₹{price.toLocaleString()}</div>
    <div className="text-sm text-gray-600 mb-6">per month</div>
    
    <div className="space-y-3">
      {features.map((feature, index) => (
        <div key={index} className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-gray-700">{feature}</span>
        </div>
      ))}
    </div>
    
    {!isCurrent && (
      <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
        Upgrade Plan
      </button>
    )}
  </div>
);

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Sample data structure matching the API response
  const [dashboardData] = useState({
    activeDevices: 0,
    inactiveDevices: 0,
    totalDevices: 0,
    totalSites: 1,
    totalProjectManagers: 0,
    totalSupervisors: 0,
    totalUsers: 0,
    todayEntries: 0,
    todayExits: 0,
    todayTotal: 0,
    recentActivity: [],
    plan: {
      packageType: "LITE",
      packageStart: "2026-01-07T00:00:00.000Z",
      packageEnd: "2026-02-07T00:00:00.000Z",
      limits: {
        pm: 1,
        supervisor: 2,
        devices: {
          barriers: 1,
          biometrics: 1,
          anpr: 0
        }
      }
    },
    usage: {
      pm: 0,
      supervisor: 0,
      devices: {
        barriers: 0,
        biometrics: 0,
        anpr: 0
      }
    }
  });

  const packages = [
    {
      name: "Lite Access",
      price: 6000,
      icon: Zap,
      bgGradient: "from-blue-500 to-blue-600",
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
      recommended: true,
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

  const getDaysRemaining = () => {
    const end = new Date(dashboardData.plan.packageEnd);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const deviceActivityRate = dashboardData.totalDevices > 0
    ? ((dashboardData.activeDevices / dashboardData.totalDevices) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Header title="Dashboard" onMenuClick={() => setSidebarOpen(true)} />

      <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Current Plan Status Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white mb-8 shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-1">
                  {dashboardData.plan.packageType} Plan
                </h1>
                <p className="text-blue-100">Your current subscription</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm text-blue-100 mb-1">Time Remaining</div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-2xl font-bold">{getDaysRemaining()} days</span>
                </div>
              </div>
              <button className="bg-white text-blue-600 font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-50 transition-colors">
                Manage Plan
              </button>
            </div>
          </div>
        </div>

        {/* Usage Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Plan Usage & Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* User Limits */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                User Allocation
              </h3>
              <UsageBar 
                used={dashboardData.usage.pm} 
                limit={dashboardData.plan.limits.pm} 
                label="Project Managers" 
              />
              <UsageBar 
                used={dashboardData.usage.supervisor} 
                limit={dashboardData.plan.limits.supervisor} 
                label="Supervisors" 
              />
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  Total Users: <span className="font-semibold text-gray-900">
                    {dashboardData.usage.pm + dashboardData.usage.supervisor} / {dashboardData.plan.limits.pm + dashboardData.plan.limits.supervisor}
                  </span>
                </div>
              </div>
            </div>

            {/* Device Limits */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-600" />
                Device Allocation
              </h3>
              <UsageBar 
                used={dashboardData.usage.devices.barriers} 
                limit={dashboardData.plan.limits.devices.barriers} 
                label="Barriers" 
              />
              <UsageBar 
                used={dashboardData.usage.devices.biometrics} 
                limit={dashboardData.plan.limits.devices.biometrics} 
                label="Biometrics" 
              />
              <UsageBar 
                used={dashboardData.usage.devices.anpr} 
                limit={dashboardData.plan.limits.devices.anpr} 
                label="ANPR Cameras" 
              />
            </div>
          </div>
        </div>

        {/* Site & User Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Infrastructure Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              icon={MapPin}
              value={dashboardData.totalSites}
              label="Total Sites"
              bgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <DashboardCard
              icon={Users}
              value={dashboardData.totalProjectManagers}
              label="Project Managers"
              bgColor="bg-indigo-50"
              iconColor="text-indigo-600"
            />
            <DashboardCard
              icon={Users}
              value={dashboardData.totalSupervisors}
              label="Supervisors"
              bgColor="bg-pink-50"
              iconColor="text-pink-600"
            />
            <DashboardCard
              icon={Camera}
              value={dashboardData.totalDevices}
              label="Total Devices"
              bgColor="bg-orange-50"
              iconColor="text-orange-600"
            />
          </div>
        </div>

        {/* Device Status */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Device Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Active</h3>
                <Wifi className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {dashboardData.activeDevices}
              </div>
              <div className="text-sm text-gray-600">Devices online</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Inactive</h3>
                <WifiOff className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-4xl font-bold text-red-600 mb-2">
                {dashboardData.inactiveDevices}
              </div>
              <div className="text-sm text-gray-600">Devices offline</div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Health</h3>
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {deviceActivityRate}%
              </div>
              <div className="text-sm text-gray-600">System health</div>
            </div>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Today's Activity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <DashboardCard
              icon={ArrowUpRight}
              value={dashboardData.todayEntries}
              label="Today's Entries"
              bgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <DashboardCard
              icon={ArrowDownRight}
              value={dashboardData.todayExits}
              label="Today's Exits"
              bgColor="bg-cyan-50"
              iconColor="text-cyan-600"
            />
            <DashboardCard
              icon={TrendingUp}
              value={dashboardData.todayTotal}
              label="Total Movements"
              bgColor="bg-indigo-50"
              iconColor="text-indigo-600"
            />
          </div>
        </div>

        {/* Available Packages */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Available Plans</h2>
          <p className="text-gray-600 mb-6">Compare and upgrade your subscription</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg, index) => (
              <PackageCard
                key={index}
                {...pkg}
                isCurrent={pkg.type === dashboardData.plan.packageType}
              />
            ))}
          </div>
        </div>

        {/* Additional Rental Options */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Alternative Rental Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Standard Rental</h3>
              <p className="text-sm text-gray-600 mb-2">Managed & Maintained by You</p>
              <p className="text-xs text-gray-500">3 years minimum tenure</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Annual Membership</h3>
              <p className="text-sm text-gray-600 mb-2">Lump-sum annual payment</p>
              <p className="text-xs text-gray-500">3 years minimum tenure</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Site Ownership</h3>
              <p className="text-sm text-gray-600 mb-2">5-Year full ownership</p>
              <p className="text-xs text-gray-500">Client owned hardware</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;