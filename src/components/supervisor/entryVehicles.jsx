// components/supervisor/entryVehicles.jsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  Camera, Upload, X, CheckCircle, AlertCircle, Loader2,
  Car, Package, FileText, Video, ArrowRight, ArrowLeft, Truck, RotateCw
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Vehicle Types
const VEHICLE_TYPES = [
  // Heavy Commercial Vehicles
  { value: "TRUCK_12_WHEEL", label: "Truck 12 Wheel" },
  { value: "TRUCK_10_WHEEL", label: "Truck 10 Wheel" },
  { value: "TRUCK_6_WHEEL", label: "Truck 6 Wheel" },
  { value: "TRAILER", label: "Trailer" },
  { value: "DUMPER", label: "Dumper" },
  { value: "TIPPER", label: "Tipper" },
  
  // Medium / Light Commercial
  { value: "PICKUP", label: "Pickup" },
  { value: "LCV", label: "LCV" },
  { value: "VAN", label: "Van" },
  
  // Special Purpose
  { value: "TANKER", label: "Tanker" },
  { value: "CRANE", label: "Crane" },
  { value: "BULKER", label: "Bulker" },
  { value: "CONCRETE_MIXER", label: "Concrete Mixer" },
  
  // Construction / Site Vehicles
  { value: "EXCAVATOR", label: "Excavator" },
  { value: "JCB", label: "JCB" },
  { value: "BULLDOZER", label: "Bulldozer" },
  { value: "ROLLER", label: "Roller" },
  { value: "FORKLIFT", label: "Forklift" },
  
  // Passenger / Staff
  { value: "CAR", label: "Car" },
  { value: "BIKE", label: "Bike" },
  { value: "BUS", label: "Bus" },
  { value: "VISITOR", label: "Visitor" },
  
  // Others
  { value: "OTHER", label: "Other" }
];

const EntryVehicles = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [cameraView, setCameraView] = useState(null); // 'challan' or null
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Vehicle Type Autocomplete
  const [vehicleTypeInput, setVehicleTypeInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredVehicleTypes, setFilteredVehicleTypes] = useState([]);
 
  // Step 1 - ANPR Data
  const [anprData, setAnprData] = useState({
    vehicleNumber: '',
    capturedImage: null,
    confidence: 0,
    timestamp: '',
    cameraId: 'Main Gate (In)'
  });

  // Step 2 - Vehicle Details
  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleType: '',
    vendorId: '',
    materialType: '',
    materialCount: '',
    loadStatus: 'full',
    challanImage: null,
    notes: ''
  });

  // Step 3 - Media Capture
  const [mediaCapture, setMediaCapture] = useState({
    frontView: null,
    backView: null,
    driverView: null,
    loadView: null,
    videoClip: null
  });

  useEffect(() => {
    fetchVendors();
    simulateANPRCapture();
    
    return () => {
      stopCamera();
    };
  }, []);

  // Vehicle Type Autocomplete Logic
  useEffect(() => {
    if (vehicleTypeInput.trim()) {
      const filtered = VEHICLE_TYPES.filter(type =>
        type.label.toLowerCase().includes(vehicleTypeInput.toLowerCase()) ||
        type.value.toLowerCase().includes(vehicleTypeInput.toLowerCase())
      );
      setFilteredVehicleTypes(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredVehicleTypes(VEHICLE_TYPES);
      setShowSuggestions(false);
    }
  }, [vehicleTypeInput]);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${API_URL}/api/supervisor/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      // Mock data
      setVendors([
        { _id: '1', name: 'Blue Dart Logistics' },
        { _id: '2', name: 'Amazon Supplies' },
        { _id: '3', name: 'Indian Oil Corp' },
        { _id: '4', name: 'Tech Solutions Ltd' },
        { _id: '5', name: 'Local Supply Co' }
      ]);
    }
  };

  const simulateANPRCapture = () => {
    setAnprData({
      vehicleNumber: 'MH12-DE-1992',
      capturedImage: '/placeholder-vehicle.jpg',
      confidence: 98.5,
      timestamp: new Date().toLocaleString(),
      cameraId: 'Main Gate (In)'
    });
  };

  // Camera Functions
  const startCamera = async (type) => {
    setCameraView(type);
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported');
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => console.error('Error playing video:', err));
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      alert('Could not access camera. Please check permissions.');
      setCameraView(null);
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
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => console.error('Error playing video:', err));
        };
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      alert('Could not switch camera');
      setFacingMode(facingMode === 'user' ? 'environment' : 'user');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      alert('Camera not ready');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (canvas.width === 0 || canvas.height === 0) {
      alert('Camera not ready. Please wait.');
      return;
    }
    
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.85);
    
    if (cameraView === 'challan') {
      setVehicleDetails(prev => ({ ...prev, challanImage: imageData }));
    }

    stopCamera();
    setCameraView(null);
  };

  const cancelCamera = () => {
    stopCamera();
    setCameraView(null);
  };

  const handleFileUpload = (field, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (step === 2) {
          setVehicleDetails(prev => ({ ...prev, [field]: reader.result }));
        } else if (step === 3) {
          setMediaCapture(prev => ({ ...prev, [field]: reader.result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCaptureImage = (field) => {
    const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    setMediaCapture(prev => ({ ...prev, [field]: dummyImage }));
  };

  const handleVehicleTypeSelect = (type) => {
    setVehicleTypeInput(type.label);
    setVehicleDetails({ ...vehicleDetails, vehicleType: type.value });
    setShowSuggestions(false);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!anprData.vehicleNumber) {
        alert('Vehicle number is required');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!vehicleDetails.vehicleType) {
        alert('Please select vehicle type');
        return;
      }
      // Removed challan validation - now optional
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleAllowEntry = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      const entryData = {
        vehicleNumber: anprData.vehicleNumber,
        vehicleType: vehicleDetails.vehicleType,
        vendorId: vehicleDetails.vendorId,
        materialType: vehicleDetails.materialType,
        materialCount: vehicleDetails.materialCount,
        loadStatus: vehicleDetails.loadStatus,
        notes: vehicleDetails.notes,
        entryTime: new Date().toISOString(),
        capturedBy: 'supervisor',
        media: {
          anprImage: anprData.capturedImage,
          challanImage: vehicleDetails.challanImage,
          frontView: mediaCapture.frontView,
          backView: mediaCapture.backView,
          driverView: mediaCapture.driverView,
          loadView: mediaCapture.loadView,
          videoClip: mediaCapture.videoClip
        }
      };

      await axios.post(`${API_URL}/api/supervisor/vehicles/entry`, entryData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('✅ Vehicle entry allowed successfully!');
      resetForm();
    } catch (error) {
      console.error('Error allowing entry:', error);
      alert(error.response?.data?.message || 'Failed to allow entry');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setVehicleTypeInput('');
    setVehicleDetails({
      vehicleType: '',
      vendorId: '',
      materialType: '',
      materialCount: '',
      loadStatus: 'full',
      challanImage: null,
      notes: ''
    });
    setMediaCapture({
      frontView: null,
      backView: null,
      driverView: null,
      loadView: null,
      videoClip: null
    });
    simulateANPRCapture();
  };

  return (
    <SupervisorLayout>
      <div className="max-w-6xl mx-auto">
        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera View */}
        {cameraView && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="bg-black/80 backdrop-blur-sm p-4 flex items-center justify-between">
              <button
                onClick={cancelCamera}
                className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-white font-semibold text-center">
                <div>Capture {cameraView === 'challan' ? 'Challan/Bill' : ''}</div>
                <div className="text-xs text-gray-300 mt-1">Position document in frame</div>
              </div>

              <button
                onClick={switchCamera}
                className="p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
              >
                <RotateCw className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />
              
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/50 rounded-lg"></div>
              </div>
            </div>

            <div className="bg-black/80 backdrop-blur-sm p-6 flex justify-center items-center">
              <button
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition shadow-xl relative"
              >
                <div className="w-16 h-16 bg-white border-4 border-gray-800 rounded-full"></div>
                <Camera className="absolute w-8 h-8 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">New Vehicle Entry</h1>
          <p className="text-gray-600">Step {step}: {step === 1 ? 'Vehicle Identification' : step === 2 ? 'Vehicle & Driver Details' : 'Media Capture & Validation'}</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    s === step
                      ? 'bg-blue-600 text-white'
                      : s < step
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {s < step ? <CheckCircle className="w-6 h-6" /> : s}
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${s === step ? 'text-blue-600' : s < step ? 'text-green-600' : 'text-gray-500'}`}>
                      Step {s}
                    </div>
                    <div className="text-xs text-gray-500">
                      {s === 1 ? 'Arrival' : s === 2 ? 'Details' : 'Media'}
                    </div>
                  </div>
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-4 ${s < step ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: ANPR Capture */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ANPR Preview */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-900 h-80 flex items-center justify-center relative">
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE FEED - CAM 01
                </div>
                <div className="text-white text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm opacity-75">ANPR Camera Live View</p>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-white text-xs mb-1">Vehicle Detected in Zone</div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-white">{anprData.vehicleNumber}</div>
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      {anprData.confidence}% Confidence
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ANPR Result */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">ANPR Capture Result</h3>
              <p className="text-sm text-gray-600 mb-4">Confirm vehicle number before proceeding.</p>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-xs text-blue-600 font-semibold mb-1">CAPTURED IMAGE CROP</div>
                  <div className="h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">[ Plate Crop Image Placeholder ]</span>
                  </div>
                  <div className="flex items-center justify-center gap-4 bg-white border-2 border-blue-600 rounded-lg p-4">
                    <div className="text-4xl font-bold text-gray-900">{anprData.vehicleNumber}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Confidence</span>
                    <span className="font-bold text-green-600">{anprData.confidence}%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Capture Time</span>
                    <span className="font-semibold text-gray-900">{anprData.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Camera ID</span>
                    <span className="font-semibold text-gray-900">{anprData.cameraId}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Vehicle Type</span>
                    <span className="font-semibold text-gray-900">Four Wheeler</span>
                  </div>
                </div>

                <button
                  onClick={() => simulateANPRCapture()}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold text-sm"
                >
                  Capture Again
                </button>

                <button
                  onClick={handleNext}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
                >
                  Proceed to Check-in
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle Details */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Entry Details</h3>
            <p className="text-sm text-gray-600 mb-6">Please fill in the consignment and vehicle information below.</p>

            <div className="space-y-5">
              {/* Vehicle Number (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Number</label>
                <input
                  type="text"
                  value={anprData.vehicleNumber}
                  disabled
                  className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-lg font-bold text-blue-900"
                />
              </div>

              {/* Vehicle Type with Autocomplete */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vehicle Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Truck className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={vehicleTypeInput}
                    onChange={(e) => setVehicleTypeInput(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Type or select vehicle type..."
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && filteredVehicleTypes.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredVehicleTypes.map((type) => (
                        <div
                          key={type.value}
                          onClick={() => handleVehicleTypeSelect(type)}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-semibold text-gray-900">{type.label}</div>
                          <div className="text-xs text-gray-500">{type.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Start typing to see suggestions or select from dropdown</p>
              </div>

              {/* Vendor Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vendor / Transporter <span className="text-gray-400">(Optional)</span>
                </label>
                <select
                  value={vehicleDetails.vendorId}
                  onChange={(e) => setVehicleDetails({ ...vehicleDetails, vendorId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select Vendor...</option>
                  {vendors.map(vendor => (
                    <option key={vendor._id} value={vendor._id}>{vendor.name}</option>
                  ))}
                </select>
              </div>

              {/* Load Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Load Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {['full', 'partial', 'empty'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setVehicleDetails({ ...vehicleDetails, loadStatus: status })}
                      className={`px-4 py-3 rounded-lg font-semibold transition ${
                        vehicleDetails.loadStatus === status
                          ? 'bg-blue-600 text-white border-2 border-blue-600'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)} Load
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Material Type <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={vehicleDetails.materialType}
                  onChange={(e) => setVehicleDetails({ ...vehicleDetails, materialType: e.target.value })}
                  placeholder="e.g. Steel Rods, Cement Bags..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Count of Material */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Count of Material <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={vehicleDetails.materialCount}
                  onChange={(e) => setVehicleDetails({ ...vehicleDetails, materialCount: e.target.value })}
                  placeholder="e.g. 50 bags, 10 boxes, 500 kg..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Challan / Bill - Camera Capture - NOW OPTIONAL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Challan / Bill Capture <span className="text-gray-400">(Optional)</span>
                </label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  vehicleDetails.challanImage ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                }`}>
                  {vehicleDetails.challanImage ? (
                    <div className="space-y-3">
                      <img 
                        src={vehicleDetails.challanImage} 
                        alt="Challan"
                        className="w-full h-48 object-cover rounded-lg mb-2"
                      />
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                      <p className="text-sm font-semibold text-green-700">Challan captured successfully!</p>
                      <button
                        onClick={() => setVehicleDetails({ ...vehicleDetails, challanImage: null })}
                        className="text-sm text-red-600 hover:text-red-700 font-semibold"
                      >
                        Remove & Capture Again
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 mb-3">Capture challan/bill using camera (Optional)</p>
                      <button
                        type="button"
                        onClick={() => startCamera('challan')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                      >
                        Open Camera
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Remarks <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  value={vehicleDetails.notes}
                  onChange={(e) => setVehicleDetails({ ...vehicleDetails, notes: e.target.value })}
                  rows={3}
                  placeholder="Add any additional notes here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
                >
                  Next Step
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Media Capture - UNCHANGED */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Required Photos</h3>
                  <p className="text-sm text-gray-600">Tap a card to capture image from connected tablet camera.</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Vehicle: </div>
                  <div className="text-lg font-bold text-blue-600">{anprData.vehicleNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'frontView', label: 'Front View', desc: 'Capture number plate & cabin' },
                  { key: 'backView', label: 'Back View', desc: 'Capture tail & cargo doors' },
                  { key: 'driverView', label: 'Driver / Cabin', desc: 'Driver photo or empty cabin' },
                  { key: 'loadView', label: 'Material / Load', desc: 'Visible cargo or empty bed' }
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`relative border-2 border-dashed rounded-lg p-6 transition cursor-pointer ${
                      mediaCapture[item.key]
                        ? 'border-green-300 bg-green-50'
                        : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                    }`}
                    onClick={() => !mediaCapture[item.key] && handleCaptureImage(item.key)}
                  >
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        mediaCapture[item.key] ? 'bg-green-600 text-white' : 'bg-red-100 text-red-700'
                      }`}>
                        Required
                      </span>
                    </div>

                    {mediaCapture[item.key] ? (
                      <div className="text-center">
                        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <div className="font-bold text-gray-900 mb-1">{item.label}</div>
                        <p className="text-xs text-gray-600 mb-3">{item.desc}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMediaCapture({ ...mediaCapture, [item.key]: null });
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Retake Photo
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                        <div className="font-bold text-gray-900 mb-1">{item.label}</div>
                        <p className="text-xs text-gray-600">{item.desc}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Video */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Video Evidence <span className="text-gray-400 font-normal text-sm">(Optional)</span></h3>
              <p className="text-sm text-gray-600 mb-4">Record a 360° walkaround of the vehicle</p>

              <div className={`border-2 border-dashed rounded-lg p-8 text-center ${
                mediaCapture.videoClip ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}>
                {mediaCapture.videoClip ? (
                  <div>
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-green-700 mb-3">Video clip recorded!</p>
                    <button
                      onClick={() => setMediaCapture({ ...mediaCapture, videoClip: null })}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Remove Video
                    </button>
                  </div>
                ) : (
                  <div>
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-4">Record Video Clip</p>
                    <button
                      onClick={() => {
                        setMediaCapture({ ...mediaCapture, videoClip: 'dummy-video-data' });
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      Start Recording
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={handleBack}
                className="py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
              >
                Back
              </button>
              <button
                onClick={resetForm}
                className="py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition font-semibold"
              >
                Cancel Entry
              </button>
              <button
                onClick={handleAllowEntry}
                disabled={loading || !mediaCapture.frontView || !mediaCapture.backView || !mediaCapture.driverView || !mediaCapture.loadView}
                className="py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Allow Entry'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </SupervisorLayout>
  );
};

export default EntryVehicles;
