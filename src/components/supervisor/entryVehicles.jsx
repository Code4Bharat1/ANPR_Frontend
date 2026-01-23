// components/supervisor/entryVehicles.jsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  Camera, Upload, X, CheckCircle, AlertCircle, Loader2,
  Car, Package, FileText, Video, ArrowRight, ArrowLeft, Truck, RotateCw, StopCircle, User,
  Clock, Plus, CheckCircle2, Search, Menu, ChevronDown, Building,
  Target, Contrast, Filter, ZoomIn, Settings, Hash, MapPin
} from 'lucide-react';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const SOCKET_URL = 'https://webhooks.nexcorealliance.com';

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
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [sites, setSites] = useState([]);
  const [cameraView, setCameraView] = useState(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  
  // ANPR Live Feed State
  const [socketStatus, setSocketStatus] = useState('disconnected');
  const [anprEvents, setAnprEvents] = useState([]);
  
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
  const [siteInputMode, setSiteInputMode] = useState('select');
  const [manualSiteId, setManualSiteId] = useState('');
  const [manualSiteName, setManualSiteName] = useState('');
  const [features, setFeatures] = useState(null);

 
  const [anprData, setAnprData] = useState({
    vehicleNumber: '',
    capturedImage: null,
    frameImage: null,
    confidence: 0,
    timestamp: '',
    cameraId: 'Main Gate (In)',
    siteId: '',
    siteName: '',
    laneId: '',
    direction: '',
    speed: '',
    isEntry: true
  });

  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleType: '',
    vendorId: '',
    materialType: '',
    countofmaterials: '',
    loadStatus: 'full',
    challanImage: null,
    notes: '',
    siteId: '',
    siteName: ''
  });

  const [mediaCapture, setMediaCapture] = useState({
    frontView: null,
    backView: null,
    driverView: null,
    loadView: null,
    videoClip: null
  });

  // Mobile responsive state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
useEffect(() => {
  const storedFeatures = localStorage.getItem("features");
  if (!storedFeatures) return;

  const parsedFeatures = JSON.parse(storedFeatures);
  setFeatures(parsedFeatures);

  if (parsedFeatures.anpr === false) {
    router.replace("/supervisor/entry-vehicles/ocr");
  }
}, []);






  // Socket connection for ANPR live feed
// Socket connection for ANPR live feed (PLAN GUARDED)
useEffect(() => {
  // 🚫 LITE plan or features not loaded → do nothing
  if (!features || features.anpr === false) return;

  const socket = io(SOCKET_URL, {
    transports: ["websocket"],
    reconnection: true,
  });

  socket.on("connect", () => {
    setSocketStatus("connected");
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket error:", err);
    setSocketStatus("error");
  });

  socket.on("disconnect", () => {
    setSocketStatus("disconnected");
  });

  socket.on("anpr:new-event", (data) => {
    setAnprEvents(prev => [data, ...prev.slice(0, 4)]);

    if (data.numberPlate) {
      setAnprData({
        vehicleNumber: data.numberPlate || "",
        capturedImage: base64ToImageUrl(data.image),
        frameImage: base64ToImageUrl(data.frame),
        confidence: 95,
        timestamp: new Date(data.timestamp).toLocaleString(),
        cameraId: data.cameraName || "Main Gate (In)",
        siteId: data.siteId?.toString() || "",
        siteName: data.siteName || "",
        laneId: data.laneId?.toString() || "",
        direction: data.direction?.toString() || "",
        speed: data.speed?.toString() || "",
        isEntry: data.isEntry ?? true,
      });
    }
  });

  return () => {
    socket.disconnect();
  };
}, [features]);

  useEffect(() => {
    fetchVendors();
    fetchSites();
    
    return () => {
      stopCamera();
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

  // Fetch assigned sites
  const fetchSites = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.get(`${API_URL}/api/supervisor/my-site`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let sitesData = [];
      
      if (response.data && response.data.success) {
        if (Array.isArray(response.data.data)) {
          sitesData = response.data.data;
        } else if (response.data.data && typeof response.data.data === 'object') {
          sitesData = [response.data.data];
        }
      } else {
        if (Array.isArray(response.data)) {
          sitesData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          sitesData = [response.data];
        }
      }
      
      setSites(sitesData);
      
      if (sitesData.length > 0 && siteInputMode === 'select') {
        const firstSite = sitesData[0];
        setVehicleDetails(prev => ({ 
          ...prev, 
          siteId: firstSite._id,
          siteName: firstSite.name
        }));
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
      console.error('Error response:', error.response?.data);
      setSites([]);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const endpoints = [
        `${API_URL}/api/supervisor/vendors`,
        `${API_URL}/api/project/vendors`,
        // `${API_URL}/api/supervisor/vendors-by-site`,
        // `${API_URL}/api/vendors/active`,
        `${API_URL}/api/vendors`
      ];
      
      let vendorsData = [];
      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          // console.log(`Trying endpoint: ${endpoint}`);
          const response = await axios.get(endpoint, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          });
          
          // console.log(`Response from ${endpoint}:`, response.data);
          
          if (response.data && response.data.success) {
            if (Array.isArray(response.data.data)) {
              vendorsData = response.data.data;
            } else if (Array.isArray(response.data.vendors)) {
              vendorsData = response.data.vendors;
            }
          } else if (Array.isArray(response.data)) {
            vendorsData = response.data;
          }
          
          if (vendorsData.length > 0) {
            // console.log(`Successfully fetched ${vendorsData.length} vendors from ${endpoint}`);
            break;
          }
        } catch (error) {
          lastError = error;
          // console.log(`Failed for ${endpoint}:`, error.response?.status || error.message);
          continue;
        }
      }
      
      if (vendorsData.length === 0) {
        // console.log('No vendors found from any endpoint. Using mock data for testing.');
        // vendorsData = [
        //   { _id: '1', name: 'Test Vendor 1', email: 'vendor1@test.com' },
        //   { _id: '2', name: 'Test Vendor 2', email: 'vendor2@test.com' }
        // ];
      }
      
      setVendors(vendorsData);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error fetching vendors:', error);
      setLoading(false);
      alert('Failed to load vendors. Please check your connection.');
    }
  };

  // Manual entry via OCR page
  const handleManualEntry = () => {
    router.push('/supervisor/entry-vehicles/ocr');
  };

  const handleANPREventClick = (event) => {
    setAnprData({
      vehicleNumber: event.numberPlate || '',
      capturedImage: base64ToImageUrl(event.image),
      frameImage: base64ToImageUrl(event.frame),
      confidence: 95,
      timestamp: new Date(event.timestamp).toLocaleString(),
      cameraId: event.cameraName || 'Main Gate (In)',
      siteId: event.siteId?.toString() || '',
      siteName: event.siteName || '',
      laneId: event.laneId?.toString() || '',
      direction: event.direction?.toString() || '',
      speed: event.speed?.toString() || '',
      isEntry: event.isEntry ?? true
    });
   };

  const handleSiteModeChange = (mode) => {
    setSiteInputMode(mode);
    
    if (mode === 'select') {
      if (sites.length > 0) {
        const firstSite = sites[0];
        setVehicleDetails(prev => ({ 
          ...prev, 
          siteId: firstSite._id,
          siteName: firstSite.name
        }));
      } else {
        setVehicleDetails(prev => ({ ...prev, siteId: '', siteName: '' }));
      }
      setManualSiteId('');
      setManualSiteName('');
    } else {
      setVehicleDetails(prev => ({ ...prev, siteId: '', siteName: '' }));
    }
  };

  const handleManualSiteChange = (field, value) => {
    if (field === 'id') {
      setManualSiteId(value);
      setVehicleDetails(prev => ({ ...prev, siteId: value }));
    } else if (field === 'name') {
      setManualSiteName(value);
      setVehicleDetails(prev => ({ ...prev, siteName: value }));
    }
  };

  const handleSiteSelect = (siteId) => {
    const selectedSite = sites.find(s => s._id === siteId);
    if (selectedSite) {
      setVehicleDetails(prev => ({ 
        ...prev, 
        siteId: selectedSite._id,
        siteName: selectedSite.name
      }));
    }
  };

  const base64ToImageUrl = (base64String) => {
    if (!base64String) return null;
    
    if (base64String.startsWith('data:image')) {
      return base64String;
    }
    
    return `data:image/jpeg;base64,${base64String}`;
  };

  // Helper function to convert base64 to File
  const base64ToFile = (base64String, filename) => {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  };

  // Upload to Wasabi function
  // const uploadToWasabi = async (file, folder) => {
  //   try {
  //     const token = localStorage.getItem('accessToken');
      
  //     const formData = new FormData();
  //     formData.append('file', file);
  //     formData.append('folder', folder);
      
  //     const response = await axios.post(`${API_URL}/api/upload/upload-url`, formData, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'multipart/form-data'
  //       }
  //     });
      
  //     if (response.data.success) {
  //       return response.data.key;
  //     } else {
  //       throw new Error('Upload failed');
  //     }
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     throw error;
  //   }
  // };

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
      if (!vehicleDetails.siteId) {
        alert('Please enter or select a site');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

 // Utility functions for direct Wasabi upload
// Make sure your uploadToWasabiDirect function looks like this:

 const uploadToWasabi = async ({
  file,
  vehicleId,
  type,          // "entry" | "exit"
  index = null,  // 1–4 for photos, null for video/challan
}) => {
  try {
    const token = localStorage.getItem("accessToken");

    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { data } = await axios.post(
      `${API_URL}/api/uploads/upload-url`,
      {
        vehicleId,
        type,
        index,
        fileName: filename,
        fileType: file.type,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { uploadURL, fileKey } = data;

    await axios.put(uploadURL, file, {
      headers: { "Content-Type": file.type },
      transformRequest: [(d) => d],
    });

    return fileKey;
  } catch (err) {
    console.error("❌ Wasabi upload failed:", err.response?.data || err);
    throw err;
  }
};


const handleAllowEntry = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("accessToken");

    if (!anprData.vehicleNumber) {
      alert("❌ Vehicle number is required");
      return;
    }

    const vehicleId = selectedVehicle?._id;
    if (!vehicleId) {
      alert("Invalid vehicle");
      return;
    }

    const finalVehicleType =
      vehicleDetails.vehicleType === "OTHER"
        ? customVehicleType
        : vehicleDetails.vehicleType;

    const PHOTO_CONFIG = [
      { key: "frontView", index: 1 },
      { key: "backView", index: 2 },
      { key: "loadView", index: 3 },
      { key: "driverView", index: 4 },
    ];

    const uploadedPhotos = {
      frontView: null,
      backView: null,
      loadView: null,
      driverView: null,
    };

    // 📸 PHOTO UPLOADS
    for (const photo of PHOTO_CONFIG) {
      const base64 = mediaCapture?.[photo.key];
      if (!base64) continue;

      const file = base64ToFile(
        base64,
        `${photo.key}-${Date.now()}.jpg`
      );

      const fileKey = await uploadToWasabi({
        file,
        vehicleId,
        type: "entry",
        index: photo.index,
      });

      uploadedPhotos[photo.key] = fileKey;
    }

    // 🎥 VIDEO
    let videoKey = null;
    if (mediaCapture?.videoClip) {
      const videoFile = base64ToFile(
        mediaCapture.videoClip,
        `entry-video-${Date.now()}.webm`
      );

      videoKey = await uploadToWasabi({
        file: videoFile,
        vehicleId,
        type: "entry",
      });
    }

    // 📄 CHALLAN
    let challanKey = null;
    if (vehicleDetails?.challanImage) {
      const challanFile = base64ToFile(
        vehicleDetails.challanImage,
        `challan-${Date.now()}.jpg`
      );

      challanKey = await uploadToWasabi({
        file: challanFile,
        vehicleId,
        type: "entry",
      });
    }

    // 📦 FINAL PAYLOAD
    const entryData = {
      vehicleNumber: anprData.vehicleNumber.toUpperCase().trim(),
      vehicleType: finalVehicleType || "TRUCK",
      driverName: driverName || "",
      entryTime: new Date().toISOString(),
      purpose: vehicleDetails.materialType || "Material Delivery",
      loadStatus: vehicleDetails.loadStatus?.toUpperCase() || "FULL",
      entryGate: "Manual Entry",
      notes: vehicleDetails.notes || "",
      siteId: vehicleDetails.siteId,
      media: {
        anprImage: anprData.capturedImage || null,
        photos: uploadedPhotos,
        video: videoKey,
        challanImage: challanKey,
      },
    };

    await axios.post(
      `${API_URL}/api/supervisor/vehicles/entry`,
      entryData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );


    // await axios.post(`http://${ip}/analytics/barrier`)

    alert("✅ Vehicle entry recorded successfully!");
    resetForm();

  } catch (err) {
    console.error("❌ Entry error:", err.response?.data || err);
    alert(err.response?.data?.message || "Failed to record entry");
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
    setSiteInputMode('select');
    setManualSiteId('');
    setManualSiteName('');
    setVehicleDetails({
      vehicleType: '',
      vendorId: '',
      materialType: '',
      materialCount: '',
      loadStatus: 'full',
      challanImage: null,
      notes: '',
      siteId: '',
      siteName: ''
    });
    setMediaCapture({
      frontView: null,
      backView: null,
      driverView: null,
      loadView: null,
      videoClip: null
    });
    setRecordingTime(0);
    setAnprData({
      vehicleNumber: '',
      capturedImage: null,
      frameImage: null,
      confidence: 0,
      timestamp: '',
      cameraId: 'Main Gate (In)',
      siteId: '',
      siteName: '',
      laneId: '',
      direction: '',
      speed: '',
      isEntry: true
    });
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

  const getSocketStatusColor = () => {
    switch (socketStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-orange-500';
    }
  };

  return (
    <SupervisorLayout>
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera View */}
        {cameraView && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="bg-black/80 backdrop-blur-sm p-4 flex items-center justify-between">
              <button
                onClick={cancelCamera}
                className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <div className="text-white font-semibold text-center">
                <div className="text-sm sm:text-base">
                  {cameraView === 'video' ? 'Recording Video' : `Capture ${getCameraLabel()}`}
                </div>
                {isRecording && (
                  <div className="text-xs text-red-400 mt-1 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                    REC {formatRecordingTime(recordingTime)}
                  </div>
                )}
              </div>

              <button
                onClick={switchCamera}
                className="p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
              >
                <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
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
              
              {cameraView !== 'video' && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border-2 border-white/30 rounded-lg"></div>
                </div>
              )}
            </div>

            <div className="bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex justify-center items-center">
              {cameraView === 'video' ? (
                <button
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition shadow-xl disabled:opacity-50"
                >
                  <StopCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </button>
              ) : (
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition shadow-xl"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white border-4 border-gray-800 rounded-full"></div>
                  <Camera className="absolute w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 bg-blue-600 text-white rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">New Vehicle Entry</h1>
          <p className="text-sm text-gray-600">
            Step {step}: {step === 1 ? 'Vehicle Identification' : step === 2 ? 'Vehicle & Driver Details' : 'Media Capture & Validation'}
          </p>
        </div>

        {/* Progress Steps - Responsive */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                    s === step ? 'bg-blue-600 text-white' : s < step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {s < step ? <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" /> : s}
                  </div>
                  <div className="hidden sm:block">
                    <div className={`text-sm font-semibold ${s === step ? 'text-blue-600' : s < step ? 'text-green-600' : 'text-gray-500'}`}>
                      Step {s}
                    </div>
                    <div className="text-xs text-gray-500">
                      {s === 1 ? 'Arrival' : s === 2 ? 'Details' : 'Media'}
                    </div>
                  </div>
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 sm:mx-4 ${s < step ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: ANPR Live Feed */}
        {step === 1 && (
          <div className="space-y-4 sm:space-y-6">
            {/* Live ANPR Header - Responsive */}
            <div className="bg-slate-800 rounded-lg shadow p-4 sm:p-6 border border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Car className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                  <div>
                    <h1 className="text-xl sm:text-3xl font-bold text-white">
                      Live ANPR System
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">
                      Real-time vehicle tracking
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getSocketStatusColor()} animate-pulse`}
                    ></div>
                    <span className="text-white font-medium text-sm capitalize">
                      {socketStatus}
                    </span>
                  </div>
                  {/* Manual Entry Button */}
                  <button
                    onClick={handleManualEntry}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
                  >
                    <Target className="w-4 h-4" />
                    <span className="hidden sm:inline">Manual Entry</span>
                    <span className="sm:hidden">Manual</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Events - Collapsible on Mobile */}
            <div className="bg-slate-800 rounded-lg shadow p-4 sm:p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  Recent Events ({anprEvents.length})
                </h2>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden text-blue-400"
                >
                  <ChevronDown className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {(isMobileMenuOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024)) && (
                <>
                  {anprEvents.length === 0 ? (
                    <p className="text-slate-400 text-center py-4 text-sm sm:text-base">
                      No events received yet. Waiting for ANPR data...
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 sm:max-h-96 overflow-y-auto">
                      {anprEvents.map((e, index) => (
                        <div
                          key={e._id || index}
                          className="bg-slate-700 p-3 sm:p-4 rounded-lg border border-slate-600 hover:border-blue-500 transition-colors cursor-pointer"
                          onClick={() => handleANPREventClick(e)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  e.isEntry
                                    ? "bg-green-500 text-white"
                                    : "bg-red-500 text-white"
                                }`}
                              >
                                {e.isEntry ? "IN" : "OUT"}
                              </div>
                              <div>
                                <p className="text-white font-bold text-sm sm:text-lg">
                                  {e.numberPlate}
                                </p>
                                <p className="text-slate-400 text-xs sm:text-sm">
                                  {new Date(e.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                              </div>
                            </div>
                            <div className="text-blue-400 hover:text-blue-300 text-xs sm:text-sm font-medium">
                              Use
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Current Vehicle Detection - Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Live Feed */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-900 h-48 sm:h-64 md:h-80 flex items-center justify-center relative">
                  <div className={`absolute top-2 sm:top-4 left-2 sm:left-4 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 ${
                    socketStatus === 'connected' ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
                  }`}>
                    <div className={`w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full ${socketStatus === 'connected' ? 'animate-pulse' : ''}`}></div>
                    {socketStatus === 'connected' ? 'LIVE' : 'OFFLINE'}
                  </div>

                  {anprData.frameImage ? (
                    <img 
                      src={anprData.frameImage} 
                      alt="ANPR Frame"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white text-center">
                      <Camera className="w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-2 sm:mb-4 opacity-50" />
                      <p className="text-xs sm:text-sm opacity-75 px-2">ANPR Camera Live View</p>
                    </div>
                  )}

                  {anprData.vehicleNumber && (
                    <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 bg-black/50 backdrop-blur-sm rounded-lg p-2 sm:p-3">
                      <div className="text-white text-xs mb-1">Vehicle Detected</div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg sm:text-2xl font-bold text-white">
                          {anprData.vehicleNumber}
                        </div>
                        <div className="bg-green-500 text-white px-1 sm:px-2 py-1 rounded text-xs font-semibold">
                          {anprData.confidence}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Capture Result */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 sm:mb-4">ANPR Capture Result</h3>
                <p className="text-sm text-gray-600 mb-3 sm:mb-4">Confirm vehicle number before proceeding.</p>

                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <div className="text-xs text-blue-600 font-semibold mb-1">CAPTURED IMAGE</div>
                    
                    {anprData.capturedImage ? (
                      <img 
                        src={anprData.capturedImage} 
                        alt="Number Plate"
                        className="w-full h-24 sm:h-32 object-contain bg-gray-200 rounded-lg mb-2 sm:mb-3"
                      />
                    ) : (
                      <div className="h-24 sm:h-32 bg-gray-200 rounded-lg mb-2 sm:mb-3 flex items-center justify-center">
                        <span className="text-gray-500 text-xs sm:text-sm">[ Waiting for detection... ]</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-center gap-2 sm:gap-4 bg-white border-2 border-blue-600 rounded-lg p-2 sm:p-4">
                      <div className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900">
                        {anprData.vehicleNumber || 'Detecting...'}
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-3 flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Confidence</span>
                      <span className="font-bold text-green-600">{anprData.confidence}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Time</span>
                      <span className="font-semibold text-gray-900">{anprData.timestamp || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Camera</span>
                      <span className="font-semibold text-gray-900">{anprData.cameraId}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!anprData.vehicleNumber}
                    className="w-full py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    Proceed to Check-in
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  {/* Manual Entry Button */}
                  <button
                    onClick={handleManualEntry}
                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    Manual Vehicle Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle Details with Site Selection */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Entry Details</h3>
            <p className="text-sm text-gray-600 mb-4 sm:mb-6">Please fill in the consignment and vehicle information below.</p>

            <div className="space-y-4 sm:space-y-5">
              {/* Vehicle Number (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Number</label>
                <input
                  type="text"
                  value={anprData.vehicleNumber}
                  disabled
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-base sm:text-lg font-bold text-blue-900"
                />
              </div>

              {/* Site Selection - BOTH DROPDOWN AND MANUAL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site <span className="text-red-500">*</span>
                </label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => handleSiteModeChange('select')}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      siteInputMode === 'select'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Select from List
                  </button>
                  {/* <button
                    type="button"
                    onClick={() => handleSiteModeChange('manual')}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      siteInputMode === 'manual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Enter Manually
                  </button> */}
                </div>

                {siteInputMode === 'select' ? (
                  <div className="relative">
                    <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <select
                      value={vehicleDetails.siteId}
                      onChange={(e) => handleSiteSelect(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
                    >
                      <option value="">Select Site...</option>
                      {sites.map(site => (
                        <option key={site._id} value={site._id}>
                          {site.name} {site.location ? `- ${site.location}` : ''}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Site ID *</label>
                      <input
                        type="text"
                        value={manualSiteId}
                        onChange={(e) => handleManualSiteChange('id', e.target.value)}
                        placeholder="Enter Site ID (e.g., 507f1f77bcf86cd799439011)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Site Name</label>
                      <input
                        type="text"
                        value={manualSiteName}
                        onChange={(e) => handleManualSiteChange('name', e.target.value)}
                        placeholder="Enter Site Name (optional)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}
                
                {!vehicleDetails.siteId && (
                  <p className="text-red-500 text-xs mt-1">Please enter or select a site</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {siteInputMode === 'select' 
                    ? 'Select from your assigned sites' 
                    : 'Enter Site ID manually (ObjectId format)'}
                </p>
                
                {/* Show selected/entered site info */}
                {/* {vehicleDetails.siteId && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      <span className="font-semibold">Site ID:</span> {vehicleDetails.siteId}
                      {vehicleDetails.siteName && (
                        <span className="ml-2">
                          <span className="font-semibold">Name:</span> {vehicleDetails.siteName}
                        </span>
                      )}
                    </p>
                  </div>
                )} */}
              </div>

              {/* Driver Name (Optional) */}
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
                {!vehicleDetails.vehicleType && (
                  <p className="text-red-500 text-xs mt-1">Please select a vehicle type</p>
                )}
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
                  {!customVehicleType.trim() && (
                    <p className="text-red-500 text-xs mt-1">Please enter custom vehicle type</p>
                  )}
                  <p className="text-xs text-gray-600 mt-2">Please specify the exact vehicle type</p>
                </div>
              )}

              {/* Vendor Selection with Manual Entry Option */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vendor / Transporter <span className="text-gray-400">(Optional)</span>
                </label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setVendorInputMode('select');
                      setManualVendorName('');
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      vendorInputMode === 'select'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Select from List
                  </button>
                  {/* <button
                    type="button"
                    onClick={() => {
                      setVendorInputMode('manual');
                      setVehicleDetails({ ...vehicleDetails, vendorId: '' });
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      vendorInputMode === 'manual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Enter Manually
                  </button> */}
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

              {/* Load Status - Responsive */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Load Status</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {['full', 'partial', 'empty'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setVehicleDetails({ ...vehicleDetails, loadStatus: status })}
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition ${
                        vehicleDetails.loadStatus === status
                          ? 'bg-blue-600 text-white border-2 border-blue-600'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
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
                  value={vehicleDetails.countofmaterials}
                  onChange={(e) => setVehicleDetails({ ...vehicleDetails, countofmaterials: e.target.value })}
                  placeholder="e.g. 50 bags, 10 boxes, 500 kg..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Challan / Bill - Camera Capture */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Challan / Bill Capture <span className="text-gray-400">(Optional)</span>
                </label>
                <div className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center ${
                  vehicleDetails.challanImage ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
                }`}>
                  {vehicleDetails.challanImage ? (
                    <div className="space-y-2 sm:space-y-3">
                      <img 
                        src={vehicleDetails.challanImage} 
                        alt="Challan"
                        className="w-full h-32 sm:h-48 object-cover rounded-lg mb-2"
                      />
                      <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 mx-auto" />
                      <p className="text-sm font-semibold text-green-700">Challan captured successfully!</p>
                      <button
                        type="button"
                        onClick={() => setVehicleDetails({ ...vehicleDetails, challanImage: null })}
                        className="text-sm text-red-600 hover:text-red-700 font-semibold"
                      >
                        Remove & Capture Again
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                      <p className="text-sm text-gray-600 mb-2 sm:mb-3">Capture challan/bill using camera (Optional)</p>
                      <button
                        type="button"
                        onClick={() => startCamera('challan')}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm sm:text-base"
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

              {/* Action Buttons - Responsive */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleBack}
                  className="py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!vehicleDetails.vehicleType || !vehicleDetails.siteId || (vehicleDetails.vehicleType === 'OTHER' && !customVehicleType.trim())}
                  className="py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next Step
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Media Capture (Responsive) */}
        {step === 3 && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Required Photos</h3>
                  <p className="text-sm text-gray-600">Tap a card to capture image from camera.</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Vehicle: </div>
                  <div className="text-base sm:text-lg font-bold text-blue-600">{anprData.vehicleNumber}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Site: {vehicleDetails.siteName || vehicleDetails.siteId.substring(0, 8) + '...'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { key: 'frontView', label: 'Front View', desc: 'Number plate & cabin' },
                  { key: 'backView', label: 'Back View', desc: 'Tail & cargo doors' },
                  { key: 'driverView', label: 'Driver / Cabin', desc: 'Driver or empty cabin' },
                  { key: 'loadView', label: 'Material / Load', desc: 'Cargo or empty bed' }
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`relative border-2 border-dashed rounded-lg p-4 transition cursor-pointer ${
                      mediaCapture[item.key]
                        ? 'border-green-300 bg-green-50'
                        : 'border-blue-300 bg-blue-50 hover:bg-blue-100'
                    }`}
                    onClick={() => !mediaCapture[item.key] && startCamera(item.key)}
                  >
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
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
                          className="w-full h-24 sm:h-32 object-cover rounded-lg mb-2"
                        />
                        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900 text-sm sm:text-base mb-1">{item.label}</div>
                        <p className="text-xs text-gray-600 mb-2">{item.desc}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMediaCapture({ ...mediaCapture, [item.key]: null });
                          }}
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Retake Photo
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900 text-sm sm:text-base mb-1">{item.label}</div>
                        <p className="text-xs text-gray-600">{item.desc}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Video */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                Video Evidence <span className="text-gray-400 font-normal text-xs sm:text-sm">(Optional)</span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">Record a 360° walkaround of the vehicle</p>

              <div className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center ${
                mediaCapture.videoClip ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-gray-50'
              }`}>
                {mediaCapture.videoClip ? (
                  <div>
                    <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 mx-auto mb-2 sm:mb-3" />
                    <p className="text-sm font-semibold text-green-700 mb-2 sm:mb-3">Video recorded successfully!</p>
                    <button
                      onClick={() => setMediaCapture({ ...mediaCapture, videoClip: null })}
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Remove Video
                    </button>
                  </div>
                ) : (
                  <div>
                    <Video className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                    <p className="text-sm text-gray-600 mb-3 sm:mb-4">Record Video Clip with Camera</p>
                    <button
                      onClick={() => startCamera('video')}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center gap-2 mx-auto text-sm sm:text-base"
                    >
                      <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                      Start Recording
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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