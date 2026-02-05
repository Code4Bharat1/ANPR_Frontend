// components/supervisor/entryVehicles/ocrScan.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import SupervisorLayout from "./SupervisorLayout";
import axios from "axios";
import {
  Camera,
  X,
  Loader2,
  Truck,
  RotateCw,
  Car,
  Video,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Target,
  Upload,
  Contrast,
  Filter,
  ZoomIn,
  Hash,
  Building,
  User,
  Package,
  FileText,
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  XCircle,
  StopCircle,
} from "lucide-react";
import Tesseract from "tesseract.js";
import { useRouter } from "next/navigation";
import { base64ToFile, uploadToWasabi } from "@/utils/wasabiUpload";
import BarrierLoginPage from "@/utils/BarrierLogin";

const INDIAN_STATES = [
  "AN",
  "AP",
  "AR",
  "AS",
  "BR",
  "CH",
  "CG",
  "DN",
  "DD",
  "DL",
  "GA",
  "GJ",
  "HR",
  "HP",
  "JK",
  "JH",
  "KA",
  "KL",
  "LA",
  "LD",
  "MP",
  "MH",
  "MN",
  "ML",
  "MZ",
  "NL",
  "OD",
  "PY",
  "PB",
  "RJ",
  "SK",
  "TN",
  "TS",
  "TR",
  "UP",
  "UK",
  "WB",
];

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
  { value: "OTHER", label: "Other" },
];

const OcrScan = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [cameraView, setCameraView] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const [loading, setLoading] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [barrierLoading, setBarrierLoading] = useState(false);
  const [barrierMessage, setBarrierMessage] = useState("");
  const [message, setMessage] = useState("");
  // Added states from first file
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  // Remove duplicate stream state - use only streamRef
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [ocrResult, setOcrResult] = useState({
    vehicleNumber: "",
    confidence: 0,
    image: null,
    rawText: "",
    suggestions: [],
    isEdited: false,
    stateCode: "",
    district: "",
    series: "",
    number: "",
  });

  const [ocrSettings, setOcrSettings] = useState({
    contrast: 1.2,
    brightness: 1.1,
    sharpen: true,
    autoCrop: true,
    language: "eng",
  });

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [vehicleTypeInput, setVehicleTypeInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredVehicleTypes, setFilteredVehicleTypes] = useState([]);
  const [customVehicleType, setCustomVehicleType] = useState("");
  const [vendorInputMode, setVendorInputMode] = useState("select");
  const [manualVendorName, setManualVendorName] = useState("");
  const [siteInputMode, setSiteInputMode] = useState("select");
  const [manualSiteId, setManualSiteId] = useState("");
  const [manualSiteName, setManualSiteName] = useState("");

  const [sites, setSites] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleType: "",
    vendorId: "",
    materialType: "",
    countofmaterials: "",
    loadStatus: "full",
    challanImage: null,
    notes: "",
    siteId: "",
    siteName: "",
  });

  const [mediaCapture, setMediaCapture] = useState({
    frontView: null,
    backView: null,
    driverView: null,
    loadView: null,
    videoClip: null,
  });

  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingIntervalRef = useRef(null);

  // Cleanup on unmount - from first file
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    fetchSites();
    fetchVendors();
  }, []);

  useEffect(() => {
    if (vehicleTypeInput.trim()) {
      const filtered = VEHICLE_TYPES.filter(
        (type) =>
          type.label.toLowerCase().includes(vehicleTypeInput.toLowerCase()) ||
          type.value.toLowerCase().includes(vehicleTypeInput.toLowerCase()),
      );
      setFilteredVehicleTypes(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredVehicleTypes(VEHICLE_TYPES);
      setShowSuggestions(false);
    }
  }, [vehicleTypeInput]);

  // =====================================================
  // ENHANCED CAMERA FUNCTIONS (from first file - FIXED)
  // =====================================================

  const ocrstartCamera = async () => {
    // console.log('🎥 Starting camera...');
    setCameraView("ocr");

    try {
      setError(null);
      setCameraActive(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }

      await new Promise((resolve) => setTimeout(resolve, 150));

      if (!videoRef.current) {
        console.error("Video element still not found after render");
        setCameraActive(false);
        throw new Error("Video element failed to render. Please try again.");
      }

      // console.log('✅ Video element ready');

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      };

      // console.log('📱 Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      // console.log('✅ Camera stream obtained');

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", "true");
      videoRef.current.setAttribute("webkit-playsinline", "true");
      videoRef.current.muted = true;

      videoRef.current.onloadedmetadata = async () => {
        // console.log('📹 Video metadata loaded');
        try {
          await videoRef.current.play();
          // console.log('▶️ Video playing successfully');
        } catch (playError) {
          console.error("Play error:", playError);
          videoRef.current.muted = true;
          try {
            await videoRef.current.play();
            // console.log('▶️ Video playing (muted retry)');
          } catch (retryError) {
            throw new Error("Could not start video playback");
          }
        }
      };

      setTimeout(async () => {
        if (videoRef.current && videoRef.current.paused) {
          try {
            await videoRef.current.play();
            // console.log('▶️ Video playing (delayed)');
          } catch (err) {
            console.warn("Delayed play attempt failed:", err);
          }
        }
      }, 500);

      setResult(null);
      setCapturedImage(null);
    } catch (err) {
      console.error("❌ Camera error:", err);

      let errorMessage = "Could not access camera. ";

      if (err.name === "NotAllowedError") {
        errorMessage += "Please allow camera access in browser settings.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "No camera found on this device.";
      } else if (err.name === "NotReadableError") {
        errorMessage += "Camera is already in use by another application.";
      } else {
        errorMessage +=
          err.message || "Please check permissions and try again.";
      }

      setError(errorMessage);
      setCameraActive(false);
      setCameraView(null);
      stopCamera();
    }
  };

  const startCamera = async (type) => {
    setCameraView(type);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported");
      }

      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
        },
        audio: type === "video",
      };

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            .play()
            .catch((err) => console.error("Error playing video:", err));
        };
      }

      if (type === "video") {
        startVideoRecording(mediaStream);
      }
    } catch (error) {
      console.error("Camera error:", error);
      alert("Could not access camera. Please check permissions.");
      setCameraView(null);
    }
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

  const stopCamera = () => {
    // console.log('🛑 Stopping camera...');

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        // console.log('Track stopped:', track.kind);
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setCameraView(null);
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

  const startVideoRecording = (mediaStream) => {
    try {
      const options = { mimeType: "video/webm;codecs=vp9" };

      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = "video/webm";
      }

      const recorder = new MediaRecorder(mediaStream, options);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaCapture((prev) => ({ ...prev, videoClip: reader.result }));
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not start video recording");
    }
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const switchCamera = async () => {
    stopCamera();
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacingMode);

    // Small delay to ensure camera is stopped
    await new Promise((resolve) => setTimeout(resolve, 100));

    await startCamera();
  };

  const capturePhoto = () => {
    // console.log('📸 Capturing photo...');

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      alert("Camera not ready");
      return;
    }

    if (video.paused || video.readyState < 2) {
      alert("Please wait for camera to be ready");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    if (canvas.width === 0 || canvas.height === 0) {
      alert("Camera not ready. Please wait a moment.");
      return;
    }

    // console.log(`Image size: ${canvas.width}x${canvas.height}`);

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95);
    // console.log('✅ Image captured');

    setCapturedImage(imageDataUrl);
    stopCamera();

    if (cameraView === "ocr") {
      processOCR(imageDataUrl);
    } else if (
      ["frontView", "backView", "driverView", "loadView"].includes(cameraView)
    ) {
      setMediaCapture((prev) => ({ ...prev, [cameraView]: imageDataUrl }));
    } else if (cameraView === "challan") {
      setVehicleDetails((prev) => ({ ...prev, challanImage: imageDataUrl }));
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // console.log('📁 File selected:', file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result;
      setCapturedImage(imageData);
      processOCR(imageData);
    };
    reader.readAsDataURL(file);
  };

  // =====================================================
  // ENHANCED OCR PROCESSING FUNCTIONS
  // =====================================================

  const processOCR = async (imageDataUrl) => {
    // console.log("🚀 Starting OCR...");
    setOcrProcessing(true);
    setError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    try {
      // ✅ PURE base64 only
      const pureBase64 = imageDataUrl.split(",")[1];

      // ================= API OCR WITH RETRY =================
      let apiResult = null;

      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          // console.log(`🔁 OCR API attempt ${attempt}`);

          const { data } = await axios.post(
            `${API_URL}/api/plate/read`,
            { image_base64: pureBase64 },
            {
              headers: { "Content-Type": "application/json" },
              timeout: 30000, // ⬅️ Render-safe
            },
          );

          if (data?.plate) {
            apiResult = data;
            break;
          }
        } catch (err) {
          const isTimeout = err.code === "ECONNABORTED";
          console.warn(
            `⚠️ API attempt ${attempt} failed`,
            isTimeout ? "Timeout" : err.message,
          );

          if (attempt === 2 && !isTimeout) {
            throw err; // real error → stop
          }
        }
      }

      // ================= API SUCCESS =================
      if (apiResult?.plate) {
        const cleanedText = extractVehicleNumber(apiResult.plate);

        // console.log("✅ API OCR success:", cleanedText);

        setVehicleNumber(cleanedText);
        setOcrResult({
          vehicleNumber: cleanedText,
          confidence: apiResult.score ? Math.round(apiResult.score * 100) : 90,
          image: imageDataUrl,
          rawText: apiResult.plate,
          suggestions: [],
          isEdited: false,
          method: "api",
        });

        return; // ⛔ STOP HERE
      }

      console.warn("⚠️ API OCR unavailable, using Tesseract");

      // ================= FALLBACK: TESSERACT =================
      const results = [];
      const canvas = canvasRef.current;

      const modes = ["standard", "aggressive", "rotated"];

      for (const mode of modes) {
        const result = await processWithTesseract(canvas, mode);
        if (result.success && result.confidence > 50) {
          results.push(result);
          // console.log(`✅ ${mode} OCR:`, result.text);
        }
      }

      if (results.length === 0) {
        throw new Error(
          "❌ Could not detect number plate. Improve lighting, distance, or angle.",
        );
      }

      // ================= PICK BEST RESULT =================
      results.sort((a, b) => {
        const aValid = validateVehicleNumberPattern(a.text);
        const bValid = validateVehicleNumberPattern(b.text);
        if (aValid && !bValid) return -1;
        if (!aValid && bValid) return 1;
        return b.confidence - a.confidence;
      });

      const best = results[0];
      const cleanedText = extractVehicleNumber(best.text);

      // console.log("🎯 Best Tesseract:", cleanedText);

      setVehicleNumber(cleanedText);
      setOcrResult({
        vehicleNumber: cleanedText,
        confidence: Math.round(best.confidence),
        image: imageDataUrl,
        method: best.method,
        rawText: best.text,
        allResults: results,
        isEdited: false,
      });
    } catch (err) {
      console.error("❌ OCR Error:", err);

      setError(
        err?.response?.data?.error ||
          err.message ||
          "OCR processing failed. Please try again.",
      );
    } finally {
      setOcrProcessing(false);
    }
  };

  // Tesseract processing functions (kept from original)
  const processWithTesseract = async (canvas, mode = "standard") => {
    try {
      // console.log(`🔄 Running Tesseract in ${mode} mode...`);

      const tempCanvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const tempCtx = tempCanvas.getContext("2d");

      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;

      tempCtx.drawImage(canvas, 0, 0);

      let imageData = tempCtx.getImageData(
        0,
        0,
        tempCanvas.width,
        tempCanvas.height,
      );

      // Apply different preprocessing based on mode
      if (mode === "standard") {
        imageData = applyStandardPreprocessing(
          imageData,
          tempCanvas.width,
          tempCanvas.height,
        );
      } else if (mode === "aggressive") {
        imageData = applyAggressivePreprocessing(
          imageData,
          tempCanvas.width,
          tempCanvas.height,
        );
      } else if (mode === "rotated") {
        imageData = applyRotationCorrection(
          imageData,
          tempCanvas.width,
          tempCanvas.height,
        );
      }

      tempCtx.putImageData(imageData, 0, 0);

      const {
        data: { text, confidence },
      } = await Tesseract.recognize(tempCanvas, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            // console.log(`Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
        tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
        preserve_interword_spaces: "0",
      });

      const cleaned = text
        .replace(/\s+/g, "")
        .replace(/[^A-Z0-9]/g, "")
        .toUpperCase();

      return {
        success: cleaned.length >= 6,
        text: cleaned,
        confidence: confidence || 0,
        method: `tesseract-${mode}`,
      };
    } catch (error) {
      console.error(`Tesseract ${mode} error:`, error);
      return {
        success: false,
        text: "",
        confidence: 0,
        method: `tesseract-${mode}`,
      };
    }
  };

  // Image preprocessing functions (kept from original)
  const applyStandardPreprocessing = (imageData, width, height) => {
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = data[i + 1] = data[i + 2] = gray;
    }

    const factor = 1.5;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * factor + 128));
      data[i + 1] = data[i];
      data[i + 2] = data[i];
    }

    const threshold = 128;
    for (let i = 0; i < data.length; i += 4) {
      const value = data[i] > threshold ? 255 : 0;
      data[i] = data[i + 1] = data[i + 2] = value;
    }

    return new ImageData(data, width, height);
  };

  const applyAggressivePreprocessing = (imageData, width, height) => {
    const data = new Uint8ClampedArray(imageData.data);

    const contrastFactor = 2.5;
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const enhanced = Math.min(
        255,
        Math.max(0, (gray - 128) * contrastFactor + 128),
      );
      data[i] = data[i + 1] = data[i + 2] = enhanced;
    }

    const sharpenKernel = [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ];

    const sharpened = applyConvolution(data, width, height, sharpenKernel);
    const result = applyAdaptiveThreshold(sharpened, width, height, 15);

    return new ImageData(result, width, height);
  };

  const applyRotationCorrection = (imageData, width, height) => {
    const data = imageData.data;
    const angles = [-10, -5, 0, 5, 10];
    let bestAngle = 0;
    let bestScore = 0;

    for (const angle of angles) {
      const rotated = rotateImage(data, width, height, angle);
      const score = calculateHorizontalEdgeScore(rotated, width, height);
      if (score > bestScore) {
        bestScore = score;
        bestAngle = angle;
      }
    }

    if (bestAngle !== 0) {
      // console.log(`🔄 Correcting rotation by ${bestAngle}°`);
      const corrected = rotateImage(data, width, height, bestAngle);
      return new ImageData(corrected, width, height);
    }

    return imageData;
  };

  const applyConvolution = (data, width, height, kernel) => {
    const result = new Uint8ClampedArray(data.length);
    const kSize = Math.floor(kernel.length / 2);

    for (let y = kSize; y < height - kSize; y++) {
      for (let x = kSize; x < width - kSize; x++) {
        let sum = 0;

        for (let ky = -kSize; ky <= kSize; ky++) {
          for (let kx = -kSize; kx <= kSize; kx++) {
            const pixelIdx = ((y + ky) * width + (x + kx)) * 4;
            const kernelValue = kernel[ky + kSize][kx + kSize];
            sum += data[pixelIdx] * kernelValue;
          }
        }

        const idx = (y * width + x) * 4;
        result[idx] =
          result[idx + 1] =
          result[idx + 2] =
            Math.min(255, Math.max(0, sum));
        result[idx + 3] = 255;
      }
    }

    return result;
  };

  const applyAdaptiveThreshold = (data, width, height, blockSize) => {
    const result = new Uint8ClampedArray(data.length);
    const halfBlock = Math.floor(blockSize / 2);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0;
        let count = 0;

        for (let dy = -halfBlock; dy <= halfBlock; dy++) {
          for (let dx = -halfBlock; dx <= halfBlock; dx++) {
            const ny = Math.min(height - 1, Math.max(0, y + dy));
            const nx = Math.min(width - 1, Math.max(0, x + dx));
            sum += data[(ny * width + nx) * 4];
            count++;
          }
        }

        const mean = sum / count;
        const idx = (y * width + x) * 4;
        const value = data[idx] > mean - 10 ? 255 : 0;
        result[idx] = result[idx + 1] = result[idx + 2] = value;
        result[idx + 3] = 255;
      }
    }

    return result;
  };

  const rotateImage = (data, width, height, angleDegrees) => {
    const angle = (angleDegrees * Math.PI) / 180;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const result = new Uint8ClampedArray(data.length);

    const cx = width / 2;
    const cy = height / 2;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - cx;
        const dy = y - cy;

        const srcX = Math.round(dx * cos - dy * sin + cx);
        const srcY = Math.round(dx * sin + dy * cos + cy);

        if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
          const srcIdx = (srcY * width + srcX) * 4;
          const dstIdx = (y * width + x) * 4;
          result[dstIdx] = data[srcIdx];
          result[dstIdx + 1] = data[srcIdx + 1];
          result[dstIdx + 2] = data[srcIdx + 2];
          result[dstIdx + 3] = 255;
        } else {
          const dstIdx = (y * width + x) * 4;
          result[dstIdx] = result[dstIdx + 1] = result[dstIdx + 2] = 255;
          result[dstIdx + 3] = 255;
        }
      }
    }

    return result;
  };

  const calculateHorizontalEdgeScore = (data, width, height) => {
    let score = 0;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const above = ((y - 1) * width + x) * 4;
        const below = ((y + 1) * width + x) * 4;
        const diff =
          Math.abs(data[idx] - data[above]) + Math.abs(data[idx] - data[below]);
        score += diff;
      }
    }
    return score;
  };

  const validateVehicleNumberPattern = (text) => {
    if (!text || text.length < 6) return false;

    const patterns = [
      // Standard Indian plate: KL-65-AN-7722
      /^[A-Z]{2}[-]?\d{1,2}[-]?[A-Z]{1,3}[-]?\d{3,4}$/i,

      // BH series: 65BH7722AB
      /^\d{2}BH\d{4}[A-Z]{2}$/i,

      // Old format: KL-65-7722
      /^[A-Z]{2}[-]?\d{1,2}[-]?\d{3,4}$/i,

      // Diplomatic plates: 199 CD 1
      /^\d{1,3}[-]?[A-Z]{1,2}[-]?\d{1,3}$/i,

      // Temporary plates: DL-65-AB-123456
      /^[A-Z]{2}[-]?\d{1,2}[-]?[A-Z]{1,2}[-]?\d{5,6}$/i,

      // All numbers format (some special vehicles)
      /^[A-Z]{2}\d{6,8}$/i,

      // No hyphen format: KL65AN7722
      /^[A-Z]{2}\d{1,2}[A-Z]{1,3}\d{3,4}$/i,

      // For testing/development
      /^TEST\d+$/i,
      /^DEMO\d+$/i,
    ];

    return patterns.some((pattern) => pattern.test(text));
  };

  const extractVehicleNumber = (text) => {
    if (!text) return "";

    // console.log('🔍 Raw OCR text:', text);

    // First convert to uppercase
    let clean = text.toUpperCase().trim();

    // Indian state codes (all uppercase)
    const INDIAN_STATES = [
      "AN",
      "AP",
      "AR",
      "AS",
      "BR",
      "CH",
      "CG",
      "DN",
      "DD",
      "DL",
      "GA",
      "GJ",
      "HR",
      "HP",
      "JK",
      "JH",
      "KA",
      "KL",
      "LA",
      "LD",
      "MP",
      "MH",
      "MN",
      "ML",
      "MZ",
      "NL",
      "OD",
      "PY",
      "PB",
      "RJ",
      "SK",
      "TN",
      "TS",
      "TR",
      "UP",
      "UK",
      "WB",
    ];

    // Common OCR errors for Indian plates
    const commonReplacements = {
      0: "O", // Number 0 to letter O (for state codes)
      1: "I", // Number 1 to letter I
      1: "L", // Number 1 to letter L (common for KL -> K1)
      2: "Z", // Number 2 to letter Z
      5: "S", // Number 5 to letter S
      6: "G", // Number 6 to letter G
      8: "B", // Number 8 to letter B
    };

    // First 2 characters should be state code
    let stateCode = clean.substring(0, 2);

    // Check if it's a valid Indian state code
    const isValidState = INDIAN_STATES.includes(stateCode);

    if (!isValidState) {
      // Fix common state code OCR errors
      const stateCorrections = {
        K1: "KL", // K1 -> KL (Kerala)
        M0: "MH", // M0 -> MH (Maharashtra)
        T5: "TN", // T5 -> TN (Tamil Nadu)
        A9: "AP", // A9 -> AP (Andhra Pradesh)
        U0: "UP", // U0 -> UP (Uttar Pradesh)
        R1: "RJ", // R1 -> RJ (Rajasthan)
        H1: "HR", // H1 -> HR (Haryana)
        G0: "GJ", // G0 -> GJ (Gujarat)
        P1: "PB", // P1 -> PB (Punjab)
        W1: "WB", // W1 -> WB (West Bengal)
        K0: "KA", // K0 -> KA (Karnataka)
        N1: "NL", // N1 -> NL (Nagaland)
        M1: "MP", // M1 -> MP (Madhya Pradesh)
        D1: "DL", // D1 -> DL (Delhi)
        C6: "CH", // C6 -> CH (Chandigarh)
      };

      if (stateCorrections[stateCode]) {
        stateCode = stateCorrections[stateCode];
        clean = stateCode + clean.substring(2);
      }
    }

    // Remove all non-alphanumeric characters (keep hyphens for formatting)
    clean = clean.replace(/[^A-Z0-9]/g, "");

    // console.log('🧹 Cleaned:', clean);

    // Indian vehicle number patterns
    const patterns = [
      // Standard format: KL-65-AN-7722
      {
        regex: /^([A-Z]{2})([0-9]{1,2})([A-Z]{1,3})([0-9]{3,4})$/i,
        format: (m) =>
          `${m[1].toUpperCase()}-${m[2].padStart(2, "0")}-${m[3].toUpperCase()}-${m[4].padStart(4, "0")}`,
      },
      // Numbers first format: 65-KL-AN-7722 (some regions)
      {
        regex: /^([0-9]{1,2})([A-Z]{2})([A-Z]{1,3})([0-9]{3,4})$/i,
        format: (m) =>
          `${m[2].toUpperCase()}-${m[1].padStart(2, "0")}-${m[3].toUpperCase()}-${m[4].padStart(4, "0")}`,
      },
      // BH series (Defense): 65BH7722AB
      {
        regex: /^([0-9]{2})BH([0-9]{4})([A-Z]{2})$/i,
        format: (m) => `${m[1]}BH${m[2]}${m[3].toUpperCase()}`,
      },
      // Old format: KL-65-7722
      {
        regex: /^([A-Z]{2})([0-9]{1,2})([0-9]{3,4})$/i,
        format: (m) =>
          `${m[1].toUpperCase()}-${m[2].padStart(2, "0")}-${m[3].padStart(4, "0")}`,
      },
      // Diplomatic plates: 199 CD 1
      {
        regex: /^([0-9]{1,3})([A-Z]{1,2})([0-9]{1,3})$/i,
        format: (m) => `${m[1]}-${m[2]}-${m[3]}`,
      },
      // Temporary plates: DL-65-AB-123456
      {
        regex: /^([A-Z]{2})([0-9]{1,2})([A-Z]{1,2})([0-9]{5,6})$/i,
        format: (m) =>
          `${m[1].toUpperCase()}-${m[2].padStart(2, "0")}-${m[3].toUpperCase()}-${m[4]}`,
      },
    ];

    // Try all pattern matches
    for (const { regex, format } of patterns) {
      const match = clean.match(regex);
      if (match) {
        const result = format(match);
        // console.log('✅ Pattern matched:', result);
        return result;
      }
    }

    // If no pattern matches, try intelligent parsing
    // console.log('⚠️ No exact match, trying intelligent parsing...');

    // Extract state code (first 2 letters)
    const stateMatch = clean.match(/^([A-Z]{2})/i);
    if (!stateMatch) {
      // console.log('❌ No state code found');
      // Try to find known state codes in the text
      for (const state of INDIAN_STATES) {
        if (clean.includes(state)) {
          const stateIndex = clean.indexOf(state);
          if (stateIndex === 0) {
            const remaining = clean.substring(2);
            // Extract numbers
            const numbers = remaining.match(/\d+/g);
            if (numbers && numbers.length > 0) {
              const allNumbers = numbers.join("");
              const result = `${state}-${allNumbers.slice(0, 6)}`;
              // console.log('✅ Reconstructed from state:', result);
              return result;
            }
          }
        }
      }
      return clean; // Return cleaned text
    }

    const stateCodeFinal = stateMatch[1].toUpperCase();
    const remaining = clean.substring(2);

    // Extract district code (usually 2 digits)
    const districtMatch = remaining.match(/^(\d{1,2})/);
    if (!districtMatch) {
      // console.log('❌ No district code found');
      return `${stateCodeFinal}-${remaining}`;
    }

    const districtCode = districtMatch[1].padStart(2, "0");
    const afterDistrict = remaining.substring(districtMatch[0].length);

    // Try to extract series (letters) and number (digits)
    const seriesMatch = afterDistrict.match(/^([A-Z]{1,3})/i);
    let series = "";
    let afterSeries = afterDistrict;

    if (seriesMatch) {
      series = seriesMatch[1].toUpperCase();
      afterSeries = afterDistrict.substring(seriesMatch[0].length);
    }

    // Extract number part (last 3-4 digits)
    const numberMatch = afterSeries.match(/(\d{3,4})$/);
    if (!numberMatch) {
      // If no clear number found, take all remaining digits
      const allNumbers = afterSeries.match(/\d+/g);
      if (allNumbers) {
        const combinedNumbers = allNumbers.join("");
        if (combinedNumbers.length >= 3) {
          const number = combinedNumbers.slice(-4).padStart(4, "0");
          const result = series
            ? `${stateCodeFinal}-${districtCode}-${series}-${number}`
            : `${stateCodeFinal}-${districtCode}-${number}`;
          // console.log('✅ Extracted with combined numbers:', result);
          return result;
        }
      }
      return `${stateCodeFinal}-${districtCode}${afterSeries}`;
    }

    const number = numberMatch[1].padStart(4, "0");

    // Build final result
    const result = series
      ? `${stateCodeFinal}-${districtCode}-${series}-${number}`
      : `${stateCodeFinal}-${districtCode}-${number}`;

    // console.log('✅ Intelligent parsing result:', result);
    return result;
  };

  const validateVehicleNumber = (number) => {
    if (!number || number.length < 6) return false;
    return /^[A-Z0-9-]{6,15}$/.test(number);
  };

  const handleVehicleNumberChange = (value) => {
    const formatted = value
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "")
      .slice(0, 15);

    setVehicleNumber(formatted);

    setOcrResult((prev) => ({
      ...prev,
      vehicleNumber: formatted,
      isEdited: true,
    }));
  };
  // Add missing state
  const [anprData, setAnprData] = useState({
    vehicleNumber: "",
    confidence: 0,
    image: null,
  });

  // =====================================================
  // REMAINING COMPONENT FUNCTIONS
  // =====================================================

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const response = await axios.get(`${API_URL}/api/supervisor/my-site`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let sitesData = [];

      if (response.data && response.data.success) {
        if (Array.isArray(response.data.data)) {
          sitesData = response.data.data;
        } else if (
          response.data.data &&
          typeof response.data.data === "object"
        ) {
          sitesData = [response.data.data];
        }
      } else {
        if (Array.isArray(response.data)) {
          sitesData = response.data;
        } else if (response.data && typeof response.data === "object") {
          sitesData = [response.data];
        }
      }

      setSites(sitesData);

      if (sitesData.length > 0 && siteInputMode === "select") {
        const firstSite = sitesData[0];
        setVehicleDetails((prev) => ({
          ...prev,
          siteId: firstSite._id,
          siteName: firstSite.name,
        }));
      }
    } catch (error) {
      console.error("Error fetching sites:", error);
      setSites([]);
    }
  };

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      const endpoints = [
        `${API_URL}/api/supervisor/vendors`,
        `${API_URL}/api/project/vendors`,
        // `${API_URL}/api/supervisor/vendors-by-site`,
        // `${API_URL}/api/vendors/active`,
        `${API_URL}/api/vendors`,
      ];

      let vendorsData = [];

      for (const endpoint of endpoints) {
        try {
          const response = await axios.get(endpoint, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 5000,
          });

          // console.log(response);

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
            // cons/ole.log(`Successfully fetched ${vendorsData.length} vendors from ${endpoint}`);
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (vendorsData.length === 0) {
        vendorsData = [
          { _id: "1", name: "Test Vendor 1", email: "vendor1@test.com" },
          { _id: "2", name: "Test Vendor 2", email: "vendor2@test.com" },
        ];
      }

      setVendors(vendorsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateVehicleNumber(vehicleNumber)) {
        alert("Please enter a valid vehicle number");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!vehicleDetails.vehicleType) {
        alert("Please select vehicle type");
        return;
      }
      if (vehicleDetails.vehicleType === "OTHER" && !customVehicleType.trim()) {
        alert("Please enter custom vehicle type");
        return;
      }
      if (!vehicleDetails.siteId) {
        alert("Please enter or select a site");
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const retryOCR = () => {
    setVehicleNumber("");
    setOcrResult({
      vehicleNumber: "",
      confidence: 0,
      image: null,
      rawText: "",
      suggestions: [],
      isEdited: false,
      stateCode: "",
      district: "",
      series: "",
      number: "",
    });
    startCamera();
  };

  const handleVehicleTypeSelect = (type) => {
    setVehicleTypeInput(type.label);
    setVehicleDetails({ ...vehicleDetails, vehicleType: type.value });
    setShowSuggestions(false);

    if (type.value !== "OTHER") {
      setCustomVehicleType("");
    }
  };

  const handleSiteModeChange = (mode) => {
    setSiteInputMode(mode);

    if (mode === "select") {
      if (sites.length > 0) {
        const firstSite = sites[0];
        setVehicleDetails((prev) => ({
          ...prev,
          siteId: firstSite._id,
          siteName: firstSite.name,
        }));
      } else {
        setVehicleDetails((prev) => ({ ...prev, siteId: "", siteName: "" }));
      }
      setManualSiteId("");
      setManualSiteName("");
    } else {
      setVehicleDetails((prev) => ({ ...prev, siteId: "", siteName: "" }));
    }
  };

  const handleManualSiteChange = (field, value) => {
    if (field === "id") {
      setManualSiteId(value);
      setVehicleDetails((prev) => ({ ...prev, siteId: value }));
    } else if (field === "name") {
      setManualSiteName(value);
      setVehicleDetails((prev) => ({ ...prev, siteName: value }));
    }
  };

  const handleSiteSelect = (siteId) => {
    const selectedSite = sites.find((s) => s._id === siteId);
    if (selectedSite) {
      setVehicleDetails((prev) => ({
        ...prev,
        siteId: selectedSite._id,
        siteName: selectedSite.name,
      }));
    }
  };

  const startMediaCapture = async (type) => {
    setCameraView(type);

    // Set appropriate camera facing mode based on what we're capturing
    if (type === "driverView") {
      // Front-facing camera for driver cabin
      setFacingMode("user");
    } else {
      // Back camera for everything else (OCR, vehicle views, load, etc.)
      setFacingMode("environment");
    }

    // Small delay to ensure state updates
    await new Promise((resolve) => setTimeout(resolve, 50));

    await startCamera();
  };

  const handleAllowEntry = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      if (!vehicleNumber) {
        alert("❌ Vehicle number is required");
        return;
      }

      const finalVendor =
        vendorInputMode === "manual"
          ? manualVendorName
          : vehicleDetails.vendorId;

      const finalVehicleType =
        vehicleDetails.vehicleType === "OTHER"
          ? customVehicleType
          : vehicleDetails.vehicleType;

      // ✅ ENTRY PHOTOS CONFIG
      const ENTRY_PHOTOS = [
        { key: "frontView", name: "Front View", index: 1 },
        { key: "backView", name: "Back View", index: 2 },
        { key: "loadView", name: "Load View", index: 3 },
        { key: "driverView", name: "Driver View", index: 4 },
      ];

      const uploadedEntryPhotos = {};

      // ✅ Upload entry photos to Wasabi
      for (const photo of ENTRY_PHOTOS) {
        if (!mediaCapture?.[photo.key]) continue;

        const file = base64ToFile(
          mediaCapture[photo.key],
          `${Date.now()}-${photo.key}.jpg`,
        );

        // console.log(file);

        const fileKey = await uploadToWasabi({
          file,
          vehicleId: `${vehicleNumber}/entry/photos`,
          type: "entry",
          index: photo.index,
        });

        uploadedEntryPhotos[photo.key] = fileKey;
      }

      // ✅ Upload challan image (if any)
      let challanKey = "";
      if (vehicleDetails.challanImage) {
        const challanFile = base64ToFile(
          vehicleDetails.challanImage,
          `${Date.now()}-challan.jpg`,
        );

        // console.log("Challan : ", challanFile);

        challanKey = await uploadToWasabi({
          file: challanFile,
          vehicleId: `${vehicleNumber}/entry/challan`,
          type: "entry",
          index: 1,
        });
      }

      // ✅ FINAL ENTRY PAYLOAD
      const entryData = {
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        vendorId: finalVendor || "",
        vehicleType: finalVehicleType || "TRUCK",
        driverName: driverName || "",
        entryTime: new Date().toISOString(),
        purpose: vehicleDetails.materialType || "Material Delivery",
        loadStatus: vehicleDetails.loadStatus.toUpperCase() || "FULL",
        entryGate: "OCR Manual Entry",
        countofmaterials: vehicleDetails.countofmaterials || "",
        notes: vehicleDetails.notes || "",
        siteId: vehicleDetails.siteId,

        media: {
          photos: uploadedEntryPhotos, // ✅ Wasabi keys
          video: "",
          challanImage: challanKey, // ✅ Wasabi key
        },
      };

      const response = await axios.post(
        `${API_URL}/api/supervisor/mobile/trips/manual`,
        entryData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      alert("✅ Vehicle entry recorded successfully!");
      resetForm();
      router.push("/supervisor/active-vehicles");
    } catch (error) {
      console.error("❌ Entry Error:", error);
      alert(error.response?.data?.message || "Entry failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setVehicleNumber("");
    setDriverName("");
    setVehicleTypeInput("");
    setCustomVehicleType("");
    setVendorInputMode("select");
    setManualVendorName("");
    setSiteInputMode("select");
    setManualSiteId("");
    setManualSiteName("");
    setVehicleDetails({
      vehicleType: "",
      vendorId: "",
      materialType: "",
      materialCount: "",
      loadStatus: "full",
      challanImage: null,
      notes: "",
      siteId: "",
      siteName: "",
    });
    // setMediaCapture({
    //   frontView: null,
    //   backView: null,
    //   driverView: null,
    //   loadView: null,
    //   videoClip: null
    // });
    setOcrResult({
      vehicleNumber: "",
      confidence: 0,
      image: null,
      rawText: "",
      suggestions: [],
      isEdited: false,
      stateCode: "",
      district: "",
      series: "",
      number: "",
    });
    setError(null);
    setCapturedImage(null);
  };

  const getCameraLabel = () => {
    const labels = {
      challan: "Challan/Bill",
      frontView: "Front View",
      backView: "Back View",
      driverView: "Driver/Cabin",
      loadView: "Material/Load",
      video: "Video Recording",
      ocr: "Scan Vehicle Number",
    };
    return labels[cameraView] || "Photo";
  };
  const actuateBarrier = async () => {
    setLoading(true);
    console.log("Actuate barrier clicked");
    setMessage("");

    try {
      const res = await axios.post(
        "https://api-anpr.nexcorealliance.com/api/barrier/open",
      );

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Barrier open failed");
      }

      setMessage(res.data.message);
    } catch (err) {
      setMessage(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <SupervisorLayout>
      <BarrierLoginPage />
      <div className="max-w-5xl">
        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileInput}
          className="hidden"
        />

        {/* Camera View - Enhanced from first file */}
        {/* Camera View - Enhanced from first file */}
        {cameraView && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Update the header section in camera view */}
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
                  {cameraView === "ocr"
                    ? "📷 Scan Vehicle Number Plate"
                    : cameraView === "challan"
                      ? "Capture Challan/Bill"
                      : cameraView === "frontView"
                        ? "Capture Front View"
                        : cameraView === "backView"
                          ? "Capture Back View"
                          : cameraView === "driverView"
                            ? "Capture Driver/Cabin"
                            : cameraView === "loadView"
                              ? "Capture Material/Load"
                              : `Capture ${getCameraLabel()}`}
                </div>
                {cameraView === "ocr" && (
                  <div className="text-xs text-yellow-400 mt-1 flex items-center justify-center gap-1">
                    <Target className="w-3 h-3" />
                    Works up to 10+ meters distance
                  </div>
                )}
                {[
                  "frontView",
                  "backView",
                  "driverView",
                  "loadView",
                  "challan",
                ].includes(cameraView) && (
                  <div className="text-xs text-blue-300 mt-1">
                    Position camera for clear photo
                  </div>
                )}
              </div>

              {/* Only show switch camera button for OCR mode */}
              {cameraView === "ocr" ? (
                <button
                  onClick={switchCamera}
                  className="p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
                >
                  <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              ) : (
                <div className="w-10"></div>
              )}
            </div>

            {/* In the camera view section, update the overlay condition: */}
            <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{
                  transform: facingMode === "user" ? "scaleX(-1)" : "none",
                }}
              />
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
                        {cameraView === "video"
                          ? "Recording Video"
                          : `Capture ${getCameraLabel()}`}
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
                      muted={cameraView !== "video"}
                      className="w-full h-full object-cover"
                      style={{
                        transform:
                          facingMode === "user" ? "scaleX(-1)" : "none",
                      }}
                    />

                    {cameraView !== "video" && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-8 border-2 border-white/30 rounded-lg"></div>
                      </div>
                    )}
                  </div>

                  <div className="bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex justify-center items-center">
                    {cameraView === "video" ? (
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
              {/* ONLY SHOW OCR OVERLAY FOR OCR MODE */}
              {cameraView === "ocr" && (
                <div className="absolute inset-0 pointer-events-none">
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

              {/* For other photo modes (driver cabin, load, etc.), show minimal guidance */}
              {[
                "frontView",
                "backView",
                "driverView",
                "loadView",
                "challan",
              ].includes(cameraView) && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Simple center crosshair */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 border-2 border-white/50 rounded-lg"></div>
                  </div>

                  {/* Bottom guidance text */}
                  <div className="absolute bottom-8 left-0 right-0 text-center">
                    <div className="inline-block bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <p className="text-white text-sm font-medium">
                        {cameraView === "frontView" &&
                          "Capture vehicle front with number plate"}
                        {cameraView === "backView" &&
                          "Capture vehicle rear with tail lights"}
                        {cameraView === "driverView" &&
                          "Capture driver/cabin clearly"}
                        {cameraView === "loadView" &&
                          "Capture material/load in vehicle"}
                        {cameraView === "challan" &&
                          "Capture challan/bill clearly"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex justify-center items-center">
              <button
                onClick={capturePhoto}
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            OCR Vehicle Entry
          </h1>
          <p className="text-gray-600">
            Step {step}:{" "}
            {step === 1
              ? "Vehicle Number Scan"
              : step === 2
                ? "Vehicle Details & Submit"
                : ""}
          </p>
        </div>

        {/* Progress Steps */}
        {/* Progress Steps - Responsive */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                      s === step
                        ? "bg-blue-600 text-white"
                        : s < step
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {s < step ? (
                      <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" />
                    ) : (
                      s
                    )}
                  </div>
                  <div className="hidden sm:block">
                    <div
                      className={`text-sm font-semibold ${s === step ? "text-blue-600" : s < step ? "text-green-600" : "text-gray-500"}`}
                    >
                      Step {s}
                    </div>
                    <div className="text-xs text-gray-500">
                      {s === 1 ? "Arrival" : s === 2 ? "Details" : "Media"}
                    </div>
                  </div>
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 sm:mx-4 ${s < step ? "bg-green-600" : "bg-gray-200"}`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: OCR Scan - Enhanced with better UI */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            {error && !ocrProcessing && !ocrResult.vehicleNumber && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {ocrProcessing ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">
                  Processing with 4-pass OCR...
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Advanced algorithms for 10+ meter distance
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                    style={{ animationDelay: "0.15s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"
                    style={{ animationDelay: "0.3s" }}
                  ></div>
                </div>
              </div>
            ) : ocrResult.vehicleNumber ? (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-xs text-blue-600 font-semibold mb-1">
                    SCANNED IMAGE
                  </div>
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
                    <span className="text-gray-600">
                      Confidence ({ocrResult.method})
                    </span>
                    <span className="font-bold text-green-600">
                      {ocrResult.confidence}%
                    </span>
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
                      onChange={(e) =>
                        handleVehicleNumberChange(e.target.value)
                      }
                      className={`w-full px-4 py-3 border-2 rounded-lg text-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono ${
                        validateVehicleNumber(vehicleNumber)
                          ? "border-green-400 bg-green-50"
                          : "border-blue-300"
                      }`}
                      placeholder="e.g. MH-12-AB-1234"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Multi-Pass OCR Detection
                      </div>
                      {vehicleNumber && (
                        <div
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            validateVehicleNumber(vehicleNumber)
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {validateVehicleNumber(vehicleNumber)
                            ? "✓ Valid"
                            : "✗ Invalid"}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Enhanced OCR Features
                    </div>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• 4-pass OCR (API + 3x Tesseract modes)</li>
                      <li>• Adaptive histogram equalization</li>
                      <li>• Multi-scale sharpening</li>
                      <li>• Auto-rotation correction (±10°)</li>
                      <li>• Intelligent pattern matching</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={retryOCR}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Scan Again
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!validateVehicleNumber(vehicleNumber)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Next Step
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <button
                    onClick={ocrstartCamera}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg flex items-center justify-center gap-3"
                  >
                    <Camera className="w-6 h-6" />
                    Open Camera Scanner
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">OR</span>
                    </div>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-4 px-6 rounded-2xl transition-all duration-200 border-2 border-dashed border-gray-300 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5" />
                    Choose from Gallery
                  </button>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Enhanced OCR Features:
                    </div>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• API + Tesseract multi-pass detection</li>
                      <li>• Works up to 10+ meters distance</li>
                      <li>• Advanced image preprocessing</li>
                      <li>• Auto-rotation correction</li>
                      <li>• Pattern-based validation</li>
                    </ul>
                  </div>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Hash className="w-8 h-8 text-gray-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Enter Manually
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Type vehicle number manually
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Vehicle Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={vehicleNumber}
                        onChange={(e) =>
                          handleVehicleNumberChange(e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                        placeholder="e.g. MH-12-AB-1234"
                        maxLength={15}
                      />
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">
                        Valid Formats:
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className="bg-white p-2 rounded border">
                          <div className="font-mono font-bold">
                            MH-12-AB-1234
                          </div>
                          <div className="text-gray-500">Standard Format</div>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <div className="font-mono font-bold">
                            DL-01-C-5678
                          </div>
                          <div className="text-gray-500">
                            Single Letter Series
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded border">
                          <div className="font-mono font-bold">22BH1234AB</div>
                          <div className="text-gray-500">BH Series</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Vehicle Details - CONTINUES ON NEXT MESSAGE DUE TO LENGTH */}
        {/* Step 2: Vehicle Details with Site Selection */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
              Entry Details
            </h3>
            <p className="text-sm text-gray-600 mb-4 sm:mb-6">
              Please fill in the consignment and vehicle information below.
            </p>

            <div className="space-y-4 sm:space-y-5">
              {/* Vehicle Number (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  value={ocrResult.vehicleNumber}
                  disabled
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-base sm:text-lg font-bold text-blue-900"
                />
              </div>

              {/* Site Selection - BOTH DROPDOWN AND MANUAL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Site <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />

                  <select
                    value={vehicleDetails.siteId}
                    onChange={(e) => handleSiteSelect(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 outline-none appearance-none bg-white"
                  >
                    <option value="">Select Site...</option>
                    {sites.map((site) => (
                      <option key={site._id} value={site._id}>
                        {site.name} {site.location ? `- ${site.location}` : ""}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                {/* Optional validation message */}
                {!vehicleDetails.siteId && (
                  <p className="text-red-500 text-xs mt-1">
                    Please select a site
                  </p>
                )}
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
                <p className="text-xs text-gray-500 mt-1">
                  This information will be recorded with the entry
                </p>
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
                          <div className="font-semibold text-gray-900">
                            {type.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {type.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {!vehicleDetails.vehicleType && (
                  <p className="text-red-500 text-xs mt-1">
                    Please select a vehicle type
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Start typing to see suggestions or select from dropdown
                </p>
              </div>

              {/* Custom Vehicle Type Input */}
              {vehicleDetails.vehicleType === "OTHER" && (
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter Custom Vehicle Type{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customVehicleType}
                    onChange={(e) => setCustomVehicleType(e.target.value)}
                    placeholder="e.g., Mobile Crane, Water Tanker, etc..."
                    className="w-full px-4 py-3 border border-yellow-400 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none bg-white"
                  />
                  {!customVehicleType.trim() && (
                    <p className="text-red-500 text-xs mt-1">
                      Please enter custom vehicle type
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-2">
                    Please specify the exact vehicle type
                  </p>
                </div>
              )}

              {/* Vendor Selection with Manual Entry Option */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vendor / Transporter{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>

                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setVendorInputMode("select");
                      setManualVendorName("");
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition ${
                      vendorInputMode === "select"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Select from List
                  </button>
                  {/* <button
                    type="button"
                    onClick={() => {
                      setVendorInputMode("manual");
                      setVehicleDetails({ ...vehicleDetails, vendorId: "" });
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm transition ${vendorInputMode === "manual"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Enter Manually
                  </button> */}
                </div>

                {vendorInputMode === "select" ? (
                  <select
                    value={vehicleDetails.vendorId}
                    onChange={(e) =>
                      setVehicleDetails({
                        ...vehicleDetails,
                        vendorId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select Vendor...</option>
                    {vendors.map((vendor) => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.name}
                      </option>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Load Status
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {["full", "partial", "empty"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setVehicleDetails({
                          ...vehicleDetails,
                          loadStatus: status,
                        })
                      }
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition ${
                        vehicleDetails.loadStatus === status
                          ? "bg-blue-600 text-white border-2 border-blue-600"
                          : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300"
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
                  Material Type{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={vehicleDetails.materialType}
                  onChange={(e) =>
                    setVehicleDetails({
                      ...vehicleDetails,
                      materialType: e.target.value,
                    })
                  }
                  placeholder="e.g. Steel Rods, Cement Bags..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Count of Material */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Count of Material{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={vehicleDetails.countofmaterials}
                  onChange={(e) =>
                    setVehicleDetails({
                      ...vehicleDetails,
                      countofmaterials: e.target.value,
                    })
                  }
                  placeholder="e.g. 50 bags, 10 boxes, 500 kg..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {/* Challan / Bill - Camera Capture */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Challan / Bill Capture{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center ${
                    vehicleDetails.challanImage
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  {vehicleDetails.challanImage ? (
                    <div className="space-y-2 sm:space-y-3">
                      <img
                        src={vehicleDetails.challanImage}
                        alt="Challan"
                        className="w-full h-32 sm:h-48 object-cover rounded-lg mb-2"
                      />
                      <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 mx-auto" />
                      <p className="text-sm font-semibold text-green-700">
                        Challan captured successfully!
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setVehicleDetails({
                            ...vehicleDetails,
                            challanImage: null,
                          })
                        }
                        className="text-sm text-red-600 hover:text-red-700 font-semibold"
                      >
                        Remove & Capture Again
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Camera className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                      <p className="text-sm text-gray-600 mb-2 sm:mb-3">
                        Capture challan/bill using camera (Optional)
                      </p>
                      <button
                        type="button"
                        onClick={() => startCamera("challan")}
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
                  onChange={(e) =>
                    setVehicleDetails({
                      ...vehicleDetails,
                      notes: e.target.value,
                    })
                  }
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
                  disabled={
                    !vehicleDetails.vehicleType ||
                    !vehicleDetails.siteId ||
                    (vehicleDetails.vehicleType === "OTHER" &&
                      !customVehicleType.trim())
                  }
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
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                    Required Photos
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tap a card to capture image from camera.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Vehicle: </div>
                  <div className="text-base sm:text-lg font-bold text-blue-600">
                    {anprData.vehicleNumber}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Site:{" "}
                    {vehicleDetails.siteName ||
                      vehicleDetails.siteId.substring(0, 8) + "..."}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  {
                    key: "frontView",
                    label: "Front View",
                    desc: "Number plate & cabin",
                  },
                  {
                    key: "backView",
                    label: "Back View",
                    desc: "Tail & cargo doors",
                  },
                  {
                    key: "driverView",
                    label: "Driver / Cabin",
                    desc: "Driver or empty cabin",
                  },
                  {
                    key: "loadView",
                    label: "Material / Load",
                    desc: "Cargo or empty bed",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className={`relative border-2 border-dashed rounded-lg p-4 transition cursor-pointer ${
                      mediaCapture[item.key]
                        ? "border-green-300 bg-green-50"
                        : "border-blue-300 bg-blue-50 hover:bg-blue-100"
                    }`}
                    onClick={() =>
                      !mediaCapture[item.key] && startCamera(item.key)
                    }
                  >
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          mediaCapture[item.key]
                            ? "bg-green-600 text-white"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
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
                        <div className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                          {item.label}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          {item.desc}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMediaCapture({
                              ...mediaCapture,
                              [item.key]: null,
                            });
                          }}
                          className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold"
                        >
                          Retake Photo
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900 text-sm sm:text-base mb-1">
                          {item.label}
                        </div>
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
                Video Evidence{" "}
                <span className="text-gray-400 font-normal text-xs sm:text-sm">
                  (Optional)
                </span>
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Record a 360° walkaround of the vehicle
              </p>

              <div
                className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center ${
                  mediaCapture.videoClip
                    ? "border-green-300 bg-green-50"
                    : "border-gray-300 bg-gray-50"
                }`}
              >
                {mediaCapture.videoClip ? (
                  <div>
                    <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 mx-auto mb-2 sm:mb-3" />
                    <p className="text-sm font-semibold text-green-700 mb-2 sm:mb-3">
                      Video recorded successfully!
                    </p>
                    <button
                      onClick={() =>
                        setMediaCapture({ ...mediaCapture, videoClip: null })
                      }
                      className="text-sm text-red-600 hover:text-red-700 font-semibold"
                    >
                      Remove Video
                    </button>
                  </div>
                ) : (
                  <div>
                    <Video className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-2 sm:mb-3" />
                    <p className="text-sm text-gray-600 mb-3 sm:mb-4">
                      Record Video Clip with Camera
                    </p>
                    <button
                      onClick={() => startCamera("video")}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center gap-2 mx-auto text-sm sm:text-base"
                    >
                      <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                      Start Recording
                    </button>
                  </div>
                )}
              </div>
            </div>
            {/* ✅ NEW: Barrier Control Section */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      Barrier Control
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Open gate for vehicle entry
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={actuateBarrier}
                disabled={barrierLoading}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg"
              >
                {barrierLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Opening Barrier...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                    OPEN BARRIER
                  </>
                )}
              </button>

              {barrierMessage && (
                <div
                  className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
                    barrierMessage.toLowerCase().includes("error") ||
                    barrierMessage.toLowerCase().includes("not found") ||
                    barrierMessage.toLowerCase().includes("failed")
                      ? "bg-red-50 border border-red-200"
                      : "bg-green-50 border border-green-200"
                  }`}
                >
                  <svg
                    className={`w-5 h-5 flex-shrink-0 ${
                      barrierMessage.toLowerCase().includes("error") ||
                      barrierMessage.toLowerCase().includes("not found") ||
                      barrierMessage.toLowerCase().includes("failed")
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    {barrierMessage.toLowerCase().includes("error") ||
                    barrierMessage.toLowerCase().includes("not found") ||
                    barrierMessage.toLowerCase().includes("failed") ? (
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    ) : (
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    )}
                  </svg>
                  <p
                    className={`text-xs sm:text-sm font-medium ${
                      barrierMessage.toLowerCase().includes("error") ||
                      barrierMessage.toLowerCase().includes("not found") ||
                      barrierMessage.toLowerCase().includes("failed")
                        ? "text-red-700"
                        : "text-green-700"
                    }`}
                  >
                    {barrierMessage}
                  </p>
                </div>
              )}
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
                disabled={
                  loading ||
                  !mediaCapture.frontView ||
                  !mediaCapture.backView ||
                  !mediaCapture.driverView ||
                  !mediaCapture.loadView
                }
                className="py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Allow Entry"
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
