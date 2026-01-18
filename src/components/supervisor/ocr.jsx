"use client";
import { useState, useRef, useEffect } from "react";
import { Camera, RotateCcw, CheckCircle, XCircle, Loader2, ArrowRight, ArrowLeft, User, Truck, Building, ChevronDown } from "lucide-react";

export default function MobileOCR() {
  const [step, setStep] = useState(1);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Form states
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [siteId, setSiteId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [materialType, setMaterialType] = useState('');
  const [loadStatus, setLoadStatus] = useState('full');
  const [notes, setNotes] = useState('');
  
  const [mediaCapture, setMediaCapture] = useState({
    frontView: null,
    backView: null,
    driverView: null,
    loadView: null,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Camera start with proper error handling
  const startCamera = async () => {
    console.log('🎥 Starting camera...');
    
    try {
      setError(null);
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }
      
      setCameraActive(true);
      await new Promise((resolve) => setTimeout(resolve, 150));
      
      if (!videoRef.current) {
        console.error('Video element still not found after render');
        setCameraActive(false);
        throw new Error('Video element failed to render. Please try again.');
      }
      
      console.log('✅ Video element ready');
      
      const constraints = {
        video: { 
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      console.log('📱 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Camera stream obtained');
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.setAttribute('webkit-playsinline', 'true');
      videoRef.current.muted = true;
      
      videoRef.current.onloadedmetadata = async () => {
        console.log('📹 Video metadata loaded');
        try {
          await videoRef.current.play();
          console.log('▶️ Video playing successfully');
        } catch (playError) {
          console.error('Play error:', playError);
          videoRef.current.muted = true;
          try {
            await videoRef.current.play();
            console.log('▶️ Video playing (muted retry)');
          } catch (retryError) {
            throw new Error('Could not start video playback');
          }
        }
      };
      
      setTimeout(async () => {
        if (videoRef.current && videoRef.current.paused) {
          try {
            await videoRef.current.play();
            console.log('▶️ Video playing (delayed)');
          } catch (err) {
            console.warn('Delayed play attempt failed:', err);
          }
        }
      }, 500);
      
      setResult(null);
      setCapturedImage(null);
      
    } catch (err) {
      console.error("❌ Camera error:", err);
      
      let errorMessage = "Could not access camera. ";
      
      if (err.name === 'NotAllowedError') {
        errorMessage += "Please allow camera access in browser settings.";
      } else if (err.name === 'NotFoundError') {
        errorMessage += "No camera found on this device.";
      } else if (err.name === 'NotReadableError') {
        errorMessage += "Camera is already in use by another application.";
      } else {
        errorMessage += err.message || "Please check permissions and try again.";
      }
      
      setError(errorMessage);
      setCameraActive(false);
      stopCamera();
    }
  };

  const stopCamera = () => {
    console.log('🛑 Stopping camera...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.kind);
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setCameraActive(false);
  };

  const capturePhoto = () => {
    console.log('📸 Capturing photo...');
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      alert('Camera not ready');
      return;
    }
    
    if (video.paused || video.readyState < 2) {
      alert('Please wait for camera to be ready');
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (canvas.width === 0 || canvas.height === 0) {
      alert('Camera not ready. Please wait a moment.');
      return;
    }
    
    console.log(`Image size: ${canvas.width}x${canvas.height}`);
    
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0);
    
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95);
    console.log('✅ Image captured');
    
    setCapturedImage(imageDataUrl);
    stopCamera();
    
    if (step === 1) {
      processOCR(imageDataUrl);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log('📁 File selected:', file.name);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result);
      processOCR(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const processOCR = async (imageDataUrl) => {
    console.log('🔄 Processing OCR...');
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://localhost:5000/api/plate/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image_base64: imageDataUrl }),
      });
      
      console.log('API Response status:', response.status);
      const data = await response.json();
      console.log('API Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `API Error: ${response.status}`);
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      if (!data.success) {
        throw new Error(data.message || "No plate detected");
      }
      
      console.log('✅ OCR Success:', data.plate);
      setResult(data);
      setVehicleNumber(data.plate || '');
      
    } catch (err) {
      console.error("❌ OCR Error:", err);
      setError(err.message || "Failed to process image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const retakePhoto = () => {
    console.log('🔄 Retaking photo...');
    setCapturedImage(null);
    setResult(null);
    setError(null);
    setVehicleNumber('');
  };

  const handleNext = () => {
    if (step === 1) {
      if (!vehicleNumber || vehicleNumber.length < 6) {
        alert('Please enter a valid vehicle number');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!vehicleType) {
        alert('Please select vehicle type');
        return;
      }
      if (!siteId) {
        alert('Please enter site ID');
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
      const token = localStorage.getItem("accessToken");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      if (!vehicleNumber) {
        alert("❌ Vehicle number is required");
        setLoading(false);
        return;
      }

      const entryData = {
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        vendorId: vendorId || "",
        vehicleType: vehicleType || "TRUCK",
        driverName: driverName || "",
        entryTime: new Date().toISOString(),
        purpose: materialType || "Material Delivery",
        loadStatus: loadStatus.toUpperCase() || "FULL",
        entryGate: "OCR Manual Entry",
        notes: notes || "",
        siteId: siteId,
        media: {
          photos: Object.values(mediaCapture).filter(photo => photo && typeof photo === 'string'),
          video: "",
          challanImage: "",
        }
      };

      console.log("📦 OCR Entry Payload:", entryData);

      const response = await fetch(
        `${API_URL}/api/supervisor/mobile/trips/manual`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(entryData)
        }
      );

      const data = await response.json();
      console.log("✅ SUCCESS Response:", data);
      
      if (response.ok) {
        alert("✅ Vehicle entry recorded successfully via OCR!");
        resetForm();
      } else {
        throw new Error(data.message || 'Failed to record entry');
      }

    } catch (error) {
      console.error("❌ ERROR Details:", error);
      alert("❌ Failed to record entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setVehicleNumber('');
    setDriverName('');
    setVehicleType('');
    setSiteId('');
    setVendorId('');
    setMaterialType('');
    setLoadStatus('full');
    setNotes('');
    setMediaCapture({
      frontView: null,
      backView: null,
      driverView: null,
      loadView: null,
    });
    setCapturedImage(null);
    setResult(null);
    setError(null);
  };

  const startMediaCapture = async (mediaType) => {
    console.log('📸 Starting media capture for:', mediaType);
    setCameraActive(true);
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    if (!videoRef.current) {
      alert('Camera not ready');
      setCameraActive(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute('playsinline', 'true');
      videoRef.current.muted = true;
      
      videoRef.current.onloadedmetadata = async () => {
        await videoRef.current.play();
      };
    } catch (err) {
      alert('Camera access denied');
      setCameraActive(false);
    }
  };

  const captureMediaPhoto = (mediaType) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) return;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0);
    
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.85);
    
    setMediaCapture(prev => ({ ...prev, [mediaType]: imageDataUrl }));
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4">
      <div className="max-w-md mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6 mt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-3 shadow-lg">
            <Camera className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Number Plate OCR
          </h1>
          <p className="text-purple-100">
            Step {step} of 3
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Step 1: OCR Scan */}
          {step === 1 && !cameraActive && !capturedImage && (
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Scan Vehicle Number</h2>
              
              <button
                onClick={startCamera}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg flex items-center justify-center gap-3"
              >
                <Camera className="w-6 h-6" />
                Open Camera
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">OR</span>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileInput}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-4 px-6 rounded-2xl transition-all duration-200 border-2 border-dashed border-gray-300"
              >
                📁 Choose from Gallery
              </button>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Camera Active */}
          {step === 1 && cameraActive && (
            <div className="relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto"
                style={{ maxHeight: '70vh', objectFit: 'cover' }}
              />
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-4 border-white border-dashed rounded-2xl w-4/5 h-32 opacity-50"></div>
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={stopCamera}
                    className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={capturePhoto}
                    className="bg-white hover:bg-gray-100 text-gray-800 p-6 rounded-full shadow-xl transition transform hover:scale-105"
                  >
                    <Camera className="w-8 h-8" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Loading */}
          {step === 1 && loading && (
            <div className="p-12 text-center">
              <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-lg">Processing image...</p>
            </div>
          )}

          {/* Step 1: Result */}
          {step === 1 && result && !loading && (
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Scanned Result</h2>
              
              {capturedImage && (
                <img src={capturedImage} alt="captured" className="w-full rounded-xl shadow-lg" />
              )}
              
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Vehicle Number</p>
                <p className="text-2xl font-bold text-gray-900">{result.plate || vehicleNumber}</p>
                {result.score && (
                  <p className="text-sm text-green-600 mt-2">
                    Confidence: {(result.score * 100).toFixed(1)}%
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Edit Vehicle Number (if needed)
                </label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl font-mono text-lg"
                  placeholder="MH-12-AB-1234"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={retakePhoto}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl"
                >
                  Retake
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Vehicle Details */}
          {step === 2 && (
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Vehicle Details</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Number</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  disabled
                  className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-xl font-bold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Driver Name</label>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                  placeholder="Enter driver name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type *</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                >
                  <option value="">Select Type</option>
                  <option value="TRUCK">Truck</option>
                  <option value="TRAILER">Trailer</option>
                  <option value="VAN">Van</option>
                  <option value="CAR">Car</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Site ID *</label>
                <input
                  type="text"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl"
                  placeholder="Enter site ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Load Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['full', 'partial', 'empty'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setLoadStatus(status)}
                      className={`py-3 rounded-xl font-semibold transition ${
                        loadStatus === status
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!vehicleType || !siteId}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Media Capture */}
          {step === 3 && !cameraActive && (
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Capture Photos</h2>
              
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'frontView', label: 'Front View' },
                  { key: 'backView', label: 'Back View' },
                  { key: 'driverView', label: 'Driver View' },
                  { key: 'loadView', label: 'Load View' }
                ].map((item) => (
                  <div
                    key={item.key}
                    onClick={() => !mediaCapture[item.key] && startMediaCapture(item.key)}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                      mediaCapture[item.key]
                        ? 'border-green-300 bg-green-50'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {mediaCapture[item.key] ? (
                      <>
                        <img src={mediaCapture[item.key]} className="w-full h-24 object-cover rounded-lg mb-2" />
                        <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                      </>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-600">{item.label}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl"
                >
                  Back
                </button>
                <button
                  onClick={handleAllowEntry}
                  disabled={loading || !mediaCapture.frontView || !mediaCapture.backView}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Submit Entry'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Camera Active for Media */}
          {step === 3 && cameraActive && (
            <div className="relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto"
              />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={stopCamera}
                    className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                  
                  <button
                    onClick={() => captureMediaPhoto(Object.keys(mediaCapture).find(k => !mediaCapture[k]))}
                    className="bg-white hover:bg-gray-100 text-gray-800 p-6 rounded-full shadow-xl"
                  >
                    <Camera className="w-8 h-8" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hidden canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}