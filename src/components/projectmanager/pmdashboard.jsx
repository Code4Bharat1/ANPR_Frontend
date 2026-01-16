"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from "next/link";
import {
  MapPin, Users, TrendingUp, Activity,
  ArrowRight, CheckCircle
} from 'lucide-react';
import Sidebar from './sidebar';
import Header from './header';  // ✅ Import Header

const DashboardCard = ({ icon: Icon, value, label, subLabel, bgColor, iconColor }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
    </div>
    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-gray-600 text-sm font-medium">{label}</div>
    {subLabel && <div className="text-gray-500 text-xs mt-1">{subLabel}</div>}
  </div>
);

const SiteCard = ({ site }) => {
  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{site.name}</h3>
        <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">
          {site.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mt-3">
        <div>
          <p className="text-gray-500">Barriers</p>
          <p className="font-semibold">{site.barriersActive} active</p>
        </div>
        <div>
          <p className="text-gray-500">Active Trips</p>
          <p className="font-semibold">{site.activeTrips}</p>
        </div>
      </div>

    
    </div>
  );
};


const PMDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/project/dashboard/stats`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDashboardData(response.data);
      // console.log(response.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* ✅ Header Component with Dropdown */}
      <Header title="Dashboard Overview" onMenuClick={() => setSidebarOpen(true)} />

      {/* ✅ Main Content with proper spacing */}
      <main className="lg:ml-72 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Project Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Project Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <DashboardCard
              icon={MapPin}
              value={dashboardData?.totalSites || 0}
              label="Total Sites"
              subLabel="All operational"
              bgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
            <DashboardCard
              icon={TrendingUp}
              value={`${dashboardData?.totalTrips || 0}`}
              label="Total Trips"
              bgColor="bg-green-50"
              iconColor="text-green-600"
            />
            <DashboardCard
              icon={Users}
              value={dashboardData?.supervisors || 0}
              label="Supervisors"
              subLabel="Total registered"
              bgColor="bg-purple-50"
              iconColor="text-purple-600"
            />
            <DashboardCard
              icon={Activity}
              value={dashboardData?.activeTrips || 0}
              label="Active Trips"
              subLabel="In progress now"
              bgColor="bg-orange-50"
              iconColor="text-orange-600"
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <DashboardCard
            icon={Users}
            value={dashboardData?.activeSupervisors || 0}
            label="Active Supervisors"
            subLabel="Currently online"
            bgColor="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          <DashboardCard
            icon={TrendingUp}
            value={dashboardData?.todayTrips || 0}
            label="Today's Trips"
            subLabel="yesterday"
            bgColor="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <DashboardCard
            icon={CheckCircle}
            value={dashboardData?.completedTrips || 0}
            label="Completed Trips"
            bgColor="bg-cyan-50"
            iconColor="text-cyan-600"
          />
        </div>

        {/* My Assigned Sites */}
        <div className="mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Assigned Sites</h2>
              <Link href="/projectmanager/sites">
                <button className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            
            {dashboardData?.sites && dashboardData.sites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardData.sites.slice(0, 4).map((site) => (
                  <SiteCard key={site.id} site={site} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No sites assigned yet</p>
                <p className="text-sm text-gray-400 mt-1">Sites will appear here when assigned</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PMDashboard;
