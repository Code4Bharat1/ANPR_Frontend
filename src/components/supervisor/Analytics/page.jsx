"use client" 

import React, { useState } from 'react';
import { 
  Download,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Video,
  BarChart3
} from 'lucide-react';
import Sidebar from '../sidebar';

const Analytics = () => {
  const [dateFilter, setDateFilter] = useState('Last 7 Days');

  // Chart data for daily traffic
  const chartData = [
    { day: 'Mon', entries: 65, exits: 58 },
    { day: 'Tue', entries: 82, exits: 75 },
    { day: 'Wed', entries: 75, exits: 68 },
    { day: 'Thu', entries: 95, exits: 88 },
    { day: 'Fri', entries: 105, exits: 98 },
    { day: 'Sat', entries: 72, exits: 70 },
    { day: 'Sun', entries: 58, exits: 55 }
  ];

  const maxValue = Math.max(...chartData.flatMap(d => [d.entries, d.exits]));

  const handleDownloadReport = () => {
    console.log('Downloading report...');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
     <Sidebar/>
      

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-500 text-sm mt-1">Overview of traffic and operational efficiency</p>
            </div>
            <div className="flex items-center gap-4">
              <select 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer font-medium text-gray-700"
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
                <option>This Year</option>
              </select>
              <button 
                onClick={handleDownloadReport}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Today Trips */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Today Trips</h3>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">84</div>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +12% from yesterday
              </div>
            </div>

            {/* Last 7 Days Trips */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Last 7 Days Trips</h3>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">528</div>
              <div className="text-gray-500 text-sm">Consistent with last week</div>
            </div>

            {/* Avg Processing Time */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-gray-600 text-sm font-medium">Avg. Processing Time</h3>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">1h 12m</div>
              <div className="text-green-600 text-sm font-medium">-5 min improvement</div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900">Vehicle Traffic Trends (Daily)</h2>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm text-gray-600">Entries</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-sm text-gray-600">Exits</span>
                </div>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="h-96 flex items-end justify-between gap-8 px-4">
              {chartData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  {/* Bars Container */}
                  <div className="w-full flex items-end justify-center gap-2 h-80">
                    {/* Entries Bar */}
                    <div 
                      className="w-full bg-blue-600 rounded-t-lg transition-all hover:bg-blue-700 cursor-pointer"
                      style={{ 
                        height: `${(data.entries / maxValue) * 100}%`,
                        minHeight: '40px'
                      }}
                      title={`Entries: ${data.entries}`}
                    ></div>
                    {/* Exits Bar */}
                    <div 
                      className="w-full bg-gray-300 rounded-t-lg transition-all hover:bg-gray-400 cursor-pointer"
                      style={{ 
                        height: `${(data.exits / maxValue) * 100}%`,
                        minHeight: '40px'
                      }}
                      title={`Exits: ${data.exits}`}
                    ></div>
                  </div>
                  {/* Day Label */}
                  <div className="text-sm text-gray-600 font-medium">{data.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;