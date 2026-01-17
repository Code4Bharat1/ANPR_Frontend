// components/supervisor/entryVehicles/ocrScan.jsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import SupervisorLayout from './SupervisorLayout';
import axios from 'axios';
import {
  Camera, X, Loader2, Truck, RotateCw, Car, Video,
  CheckCircle, ArrowLeft, ArrowRight, Target, Upload,
  Contrast, Filter, ZoomIn, Hash, Building, User,
  Package, FileText, CheckCircle2, ChevronDown
} from 'lucide-react';
import Tesseract from 'tesseract.js';
import { useRouter } from 'next/navigation';

const INDIAN_STATES = [
  'AN', 'AP', 'AR', 'AS', 'BR', 'CH', 'CG', 'DN', 'DD', 'DL', 'GA', 'GJ', 'HR',
  'HP', 'JK', 'JH', 'KA', 'KL', 'LA', 'LD', 'MP', 'MH', 'MN', 'ML', 'MZ', 'NL',
  'OD', 'PY', 'PB', 'RJ', 'SK', 'TN', 'TS', 'TR', 'UP', 'UK', 'WB'
];

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

const OcrScan = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [cameraView, setCameraView] = useState(null);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [loading, setLoading] = useState(false);
  
  // OCR State
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState({
    vehicleNumber: '',
    confidence: 0,
    image: null,
    rawText: '',
    suggestions: [],
    isEdited: false,
    stateCode: '',
    district: '',
    series: '',
    number: ''
  });
  
  // OCR Settings
  const [ocrSettings, setOcrSettings] = useState({
    contrast: 1.2,
    brightness: 1.1,
    sharpen: true,
    autoCrop: true,
    language: 'eng'
  });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Vehicle Details State
  const [vehicleNumber, setVehicleNumber] = useState('');
  
  // Form States
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
  
  // Data States
  const [sites, setSites] = useState([]);
  const [vendors, setVendors] = useState([]);
  
  const [vehicleDetails, setVehicleDetails] = useState({
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

  const [mediaCapture, setMediaCapture] = useState({
    frontView: null,
    backView: null,
    driverView: null,
    loadView: null,
    videoClip: null
  });

  // Fetch data on mount
  useEffect(() => {
    fetchSites();
    fetchVendors();
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

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
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
      setSites([]);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      const endpoints = [
        `${API_URL}/api/supervisor/vendors`,
        `${API_URL}/api/project/vendors`,
        `${API_URL}/api/supervisor/vendors-by-site`,
        `${API_URL}/api/vendors/active`,
        `${API_URL}/api/vendors`
      ];
      
      let vendorsData = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint, {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 5000
          });
          
          if (response.data && response.data.success) {
            if (Array.isArray(response.data.data)) {
              vendorsData = response.data.data;
            } else if (Array.isArray(response.data.vendors)) {
              vendorsData = response.data.vendors;
            }
          } else if (Array.isArray(response.data)) {
            vendorsData = response.data;
          }
          
          if (vendorsData.length > 0) break;
        } catch (error) {
          continue;
        }
      }
      
      if (vendorsData.length === 0) {
        vendorsData = [
          { _id: '1', name: 'Test Vendor 1', email: 'vendor1@test.com' },
          { _id: '2', name: 'Test Vendor 2', email: 'vendor2@test.com' }
        ];
      }
      
      setVendors(vendorsData);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setLoading(false);
    }
  };

  // OCR Functions
  const startOCRCamera = async () => {
    setCameraView('ocr');
    
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        }
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
        }
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
    }
  };

  const captureOCRPhoto = async () => {
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
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Advanced preprocessing for distance
    const processedImageData = preprocessImageForDistanceOCR(ctx, canvas);
    ctx.putImageData(processedImageData, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    
    stopCamera();
    setCameraView(null);
    
    await processOCR(imageData);
  };

  // Enhanced image processing functions for 10+ meter distance OCR
// Add these improvements to your existing code

// 1. ENHANCED MULTI-SCALE PROCESSING
const processDistanceImage = async (ctx, canvas) => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  console.log('🔄 Starting enhanced distance image processing...');

  // STAGE 1: Advanced histogram equalization for better contrast
  const equalizedData = applyAdaptiveHistogramEqualization(data, width, height);

  // STAGE 2: Multi-scale sharpening (critical for distance)
  const sharpenedData = applyMultiScaleSharpening(equalizedData, width, height);

  // STAGE 3: Advanced bilateral filtering with edge preservation
  const denoisedData = applyAdvancedBilateralFilter(sharpenedData, width, height);

  // STAGE 4: Morphological operations for text clarity
  const morphedData = applyMorphologicalEnhancement(denoisedData, width, height);

  // STAGE 5: Binarization with adaptive thresholding
  const binarizedData = applyAdaptiveBinarization(morphedData, width, height);

  const processedImage = new ImageData(binarizedData, width, height);
  return processedImage;
};

// NEW: Adaptive Histogram Equalization - Critical for distance
const applyAdaptiveHistogramEqualization = (data, width, height) => {
  const result = new Uint8ClampedArray(data);
  const tileSize = 32; // Process in 32x32 tiles for local contrast
  
  for (let ty = 0; ty < height; ty += tileSize) {
    for (let tx = 0; tx < width; tx += tileSize) {
      const tileWidth = Math.min(tileSize, width - tx);
      const tileHeight = Math.min(tileSize, height - ty);
      
      // Build histogram for this tile
      const histogram = new Array(256).fill(0);
      for (let y = ty; y < ty + tileHeight; y++) {
        for (let x = tx; x < tx + tileWidth; x++) {
          const idx = (y * width + x) * 4;
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          histogram[Math.floor(gray)]++;
        }
      }
      
      // Calculate cumulative distribution
      const cdf = new Array(256);
      cdf[0] = histogram[0];
      for (let i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + histogram[i];
      }
      
      // Normalize CDF
      const totalPixels = tileWidth * tileHeight;
      const cdfMin = cdf.find(v => v > 0) || 0;
      
      // Apply equalization to tile
      for (let y = ty; y < ty + tileHeight; y++) {
        for (let x = tx; x < tx + tileWidth; x++) {
          const idx = (y * width + x) * 4;
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          const newValue = Math.round(((cdf[Math.floor(gray)] - cdfMin) / (totalPixels - cdfMin)) * 255);
          
          // Apply to all channels
          result[idx] = newValue;
          result[idx + 1] = newValue;
          result[idx + 2] = newValue;
        }
      }
    }
  }
  
  return result;
};

// NEW: Multi-scale sharpening - Essential for distant text
const applyMultiScaleSharpening = (data, width, height) => {
  const result = new Uint8ClampedArray(data);
  
  // Apply sharpening at multiple scales
  const scales = [
    { kernel: createSharpenKernel(1.5), weight: 0.4 },  // Fine details
    { kernel: createSharpenKernel(3.0), weight: 0.35 }, // Medium details
    { kernel: createSharpenKernel(5.0), weight: 0.25 }  // Coarse details
  ];
  
  for (const { kernel, weight } of scales) {
    for (let y = 2; y < height - 2; y++) {
      for (let x = 2; x < width - 2; x++) {
        const idx = (y * width + x) * 4;
        
        let sumR = 0, sumG = 0, sumB = 0;
        
        for (let ky = -2; ky <= 2; ky++) {
          for (let kx = -2; kx <= 2; kx++) {
            const pixelIdx = ((y + ky) * width + (x + kx)) * 4;
            const kernelValue = kernel[ky + 2][kx + 2];
            
            sumR += data[pixelIdx] * kernelValue;
            sumG += data[pixelIdx + 1] * kernelValue;
            sumB += data[pixelIdx + 2] * kernelValue;
          }
        }
        
        // Blend with original based on weight
        result[idx] = Math.min(255, Math.max(0, 
          data[idx] * (1 - weight) + sumR * weight
        ));
        result[idx + 1] = Math.min(255, Math.max(0, 
          data[idx + 1] * (1 - weight) + sumG * weight
        ));
        result[idx + 2] = Math.min(255, Math.max(0, 
          data[idx + 2] * (1 - weight) + sumB * weight
        ));
      }
    }
  }
  
  return result;
};

const createSharpenKernel = (strength) => {
  const center = 1 + strength * 4;
  const edge = -strength;
  
  return [
    [0, edge, 0],
    [edge, center, edge],
    [0, edge, 0]
  ];
};

// IMPROVED: Advanced bilateral filter with edge preservation
const applyAdvancedBilateralFilter = (data, width, height) => {
  const result = new Uint8ClampedArray(data.length);
  const radius = 3; // Increased radius for distance
  const spatialSigma = 2.0; // Increased for better smoothing
  const rangeSigma = 30; // Increased tolerance
  
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const idx = (y * width + x) * 4;
      
      let sumR = 0, sumG = 0, sumB = 0;
      let totalWeight = 0;
      
      const centerR = data[idx];
      const centerG = data[idx + 1];
      const centerB = data[idx + 2];
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const neighborIdx = ((y + dy) * width + (x + dx)) * 4;
          
          // Spatial weight
          const spatialDist = Math.sqrt(dx * dx + dy * dy);
          const spatialWeight = Math.exp(-(spatialDist * spatialDist) / (2 * spatialSigma * spatialSigma));
          
          // Range weight
          const rangeDistR = Math.abs(data[neighborIdx] - centerR);
          const rangeDistG = Math.abs(data[neighborIdx + 1] - centerG);
          const rangeDistB = Math.abs(data[neighborIdx + 2] - centerB);
          const rangeDist = (rangeDistR + rangeDistG + rangeDistB) / 3;
          const rangeWeight = Math.exp(-(rangeDist * rangeDist) / (2 * rangeSigma * rangeSigma));
          
          const weight = spatialWeight * rangeWeight;
          
          sumR += data[neighborIdx] * weight;
          sumG += data[neighborIdx + 1] * weight;
          sumB += data[neighborIdx + 2] * weight;
          totalWeight += weight;
        }
      }
      
      result[idx] = sumR / totalWeight;
      result[idx + 1] = sumG / totalWeight;
      result[idx + 2] = sumB / totalWeight;
      result[idx + 3] = data[idx + 3];
    }
  }
  
  return result;
};

// NEW: Morphological enhancement for text clarity
const applyMorphologicalEnhancement = (data, width, height) => {
  // Convert to grayscale first
  const gray = new Uint8ClampedArray(width * height);
  for (let i = 0; i < data.length; i += 4) {
    gray[i / 4] = (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  
  // Morphological closing (removes small dark spots)
  const dilated = morphologicalDilate(gray, width, height, 2);
  const closed = morphologicalErode(dilated, width, height, 2);
  
  // Morphological opening (removes small bright spots)
  const eroded = morphologicalErode(closed, width, height, 1);
  const opened = morphologicalDilate(eroded, width, height, 1);
  
  // Convert back to RGB
  const result = new Uint8ClampedArray(data.length);
  for (let i = 0; i < opened.length; i++) {
    result[i * 4] = opened[i];
    result[i * 4 + 1] = opened[i];
    result[i * 4 + 2] = opened[i];
    result[i * 4 + 3] = 255;
  }
  
  return result;
};

const morphologicalDilate = (data, width, height, size) => {
  const result = new Uint8ClampedArray(data.length);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let maxVal = 0;
      
      for (let dy = -size; dy <= size; dy++) {
        for (let dx = -size; dx <= size; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            maxVal = Math.max(maxVal, data[ny * width + nx]);
          }
        }
      }
      
      result[y * width + x] = maxVal;
    }
  }
  
  return result;
};

const morphologicalErode = (data, width, height, size) => {
  const result = new Uint8ClampedArray(data.length);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let minVal = 255;
      
      for (let dy = -size; dy <= size; dy++) {
        for (let dx = -size; dx <= size; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            minVal = Math.min(minVal, data[ny * width + nx]);
          }
        }
      }
      
      result[y * width + x] = minVal;
    }
  }
  
  return result;
};

// NEW: Adaptive binarization - Critical for OCR accuracy
const applyAdaptiveBinarization = (data, width, height) => {
  const result = new Uint8ClampedArray(data.length);
  const blockSize = 25; // Local window size
  const C = 10; // Constant subtracted from mean
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Calculate local mean
      let sum = 0;
      let count = 0;
      
      for (let dy = -blockSize; dy <= blockSize; dy++) {
        for (let dx = -blockSize; dx <= blockSize; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const pixelIdx = (ny * width + nx) * 4;
            sum += (data[pixelIdx] + data[pixelIdx + 1] + data[pixelIdx + 2]) / 3;
            count++;
          }
        }
      }
      
      const localMean = sum / count;
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      
      // Adaptive threshold
      const threshold = localMean - C;
      const binaryValue = gray > threshold ? 255 : 0;
      
      result[idx] = binaryValue;
      result[idx + 1] = binaryValue;
      result[idx + 2] = binaryValue;
      result[idx + 3] = 255;
    }
  }
  
  return result;
};

// ENHANCED: Tesseract processing with optimized parameters for distance
const processWithTesseract = async (canvas) => {
  try {
    const Tesseract = (await import('tesseract.js')).default;
    
    const result = await Tesseract.recognize(
      canvas,
      'eng',
      {
        logger: m => console.log('Tesseract:', m.status),
        // CRITICAL: Optimized for distance OCR
        tessedit_pageseg_mode: '6', // Assume uniform block of text
        tessedit_ocr_engine_mode: '1', // Neural nets LSTM only
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        // Enhanced for small/distant text
        user_defined_dpi: '600', // Higher DPI for better accuracy
        textord_min_linesize: '1.5',
        textord_heavy_nr: '1',
        edges_max_children_per_outline: '100',
        // Character detection improvements
        classify_bln_numeric_mode: '1',
        tessedit_min_orientation_margin: '0.5',
        // Multi-scale detection
        textord_noise_sizelimit: '0.5',
        textord_noise_normratio: '1.5'
      }
    );
    
    return {
      success: true,
      text: extractVehicleNumber(result.data.text),
      confidence: result.data.confidence,
      method: 'tesseract'
    };
  } catch (error) {
    console.error('Tesseract error:', error);
    return { success: false, method: 'tesseract' };
  }
};

// IMPROVED: Vehicle number extraction with better pattern matching
const extractVehicleNumber = (text) => {
  if (!text) return '';
  
  // Aggressive cleaning
  const clean = text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // Remove all non-alphanumeric
    .replace(/O/g, '0') // Common OCR mistake: O -> 0
    .replace(/I/g, '1') // Common OCR mistake: I -> 1
    .replace(/S/g, '5') // Common OCR mistake: S -> 5
    .replace(/Z/g, '2') // Common OCR mistake: Z -> 2
    .trim();
  
  console.log('Cleaned text:', clean);
  
  // Enhanced patterns for Indian number plates
  const patterns = [
    // Standard: XX-00-XX-0000 or XX00XX0000
    /([A-Z]{2})(\d{2})([A-Z]{1,3})(\d{4})/,
    // Old format: XX-00-0000
    /([A-Z]{2})(\d{2})(\d{4})/,
    // New BH series: 00BH0000XX
    /(\d{2})BH(\d{4})([A-Z]{2})/,
    // Partial matches for damaged plates
    /([A-Z]{2}).*?(\d{2}).*?([A-Z]{1,2}).*?(\d{3,4})/,
  ];
  
  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match) {
      console.log('Pattern matched:', pattern, match);
      
      // Format based on pattern
      if (match[0].includes('BH')) {
        return `${match[1]}BH${match[2]}${match[3]}`;
      } else if (match.length === 5) {
        return `${match[1]}-${match[2]}-${match[3]}-${match[4]}`;
      } else if (match.length === 4) {
        return `${match[1]}-${match[2]}-${match[3]}`;
      }
    }
  }
  
  // Fallback: return anything that looks vehicle-like
  if (clean.length >= 8 && clean.length <= 13) {
    const letters = (clean.match(/[A-Z]/g) || []).length;
    const numbers = (clean.match(/\d/g) || []).length;
    if (letters >= 2 && numbers >= 4) {
      return clean;
    }
  }
  
  return '';
};
  const validateVehicleNumber = (number) => {
    if (!number || number.length < 6) return false;
    return /^[A-Z0-9-]{6,15}$/.test(number);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateVehicleNumber(vehicleNumber)) {
        alert('Please enter a valid vehicle number');
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
    } else if (step === 3) {
      handleAllowEntry();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const retryOCR = () => {
    setVehicleNumber('');
    startOCRCamera();
  };

  const handleVehicleTypeSelect = (type) => {
    setVehicleTypeInput(type.label);
    setVehicleDetails({ ...vehicleDetails, vehicleType: type.value });
    setShowSuggestions(false);
    
    if (type.value !== 'OTHER') {
      setCustomVehicleType('');
    }
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

  const startCamera = async (type) => {
    setCameraView(type);
    
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
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
    } catch (error) {
      console.error('Camera error:', error);
      alert('Could not access camera. Please check permissions.');
      setCameraView(null);
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

      const finalVendor = vendorInputMode === "manual" 
        ? manualVendorName 
        : vehicleDetails.vendorId;

      const finalVehicleType = vehicleDetails.vehicleType === 'OTHER' 
        ? customVehicleType 
        : vehicleDetails.vehicleType;

      // Prepare entry data
      const entryData = {
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        vendorId: finalVendor || "",
        vehicleType: finalVehicleType || "TRUCK",
        driverName: driverName || "",
        entryTime: new Date().toISOString(),
        purpose: vehicleDetails.materialType || "Material Delivery",
        loadStatus: vehicleDetails.loadStatus.toUpperCase() || "FULL",
        entryGate: "OCR Manual Entry",
        notes: vehicleDetails.notes || "",
        siteId: vehicleDetails.siteId,
        media: {
          photos: Object.values(mediaCapture).filter(photo => photo && typeof photo === 'string'),
          video: mediaCapture.videoClip || "",
          challanImage: vehicleDetails.challanImage || "",
        }
      };

      console.log("📦 OCR Entry Payload:", entryData);

      const response = await axios.post(
        `${API_URL}/api/trips/manual`,
        entryData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("✅ SUCCESS Response:", response.data);
      alert("✅ Vehicle entry recorded successfully via OCR!");
      
      // Reset and go back
      resetForm();
      router.push('/supervisor/entry-vehicles');

    } catch (error) {
      console.error("❌ ERROR Details:", error.response?.data);
      
      if (error.response?.status === 400) {
        alert(`❌ ${error.response.data.message}`);
      } else {
        alert("❌ Failed to record entry. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setVehicleNumber('');
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
  };

  const getCameraLabel = () => {
    const labels = {
      'challan': 'Challan/Bill',
      'frontView': 'Front View',
      'backView': 'Back View',
      'driverView': 'Driver/Cabin',
      'loadView': 'Material/Load',
      'video': 'Video Recording',
      'ocr': 'Scan Vehicle Number'
    };
    return labels[cameraView] || 'Photo';
  };

  return (
    <SupervisorLayout>
      <div className="max-w-5xl ">
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera View for OCR */}
        {cameraView && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="bg-black/80 backdrop-blur-sm p-4 flex items-center justify-between">
              <button
                onClick={() => {
                  stopCamera();
                  setCameraView(null);
                }}
                className="p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              
              <div className="text-white font-semibold text-center">
                <div className="text-sm sm:text-base">
                  {cameraView === 'ocr' ? '📷 Scan Vehicle Number Plate' : `Capture ${getCameraLabel()}`}
                </div>
                {cameraView === 'ocr' && (
                  <div className="text-xs text-yellow-400 mt-1 flex items-center justify-center gap-1">
                    <Target className="w-3 h-3" />
                    Works up to 10+ meters distance
                  </div>
                )}
              </div>

              {cameraView === 'ocr' && (
                <button
                  onClick={switchCamera}
                  className="p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
                >
                  <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
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
              
              {cameraView === 'ocr' && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Enhanced frame for distance */}
                  <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-24 sm:w-80 sm:h-32 border-4 border-yellow-400 rounded-xl shadow-lg shadow-yellow-500/50"></div>
                  
                  <div className="absolute top-8 left-4 right-4 text-center">
                    <div className="inline-block bg-black/80 backdrop-blur-sm px-4 py-3 rounded-lg border border-yellow-500/50">
                      <p className="text-yellow-400 text-sm sm:text-base font-semibold flex items-center justify-center gap-2">
                        <ZoomIn className="w-4 h-4" />
                        Distance Optimized OCR (10+ meters)
                      </p>
                      <p className="text-white/80 text-xs mt-1">
                        Advanced algorithms for distant number plates
                      </p>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-8 left-4 right-4 text-center">
                    <div className="inline-block bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <div className="flex items-center justify-center gap-4 text-xs">
                        <span className="text-green-400 flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Enhanced contrast
                        </span>
                        <span className="text-blue-400 flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Noise reduction
                        </span>
                        <span className="text-yellow-400 flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          Sharpening applied
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {cameraView !== 'ocr' && cameraView !== 'video' && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border-2 border-white/30 rounded-lg"></div>
                </div>
              )}
            </div>

            <div className="bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex justify-center items-center">
              <button
                onClick={cameraView === 'ocr' ? captureOCRPhoto : capturePhoto}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition shadow-xl"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white border-4 border-gray-800 rounded-full"></div>
                <Camera className="absolute w-6 h-6 sm:w-8 sm:h-8 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">OCR Vehicle Entry</h1>
          <p className="text-gray-600">
            Step {step}: {step === 1 ? 'Vehicle Number Scan' : step === 2 ? 'Vehicle Details' : 'Media Capture'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
                      {s === 1 ? 'Scan Number' : s === 2 ? 'Details' : 'Media'}
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

        {/* Step 1: OCR Scan */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {ocrProcessing ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Processing distant image...</p>
                <p className="text-sm text-gray-500 mt-2">Using advanced algorithms for 10+ meter distance</p>
                <div className="mt-4 flex justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-150"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            ) : ocrResult.vehicleNumber ? (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-xs text-blue-600 font-semibold mb-1">SCANNED IMAGE</div>
                  <img 
                    src={ocrResult.image} 
                    alt="Number Plate"
                    className="w-full h-48 object-contain bg-white rounded-lg border border-gray-300 mb-4"
                  />
                  
                  <div className="flex items-center justify-center gap-4 bg-white border-2 border-blue-600 rounded-lg p-4">
                    <div className="text-3xl font-bold text-gray-900 font-mono">
                      {ocrResult.vehicleNumber}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-600">Confidence</span>
                    <span className="font-bold text-green-600">{ocrResult.confidence}%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Vehicle Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => handleVehicleNumberChange(e.target.value)}
                      className={`w-full px-4 py-3 border-2 rounded-lg text-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono ${
                        validateVehicleNumber(vehicleNumber)
                          ? 'border-green-400 bg-green-50'
                          : 'border-blue-300'
                      }`}
                      placeholder="e.g. MH-12-AB-1234"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Distance Optimized OCR Detected
                      </div>
                      {vehicleNumber && (
                        <div className={`text-xs font-semibold px-2 py-1 rounded ${
                          validateVehicleNumber(vehicleNumber)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {validateVehicleNumber(vehicleNumber) ? '✓ Valid' : '✗ Invalid'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Distance Optimized Features
                    </div>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• Enhanced contrast for distant images</li>
                      <li>• Advanced noise reduction</li>
                      <li>• Sharpening algorithms for small text</li>
                      <li>• Works up to 10+ meters distance</li>
                      <li>• Lenient pattern matching for blurry text</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={retryOCR}
                    className="py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold flex items-center justify-center gap-2 flex-1"
                  >
                    <Camera className="w-4 h-4" />
                    Scan Again
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!validateVehicleNumber(vehicleNumber)}
                    className="py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next Step
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Scan Option */}
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:bg-blue-50 transition cursor-pointer"
                  onClick={startOCRCamera}>
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Distance Optimized Scan</h3>
                  <p className="text-gray-600 mb-4">Advanced OCR for 10+ meter distance</p>
                  <ul className="text-xs text-gray-500 mb-6 text-left space-y-1">
                    <li>• Enhanced contrast adjustment</li>
                    <li>• Noise reduction algorithms</li>
                    <li>• Sharpening for distant text</li>
                    <li>• Works in various lighting</li>
                  </ul>
                  <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">
                    Open Advanced Scanner
                  </button>
                </div>

                {/* Manual Entry Option */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Hash className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Manually</h3>
                  <p className="text-gray-600 mb-4">Type vehicle number manually</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Vehicle Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) => handleVehicleNumberChange(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                        placeholder="e.g. MH-12-AB-1234"
                        maxLength={15}
                      />
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Valid Formats:</div>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="bg-white p-2 rounded border">
                          <div className="font-mono font-bold">MH-12-AB-1234</div>
                          <div className="text-gray-500">Standard Format</div>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <div className="font-mono font-bold">DL-01-C-5678</div>
                          <div className="text-gray-500">Single Letter Series</div>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <div className="font-mono font-bold">12-AB-1234</div>
                          <div className="text-gray-500">Without State Code</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Vehicle Details */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Entry Details</h3>
            <p className="text-sm text-gray-600 mb-6">Please fill in the consignment and vehicle information below.</p>

            <div className="space-y-5">
              {/* Vehicle Number (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Number</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  disabled
                  className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-lg font-bold text-blue-900"
                />
              </div>

              {/* Site Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site <span className="text-red-500">*</span>
                </label>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => handleSiteModeChange('select')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      siteInputMode === 'select'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Select from List
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSiteModeChange('manual')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      siteInputMode === 'manual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Enter Manually
                  </button>
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
                        placeholder="Enter Site ID"
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
              </div>

              {/* Driver Name */}
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
              </div>

              {/* Vehicle Type */}
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
                </div>
              )}

              {/* Vendor Selection */}
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
                      type="button"
                      onClick={() => setVehicleDetails({ ...vehicleDetails, loadStatus: status })}
                      className={`px-4 py-3 rounded-lg font-semibold transition ${
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
                  className="py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold flex items-center justify-center gap-2 flex-1"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!vehicleDetails.vehicleType || !vehicleDetails.siteId || (vehicleDetails.vehicleType === 'OTHER' && !customVehicleType.trim())}
                  className="py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Required Photos</h3>
                  <p className="text-sm text-gray-600">Tap a card to capture image from camera.</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Vehicle: </div>
                  <div className="text-base sm:text-lg font-bold text-blue-600">{vehicleNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900 mb-1">{item.label}</div>
                        <p className="text-xs text-gray-600 mb-2">{item.desc}</p>
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
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
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
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                Video Evidence <span className="text-gray-400 font-normal text-sm">(Optional)</span>
              </h3>
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

export default OcrScan;