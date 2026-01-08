// components/supervisor/entryVehicles.jsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  Camera, Upload, X, CheckCircle, AlertCircle, Loader2,
  Car, Package, FileText, Video, ArrowRight, ArrowLeft, Truck, RotateCw, StopCircle, User
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ANPR_WEBHOOK_URL = 'https://webhooks.nexcorealliance.com/api/anpr/events';

// Vehicle Types
const VEHICLE_TYPES = [
  { value: "TRUCK_12_WHEEL", label: "Truck 12 Wheel" },
  { value: "TRUCK_10_WHEEL", label: "Truck 10 Wheel" },
  { value: "TRUCK_6_WHEEL", label: "Truck 6 Wheel" },
  { value: "TRAILER", label: "Trailer" },
  { value: "DUMPER", label: "Dumper" },
  { value: "TIPPER", label: "Tipper" },
  { value: "PICKUP", label: "Pickup" },
  { value: "LCV", label: "LCV" },
  { value: "VAN", label: "Van" },
  { value: "TANKER", label: "Tanker" },
  { value: "CRANE", label: "Crane" },
  { value: "BULKER", label: "Bulker" },
  { value: "CONCRETE_MIXER", label: "Concrete Mixer" },
  { value: "EXCAVATOR", label: "Excavator" },
  { value: "JCB", label: "JCB" },
  { value: "BULLDOZER", label: "Bulldozer" },
  { value: "ROLLER", label: "Roller" },
  { value: "FORKLIFT", label: "Forklift" },
  { value: "CAR", label: "Car" },
  { value: "BIKE", label: "Bike" },
  { value: "BUS", label: "Bus" },
  { value: "VISITOR", label: "Visitor" },
  { value: "OTHER", label: "Other" }
];

const EntryVehicles = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [cameraView, setCameraView] = useState(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  
  // ANPR Live Feed State
  const [isANPRListening, setIsANPRListening] = useState(false);
  const [anprError, setAnprError] = useState(null);
  const pollingIntervalRef = useRef(null);
  
  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  
  // Driver Name
  const [driverName, setDriverName] = useState('');
  
  const [vehicleTypeInput, setVehicleTypeInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredVehicleTypes, setFilteredVehicleTypes] = useState([]);
  const [customVehicleType, setCustomVehicleType] = useState('');
  const [vendorInputMode, setVendorInputMode] = useState('select');
  const [manualVendorName, setManualVendorName] = useState('');
 
  const [anprData, setAnprData] = useState({
    vehicleNumber: '',
    capturedImage: null,
    frameImage: null,
    confidence: 0,
    timestamp: '',
    cameraId: 'Main Gate (In)'
  });

  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleType: '',
    vendorId: '',
    materialType: '',
    materialCount: '',
    loadStatus: 'full',
    challanImage: null,
    notes: ''
  });

  const [mediaCapture, setMediaCapture] = useState({
    frontView: null,
    backView: null,
    driverView: null,
    loadView: null,
    videoClip: null
  });

// Helper function to convert base64 to image URL
  const base64ToImageUrl = (base64String) => {
    if (!base64String) return null;
    
    // Check if it already has data URL prefix
    if (base64String.startsWith('data:image')) {
      return base64String;
    }
    
    // Add proper prefix for JPEG images
    return `data:image/jpeg;base64,${base64String}`;
  };

  // Fetch latest ANPR event
  const fetchLatestANPREvent = async () => {
    try {
      const response = await axios.get(`${ANPR_WEBHOOK_URL}?limit=1`);
      
      if (response.data) {
        const anprEvent = response.data;
        
        // Extract number plate and images from the response
        const numberPlate = anprEvent.numberPlate || anprEvent.plate || '';
        const plateImage = anprEvent.image || anprEvent.plateImage || null;
        const frameImage = anprEvent.frame || anprEvent.frameImage || null;
        
        // Only update if we have a number plate
        if (numberPlate) {
          // Update ANPR data with images converted from base64
          setAnprData({
            vehicleNumber: numberPlate,
            capturedImage: base64ToImageUrl(plateImage),
            frameImage: base64ToImageUrl(frameImage),
            confidence: anprEvent.confidence || 95,
            timestamp: anprEvent.timestamp 
              ? new Date(anprEvent.timestamp?.$date || anprEvent.timestamp).toLocaleString()
              : new Date().toLocaleString(),
            cameraId: anprEvent.cameraName || anprEvent.cameraId || 'Main Gate (In)'
          });
          
          setAnprError(null);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error fetching ANPR event:', error);
      setAnprError('Failed to fetch ANPR data');
      return false;
    }
  };
  // Start polling for ANPR events
  const startANPRPolling = () => {
    setIsANPRListening(true);
    
    // Fetch immediately
    fetchLatestANPREvent();
    
    // Then poll every 2 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchLatestANPREvent();
    }, 2000);
  };

  // Stop polling
  const stopANPRPolling = () => {
    setIsANPRListening(false);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  useEffect(() => {
    fetchVendors();
    startANPRPolling(); // Start listening to ANPR events
    
    return () => {
      stopCamera();
      stopANPRPolling();
      if (isRecording) stopRecording();
    };
  }, []);

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
      const response = await axios.get(`${API_URL}/api/project/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVendors(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

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
        audio: type === 'video'
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => console.error('Error playing video:', err));
        };
      }

      if (type === 'video') {
        startVideoRecording(mediaStream);
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
    const wasRecording = isRecording;
    if (wasRecording) {
      stopRecording();
    }
    
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
        audio: cameraView === 'video'
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => console.error('Error playing video:', err));
        };
      }

      if (wasRecording && cameraView === 'video') {
        startVideoRecording(mediaStream);
      }
    } catch (error) {
      console.error('Error switching camera:', error);
      alert('Could not switch camera');
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
    } else if (['frontView', 'backView', 'driverView', 'loadView'].includes(cameraView)) {
      setMediaCapture(prev => ({ ...prev, [cameraView]: imageData }));
    }

    stopCamera();
    setCameraView(null);
  };

  const startVideoRecording = (mediaStream) => {
    try {
      const options = { mimeType: 'video/webm;codecs=vp9' };
      
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm';
      }
      
      const recorder = new MediaRecorder(mediaStream, options);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaCapture(prev => ({ ...prev, videoClip: reader.result }));
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not start video recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      
      stopCamera();
      setCameraView(null);
      setRecordingTime(0);
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cancelCamera = () => {
    if (isRecording) {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      setIsRecording(false);
      setRecordingTime(0);
    }
    stopCamera();
    setCameraView(null);
  };

  const handleVehicleTypeSelect = (type) => {
    setVehicleTypeInput(type.label);
    setVehicleDetails({ ...vehicleDetails, vehicleType: type.value });
    setShowSuggestions(false);
    
    if (type.value !== 'OTHER') {
      setCustomVehicleType('');
    }
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
      if (vehicleDetails.vehicleType === 'OTHER' && !customVehicleType.trim()) {
        alert('Please enter custom vehicle type');
        return;
      }
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

      const finalVehicleType = vehicleDetails.vehicleType === 'OTHER' 
        ? customVehicleType 
        : vehicleDetails.vehicleType;

      const finalVendor = vendorInputMode === 'manual' 
        ? manualVendorName 
        : vehicleDetails.vendorId;

      const entryData = {
        vehicleNumber: anprData.vehicleNumber,
        driverName: driverName,
        vehicleType: finalVehicleType,
        vendorId: vendorInputMode === 'select' ? finalVendor : null,
        vendorName: vendorInputMode === 'manual' ? finalVendor : null,
        materialType: vehicleDetails.materialType,
        materialCount: vehicleDetails.materialCount,
        loadStatus: vehicleDetails.loadStatus,
        notes: vehicleDetails.notes,
        entryTime: new Date().toISOString(),
        capturedBy: 'supervisor',
        media: {
          anprImage: anprData.capturedImage,
          anprFrame: anprData.frameImage,
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
    setDriverName('');
    setVehicleTypeInput('');
    setCustomVehicleType('');
    setVendorInputMode('select');
    setManualVendorName('');
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
    setRecordingTime(0);
  };

  const getCameraLabel = () => {
    const labels = {
      'challan': 'Challan/Bill',
      'frontView': 'Front View',
      'backView': 'Back View',
      'driverView': 'Driver/Cabin',
      'loadView': 'Material/Load',
      'video': 'Video Recording'
    };
    return labels[cameraView] || 'Photo';
  };

  return (
    <SupervisorLayout>
      <div className="max-w-6xl mx-auto">
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
                <div>{cameraView === 'video' ? 'Recording Video' : `Capture ${getCameraLabel()}`}</div>
                {isRecording && (
                  <div className="text-sm text-red-400 mt-1 flex items-center justify-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    REC {formatRecordingTime(recordingTime)}
                  </div>
                )}
                {!isRecording && cameraView !== 'video' && (
                  <div className="text-xs text-gray-300 mt-1">Position in frame and tap capture</div>
                )}
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
                muted={cameraView !== 'video'}
                className="w-full h-full object-cover"
                style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />
              
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/50 rounded-lg"></div>
              </div>
            </div>

            <div className="bg-black/80 backdrop-blur-sm p-6 flex justify-center items-center">
              {cameraView === 'video' ? (
                <button
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-xl disabled:opacity-50"
                >
                  <StopCircle className="w-10 h-10 text-white" />
                </button>
              ) : (
                <button
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition shadow-xl relative"
                >
                  <div className="w-16 h-16 bg-white border-4 border-gray-800 rounded-full"></div>
                  <Camera className="absolute w-8 h-8 text-gray-600" />
                </button>
              )}
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
                    s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-900 h-80 flex items-center justify-center relative">
                <div className={`absolute top-4 left-4 px-3 py-1 rounded text-sm font-semibold flex items-center gap-2 ${
                  isANPRListening ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
                }`}>
                  <div className={`w-2 h-2 bg-white rounded-full ${isANPRListening ? 'animate-pulse' : ''}`}></div>
                  {isANPRListening ? 'LIVE FEED - CAM 01' : 'FEED OFFLINE'}
                </div>

                {anprData.frameImage ? (
                  <img 
                    src={anprData.frameImage} 
                    alt="ANPR Frame"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm opacity-75">ANPR Camera Live View</p>
                    {anprError && (
                      <p className="text-xs text-red-400 mt-2">{anprError}</p>
                    )}
                  </div>
                )}

                {anprData.vehicleNumber && (
                  <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-white text-xs mb-1">Vehicle Detected in Zone</div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-white">{anprData.vehicleNumber}</div>
                      <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        {anprData.confidence}% Confidence
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">ANPR Capture Result</h3>
              <p className="text-sm text-gray-600 mb-4">Confirm vehicle number before proceeding.</p>

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-xs text-blue-600 font-semibold mb-1">CAPTURED IMAGE CROP</div>
                  
                  {anprData.capturedImage ? (
                    <img 
                      src={anprData.capturedImage} 
                      alt="Number Plate"
                      className="w-full h-32 object-contain bg-gray-200 rounded-lg mb-3"
                    />
                  ) : (
                    <div className="h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">[ Waiting for plate detection... ]</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center gap-4 bg-white border-2 border-blue-600 rounded-lg p-4">
                    <div className="text-4xl font-bold text-gray-900">
                      {anprData.vehicleNumber || 'Detecting...'}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Confidence</span>
                    <span className="font-bold text-green-600">{anprData.confidence}%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Capture Time</span>
                    <span className="font-semibold text-gray-900">{anprData.timestamp || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Camera ID</span>
                    <span className="font-semibold text-gray-900">{anprData.cameraId}</span>
                  </div>
                </div>

                <button
                  onClick={fetchLatestANPREvent}
                  disabled={!isANPRListening}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold text-sm disabled:opacity-50"
                >
                  Refresh Detection
                </button>

                <button
                  onClick={handleNext}
                  disabled={!anprData.vehicleNumber}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Check-in
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle Details with Driver Name */}
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

              {/* Driver Name (NEW - Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Driver Name <span className="text-gray-400">(Optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Enter driver name..."
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">This information will be recorded with the entry</p>
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

              {/* Custom Vehicle Type Input */}
              {vehicleDetails.vehicleType === 'OTHER' && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter Custom Vehicle Type <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customVehicleType}
                    onChange={(e) => setCustomVehicleType(e.target.value)}
                    placeholder="e.g., Mobile Crane, Water Tanker, etc..."
                    className="w-full px-4 py-3 border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none bg-white"
                  />
                  <p className="text-xs text-gray-600 mt-2">Please specify the exact vehicle type</p>
                </div>
              )}

              {/* Vendor Selection with Manual Entry Option */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vendor / Transporter <span className="text-gray-400">(Optional)</span>
                </label>
                
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setVendorInputMode('select');
                      setManualVendorName('');
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      vendorInputMode === 'select'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Select from List
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVendorInputMode('manual');
                      setVehicleDetails({ ...vehicleDetails, vendorId: '' });
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      vendorInputMode === 'manual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Enter Manually
                  </button>
                </div>

                {vendorInputMode === 'select' ? (
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
                ) : (
                  <input
                    type="text"
                    value={manualVendorName}
                    onChange={(e) => setManualVendorName(e.target.value)}
                    placeholder="Enter vendor/transporter name..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                )}
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

              {/* Challan / Bill - Camera Capture */}
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

        {/* Step 3: Media Capture */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Required Photos</h3>
                  <p className="text-sm text-gray-600">Tap a card to capture image from camera.</p>
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
                    onClick={() => !mediaCapture[item.key] && startCamera(item.key)}
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
                        <img 
                          src={mediaCapture[item.key]} 
                          alt={item.label}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
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
                    <p className="text-sm font-semibold text-green-700 mb-3">Video recorded successfully!</p>
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
                    <p className="text-sm text-gray-600 mb-4">Record Video Clip with Camera</p>
                    <button
                      onClick={() => startCamera('video')}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center gap-2 mx-auto"
                    >
                      <Video className="w-5 h-5" />
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
