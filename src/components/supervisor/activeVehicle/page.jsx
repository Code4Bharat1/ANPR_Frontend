"use client"

import React, { useState } from 'react';
import { 
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Settings,
  Video,
  Plus
} from 'lucide-react';
import Sidebar from '../sidebar';

const ActiveVehicles = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const vehicles = [
    {
      id: 1,
      plateNumber: 'MH12-DE-1992',
      vehicleType: 'Truck (10 Wheeler)',
      vendor: 'Blue Dart Logistics',
      driver: 'Rajesh Kumar',
      entryTime: '10:45 AM',
      entryDate: 'Today',
      duration: { hours: '02h', minutes: '15m' },
      status: 'Loading',
      statusColor: 'text-green-600 bg-green-50'
    },
    {
      id: 2,
      plateNumber: 'KA01-HH-4550',
      vehicleType: 'Van (Light)',
      vendor: 'Amazon Supplies',
      driver: 'Vijay Singh',
      entryTime: '09:15 AM',
      entryDate: 'Today',
      duration: { hours: '03h', minutes: '45m' },
      status: 'Overstay',
      statusColor: 'text-yellow-700 bg-yellow-50'
    },
    {
      id: 3,
      plateNumber: 'MH14-JK-8821',
      vehicleType: 'Tanker',
      vendor: 'Indian Oil Corp',
      driver: 'Amit Patel',
      entryTime: '11:30 AM',
      entryDate: 'Today',
      duration: { hours: '01h', minutes: '30m' },
      status: 'Unloading',
      statusColor: 'text-blue-600 bg-blue-50'
    },
    {
      id: 4,
      plateNumber: 'DL02-CC-1029',
      vehicleType: 'Sedan (Visitor)',
      vendor: 'Tech Solutions Ltd',
      visitor: 'Rahul Roy',
      entryTime: '12:15 PM',
      entryDate: 'Today',
      duration: { hours: '00h', minutes: '45m' },
      status: 'Meeting',
      statusColor: 'text-purple-600 bg-purple-50'
    },
    {
      id: 5,
      plateNumber: 'TN05-AA-9988',
      vehicleType: 'Truck (6 Wheeler)',
      vendor: 'Local Supply Co',
      driver: 'K. Ganesh',
      entryTime: '08:00 AM',
      entryDate: 'Today',
      duration: { hours: '05h', minutes: '00m' },
      status: 'Maintenance',
      statusColor: 'text-orange-600 bg-orange-50'
    }
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilter = () => {
    console.log('Filter clicked');
  };

  const handleDetails = (vehicleId) => {
    console.log('View details for vehicle:', vehicleId);
  };

  const handleAllowExit = (vehicleId) => {
    console.log('Allow exit for vehicle:', vehicleId);
  };

  const handleManualEntry = () => {
    console.log('Manual entry clicked');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar/>
    

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Active Vehicles</h1>
            <p className="text-gray-500 text-sm mt-1">Monitoring vehicles currently inside premises</p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleManualEntry}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Manual Entry
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-medium text-gray-900">Sarah Connor</div>
                <div className="text-sm text-gray-500">Site Supervisor</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                SC
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Search and Filter Bar */}
            <div className="p-6 border-b border-gray-200 flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicle, vendor..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button 
                onClick={handleFilter}
                className="flex items-center gap-2 px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
              <div className="text-sm text-gray-500">
                Showing <span className="font-semibold text-gray-900">5</span> vehicles inside
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Vehicle Number</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Vendor / Agency</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Entry Time</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Duration</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {/* Vehicle Number */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{vehicle.plateNumber}</div>
                        <div className="text-sm text-gray-500">{vehicle.vehicleType}</div>
                      </td>

                      {/* Vendor / Agency */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{vehicle.vendor}</div>
                        <div className="text-sm text-gray-500">
                          {vehicle.driver ? `Driver: ${vehicle.driver}` : vehicle.visitor ? `Visitor: ${vehicle.visitor}` : ''}
                        </div>
                      </td>

                      {/* Entry Time */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{vehicle.entryTime}</div>
                        <div className="text-sm text-gray-500">{vehicle.entryDate}</div>
                      </td>

                      {/* Duration */}
                      <td className="px-6 py-4">
                        <div className="font-mono text-gray-900">
                          <span className="font-semibold">{vehicle.duration.hours}</span>
                          <span className="text-gray-500 ml-1">{vehicle.duration.minutes}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${vehicle.statusColor}`}>
                          {vehicle.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleDetails(vehicle.id)}
                            className="text-gray-700 hover:text-gray-900 font-medium text-sm"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => handleAllowExit(vehicle.id)}
                            className="text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            Allow Exit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveVehicles;