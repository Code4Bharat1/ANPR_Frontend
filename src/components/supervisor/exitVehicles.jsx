// components/supervisor/exitVehicles.jsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  Search, ArrowRight, Loader2, Package, Clock, CheckCircle,
  Camera, Video, X, ArrowLeft, RotateCw
} from 'lucide-react';
import { base64ToFile, uploadToWasabi } from '@/utils/wasabiUpload';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ExitVehicles = () => {
  const [currentView, setCurrentView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [cameraField, setCameraField] = useState(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [resolvedExitMedia, setResolvedExitMedia] = useState({
    photos: {},
    video: null
  });


  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // State for 4 mandatory photos + 1 optional video
  const [exitData, setExitData] = useState({
    exitLoadStatus: 'empty',
    returnMaterialType: '',
    papersVerified: true,
    physicalInspection: false,
    materialMatched: false,
    exitNotes: '',
    exitMedia: {
      frontView: null,   // ✅ Mandatory
      backView: null,    // ✅ Mandatory
      loadView: null,    // ✅ Mandatory
      driverView: null,  // ✅ Mandatory (4th photo)
      videoClip: null    // ✅ Optional
    }
  });
  const resolveExitMedia = async (exitMedia) => {
    if (!exitMedia) return;

    try {
      const resolvedPhotos = {};

      // 🔹 resolve photos
      if (exitMedia.photos) {
        for (const key in exitMedia.photos) {
          const fileKey = exitMedia.photos[key];
          if (fileKey) {
            const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
              params: { key: fileKey }
            });
            resolvedPhotos[key] = res.data.url;
          }
        }
      }

      // 🔹 resolve video
      let resolvedVideo = null;
      if (exitMedia.video) {
        const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
          params: { key: exitMedia.video }
        });
        resolvedVideo = res.data.url;
      }

      setResolvedExitMedia({
        photos: resolvedPhotos,
        video: resolvedVideo
      });
    } catch (err) {
      console.error("❌ Exit media resolve failed", err);
    }
  };

  useEffect(() => {
    fetchActiveVehicles();

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

      try {
        const response = await axios.get(`${API_URL}/api/supervisor/vehicles/active`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // console.log('Active vehicles response:', response.data);

        const data = response.data.data || response.data || [];
        const vehiclesArray = Array.isArray(data) ? data : [];

        if (vehiclesArray.length > 0) {
          setActiveVehicles(vehiclesArray);
          setFilteredVehicles(vehiclesArray);
          return;
        }
      } catch (apiError) {
        console.warn('API fetch failed:', apiError);
      }

    } catch (error) {
      console.error('Error fetching active vehicles:', error);
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
  useEffect(() => {
    if (selectedVehicle?.exitMedia) {
      resolveExitMedia(selectedVehicle.exitMedia);
    } else {
      setResolvedExitMedia({ photos: {}, video: null });
    }
  }, [selectedVehicle]);

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
        driverView: null,
        videoClip: null
      }
    });
  };

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

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const switchCamera = async () => {
    stopCamera();
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

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

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg', 0.9);

    setExitData(prev => ({
      ...prev,
      exitMedia: { ...prev.exitMedia, [cameraField]: imageData }
    }));

    stopCamera();
    setCurrentView('process');
  };

  const cancelCamera = () => {
    stopCamera();
    setCurrentView('process');
  };

  // Updated handleAllowExit with Wasabi upload
  const handleAllowExit = async () => {
  if (
    exitData.exitLoadStatus === "loaded" &&
    !exitData.returnMaterialType.trim()
  ) {
    alert("Please enter return material type");
    return;
  }

  const REQUIRED_PHOTOS = [
    { key: "frontView", name: "Front View" },
    { key: "backView", name: "Back View" },
    { key: "loadView", name: "Load View" },
    { key: "driverView", name: "Driver View" },
  ];

  const missingPhotos = REQUIRED_PHOTOS.filter(
    (p) => !exitData.exitMedia?.[p.key]
  );

  if (missingPhotos.length > 0) {
    alert(
      `Please capture all mandatory photos:\n${missingPhotos
        .map((p) => `• ${p.name}`)
        .join("\n")}`
    );
    return;
  }

  // ✅ FIXED HERE
  const vehicleId = selectedVehicle?.vehicleId
    ? String(selectedVehicle.vehicleId)
    : null;

  if (!vehicleId) {
    alert("Invalid vehicle selected");
    return;
  }

  try {
    setLoading(true);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Authentication token missing");
      return;
    }

    const uploadedPhotoKeys = {};

    for (const photo of REQUIRED_PHOTOS) {
      const file = base64ToFile(
        exitData.exitMedia[photo.key],
        `${Date.now()}-${photo.key}.jpg`
      );

      const fileKey = await uploadToWasabi(
        file,
        `vehicles/${selectedVehicle.vehicleNumber}/exit/photos`
      );

      uploadedPhotoKeys[photo.key] = fileKey;
    }

    let videoKey = "";
    if (exitData.exitMedia?.videoClip) {
      try {
        const videoFile = base64ToFile(
          exitData.exitMedia.videoClip,
          `${Date.now()}-exit-video.webm`
        );

        videoKey = await uploadToWasabi(
          videoFile,
          `vehicles/${selectedVehicle.vehicleNumber}/exit/videos`
        );
      } catch (err) {
        console.warn("Video upload failed", err);
      }
    }

    const exitPayload = {
      vehicleId, // ✅ Vehicle._id
      vehicleNumber: selectedVehicle.vehicleNumber,
      exitTime: new Date().toISOString(),
      exitLoadStatus: exitData.exitLoadStatus,
      returnMaterialType: exitData.returnMaterialType || "",
      papersVerified: exitData.papersVerified,
      physicalInspection: exitData.physicalInspection,
      materialMatched: exitData.materialMatched,
      exitNotes: exitData.exitNotes || "",
      exitMedia: {
        photos: uploadedPhotoKeys,
        video: videoKey,
      },
    };

    // console.log("🚪 EXIT PAYLOAD:", exitPayload);

    await axios.post(
      `${API_URL}/api/supervisor/vehicles/exit`,
      exitPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    alert("✅ Vehicle exit allowed successfully!");
    handleBackToList();
    fetchActiveVehicles();

  } catch (error) {
    console.error("❌ Exit error:", error);
    alert(error.response?.data?.message || "Failed to process exit");
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
        <canvas ref={canvasRef} className="hidden" />

        {/* LIST VIEW */}
        {currentView === 'list' && (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Exit</h1>
              <p className="text-gray-600">Select a vehicle to process exit</p>
            </div>

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
                                <div className={`font-semibold ${vehicle.status === 'overstay' ? 'text-orange-600' : 'text-gray-900'
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
            {/* Header */}
            <div className="bg-black/80 backdrop-blur-sm p-3 sm:p-4 flex items-center justify-between shrink-0">
              <button
                onClick={cancelCamera}
                className="p-2 sm:p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition active:scale-95"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="text-white font-semibold text-sm sm:text-base">
                Capture {cameraField === 'frontView' ? 'Front View' :
                  cameraField === 'backView' ? 'Back View' :
                    cameraField === 'loadView' ? 'Load View' :
                      cameraField === 'driverView' ? 'Driver View' : 'Photo'}
              </div>

              <button
                onClick={switchCamera}
                className="p-2 sm:p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition active:scale-95"
              >
                <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Video Container */}
            <div className="flex-1 flex items-center justify-center bg-black overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            {/* Capture Button */}
            <div
              className="bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex justify-center items-center shrink-0"
              style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom) + 1rem)' }}
            >
              <button
                onClick={capturePhoto}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center active:scale-95 transition shadow-2xl relative touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white border-4 border-gray-400 rounded-full"></div>
              </button>
            </div>

            {/* Helper text */}
            <div className="absolute bottom-24 sm:bottom-32 left-0 right-0 text-center pointer-events-none">
              <p className="text-white text-sm sm:text-base font-medium drop-shadow-lg px-4">
                Tap the button to capture photo
              </p>
            </div>
          </div>
        )}

        {/* PROCESS VIEW */}
        {currentView === 'process' && selectedVehicle && (
          <>
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
                      className={`px-4 py-3 rounded-lg font-semibold transition ${exitData.exitLoadStatus === status
                        ? 'bg-blue-600 text-white border-2 border-blue-600'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                        }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

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
              {/* ENTRY PHOTOS PREVIEW */}
              {selectedVehicle.entryMedia?.photos && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Entry Evidence (Captured at Entry)
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {['frontView', 'backView', 'loadView', 'driverView'].map((key) => {
                      const photoUrl =
                        selectedVehicle.entryMedia.photos[key]?.startsWith("http")
                          ? selectedVehicle.entryMedia.photos[key]
                          : null;

                      return (
                        <div key={key} className="border rounded-lg overflow-hidden">
                          {photoUrl ? (
                            <img
                              src={photoUrl}
                              className="w-full h-32 object-cover cursor-pointer hover:opacity-90"
                              onClick={() => window.open(photoUrl, '_blank')}
                            />
                          ) : (
                            <div className="h-32 flex items-center justify-center text-gray-400 bg-gray-100">
                              Not Available
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


              {/* Exit Evidence - Updated for 4 photos */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Exit Evidence <span className="text-red-500">*</span>
                </h2>
                <p className="text-sm text-gray-600 mb-4">4 mandatory photos required</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { key: 'frontView', label: 'Front View', description: 'Vehicle front side' },
                    { key: 'backView', label: 'Back View', description: 'Vehicle rear side' },
                    { key: 'loadView', label: 'Load Area', description: 'Cargo/load area' },
                    { key: 'driverView', label: 'Driver View', description: 'Driver identification' }
                  ].map((item) => (
                    <div
                      key={item.key}
                      onClick={() => startCamera(item.key)}
                      className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${exitData.exitMedia[item.key]
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
                          <div className="text-xs text-green-600 mb-2">✓ Captured</div>
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
                          <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <div className="font-semibold text-gray-900 text-sm">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Video Evidence (Optional) */}
                <div className="mt-8">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">
                    Video Evidence <span className="text-gray-400 font-normal text-sm">(Optional)</span>
                  </h3>
                  {exitData.exitMedia.videoClip ? (
                    <div className="border border-green-300 bg-green-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Video className="w-6 h-6 text-green-600" />
                          <div>
                            <div className="font-semibold text-gray-900">Video Captured</div>
                            <div className="text-sm text-gray-600">Optional video evidence</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setExitData(prev => ({
                            ...prev,
                            exitMedia: { ...prev.exitMedia, videoClip: null }
                          }))}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 text-sm">
                      Video recording is optional. You can proceed without it.
                    </div>
                  )}
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