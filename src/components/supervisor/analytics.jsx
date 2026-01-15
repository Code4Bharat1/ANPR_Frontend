// // components/supervisor/analytics.jsx
// "use client";
// import React, { useState, useEffect } from 'react';
// import SupervisorLayout from './SupervisorLayout';
// import axios from 'axios';
// import {
//   Download, Calendar, TrendingUp, TrendingDown, Activity,
//   Clock, Car, CheckCircle, XCircle, BarChart3, Loader2
// } from 'lucide-react';

// const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// const Analytics = () => {
//   const [loading, setLoading] = useState(false);
//   const [timeFilter, setTimeFilter] = useState('last7days');
//   const [analytics, setAnalytics] = useState({
//     todayTrips: 0,
//     todayChange: 0,
//     weekTrips: 0,
//     avgProcessingTime: "--",
//     peakHour: "--",
//     totalEntries: 0,
//     totalExits: 0,
//     activeVehicles: 0,
//     avgDuration: "--",
//   });

//   const [dailyTrends, setDailyTrends] = useState([]);
//   const [hourlyTrends, setHourlyTrends] = useState([]);
//   const [vehicleTypes, setVehicleTypes] = useState([]);
//   const [topVendors, setTopVendors] = useState([]);

//   useEffect(() => {
//     fetchAnalytics();
//   }, [timeFilter]);

//   const fetchAnalytics = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('accessToken');
//       const response = await axios.get(
//         `${API_URL}/api/supervisor/analytics?period=${timeFilter}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       console.log(response.data);
      
//       if (response.data) {
//         setAnalytics(response.data.analytics || analytics);
//         setDailyTrends(response.data.dailyTrends || dailyTrends);
//         setHourlyTrends(response.data.hourlyTrends || hourlyTrends);
//       }
//     } catch (error) {
//       console.error('Error fetching analytics:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownloadReport = async () => {
//     try {
//       alert('Downloading report... (Feature to be implemented)');
//     } catch (error) {
//       console.error('Error downloading report:', error);
//       alert('Failed to download report');
//     }
//   };

//   const maxDailyValue =
//     dailyTrends.length > 0
//       ? Math.max(...dailyTrends.map(d => Math.max(d.entries, d.exits)))
//       : 1;

//   const maxHourlyValue =
//     hourlyTrends.length > 0
//       ? Math.max(...hourlyTrends.map(h => h.count))
//       : 1;

//   return (
//     <SupervisorLayout>
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
//           <div>
//             <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Analytics</h1>
//             <p className="text-sm sm:text-base text-gray-600">Overview of traffic and operational efficiency</p>
//           </div>
//           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
//             <select
//               value={timeFilter}
//               onChange={(e) => setTimeFilter(e.target.value)}
//               className="px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold"
//             >
//               <option value="today">Today</option>
//               <option value="last7days">Last 7 Days</option>
//             </select>
//             <button
//               onClick={handleDownloadReport}
//               className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
//             >
//               <Download className="w-4 h-4 sm:w-5 sm:h-5" />
//               <span className="hidden sm:inline">Download Report</span>
//               <span className="sm:hidden">Download</span>
//             </button>
//           </div>
//         </div>

//         {loading ? (
//           <div className="flex items-center justify-center h-64 sm:h-96">
//             <div className="text-center">
//               <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 animate-spin mx-auto mb-4" />
//               <p className="text-sm sm:text-base text-gray-600 font-semibold">Loading analytics...</p>
//             </div>
//           </div>
//         ) : (
//           <>
//             {/* Key Metrics */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
//               {/* Today Trips */}
//               <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
//                 <div className="flex items-center justify-between mb-3 sm:mb-4">
//                   <div>
//                     <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Today Trips</div>
//                     <div className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.todayTrips}</div>
//                   </div>
//                   <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                     <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-1 text-xs sm:text-sm">
//                   {analytics.todayChange >= 0 ? (
//                     <>
//                       <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
//                       <span className="text-green-600 font-semibold">+{analytics.todayChange}%</span>
//                     </>
//                   ) : (
//                     <>
//                       <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
//                       <span className="text-red-600 font-semibold">{analytics.todayChange}%</span>
//                     </>
//                   )}
//                   <span className="text-gray-500 ml-1">from yesterday</span>
//                 </div>
//               </div>

//               {/* Last 7 Days Trips */}
//               <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
//                 <div className="flex items-center justify-between mb-3 sm:mb-4">
//                   <div>
//                     <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Last 7 Days Trips</div>
//                     <div className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.weekTrips}</div>
//                   </div>
//                   <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
//                     <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
//                   </div>
//                 </div>
//                 <div className="text-xs sm:text-sm text-gray-500">Consistent with last week</div>
//               </div>

//               {/* Avg Processing Time */}
//               <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm sm:col-span-2 lg:col-span-1">
//                 <div className="flex items-center justify-between mb-3 sm:mb-4">
//                   <div>
//                     <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Avg. Processing Time</div>
//                     <div className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.avgProcessingTime}</div>
//                   </div>
//                   <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                     <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-1 text-xs sm:text-sm">
//                   <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
//                   <span className="text-green-600 font-semibold">{Math.abs(analytics.timeImprovement)} min improvement</span>
//                 </div>
//               </div>
//             </div>

//             {/* Charts Section */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
//               {/* Daily Trends - Large */}
//               <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
//                   <div>
//                     <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Vehicle Traffic Trends (Daily)</h2>
//                     <p className="text-xs sm:text-sm text-gray-600">Entry and exit patterns over the week</p>
//                   </div>
//                   <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
//                     <div className="flex items-center gap-2">
//                       <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-600 rounded"></div>
//                       <span className="text-gray-600">Entries</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-400 rounded"></div>
//                       <span className="text-gray-600">Exits</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Bar Chart */}
//                 <div className="h-48 sm:h-64 lg:h-80">
//                   <div className="flex items-end justify-between h-full gap-2 sm:gap-4">
//                     {dailyTrends.map((data, idx) => (
//                       <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full">
//                         <div className="flex-1 w-full flex items-end justify-center gap-0.5 sm:gap-1">
//                           {/* Entries Bar */}
//                           <div className="relative flex-1 flex flex-col justify-end group">
//                             <div
//                               className="bg-blue-600 rounded-t hover:bg-blue-700 transition cursor-pointer"
//                               style={{ height: `${(data.entries / maxDailyValue) * 100}%` }}
//                             >
//                               <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
//                                 {data.entries} entries
//                               </div>
//                             </div>
//                           </div>
//                           {/* Exits Bar */}
//                           <div className="relative flex-1 flex flex-col justify-end group">
//                             <div
//                               className="bg-gray-400 rounded-t hover:bg-gray-500 transition cursor-pointer"
//                               style={{ height: `${(data.exits / maxDailyValue) * 100}%` }}
//                             >
//                               <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
//                                 {data.exits} exits
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="text-xs sm:text-sm font-semibold text-gray-700">{data.day}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Quick Stats */}
//               <div className="space-y-4">
//                 {/* Peak Hours */}
//                 <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl p-4 sm:p-6 text-white">
//                   <div className="flex items-center gap-3 mb-3">
//                     <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
//                       <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
//                     </div>
//                     <div className="text-xs sm:text-sm opacity-90">Peak Traffic Hours</div>
//                   </div>
//                   <div className="text-xl sm:text-2xl font-bold mb-1">{analytics.peakHour}</div>
//                   <div className="text-xs sm:text-sm opacity-75">Highest activity period</div>
//                 </div>

//                 {/* Total Stats */}
//                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
//                   <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Today's Summary</h3>
//                   <div className="space-y-2.5 sm:space-y-3">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
//                           <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
//                         </div>
//                         <span className="text-xs sm:text-sm text-gray-600">Total Entries</span>
//                       </div>
//                       <span className="font-bold text-gray-900 text-sm sm:text-base">{analytics.totalEntries}</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//                           <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
//                         </div>
//                         <span className="text-xs sm:text-sm text-gray-600">Total Exits</span>
//                       </div>
//                       <span className="font-bold text-gray-900 text-sm sm:text-base">{analytics.totalExits}</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-2">
//                         <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
//                           <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
//                         </div>
//                         <span className="text-xs sm:text-sm text-gray-600">Currently Inside</span>
//                       </div>
//                       <span className="font-bold text-purple-600 text-sm sm:text-base">{analytics.activeVehicles}</span>
//                     </div>
//                     <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-gray-200">
//                       <div className="flex items-center gap-2">
//                         <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
//                         <span className="text-xs sm:text-sm text-gray-600">Avg Duration</span>
//                       </div>
//                       <span className="font-bold text-gray-900 text-sm sm:text-base">{analytics.avgDuration}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Bottom Section */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
//               {/* Hourly Trends */}
//               <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
//                 <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Hourly Traffic Distribution</h2>
//                 <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Vehicle movements by hour of day</p>

//                 <div className="space-y-2.5 sm:space-y-3">
//                   {hourlyTrends.map((data, idx) => (
//                     <div key={idx} className="flex items-center gap-2 sm:gap-3">
//                       <div className="text-xs sm:text-sm font-semibold text-gray-700 w-12 sm:w-16">{data.hour}</div>
//                       <div className="flex-1 bg-gray-100 rounded-full h-7 sm:h-8 overflow-hidden relative">
//                         <div
//                           className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-2 sm:pr-3 transition-all duration-500"
//                           style={{ width: `${(data.count / maxHourlyValue) * 100}%` }}
//                         >
//                           <span className="text-xs font-bold text-white">{data.count}</span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Vehicle Types & Top Vendors */}
//               <div className="space-y-4 sm:space-y-6">
//                 {/* Vehicle Types */}
//                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
//                   <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Vehicle Type Distribution</h2>
//                   <div className="space-y-2.5 sm:space-y-3">
//                     {vehicleTypes.map((type, idx) => (
//                       <div key={idx}>
//                         <div className="flex items-center justify-between mb-1">
//                           <span className="text-xs sm:text-sm text-gray-700">{type.type}</span>
//                           <span className="text-xs sm:text-sm font-bold text-gray-900">{type.count}</span>
//                         </div>
//                         <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2 overflow-hidden">
//                           <div
//                             className="bg-blue-600 h-full rounded-full transition-all duration-500"
//                             style={{ width: `${type.percentage}%` }}
//                           ></div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Top Vendors */}
//                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
//                   <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Top Vendors</h2>
//                   <div className="space-y-2.5 sm:space-y-3">
//                     {topVendors.map((vendor, idx) => (
//                       <div key={idx} className="flex items-center justify-between">
//                         <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
//                           <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs sm:text-sm flex-shrink-0 ${
//                             idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-blue-500'
//                           }`}>
//                             {idx + 1}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{vendor.name}</div>
//                             <div className="w-full bg-gray-100 rounded-full h-1 sm:h-1.5 mt-1 overflow-hidden">
//                               <div
//                                 className="bg-green-500 h-full rounded-full transition-all duration-500"
//                                 style={{ width: `${vendor.percentage}%` }}
//                               ></div>
//                             </div>
//                           </div>
//                         </div>
//                         <span className="text-xs sm:text-sm font-bold text-gray-900 ml-2 sm:ml-3 flex-shrink-0">{vendor.trips}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </SupervisorLayout>
//   );
// };

// export default Analytics;

// components/supervisor/analytics.jsx
"use client";
import React, { useState, useEffect } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  Download, Calendar, TrendingUp, TrendingDown, Activity,
  Clock, Car, CheckCircle, XCircle, BarChart3, Loader2
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('last7days');
  const [analytics, setAnalytics] = useState({
    todayTrips: 0,
    todayChange: 0,
    weekTrips: 0,
    avgProcessingTime: "--",
    peakHour: "--",
    totalEntries: 0,
    totalExits: 0,
    activeVehicles: 0,
    avgDuration: "--",
  });

  const [dailyTrends, setDailyTrends] = useState([]);
  const [hourlyTrends, setHourlyTrends] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [topVendors, setTopVendors] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeFilter]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(
        `${API_URL}/api/supervisor/analytics?period=${timeFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(response.data);
      
      if (response.data) {
        setAnalytics(response.data.analytics || analytics);
        setDailyTrends(response.data.dailyTrends || dailyTrends);
        setHourlyTrends(response.data.hourlyTrends || hourlyTrends);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // UPDATED DOWNLOAD FUNCTION
  const handleDownloadReport = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      // Show downloading message
      alert('Downloading Excel report...');
      
      // Create the download URL
      const downloadUrl = `${API_URL}/api/supervisor/analytics/export?period=${timeFilter}`;
      
      // Use fetch to get the Excel file
      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      link.setAttribute('download', `analytics-report-${dateStr}.xlsx`);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const maxDailyValue =
    dailyTrends.length > 0
      ? Math.max(...dailyTrends.map(d => Math.max(d.entries, d.exits)))
      : 1;

  const maxHourlyValue =
    hourlyTrends.length > 0
      ? Math.max(...hourlyTrends.map(h => h.count))
      : 1;

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Analytics</h1>
            <p className="text-sm sm:text-base text-gray-600">Overview of traffic and operational efficiency</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold"
            >
              <option value="today">Today</option>
              <option value="last7days">Last 7 Days</option>
            </select>
            <button
              onClick={handleDownloadReport}
              className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Download Report</span>
              <span className="sm:hidden">Download</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 sm:h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600 font-semibold">Loading analytics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Today Trips */}
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Today Trips</div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.todayTrips}</div>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm">
                  {analytics.todayChange >= 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      <span className="text-green-600 font-semibold">+{analytics.todayChange}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                      <span className="text-red-600 font-semibold">{analytics.todayChange}%</span>
                    </>
                  )}
                  <span className="text-gray-500 ml-1">from yesterday</span>
                </div>
              </div>

              {/* Last 7 Days Trips */}
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Last 7 Days Trips</div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.weekTrips}</div>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Consistent with last week</div>
              </div>

              {/* Avg Processing Time */}
              <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div>
                    <div className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Avg. Processing Time</div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{analytics.avgProcessingTime}</div>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs sm:text-sm">
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <span className="text-green-600 font-semibold">{Math.abs(analytics.timeImprovement)} min improvement</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Daily Trends - Large */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Vehicle Traffic Trends (Daily)</h2>
                    <p className="text-xs sm:text-sm text-gray-600">Entry and exit patterns over the week</p>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-600 rounded"></div>
                      <span className="text-gray-600">Entries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-400 rounded"></div>
                      <span className="text-gray-600">Exits</span>
                    </div>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="h-48 sm:h-64 lg:h-80">
                  <div className="flex items-end justify-between h-full gap-2 sm:gap-4">
                    {dailyTrends.map((data, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full">
                        <div className="flex-1 w-full flex items-end justify-center gap-0.5 sm:gap-1">
                          {/* Entries Bar */}
                          <div className="relative flex-1 flex flex-col justify-end group">
                            <div
                              className="bg-blue-600 rounded-t hover:bg-blue-700 transition cursor-pointer"
                              style={{ height: `${(data.entries / maxDailyValue) * 100}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                {data.entries} entries
                              </div>
                            </div>
                          </div>
                          {/* Exits Bar */}
                          <div className="relative flex-1 flex flex-col justify-end group">
                            <div
                              className="bg-gray-400 rounded-t hover:bg-gray-500 transition cursor-pointer"
                              style={{ height: `${(data.exits / maxDailyValue) * 100}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                {data.exits} exits
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-700">{data.day}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                {/* Peak Hours */}
                <div className="bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl p-4 sm:p-6 text-white">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-xs sm:text-sm opacity-90">Peak Traffic Hours</div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mb-1">{analytics.peakHour}</div>
                  <div className="text-xs sm:text-sm opacity-75">Highest activity period</div>
                </div>

                {/* Total Stats */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
                  <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Today's Summary</h3>
                  <div className="space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600">Total Entries</span>
                      </div>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{analytics.totalEntries}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600">Total Exits</span>
                      </div>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{analytics.totalExits}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Car className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600">Currently Inside</span>
                      </div>
                      <span className="font-bold text-purple-600 text-sm sm:text-base">{analytics.activeVehicles}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2.5 sm:pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                        <span className="text-xs sm:text-sm text-gray-600">Avg Duration</span>
                      </div>
                      <span className="font-bold text-gray-900 text-sm sm:text-base">{analytics.avgDuration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Hourly Trends */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">Hourly Traffic Distribution</h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Vehicle movements by hour of day</p>

                <div className="space-y-2.5 sm:space-y-3">
                  {hourlyTrends.map((data, idx) => (
                    <div key={idx} className="flex items-center gap-2 sm:gap-3">
                      <div className="text-xs sm:text-sm font-semibold text-gray-700 w-12 sm:w-16">{data.hour}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-7 sm:h-8 overflow-hidden relative">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-2 sm:pr-3 transition-all duration-500"
                          style={{ width: `${(data.count / maxHourlyValue) * 100}%` }}
                        >
                          <span className="text-xs font-bold text-white">{data.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle Types & Top Vendors */}
              <div className="space-y-4 sm:space-y-6">
                {/* Vehicle Types */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Vehicle Type Distribution</h2>
                  <div className="space-y-2.5 sm:space-y-3">
                    {vehicleTypes.map((type, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs sm:text-sm text-gray-700">{type.type}</span>
                          <span className="text-xs sm:text-sm font-bold text-gray-900">{type.count}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${type.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Vendors */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Top Vendors</h2>
                  <div className="space-y-2.5 sm:space-y-3">
                    {topVendors.map((vendor, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs sm:text-sm flex-shrink-0 ${
                            idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-blue-500'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{vendor.name}</div>
                            <div className="w-full bg-gray-100 rounded-full h-1 sm:h-1.5 mt-1 overflow-hidden">
                              <div
                                className="bg-green-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${vendor.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-gray-900 ml-2 sm:ml-3 flex-shrink-0">{vendor.trips}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </SupervisorLayout>
  );
};

export default Analytics;