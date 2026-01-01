"use client"

import React from 'react';
import {
  Bell,
  Car,
  Truck,
  AlertTriangle,
  IdCard,
  MapPin,
  Clock,
  ChevronRight
} from 'lucide-react';
import Sidebar from '../sidebar';

const SupervisorDashboard = () => {
  const stats = [
    { label: 'Today Entry', value: '482', icon: null },
    { label: 'Today Exit', value: '395', subtitle: 'Normal activity', icon: <ChevronRight className="w-4 h-4" /> },
    { label: 'Vehicles Inside', value: '87', subtitle: '45% Capacity', icon: <Car className="w-4 h-4" /> },
    { label: 'Pending Exit', value: '12', icon: null },
    { label: 'Denied Entries', value: '4', icon: null }
  ];

  const recentActivity = [
    {
      id: 1,
      plate: 'XYZ-9821',
      type: 'Visitor - John Doe',
      gate: 'Gate 1 (Main) • Entry',
      status: 'Allowed',
      time: '10:42 AM',
      icon: <Car className="w-5 h-5 text-gray-600" />
    },
    {
      id: 2,
      plate: 'DEL-5599',
      type: 'Delivery Truck',
      gate: 'Gate 2 (Rear) • Exit',
      status: 'Allowed',
      time: '10:38 AM',
      icon: <Truck className="w-5 h-5 text-gray-600" />
    },
    {
      id: 3,
      plate: 'UNK-0000',
      type: 'Unknown Vehicle',
      gate: 'Gate 1 (Main) • Entry Attempt',
      status: 'Denied',
      time: '10:15 AM',
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      alert: true
    },
    {
      id: 4,
      plate: 'ABC-1234',
      type: 'Staff Member',
      gate: 'Gate 1 (Main) • Entry',
      status: 'Allowed',
      time: '09:55 AM',
      icon: <IdCard className="w-5 h-5 text-gray-600" />
    }
  ];

  const activeVehicles = [
    { plate: 'ABC-1234', type: 'Staff', gate: 'Gate 1', duration: '01:12 hrs', action: 'Mark Exit' },
    { plate: 'VIS-7788', type: 'Visitor', gate: 'Gate 2', duration: '00:34 hrs', action: 'Mark Exit' },
    { plate: 'LOG-4521', type: 'Logistics', gate: 'Gate 1', duration: '', action: 'Mark Exit' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar/>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supervisor Dashboard</h1>
            <p className="text-gray-500 text-sm">Real-time barrier control & monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">2</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-medium text-gray-900">Sarah Connor</div>
                <div className="text-sm text-gray-500">Site Supervisor</div>
              </div>
              <img src="/api/placeholder/40/40" alt="Profile" className="w-10 h-10 rounded-full" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <span className="text-gray-600 text-sm">{stat.label}</span>
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              {stat.subtitle && (
                <div className="text-sm text-gray-500">{stat.subtitle}</div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Recent Gate Activity */}
          <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Gate Activity</h2>
              <button className="text-blue-600 text-sm font-medium">View All Logs</button>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className={`flex items-center gap-4 p-4 rounded-lg ${activity.alert ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${activity.alert ? 'bg-red-100' : 'bg-white'}`}>
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{activity.plate}</span>
                      <span className="text-gray-600">{activity.type}</span>
                    </div>
                    <div className="text-sm text-gray-500">{activity.gate}</div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                      activity.status === 'Allowed' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {activity.status}
                    </span>
                    <div className="text-sm text-gray-500">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Site Panel */}
          <div className="space-y-6">
            {/* Site Info with Map */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Assigned Site</h2>
                <MapPin className="w-5 h-5 text-gray-400" />
              </div>

              <div className="mb-4 h-32 bg-gray-200 rounded-lg overflow-hidden">
                <img src="/api/placeholder/400/200" alt="Map" className="w-full h-full object-cover" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Site Name</div>
                  <div className="font-medium text-gray-900">Tech Park - Sector 4</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Active Gates</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Current Shift</div>
                  <div className="font-medium text-gray-900">08:00 AM - 04:00 PM</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Status</div>
                  <span className="inline-block px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                    Operational
                  </span>
                </div>
              </div>
            </div>

            {/* Active Vehicles */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Active Vehicles</h2>
                <span className="text-sm text-gray-500">Inside: 5</span>
              </div>

              <div className="space-y-3">
                {activeVehicles.map((vehicle, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-gray-900">{vehicle.plate}</div>
                      <div className="text-sm text-gray-900">{vehicle.duration}</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">{vehicle.type} • {vehicle.gate}</div>
                      <button className="text-sm text-blue-600 font-medium">{vehicle.action}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;