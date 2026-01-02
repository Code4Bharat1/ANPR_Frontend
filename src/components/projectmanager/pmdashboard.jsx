"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from "next/link";
import {
  Bell, Menu, MapPin, Users, TrendingUp, Activity,
  ArrowRight, CheckCircle, AlertTriangle, Clock, 
} from 'lucide-react';
import Sidebar from './sidebar';

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

const SiteCard = ({ site }) => (
  <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition">
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-bold text-gray-900">{site.name}</h3>
        <div className="text-sm text-gray-500">{site.id}</div>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${site.status === 'Operational'
          ? 'bg-green-100 text-green-700'
          : 'bg-yellow-100 text-yellow-700'
        }`}>
        {site.status}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-3 mb-3">
      <div>
        <div className="text-xs text-gray-500">Barriers</div>
        <div className="font-semibold text-gray-900">{site.barriers} active</div>
      </div>
      <div>
        <div className="text-xs text-gray-500">Active Trips</div>
        <div className="font-semibold text-gray-900">{site.activeTrips}</div>
      </div>
    </div>
    <button className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-semibold">
      View Details
    </button>
  </div>
);

const ActivityItem = ({ icon: Icon, title, time, iconColor }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
    <div className={`w-8 h-8 ${iconColor} rounded-lg flex items-center justify-center`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div className="flex-1">
      <div className="text-sm font-medium text-gray-900">{title}</div>
      <div className="text-xs text-gray-500">{time}</div>
    </div>
  </div>
);

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
      console.log(response.data);
      
    } catch (err) {
      // setDashboardData({
      //   totalSites: 12,
      //   totalTrips: 3429,
      //   supervisors: 48,
      //   activeTrips: 28,
      //   activeSupervisors: 32,
      //   todayTrips: 142,
      //   completedTrips: 3401,
      //   sites: [
      //     {
      //       id: 'NLH-01',
      //       name: 'North Logistics Hub',
      //       barriers: 8,
      //       activeTrips: 12,
      //       status: 'Operational'
      //     },
      //     {
      //       id: 'WDC-04',
      //       name: 'Westside Distribution Center',
      //       barriers: 3,
      //       activeTrips: 5,
      //       status: 'Maintenance'
      //     },
      //     {
      //       id: 'PGA-07',
      //       name: 'Port Gate 7 Access',
      //       barriers: 12,
      //       activeTrips: 24,
      //       status: 'Operational'
      //     },
      //     {
      //       id: 'CSF-02',
      //       name: 'Central Storage Facility',
      //       barriers: 5,
      //       activeTrips: 8,
      //       status: 'Operational'
      //     }
      //   ]
      // });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
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

        <main className="max-w-7xl mx-auto px-6 py-8">

          {/* Project Overview */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Project Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* My Assigned Sites */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">My Assigned Sites</h2>
                  <Link href="/projectmanager/sites">
                    <button className="text-sm text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1">
                      View All <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dashboardData?.sites?.slice(0, 4).map((site) => (
                    <SiteCard key={site.id} site={site} />
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            {/* <div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activities</h2>
                <ActivityItem
                  icon={Activity}
                  iconColor="bg-green-500"
                  title="Vehicle Entry at North Logistics Hub - Gate 1"
                  time="2 mins ago"
                />
                <ActivityItem
                  icon={AlertTriangle}
                  iconColor="bg-yellow-500"
                  title="Barrier Alert reported at Westside Distribution"
                  time="15 mins ago"
                />
                <ActivityItem
                  icon={Users}
                  iconColor="bg-blue-500"
                  title="New Supervisor assigned to Port Gate 7"
                  time="1 hour ago"
                />
                <ActivityItem
                  icon={CheckCircle}
                  iconColor="bg-green-500"
                  title="Daily Report generated for Zone A"
                  time="2 hours ago"
                />
                <ActivityItem
                  icon={Activity}
                  iconColor="bg-indigo-500"
                  title="Vehicle Exit at North Logistics Hub - Gate 2"
                  time="3 hours ago"
                />
              </div>
            </div> */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PMDashboard;
