// components/supervisor/exitVehicles.jsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  Search, ArrowRight, Loader2, Package, Clock, CheckCircle,
  Camera, Video, X, ArrowLeft, RotateCw
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ExitVehicles = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'process' or 'camera'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [cameraField, setCameraField] = useState(null); // Track which field is being captured
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [exitData, setExitData] = useState({
    exitLoadStatus: 'empty',
    returnMaterialType: '',
    papersVerified: true,
    physicalInspection: false,
    materialMatched: false,
    exitNotes: '',
    exitMedia: {
      frontView: null,
      backView: null,
      loadView: null,
      videoClip: null
    }
  });

  useEffect(() => {
    fetchActiveVehicles();
    
    // Cleanup camera on unmount
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    applySearchFilter();
  }, [searchQuery, activeVehicles]);

  const fetchActiveVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/api/supervisor/vehicles/active`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Active vehicles response:', response.data);
      
      // Extract data from response - handle both response.data.data and response.data
      const data = response.data.data || response.data || [];
      const vehiclesArray = Array.isArray(data) ? data : [];
      
      setActiveVehicles(vehiclesArray);
      setFilteredVehicles(vehiclesArray);
    } catch (error) {
      console.error('Error fetching active vehicles:', error);
      setActiveVehicles([]);
      setFilteredVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const applySearchFilter = () => {
    if (!searchQuery.trim()) {
      setFilteredVehicles(activeVehicles);
      return;
    }
    
    const filtered = activeVehicles.filter(v =>
      (v.vehicleNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.vendor || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.driver || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredVehicles(filtered);
  };

  const handleSearch = () => {
    applySearchFilter();
  };

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentView('process');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedVehicle(null);
    resetExitData();
  };

  const resetExitData = () => {
    setExitData({
      exitLoadStatus: 'empty',
      returnMaterialType: '',
      papersVerified: true,
      physicalInspection: false,
      materialMatched: false,
      exitNotes: '',
      exitMedia: {
        frontView: null,
        backView: null,
        loadView: null,
        videoClip: null
      }
    });
  };

  // Start Camera
  const startCamera = async (field) => {
    try {
      setCameraField(field);
      setCurrentView('camera');
      
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please grant camera permissions.');
      setCurrentView('process');
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Switch Camera (Front/Back)
  const switchCamera = async () => {
    stopCamera();
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    // Restart camera with new facing mode
    try {
      const constraints = {
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error switching camera:', error);
    }
  };

  // Capture Photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    // Save to state
    setExitData(prev => ({
      ...prev,
      exitMedia: { ...prev.exitMedia, [cameraField]: imageData }
    }));

    // Close camera
    stopCamera();
    setCurrentView('process');
  };

  // Cancel Camera
  const cancelCamera = () => {
    stopCamera();
    setCurrentView('process');
  };

  const handleAllowExit = async () => {
    // Validation
    if (exitData.exitLoadStatus === 'loaded' && !exitData.returnMaterialType.trim()) {
      alert('Please enter return material type');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      // Prepare payload matching backend expectations
      const exitPayload = {
        vehicleId: selectedVehicle._id,
        vehicleNumber: selectedVehicle.vehicleNumber,
        exitTime: new Date().toISOString(),
        exitLoadStatus: exitData.exitLoadStatus,
        returnMaterialType: exitData.returnMaterialType || '',
        papersVerified: exitData.papersVerified,
        physicalInspection: exitData.physicalInspection,
        materialMatched: exitData.materialMatched,
        exitNotes: exitData.exitNotes || '',
        exitMedia: {
          frontView: exitData.exitMedia.frontView || '',
          backView: exitData.exitMedia.backView || '',
          loadView: exitData.exitMedia.loadView || '',
          videoClip: exitData.exitMedia.videoClip || ''
        }
      };

      console.log('Exit payload:', exitPayload);

      const response = await axios.post(
        `${API_URL}/api/supervisor/vehicles/exit`, 
        exitPayload, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Exit response:', response.data);

      alert(`✅ Vehicle exit allowed successfully!\nTrip ID: ${response.data.tripId || 'N/A'}`);
      handleBackToList();
      fetchActiveVehicles();
    } catch (error) {
      console.error('Error allowing exit:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to process exit';
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      loading: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Loading' },
      unloading: { bg: 'bg-green-100', text: 'text-green-700', label: 'Unloading' },
      overstay: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Overstay' }
    };
    
    const config = configs[status] || configs.loading;
    return { config, label: config.label };
  };

  return (
    <SupervisorLayout>
      <div className="max-w-7xl mx-auto">
        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* LIST VIEW */}
        {currentView === 'list' && (
          <>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Exit</h1>
              <p className="text-gray-600">Select a vehicle to process exit</p>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search vehicle, vendor, driver..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Search
                </button>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                Showing <span className="font-bold text-blue-600">{filteredVehicles.length}</span> of {activeVehicles.length} vehicles
              </div>
            </div>

            {/* Active Vehicles List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">
                  Active Vehicles ({filteredVehicles.length})
                </h2>
                <p className="text-sm text-gray-600">Select a vehicle to process exit</p>
              </div>

              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading vehicles...</p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No active vehicles</h3>
                  <p className="text-gray-600">
                    {activeVehicles.length === 0 
                      ? 'All vehicles have exited the premises'
                      : 'Try adjusting your search'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredVehicles.map((vehicle) => {
                    const statusInfo = getStatusBadge(vehicle.status);
                    return (
                      <div
                        key={vehicle._id}
                        className="p-5 hover:bg-gray-50 transition"
                      >
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                          <div className="flex-1 w-full">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">{vehicle.vehicleNumber || 'N/A'}</h3>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${statusInfo.config.bg} ${statusInfo.config.text}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-gray-500">Vendor</div>
                                <div className="font-semibold text-gray-900">{vehicle.vendor || 'Unknown'}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Driver</div>
                                <div className="font-semibold text-gray-900">{vehicle.driver || 'N/A'}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Entry Time</div>
                                <div className="font-semibold text-gray-900">{vehicle.entryTime || 'N/A'}</div>
                              </div>
                              <div>
                                <div className="text-gray-500">Duration</div>
                                <div className={`font-semibold ${
                                  vehicle.status === 'overstay' ? 'text-orange-600' : 'text-gray-900'
                                }`}>
                                  {vehicle.duration || '0h 0m'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleSelectVehicle(vehicle)}
                            className="w-full lg:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                          >
                            Allow Exit
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* CAMERA VIEW */}
        {currentView === 'camera' && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Camera Controls */}
            <div className="bg-black/50 backdrop-blur-sm p-4 flex items-center justify-between">
              <button
                onClick={cancelCamera}
                className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-white font-semibold">
                Capture {cameraField === 'frontView' ? 'Front View' : cameraField === 'backView' ? 'Back View' : 'Load View'}
              </div>

              <button
                onClick={switchCamera}
                className="p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
              >
                <RotateCw className="w-6 h-6" />
              </button>
            </div>

            {/* Video Feed */}
            <div className="flex-1 flex items-center justify-center bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Capture Button */}
            <div className="bg-black/50 backdrop-blur-sm p-6 flex justify-center">
              <button
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition shadow-xl"
              >
                <div className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full"></div>
              </button>
            </div>
          </div>
        )}

        {/* PROCESS VIEW */}
        {currentView === 'process' && selectedVehicle && (
          <>
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-semibold"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Vehicle List
              </button>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Exit Process</h1>
              <p className="text-gray-600">Verify details before allowing exit</p>
            </div>

            <div className="space-y-6">
              {/* Vehicle Summary */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Vehicle Summary</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Vehicle Number</div>
                    <div className="text-xl font-bold text-gray-900">{selectedVehicle.vehicleNumber || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Vendor</div>
                    <div className="font-semibold text-gray-900">{selectedVehicle.vendor || 'Unknown'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Driver</div>
                    <div className="font-semibold text-gray-900">{selectedVehicle.driver || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Material Type</div>
                    <div className="font-semibold text-gray-900">{selectedVehicle.materialType || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Entry Time</div>
                    <div className="font-semibold text-gray-900">{selectedVehicle.entryTime || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-1">Duration</div>
                    <div className="font-semibold text-gray-900">{selectedVehicle.duration || '0h 0m'}</div>
                  </div>
                </div>
              </div>

              {/* Exit Checklist */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Exit Checklist</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <input
                      type="checkbox"
                      checked={exitData.papersVerified}
                      onChange={(e) => setExitData({ ...exitData, papersVerified: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Papers Verified</div>
                      <div className="text-xs text-gray-500">Delivery note and challan checked</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <input
                      type="checkbox"
                      checked={exitData.physicalInspection}
                      onChange={(e) => setExitData({ ...exitData, physicalInspection: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Physical Inspection Done</div>
                      <div className="text-xs text-gray-500">Vehicle condition inspected</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                    <input
                      type="checkbox"
                      checked={exitData.materialMatched}
                      onChange={(e) => setExitData({ ...exitData, materialMatched: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Material Count Matched</div>
                      <div className="text-xs text-gray-500">Loaded/unloaded items verified</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Exit Load Status */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Exit Load Status</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {['empty', 'returned', 'loaded'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setExitData({ ...exitData, exitLoadStatus: status })}
                      className={`px-4 py-3 rounded-lg font-semibold transition ${
                        exitData.exitLoadStatus === status
                          ? 'bg-blue-600 text-white border-2 border-blue-600'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Material Type Input */}
                {exitData.exitLoadStatus === 'loaded' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Return Material Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={exitData.returnMaterialType}
                      onChange={(e) => setExitData({ ...exitData, returnMaterialType: e.target.value })}
                      placeholder="e.g. Empty Drums, Pallets, Equipment..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Specify what material the vehicle is carrying while exiting
                    </p>
                  </div>
                )}
              </div>

              {/* Exit Evidence */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Exit Evidence</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { key: 'frontView', label: 'Front View' },
                    { key: 'backView', label: 'Back View' },
                    { key: 'loadView', label: 'Load Area' }
                  ].map((item) => (
                    <div
                      key={item.key}
                      onClick={() => startCamera(item.key)}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                        exitData.exitMedia[item.key]
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {exitData.exitMedia[item.key] ? (
                        <div>
                          <img 
                            src={exitData.exitMedia[item.key]} 
                            alt={item.label}
                            className="w-full h-32 object-cover rounded-lg mb-2"
                          />
                          <div className="font-semibold text-gray-900 text-sm mb-1">{item.label}</div>
                          <div className="text-xs text-green-600 mb-2">Captured</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExitData(prev => ({
                                ...prev,
                                exitMedia: { ...prev.exitMedia, [item.key]: null }
                              }));
                            }}
                            className="text-xs text-red-600 hover:text-red-700 font-semibold"
                          >
                            Retake
                          </button>
                        </div>
                      ) : (
                        <div>
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                          <div className="text-xs text-gray-500">Tap to capture</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Supervisor Remarks */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Supervisor Remarks <span className="text-gray-400 font-normal text-sm">(Optional)</span>
                </h2>
                <textarea
                  value={exitData.exitNotes}
                  onChange={(e) => setExitData({ ...exitData, exitNotes: e.target.value })}
                  rows={3}
                  placeholder="Enter any observations, issues, or special notes..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleBackToList}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
                >
                  Hold Exit
                </button>
                <button
                  onClick={handleAllowExit}
                  disabled={loading}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing Exit...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Approve & Allow Exit
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </SupervisorLayout>
  );
};

export default ExitVehicles;