// // components/supervisor/exitVehicles.jsx
// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import SupervisorLayout from "./SupervisorLayout";
// import axios from "axios";
// import {
//   Search,
//   ArrowRight,
//   Loader2,
//   Package,
//   Clock,
//   CheckCircle,
//   Camera,
//   Video,
//   X,
//   ArrowLeft,
//   RotateCw,
// } from "lucide-react";
// import { base64ToFile, uploadToWasabi } from "@/utils/wasabiUpload";
// import BarrierLoginPage from "@/utils/BarrierLogin";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// const ExitVehicles = () => {
//   const [currentView, setCurrentView] = useState("list");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeVehicles, setActiveVehicles] = useState([]);
//   const [filteredVehicles, setFilteredVehicles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedVehicle, setSelectedVehicle] = useState(null);
//   const [cameraField, setCameraField] = useState(null);
//   const [stream, setStream] = useState(null);
//   const [facingMode, setFacingMode] = useState("environment");
//   const [resolvedExitMedia, setResolvedExitMedia] = useState({
//     photos: {},
//     video: null,
//   });

//   const [resolvedEntryMedia, setResolvedEntryMedia] = useState({
//     photos: {},
//     video: null,
//   });
//   const [barrierLoading, setBarrierLoading] = useState(false);
//   const [barrierMessage, setBarrierMessage] = useState("");
//   const [message, setMessage] = useState("");
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   // State for 4 mandatory photos + 1 optional video
//   const [exitData, setExitData] = useState({
//     exitLoadStatus: "empty",
//     returnMaterialType: "",
//     papersVerified: true,
//     physicalInspection: false,
//     materialMatched: false,
//     exitNotes: "",
//     exitMedia: {
//       frontView: null, // ✅ Mandatory
//       backView: null, // ✅ Mandatory
//       loadView: null, // ✅ Mandatory
//       driverView: null, // ✅ Mandatory (4th photo)
//       videoClip: null, // ✅ Optional
//     },
//   });

//   const resolveExitMedia = async (exitMedia) => {
//     if (!exitMedia) return;

//     try {
//       const resolvedPhotos = {};

//       // 🔹 resolve photos
//       if (exitMedia.photos) {
//         for (const key in exitMedia.photos) {
//           const fileKey = exitMedia.photos[key];
//           if (fileKey) {
//             const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
//               params: { key: fileKey },
//             });
//             resolvedPhotos[key] = res.data.url;
//           }
//         }
//       }

//       // 🔹 resolve video
//       let resolvedVideo = null;
//       if (exitMedia.video) {
//         const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
//           params: { key: exitMedia.video },
//         });
//         resolvedVideo = res.data.url;
//       }

//       setResolvedExitMedia({
//         photos: resolvedPhotos,
//         video: resolvedVideo,
//       });
//     } catch (err) {
//       console.error("❌ Exit media resolve failed", err);
//     }
//   };

//   const resolveEntryMedia = async (entryMedia) => {
//     if (!entryMedia) return;

//     try {
//       const token = localStorage.getItem("accessToken");
//       const resolvedPhotos = {};

//       // 🔹 resolve photos
//       if (entryMedia.photos) {
//         for (const key in entryMedia.photos) {
//           const fileKey = entryMedia.photos[key];
//           if (fileKey) {
//             try {
//               const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
//                 params: { key: fileKey },
//                 headers: { Authorization: `Bearer ${token}` },
//               });
//               resolvedPhotos[key] = res.data.url;
//             } catch (err) {
//               console.warn(`Failed to load entry ${key} photo`, err);
//             }
//           }
//         }
//       }

//       // 🔹 resolve video (optional)
//       let resolvedVideo = null;
//       if (entryMedia.video) {
//         try {
//           const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
//             params: { key: entryMedia.video },
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           resolvedVideo = res.data.url;
//         } catch (err) {
//           console.warn("Failed to load entry video", err);
//         }
//       }

//       setResolvedEntryMedia({
//         photos: resolvedPhotos,
//         video: resolvedVideo,
//       });
//     } catch (err) {
//       console.error("❌ Entry media resolve failed", err);
//     }
//   };

//   useEffect(() => {
//     if (selectedVehicle?.entryMedia) {
//       resolveEntryMedia(selectedVehicle.entryMedia);
//     } else {
//       setResolvedEntryMedia({ photos: {}, video: null });
//     }

//     if (selectedVehicle?.exitMedia) {
//       resolveExitMedia(selectedVehicle.exitMedia);
//     } else {
//       setResolvedExitMedia({ photos: {}, video: null });
//     }
//   }, [selectedVehicle]);

//   useEffect(() => {
//     fetchActiveVehicles();

//     return () => {
//       stopCamera();
//     };
//   }, []);

//   useEffect(() => {
//     applySearchFilter();
//   }, [searchQuery, activeVehicles]);

//   const fetchActiveVehicles = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("accessToken");

//       try {
//         const response = await axios.get(
//           `${API_URL}/api/supervisor/vehicles/active`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           },
//         );
//         // console.log("Active vehicles response:", response.data);

//         const data = response.data.data || response.data || [];
//         const vehiclesArray = Array.isArray(data) ? data : [];

//         if (vehiclesArray.length > 0) {
//           setActiveVehicles(vehiclesArray);
//           setFilteredVehicles(vehiclesArray);
//           return;
//         }
//       } catch (apiError) {
//         console.warn("API fetch failed:", apiError);
//       }
//     } catch (error) {
//       console.error("Error fetching active vehicles:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const applySearchFilter = () => {
//     if (!searchQuery.trim()) {
//       setFilteredVehicles(activeVehicles);
//       return;
//     }

//     const filtered = activeVehicles.filter(
//       (v) =>
//         (v.vehicleNumber || "")
//           .toLowerCase()
//           .includes(searchQuery.toLowerCase()) ||
//         (v.vendor || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (v.driver || "").toLowerCase().includes(searchQuery.toLowerCase()),
//     );
//     setFilteredVehicles(filtered);
//   };

//   const handleSearch = () => {
//     applySearchFilter();
//   };

//   const handleSelectVehicle = (vehicle) => {
//     setSelectedVehicle(vehicle);
//     setCurrentView("process");
//   };

//   const handleBackToList = () => {
//     setCurrentView("list");
//     setSelectedVehicle(null);
//     resetExitData();
//   };
//   useEffect(() => {
//     if (selectedVehicle?.exitMedia) {
//       resolveExitMedia(selectedVehicle.exitMedia);
//     } else {
//       setResolvedExitMedia({ photos: {}, video: null });
//     }
//   }, [selectedVehicle]);

//   const resetExitData = () => {
//     setExitData({
//       exitLoadStatus: "empty",
//       returnMaterialType: "",
//       papersVerified: true,
//       physicalInspection: false,
//       materialMatched: false,
//       exitNotes: "",
//       exitMedia: {
//         frontView: null,
//         backView: null,
//         loadView: null,
//         driverView: null,
//         videoClip: null,
//       },
//     });
//   };

//   const startCamera = async (field) => {
//     try {
//       setCameraField(field);
//       setCurrentView("camera");

//       const constraints = {
//         video: {
//           facingMode: facingMode,
//           width: { ideal: 1920 },
//           height: { ideal: 1080 },
//         },
//       };

//       const mediaStream =
//         await navigator.mediaDevices.getUserMedia(constraints);
//       setStream(mediaStream);

//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;
//       }
//     } catch (error) {
//       console.error("Error accessing camera:", error);
//       alert("Could not access camera. Please grant camera permissions.");
//       setCurrentView("process");
//     }
//   };

//   const stopCamera = () => {
//     if (stream) {
//       stream.getTracks().forEach((track) => track.stop());
//       setStream(null);
//     }
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
//   };

//   const switchCamera = async () => {
//     stopCamera();
//     const newFacingMode = facingMode === "user" ? "environment" : "user";
//     setFacingMode(newFacingMode);

//     try {
//       const constraints = {
//         video: {
//           facingMode: newFacingMode,
//           width: { ideal: 1920 },
//           height: { ideal: 1080 },
//         },
//       };

//       const mediaStream =
//         await navigator.mediaDevices.getUserMedia(constraints);
//       setStream(mediaStream);

//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;
//       }
//     } catch (error) {
//       console.error("Error switching camera:", error);
//     }
//   };

//   const capturePhoto = () => {
//     if (!videoRef.current || !canvasRef.current) return;

//     const video = videoRef.current;
//     const canvas = canvasRef.current;

//     canvas.width = video.videoWidth;
//     canvas.height = video.videoHeight;

//     const context = canvas.getContext("2d");
//     context.drawImage(video, 0, 0, canvas.width, canvas.height);

//     const imageData = canvas.toDataURL("image/jpeg", 0.9);

//     setExitData((prev) => ({
//       ...prev,
//       exitMedia: { ...prev.exitMedia, [cameraField]: imageData },
//     }));

//     stopCamera();
//     setCurrentView("process");
//   };

//   const cancelCamera = () => {
//     stopCamera();
//     setCurrentView("process");
//   };
//   const handleAllowExit = async () => {
//     if (
//       exitData.exitLoadStatus === "loaded" &&
//       !exitData.returnMaterialType.trim()
//     ) {
//       alert("Please enter return material type");
//       return;
//     }

//     const REQUIRED_PHOTOS = [
//       { key: "frontView", name: "Front View", index: 1 },
//       { key: "backView", name: "Back View", index: 2 },
//       { key: "loadView", name: "Load View", index: 3 },
//       { key: "driverView", name: "Driver View", index: 4 },
//     ];

//     const missingPhotos = REQUIRED_PHOTOS.filter(
//       (p) => !exitData.exitMedia?.[p.key],
//     );

//     if (missingPhotos.length > 0) {
//       alert(
//         `Please capture all mandatory photos:\n${missingPhotos
//           .map((p) => `• ${p.name}`)
//           .join("\n")}`,
//       );
//       return;
//     }

//     const vehicleId = selectedVehicle?._id;
//     if (!vehicleId) {
//       alert("Invalid vehicle selected");
//       return;
//     }

//     try {
//       setLoading(true);

//       const token = localStorage.getItem("accessToken");
//       if (!token) {
//         alert("Authentication token missing");
//         return;
//       }

//       const uploadedPhotoKeys = {};

//       // 🔥 PHOTO UPLOADS
//       for (const photo of REQUIRED_PHOTOS) {
//         const file = base64ToFile(
//           exitData.exitMedia[photo.key],
//           `${Date.now()}-${photo.key}.jpg`,
//         );

//         const fileKey = await uploadToWasabi({
//           file,
//           vehicleId,
//           type: "exit",
//           index: photo.index,
//         });

//         uploadedPhotoKeys[photo.key] = fileKey;
//       }

//       // 🔥 VIDEO UPLOAD (optional)
//       let videoKey = "";
//       if (exitData.exitMedia?.videoClip) {
//         try {
//           const videoFile = base64ToFile(
//             exitData.exitMedia.videoClip,
//             `${Date.now()}-exit-video.webm`,
//           );

//           videoKey = await uploadToWasabi({
//             file: videoFile,
//             vehicleId,
//             type: "exit",
//           });
//         } catch (err) {
//           console.warn("⚠️ Video upload failed", err);
//         }
//       }

//       // 🔥 FINAL EXIT PAYLOAD
//       const exitPayload = {
//         vehicleId,
//         exitTime: new Date().toISOString(),
//         exitLoadStatus: exitData.exitLoadStatus,
//         returnMaterialType: exitData.returnMaterialType || "",
//         papersVerified: exitData.papersVerified,
//         physicalInspection: exitData.physicalInspection,
//         materialMatched: exitData.materialMatched,
//         exitNotes: exitData.exitNotes || "",
//         exitMedia: {
//           photos: uploadedPhotoKeys,
//           video: videoKey,
//         },
//       };

//       const res = await axios.post(
//         `${API_URL}/api/supervisor/vehicles/exit`,
//         exitPayload,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         },
//       );

//       alert("✅ Vehicle exit allowed successfully!");
//       handleBackToList();
//       fetchActiveVehicles();
//     } catch (error) {
//       console.error("❌ Exit error:", error);
//       alert(error.response?.data?.message || "Failed to process exit");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusBadge = (status) => {
//     const configs = {
//       loading: { bg: "bg-blue-100", text: "text-blue-700", label: "Loading" },
//       unloading: {
//         bg: "bg-green-100",
//         text: "text-green-700",
//         label: "Unloading",
//       },
//       overstay: {
//         bg: "bg-orange-100",
//         text: "text-orange-700",
//         label: "Overstay",
//       },
//     };

//     const config = configs[status] || configs.loading;
//     return { config, label: config.label };
//   };
//   const actuateBarrier = async () => {
//     setLoading(true);
//     // setMessage("");

//     try {
//       const res = await axios.post(
//         "https://api-anpr.nexcorealliance.com/api/barrier/open",
//       );

//       if (!res.data?.success) {
//         throw new Error(res.data?.message || "Barrier open failed");
//       }

//       setMessage(res.data.message);
//     } catch (err) {
//       setMessage(err?.response?.data?.message || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <SupervisorLayout>
//       {/* <BarrierLoginPage/> */}
//       <div className="max-w-7xl mx-auto">
//         <canvas ref={canvasRef} className="hidden" />

//         {/* LIST VIEW */}
//         {currentView === "list" && (
//           <>
//             <div className="mb-6">
//               <h1 className="text-2xl font-bold text-gray-900 mb-2">
//                 Vehicle Exit
//               </h1>
//               <p className="text-gray-600">Select a vehicle to process exit</p>
//             </div>

//             <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-6">
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <div className="flex-1 relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                   <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     onKeyPress={(e) => e.key === "Enter" && handleSearch()}
//                     placeholder="Search vehicle, vendor, driver..."
//                     className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                   />
//                 </div>
//                 <button
//                   onClick={handleSearch}
//                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
//                 >
//                   Search
//                 </button>
//               </div>
//               <div className="mt-3 text-sm text-gray-600">
//                 Showing{" "}
//                 <span className="font-bold text-blue-600">
//                   {filteredVehicles.length}
//                 </span>{" "}
//                 of {activeVehicles.length} vehicles
//               </div>
//             </div>

//             <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//               <div className="p-5 border-b border-gray-200">
//                 <h2 className="text-lg font-bold text-gray-900">
//                   Active Vehicles ({filteredVehicles.length})
//                 </h2>
//                 <p className="text-sm text-gray-600">
//                   Select a vehicle to process exit
//                 </p>
//               </div>

//               {loading ? (
//                 <div className="p-12 text-center">
//                   <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
//                   <p className="text-gray-600">Loading vehicles...</p>
//                 </div>
//               ) : filteredVehicles.length === 0 ? (
//                 <div className="p-12 text-center">
//                   <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                   <h3 className="text-xl font-bold text-gray-900 mb-2">
//                     No active vehicles
//                   </h3>
//                   <p className="text-gray-600">
//                     {activeVehicles.length === 0
//                       ? "All vehicles have exited the premises"
//                       : "Try adjusting your search"}
//                   </p>
//                 </div>
//               ) : (
//                 <div className="divide-y divide-gray-200">
//                   {filteredVehicles.map((vehicle) => {
//                     const statusInfo = getStatusBadge(vehicle.status);
//                     return (
//                       <div
//                         key={vehicle._id}
//                         className="p-5 hover:bg-gray-50 transition"
//                       >
//                         <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
//                           <div className="flex-1 w-full">
//                             <div className="flex items-center gap-3 mb-2">
//                               <h3 className="text-lg font-bold text-gray-900">
//                                 {vehicle.vehicleNumber || "N/A"}
//                               </h3>
//                               <span
//                                 className={`px-2 py-1 rounded text-xs font-semibold ${statusInfo.config.bg} ${statusInfo.config.text}`}
//                               >
//                                 {statusInfo.label}
//                               </span>
//                             </div>

//                             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
//                               <div>
//                                 <div className="text-gray-500">Vendor</div>
//                                 <div className="font-semibold text-gray-900">
//                                   {vehicle.vendor || "Unknown"}
//                                 </div>
//                               </div>
//                               <div>
//                                 <div className="text-gray-500">Driver</div>
//                                 <div className="font-semibold text-gray-900">
//                                   {vehicle.driver || "N/A"}
//                                 </div>
//                               </div>
//                               <div>
//                                 <div className="text-gray-500">Entry Time</div>
//                                 <div className="font-semibold text-gray-900">
//                                   {vehicle.entryTime || "N/A"}
//                                 </div>
//                               </div>
//                               <div>
//                                 <div className="text-gray-500">Duration</div>
//                                 <div
//                                   className={`font-semibold ${
//                                     vehicle.status === "overstay"
//                                       ? "text-orange-600"
//                                       : "text-gray-900"
//                                   }`}
//                                 >
//                                   {vehicle.duration || "0h 0m"}
//                                 </div>
//                               </div>
//                             </div>
//                           </div>

//                           <button
//                             onClick={() => handleSelectVehicle(vehicle)}
//                             className="w-full lg:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
//                           >
//                             Allow Exit
//                             <ArrowRight className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </div>
//           </>
//         )}

//         {/* CAMERA VIEW */}
//         {currentView === "camera" && (
//           <div className="fixed inset-0 bg-black z-50 flex flex-col">
//             {/* Header */}
//             <div className="bg-black/80 backdrop-blur-sm p-3 sm:p-4 flex items-center justify-between shrink-0">
//               <button
//                 onClick={cancelCamera}
//                 className="p-2 sm:p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition active:scale-95"
//               >
//                 <X className="w-5 h-5 sm:w-6 sm:h-6" />
//               </button>

//               <div className="text-white font-semibold text-sm sm:text-base">
//                 Capture{" "}
//                 {cameraField === "frontView"
//                   ? "Front View"
//                   : cameraField === "backView"
//                     ? "Back View"
//                     : cameraField === "loadView"
//                       ? "Load View"
//                       : cameraField === "driverView"
//                         ? "Driver View"
//                         : "Photo"}
//               </div>

//               <button
//                 onClick={switchCamera}
//                 className="p-2 sm:p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition active:scale-95"
//               >
//                 <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
//               </button>
//             </div>

//             {/* Video Container */}
//             <div className="flex-1 flex items-center justify-center bg-black overflow-hidden">
//               <video
//                 ref={videoRef}
//                 autoPlay
//                 playsInline
//                 muted
//                 className="w-full h-full object-cover"
//               />
//             </div>

//             {/* Capture Button */}
//             <div
//               className="bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex justify-center items-center shrink-0"
//               style={{
//                 paddingBottom: "max(2rem, env(safe-area-inset-bottom) + 1rem)",
//               }}
//             >
//               <button
//                 onClick={capturePhoto}
//                 className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center active:scale-95 transition shadow-2xl relative touch-manipulation"
//                 style={{ WebkitTapHighlightColor: "transparent" }}
//               >
//                 <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white border-4 border-gray-400 rounded-full"></div>
//               </button>
//             </div>

//             {/* Helper text */}
//             <div className="absolute bottom-24 sm:bottom-32 left-0 right-0 text-center pointer-events-none">
//               <p className="text-white text-sm sm:text-base font-medium drop-shadow-lg px-4">
//                 Tap the button to capture photo
//               </p>
//             </div>
//           </div>
//         )}

//         {/* PROCESS VIEW */}
//         {currentView === "process" && selectedVehicle && (
//           <>
//             <div className="mb-6">
//               <button
//                 onClick={handleBackToList}
//                 className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 font-semibold"
//               >
//                 <ArrowLeft className="w-5 h-5" />
//                 Back to Vehicle List
//               </button>
//               <h1 className="text-2xl font-bold text-gray-900 mb-2">
//                 Vehicle Exit Process
//               </h1>
//               <p className="text-gray-600">
//                 Verify details before allowing exit
//               </p>
//             </div>

//             <div className="space-y-6">
//               {/* Vehicle Summary */}
//               <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
//                 <div className="flex items-center justify-between mb-5">
//                   <h2 className="text-lg font-bold text-gray-900">
//                     Vehicle Summary
//                   </h2>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {/* Vehicle Number */}
//                   <div className="bg-gray-50 rounded-xl p-4">
//                     <div className="text-xs text-gray-500 mb-1">
//                       Vehicle Number
//                     </div>
//                     <div className="text-xl font-bold text-gray-900">
//                       {selectedVehicle.vehicleNumber ?? "N/A"}
//                     </div>
//                   </div>

//                   {/* Vendor */}
//                   <div className="bg-gray-50 rounded-xl p-4">
//                     <div className="text-xs text-gray-500 mb-1">Vendor</div>
//                     <div className="font-semibold text-gray-900">
//                       {selectedVehicle.vendor ?? "Unknown"}
//                     </div>
//                   </div>

//                   {/* Driver */}
//                   <div className="bg-gray-50 rounded-xl p-4">
//                     <div className="text-xs text-gray-500 mb-1">Driver</div>
//                     <div className="font-semibold text-gray-900">
//                       {selectedVehicle.driver ?? "N/A"}
//                     </div>
//                   </div>

//                   {/* Material Details */}
//                   <div className="bg-gray-50 rounded-xl p-4 c">
//                     <div className="text-xs text-gray-500 mb-2">
//                       Material Details
//                       <span className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-700 font-semibold">
//                         {selectedVehicle.loadStatus ?? "N/A"}
//                       </span>
//                     </div>
//                     <div className="flex flex-wrap gap-4 text-sm">
//                       <div>
//                         <span className="text-gray-500">Type:</span>{" "}
//                         <span className="font-semibold text-gray-900">
//                           {selectedVehicle.purpose ?? "N/A"}
//                         </span>
//                       </div>

//                       <div>
//                         <span className="text-gray-500">Count:</span>{" "}
//                         <span className="font-semibold text-gray-900">
//                           {selectedVehicle.countofmaterials ?? "N/A"}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Entry Time */}
//                   <div className="bg-gray-50 rounded-xl p-4">
//                     <div className="text-xs text-gray-500 mb-1">Entry Time</div>
//                     <div className="font-semibold text-gray-900">
//                       {selectedVehicle.entryTime ?? "N/A"}
//                     </div>
//                   </div>

//                   {/* Duration */}
//                   <div className="bg-gray-50 rounded-xl p-4">
//                     <div className="text-xs text-gray-500 mb-1">Duration</div>
//                     <div className="font-semibold text-gray-900">
//                       {selectedVehicle.duration ?? "0h 0m"}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Exit Checklist */}
//               {/* <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
//                 <h2 className="text-lg font-bold text-gray-900 mb-4">
//                   Exit Checklist
//                 </h2>

//                 <div className="space-y-3">
//                   <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
//                     <input
//                       type="checkbox"
//                       checked={exitData.papersVerified}
//                       onChange={(e) =>
//                         setExitData({
//                           ...exitData,
//                           papersVerified: e.target.checked,
//                         })
//                       }
//                       className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
//                     />
//                     <div>
//                       <div className="font-semibold text-gray-900">
//                         Papers Verified
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         Delivery note and challan checked
//                       </div>
//                     </div>
//                   </label>

//                   <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
//                     <input
//                       type="checkbox"
//                       checked={exitData.physicalInspection}
//                       onChange={(e) =>
//                         setExitData({
//                           ...exitData,
//                           physicalInspection: e.target.checked,
//                         })
//                       }
//                       className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
//                     />
//                     <div>
//                       <div className="font-semibold text-gray-900">
//                         Physical Inspection Done
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         Vehicle condition inspected
//                       </div>
//                     </div>
//                   </label>

//                   <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
//                     <input
//                       type="checkbox"
//                       checked={exitData.materialMatched}
//                       onChange={(e) =>
//                         setExitData({
//                           ...exitData,
//                           materialMatched: e.target.checked,
//                         })
//                       }
//                       className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
//                     />
//                     <div>
//                       <div className="font-semibold text-gray-900">
//                         Material Count Matched
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         Loaded/unloaded items verified
//                       </div>
//                     </div>
//                   </label>
//                 </div>
//               </div> */}

//               {/* Exit Load Status */}
//               <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
//                 <h2 className="text-lg font-bold text-gray-900 mb-4">
//                   Exit Load Status
//                 </h2>
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
//                   {["empty", "returned", "loaded"].map((status) => (
//                     <button
//                       key={status}
//                       onClick={() =>
//                         setExitData({ ...exitData, exitLoadStatus: status })
//                       }
//                       className={`px-4 py-3 rounded-lg font-semibold transition ${
//                         exitData.exitLoadStatus === status
//                           ? "bg-blue-600 text-white border-2 border-blue-600"
//                           : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300"
//                       }`}
//                     >
//                       {status.charAt(0).toUpperCase() + status.slice(1)}
//                     </button>
//                   ))}
//                 </div>

//                 {exitData.exitLoadStatus === "loaded" && (
//                   <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                     <label className="block text-sm font-semibold text-gray-700 mb-2">
//                       Return Material Type{" "}
//                       <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={exitData.returnMaterialType}
//                       onChange={(e) =>
//                         setExitData({
//                           ...exitData,
//                           returnMaterialType: e.target.value,
//                         })
//                       }
//                       placeholder="e.g. Empty Drums, Pallets, Equipment..."
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
//                     />
//                     <p className="text-xs text-gray-500 mt-2">
//                       Specify what material the vehicle is carrying while
//                       exiting
//                     </p>
//                   </div>
//                 )}
//               </div>
//               {/* ENTRY PHOTOS PREVIEW */}
//               {selectedVehicle.entryMedia?.photos && (
//                 <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
//                   <h2 className="text-lg font-bold text-gray-900 mb-4">
//                     Entry Evidence (Captured at Entry)
//                   </h2>

//                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
//                     {["frontView", "backView", "loadView", "driverView"].map(
//                       (key) => {
//                         const photoUrl = resolvedEntryMedia.photos[key];
//                         // selectedVehicle.entryMedia.photos[key]?.startsWith("http")
//                         //   ? selectedVehicle.entryMedia.photos[key]
//                         //   : null;

//                         return (
//                           <div
//                             key={key}
//                             className="border rounded-lg overflow-hidden"
//                           >
//                             {photoUrl ? (
//                               <img
//                                 src={photoUrl}
//                                 className="w-full h-32 object-cover cursor-pointer hover:opacity-90"
//                                 onClick={() => window.open(photoUrl, "_blank")}
//                               />
//                             ) : (
//                               <div className="h-32 flex items-center justify-center text-gray-400 bg-gray-100">
//                                 Not Available
//                               </div>
//                             )}
//                           </div>
//                         );
//                       },
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Exit Evidence - Updated for 4 photos */}
//               <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
//                 <h2 className="text-lg font-bold text-gray-900 mb-4">
//                   Exit Evidence <span className="text-red-500">*</span>
//                 </h2>
//                 <p className="text-sm text-gray-600 mb-4">
//                   4 mandatory photos required
//                 </p>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                   {[
//                     {
//                       key: "frontView",
//                       label: "Front View",
//                       description: "Vehicle front side",
//                     },
//                     {
//                       key: "backView",
//                       label: "Back View",
//                       description: "Vehicle rear side",
//                     },
//                     {
//                       key: "loadView",
//                       label: "Load Area",
//                       description: "Cargo/load area",
//                     },
//                     {
//                       key: "driverView",
//                       label: "Driver View",
//                       description: "Driver identification",
//                     },
//                   ].map((item) => (
//                     <div
//                       key={item.key}
//                       onClick={() => startCamera(item.key)}
//                       className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${
//                         exitData.exitMedia[item.key]
//                           ? "border-green-300 bg-green-50"
//                           : "border-gray-300 bg-gray-50 hover:bg-gray-100"
//                       }`}
//                     >
//                       {exitData.exitMedia[item.key] ? (
//                         <div>
//                           <img
//                             src={exitData.exitMedia[item.key]}
//                             alt={item.label}
//                             className="w-full h-32 object-cover rounded-lg mb-2"
//                           />
//                           <div className="font-semibold text-gray-900 text-sm mb-1">
//                             {item.label}
//                           </div>
//                           <div className="text-xs text-green-600 mb-2">
//                             ✓ Captured
//                           </div>
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               setExitData((prev) => ({
//                                 ...prev,
//                                 exitMedia: {
//                                   ...prev.exitMedia,
//                                   [item.key]: null,
//                                 },
//                               }));
//                             }}
//                             className="text-xs text-red-600 hover:text-red-700 font-semibold"
//                           >
//                             Retake
//                           </button>
//                         </div>
//                       ) : (
//                         <div>
//                           <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                           <div className="font-semibold text-gray-900 text-sm">
//                             {item.label}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {item.description}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 {/* Video Evidence (Optional) */}
//                 {/* <div className="mt-8">
//                   <h3 className="text-md font-semibold text-gray-900 mb-3">
//                     Video Evidence{" "}
//                     <span className="text-gray-400 font-normal text-sm">
//                       (Optional)
//                     </span>
//                   </h3>
//                   {exitData.exitMedia.videoClip ? (
//                     <div className="border border-green-300 bg-green-50 rounded-lg p-4">
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                           <Video className="w-6 h-6 text-green-600" />
//                           <div>
//                             <div className="font-semibold text-gray-900">
//                               Video Captured
//                             </div>
//                             <div className="text-sm text-gray-600">
//                               Optional video evidence
//                             </div>
//                           </div>
//                         </div>
//                         <button
//                           onClick={() =>
//                             setExitData((prev) => ({
//                               ...prev,
//                               exitMedia: { ...prev.exitMedia, videoClip: null },
//                             }))
//                           }
//                           className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
//                         >
//                           Remove
//                         </button>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="text-center text-gray-500 text-sm">
//                       Video recording is optional. You can proceed without it.
//                     </div>
//                   )}
//                 </div> */}
//               </div>

//               {/* Supervisor Remarks */}
//               <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
//                 <h2 className="text-lg font-bold text-gray-900 mb-4">
//                   Supervisor Remarks{" "}
//                   <span className="text-gray-400 font-normal text-sm">
//                     (Optional)
//                   </span>
//                 </h2>
//                 <textarea
//                   value={exitData.exitNotes}
//                   onChange={(e) =>
//                     setExitData({ ...exitData, exitNotes: e.target.value })
//                   }
//                   rows={3}
//                   placeholder="Enter any observations, issues, or special notes..."
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
//                 />
//               </div>
//               {/* ✅ NEW: Barrier Control Button */}
//               <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 shadow-sm p-4 sm:p-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className="p-2 bg-purple-100 rounded-lg">
//                       <svg
//                         className="w-6 h-6 text-purple-600"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
//                         />
//                       </svg>
//                     </div>
//                     <div>
//                       <h3 className="text-base sm:text-lg font-bold text-gray-900">
//                         Barrier Control
//                       </h3>
//                       <p className="text-xs sm:text-sm text-gray-600">
//                         Open gate for vehicle exit
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 <button
//                   onClick={actuateBarrier}
//                   disabled={barrierLoading}
//                   className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg"
//                 >
//                   {barrierLoading ? (
//                     <>
//                       <Loader2 className="w-5 h-5 animate-spin" />
//                       Opening Barrier...
//                     </>
//                   ) : (
//                     <>
//                       <svg
//                         className="w-5 h-5"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M5 10l7-7m0 0l7 7m-7-7v18"
//                         />
//                       </svg>
//                       OPEN BARRIER
//                     </>
//                   )}
//                 </button>

//                 {barrierMessage && (
//                   <div
//                     className={`mt-3 p-3 rounded-lg flex items-start gap-2 ${
//                       barrierMessage.toLowerCase().includes("error") ||
//                       barrierMessage.toLowerCase().includes("not found") ||
//                       barrierMessage.toLowerCase().includes("failed")
//                         ? "bg-red-50 border border-red-200"
//                         : "bg-green-50 border border-green-200"
//                     }`}
//                   >
//                     <svg
//                       className={`w-5 h-5 flex-shrink-0 ${
//                         barrierMessage.toLowerCase().includes("error") ||
//                         barrierMessage.toLowerCase().includes("not found") ||
//                         barrierMessage.toLowerCase().includes("failed")
//                           ? "text-red-600"
//                           : "text-green-600"
//                       }`}
//                       fill="currentColor"
//                       viewBox="0 0 20 20"
//                     >
//                       {barrierMessage.toLowerCase().includes("error") ||
//                       barrierMessage.toLowerCase().includes("not found") ||
//                       barrierMessage.toLowerCase().includes("failed") ? (
//                         <path
//                           fillRule="evenodd"
//                           d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                           clipRule="evenodd"
//                         />
//                       ) : (
//                         <path
//                           fillRule="evenodd"
//                           d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                           clipRule="evenodd"
//                         />
//                       )}
//                     </svg>
//                     <p
//                       className={`text-xs sm:text-sm font-medium ${
//                         barrierMessage.toLowerCase().includes("error") ||
//                         barrierMessage.toLowerCase().includes("not found") ||
//                         barrierMessage.toLowerCase().includes("failed")
//                           ? "text-red-700"
//                           : "text-green-700"
//                       }`}
//                     >
//                       {barrierMessage}
//                     </p>
//                   </div>
//                 )}
//               </div>
//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <button
//                   onClick={handleBackToList}
//                   className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold"
//                 >
//                   Hold Exit
//                 </button>
//                 <button
//                   onClick={handleAllowExit}
//                   disabled={loading}
//                   className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="w-5 h-5 animate-spin" />
//                       Processing Exit...
//                     </>
//                   ) : (
//                     <>
//                       <CheckCircle className="w-5 h-5" />
//                       Approve & Allow Exit
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </>
//         )}
//       </div>
//     </SupervisorLayout>
//   );
// };

// export default ExitVehicles;y





// components/supervisor/exitVehicles.jsx



"use client";
import React, { useState, useEffect, useRef } from "react";
import SupervisorLayout from "./SupervisorLayout";
import axios from "axios";
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Package,
  Clock,
  CheckCircle,
  Camera,
  X,
  RotateCw,
  Car,
  ChevronDown,
  Target,
} from "lucide-react";
import { io } from "socket.io-client";
import { base64ToFile, uploadToWasabi } from "@/utils/wasabiUpload";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const SOCKET_URL = "https://webhooks.nexcorealliance.com";

const ExitVehicles = () => {
  // ─── Step state (1 = ANPR / Vehicle ID, 2 = Exit Details, 3 = Media & Confirm) ──
  const [step, setStep] = useState(1);

  // ─── ANPR / Socket ───────────────────────────────────────────────────────────
  const [socketStatus, setSocketStatus] = useState("disconnected");
  const [anprEvents, setAnprEvents] = useState([]);
  const [anprData, setAnprData] = useState({
    vehicleNumber: "",
    capturedImage: null,
    frameImage: null,
    confidence: 0,
    timestamp: "",
    cameraId: "Main Gate (Out)",
    isEntry: false,
  });

  // ─── Vehicle list (for manual search fallback) ───────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVehicles, setActiveVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [showVehicleList, setShowVehicleList] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ─── Core state ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [cameraField, setCameraField] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [resolvedEntryMedia, setResolvedEntryMedia] = useState({ photos: {}, video: null });
  const [barrierLoading, setBarrierLoading] = useState(false);
  const [barrierMessage, setBarrierMessage] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [exitData, setExitData] = useState({
    exitLoadStatus: "empty",
    returnMaterialType: "",
    papersVerified: true,
    physicalInspection: false,
    materialMatched: false,
    exitNotes: "",
    exitMedia: {
      frontView: null,
      backView: null,
      loadView: null,
      driverView: null,
      videoClip: null,
    },
  });

  // ─── Socket for ANPR live feed ───────────────────────────────────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"], reconnection: true });
    socket.on("connect", () => setSocketStatus("connected"));
    socket.on("connect_error", () => setSocketStatus("error"));
    socket.on("disconnect", () => setSocketStatus("disconnected"));
    socket.on("anpr:new-event", (data) => {
      setAnprEvents((prev) => [data, ...prev.slice(0, 4)]);
      if (data.numberPlate) {
        setAnprData({
          vehicleNumber: data.numberPlate || "",
          capturedImage: base64ToImageUrl(data.image),
          frameImage: base64ToImageUrl(data.frame),
          confidence: 95,
          timestamp: new Date(data.timestamp).toLocaleString(),
          cameraId: data.cameraName || "Main Gate (Out)",
          isEntry: data.isEntry ?? false,
        });
      }
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    fetchActiveVehicles();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (selectedVehicle?.entryMedia) resolveEntryMedia(selectedVehicle.entryMedia);
    else setResolvedEntryMedia({ photos: {}, video: null });
  }, [selectedVehicle]);

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const base64ToImageUrl = (base64String) => {
    if (!base64String) return null;
    if (base64String.startsWith("data:image")) return base64String;
    return `data:image/jpeg;base64,${base64String}`;
  };

  const getSocketStatusColor = () => {
    switch (socketStatus) {
      case "connected": return "bg-green-500";
      case "error": return "bg-red-500";
      default: return "bg-orange-500";
    }
  };

  const handleANPREventClick = (event) => {
    setAnprData({
      vehicleNumber: event.numberPlate || "",
      capturedImage: base64ToImageUrl(event.image),
      frameImage: base64ToImageUrl(event.frame),
      confidence: 95,
      timestamp: new Date(event.timestamp).toLocaleString(),
      cameraId: event.cameraName || "Main Gate (Out)",
      isEntry: event.isEntry ?? false,
    });
  };

  // ─── Fetch active vehicles ────────────────────────────────────────────────────
  const fetchActiveVehicles = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${API_URL}/api/supervisor/vehicles/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.data || response.data || [];
      const arr = Array.isArray(data) ? data : [];
      setActiveVehicles(arr);
      setFilteredVehicles(arr);
    } catch (error) {
      console.warn("Failed to fetch active vehicles:", error);
    }
  };

  const applySearchFilter = (query) => {
    const q = query ?? searchQuery;
    if (!q.trim()) { setFilteredVehicles(activeVehicles); return; }
    setFilteredVehicles(
      activeVehicles.filter(
        (v) =>
          (v.vehicleNumber || "").toLowerCase().includes(q.toLowerCase()) ||
          (v.vendor || "").toLowerCase().includes(q.toLowerCase()) ||
          (v.driver || "").toLowerCase().includes(q.toLowerCase()),
      ),
    );
  };

  const handleSelectVehicleFromList = (vehicle) => {
    setSelectedVehicle(vehicle);
    setAnprData((prev) => ({ ...prev, vehicleNumber: vehicle.vehicleNumber || "" }));
    setShowVehicleList(false);
    setStep(2);
  };

  // ─── Resolve entry media ──────────────────────────────────────────────────────
  const resolveEntryMedia = async (entryMedia) => {
    if (!entryMedia) return;
    try {
      const token = localStorage.getItem("accessToken");
      const resolvedPhotos = {};
      if (entryMedia.photos) {
        for (const key in entryMedia.photos) {
          const fileKey = entryMedia.photos[key];
          if (fileKey) {
            try {
              const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
                params: { key: fileKey },
                headers: { Authorization: `Bearer ${token}` },
              });
              resolvedPhotos[key] = res.data.url;
            } catch (err) {
              console.warn(`Failed to load entry ${key} photo`, err);
            }
          }
        }
      }
      let resolvedVideo = null;
      if (entryMedia.video) {
        try {
          const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
            params: { key: entryMedia.video },
            headers: { Authorization: `Bearer ${token}` },
          });
          resolvedVideo = res.data.url;
        } catch (err) {
          console.warn("Failed to load entry video", err);
        }
      }
      setResolvedEntryMedia({ photos: resolvedPhotos, video: resolvedVideo });
    } catch (err) {
      console.error("Entry media resolve failed", err);
    }
  };

  // ─── Camera ───────────────────────────────────────────────────────────────────
  const startCamera = async (field) => {
    try {
      setCameraField(field);
      setCameraOpen(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Could not access camera. Please grant camera permissions.");
      setCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (stream) { stream.getTracks().forEach((t) => t.stop()); setStream(null); }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const switchCamera = async () => {
    stopCamera();
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error("Error switching camera:", err);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setExitData((prev) => ({ ...prev, exitMedia: { ...prev.exitMedia, [cameraField]: imageData } }));
    stopCamera();
    setCameraOpen(false);
  };

  const cancelCamera = () => { stopCamera(); setCameraOpen(false); };

  // ─── Step navigation ──────────────────────────────────────────────────────────
  const handleNext = () => {
    if (step === 1) {
      if (!anprData.vehicleNumber) { alert("Vehicle number is required"); return; }
      const matched = activeVehicles.find(
        (v) => (v.vehicleNumber || "").toUpperCase() === anprData.vehicleNumber.toUpperCase(),
      );
      if (matched) setSelectedVehicle(matched);
      setStep(2);
    } else if (step === 2) {
      if (exitData.exitLoadStatus === "loaded" && !exitData.returnMaterialType.trim()) {
        alert("Please enter return material type");
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) { setStep(1); setSelectedVehicle(null); resetExitData(); }
    else if (step === 3) setStep(2);
  };

  const resetExitData = () => {
    setExitData({
      exitLoadStatus: "empty",
      returnMaterialType: "",
      papersVerified: true,
      physicalInspection: false,
      materialMatched: false,
      exitNotes: "",
      exitMedia: { frontView: null, backView: null, loadView: null, driverView: null, videoClip: null },
    });
  };

  // ─── Allow exit (unchanged logic) ────────────────────────────────────────────
  const handleAllowExit = async () => {
    if (exitData.exitLoadStatus === "loaded" && !exitData.returnMaterialType.trim()) {
      alert("Please enter return material type");
      return;
    }
    const REQUIRED_PHOTOS = [
      { key: "frontView", name: "Front View", index: 1 },
      { key: "backView", name: "Back View", index: 2 },
      { key: "loadView", name: "Load View", index: 3 },
      { key: "driverView", name: "Driver View", index: 4 },
    ];
    const missingPhotos = REQUIRED_PHOTOS.filter((p) => !exitData.exitMedia?.[p.key]);
    if (missingPhotos.length > 0) {
      alert(`Please capture all mandatory photos:\n${missingPhotos.map((p) => `• ${p.name}`).join("\n")}`);
      return;
    }
    const vehicleId = selectedVehicle?._id;
    if (!vehicleId) { alert("Could not find vehicle record. Please search manually."); return; }
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      if (!token) { alert("Authentication token missing"); return; }
      const uploadedPhotoKeys = {};
      for (const photo of REQUIRED_PHOTOS) {
        const file = base64ToFile(exitData.exitMedia[photo.key], `${Date.now()}-${photo.key}.jpg`);
        uploadedPhotoKeys[photo.key] = await uploadToWasabi({ file, vehicleId, type: "exit", index: photo.index });
      }
      let videoKey = "";
      if (exitData.exitMedia?.videoClip) {
        try {
          const videoFile = base64ToFile(exitData.exitMedia.videoClip, `${Date.now()}-exit-video.webm`);
          videoKey = await uploadToWasabi({ file: videoFile, vehicleId, type: "exit" });
        } catch (err) { console.warn("Video upload failed", err); }
      }
      const exitPayload = {
        vehicleId,
        exitTime: new Date().toISOString(),
        exitLoadStatus: exitData.exitLoadStatus,
        returnMaterialType: exitData.returnMaterialType || "",
        papersVerified: exitData.papersVerified,
        physicalInspection: exitData.physicalInspection,
        materialMatched: exitData.materialMatched,
        exitNotes: exitData.exitNotes || "",
        exitMedia: { photos: uploadedPhotoKeys, video: videoKey },
      };
      await axios.post(`${API_URL}/api/supervisor/vehicles/exit`, exitPayload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      alert("✅ Vehicle exit allowed successfully!");
      setStep(1);
      setSelectedVehicle(null);
      resetExitData();
      setAnprData({ vehicleNumber: "", capturedImage: null, frameImage: null, confidence: 0, timestamp: "", cameraId: "Main Gate (Out)", isEntry: false });
      fetchActiveVehicles();
    } catch (error) {
      console.error("Exit error:", error);
      alert(error.response?.data?.message || "Failed to process exit");
    } finally {
      setLoading(false);
    }
  };

  const actuateBarrier = async () => {
    setBarrierLoading(true);
    try {
      const res = await axios.post("https://api-anpr.nexcorealliance.com/api/barrier/open");
      if (!res.data?.success) throw new Error(res.data?.message || "Barrier open failed");
      setBarrierMessage(res.data.message);
    } catch (err) {
      setBarrierMessage(err?.response?.data?.message || err.message);
    } finally {
      setBarrierLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <SupervisorLayout>
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <canvas ref={canvasRef} className="hidden" />

        {/* ── Camera Fullscreen ── */}
        {cameraOpen && (
          <div className="fixed inset-0 bg-black z-50 flex flex-col">
            <div className="bg-black/80 backdrop-blur-sm p-3 sm:p-4 flex items-center justify-between shrink-0">
              <button onClick={cancelCamera} className="p-2 sm:p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div className="text-white font-semibold text-sm sm:text-base">
                Capture{" "}
                {cameraField === "frontView" ? "Front View"
                  : cameraField === "backView" ? "Back View"
                  : cameraField === "loadView" ? "Load Area"
                  : cameraField === "driverView" ? "Driver View"
                  : "Photo"}
              </div>
              <button onClick={switchCamera} className="p-2 sm:p-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition">
                <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center bg-black overflow-hidden">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
            <div className="bg-black/80 backdrop-blur-sm p-4 sm:p-6 flex justify-center items-center shrink-0"
              style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom) + 1rem)" }}>
              <button onClick={capturePhoto}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center active:scale-95 transition shadow-2xl touch-manipulation">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white border-4 border-gray-400 rounded-full"></div>
              </button>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Vehicle Exit</h1>
          <p className="text-sm text-gray-600">
            Step {step}:{" "}
            {step === 1 ? "Vehicle Identification" : step === 2 ? "Exit Details" : "Media Capture & Confirm"}
          </p>
        </div>

        {/* ── Progress Steps ── */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 shadow-sm mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                    s === step ? "bg-green-600 text-white"
                      : s < step ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {s < step ? <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6" /> : s}
                  </div>
                  <div className="hidden sm:block">
                    <div className={`text-sm font-semibold ${s === step ? "text-green-600" : s < step ? "text-green-600" : "text-gray-500"}`}>
                      Step {s}
                    </div>
                    <div className="text-xs text-gray-500">
                      {s === 1 ? "Departure" : s === 2 ? "Details" : "Media"}
                    </div>
                  </div>
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 sm:mx-4 ${s < step ? "bg-green-600" : "bg-gray-200"}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            STEP 1 — ANPR Live Feed (mirrors entry page exactly)
        ══════════════════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-4 sm:space-y-6">
            {/* Live ANPR Header */}
            <div className="bg-slate-800 rounded-lg shadow p-4 sm:p-6 border border-slate-700">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Car className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
                  <div>
                    <h1 className="text-xl sm:text-3xl font-bold text-white">Live ANPR System</h1>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">Real-time vehicle exit tracking</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getSocketStatusColor()} animate-pulse`}></div>
                    <span className="text-white font-medium text-sm capitalize">{socketStatus}</span>
                  </div>
                  <button
                    onClick={() => { setShowVehicleList(!showVehicleList); fetchActiveVehicles(); }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base">
                    <Target className="w-4 h-4" />
                    <span className="hidden sm:inline">Manual Search</span>
                    <span className="sm:hidden">Search</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Manual Vehicle Search Panel */}
            {showVehicleList && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Search Active Vehicle</h2>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input type="text" value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); applySearchFilter(e.target.value); }}
                        placeholder="Search vehicle number, vendor, driver..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
                    </div>
                    <button onClick={() => applySearchFilter()}
                      className="px-5 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">
                      Search
                    </button>
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {filteredVehicles.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Package className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No active vehicles found</p>
                    </div>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <div key={vehicle._id}
                        className="p-4 hover:bg-green-50 cursor-pointer transition flex items-center justify-between"
                        onClick={() => handleSelectVehicleFromList(vehicle)}>
                        <div>
                          <p className="font-bold text-gray-900">{vehicle.vehicleNumber}</p>
                          <p className="text-xs text-gray-500">{vehicle.vendor || "Unknown vendor"} · {vehicle.entryTime || "N/A"}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-green-600" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Recent Events */}
            <div className="bg-slate-800 rounded-lg shadow p-4 sm:p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  Recent Events ({anprEvents.length})
                </h2>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden text-green-400">
                  <ChevronDown className={`w-5 h-5 transition-transform ${isMobileMenuOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
              {(isMobileMenuOpen || (typeof window !== "undefined" && window.innerWidth >= 1024)) && (
                anprEvents.length === 0 ? (
                  <p className="text-slate-400 text-center py-4 text-sm sm:text-base">
                    No events received yet. Waiting for ANPR data...
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 sm:max-h-96 overflow-y-auto">
                    {anprEvents.map((e, index) => (
                      <div key={e._id || index}
                        className="bg-slate-700 p-3 sm:p-4 rounded-lg border border-slate-600 hover:border-green-500 transition-colors cursor-pointer"
                        onClick={() => handleANPREventClick(e)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`px-2 py-1 rounded-full text-xs font-bold ${e.isEntry ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                              {e.isEntry ? "IN" : "OUT"}
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm sm:text-lg">{e.numberPlate}</p>
                              <p className="text-slate-400 text-xs sm:text-sm">
                                {new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                          <div className="text-green-400 hover:text-green-300 text-xs sm:text-sm font-medium">Use</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Live Feed + Capture Result Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Live Feed */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-900 h-48 sm:h-64 md:h-80 flex items-center justify-center relative">
                  <div className={`absolute top-2 sm:top-4 left-2 sm:left-4 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold flex items-center gap-1 sm:gap-2 ${
                    socketStatus === "connected" ? "bg-red-600 text-white" : "bg-gray-600 text-white"
                  }`}>
                    <div className={`w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-full ${socketStatus === "connected" ? "animate-pulse" : ""}`}></div>
                    {socketStatus === "connected" ? "LIVE" : "OFFLINE"}
                  </div>
                  {anprData.frameImage ? (
                    <img src={anprData.frameImage} alt="ANPR Frame" className="w-full h-full object-cover" />
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
                        <div className="text-lg sm:text-2xl font-bold text-white">{anprData.vehicleNumber}</div>
                        <div className="bg-green-500 text-white px-1 sm:px-2 py-1 rounded text-xs font-semibold">{anprData.confidence}%</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Capture Result */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3 sm:mb-4">ANPR Capture Result</h3>
                <p className="text-sm text-gray-600 mb-3 sm:mb-4">Confirm vehicle number before processing exit.</p>
                <div className="space-y-3 sm:space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                    <div className="text-xs text-green-600 font-semibold mb-1">CAPTURED IMAGE</div>
                    {anprData.capturedImage ? (
                      <img src={anprData.capturedImage} alt="Number Plate"
                        className="w-full h-24 sm:h-32 object-contain bg-gray-200 rounded-lg mb-2 sm:mb-3" />
                    ) : (
                      <div className="h-24 sm:h-32 bg-gray-200 rounded-lg mb-2 sm:mb-3 flex items-center justify-center">
                        <span className="text-gray-500 text-xs sm:text-sm">[ Waiting for detection... ]</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-2 sm:gap-4 bg-white border-2 border-green-600 rounded-lg p-2 sm:p-4">
                      <div className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-900">
                        {anprData.vehicleNumber || "Detecting..."}
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
                      <span className="font-semibold text-gray-900">{anprData.timestamp || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Camera</span>
                      <span className="font-semibold text-gray-900">{anprData.cameraId}</span>
                    </div>
                  </div>
                  <button onClick={handleNext} disabled={!anprData.vehicleNumber}
                    className="w-full py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base">
                    Proceed to Exit Check-out
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button onClick={() => { setShowVehicleList(true); fetchActiveVehicles(); }}
                    className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold text-xs sm:text-sm flex items-center justify-center gap-2">
                    <Target className="w-4 h-4" />
                    Manual Vehicle Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 2 — Exit Details
        ══════════════════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Exit Details</h3>
            <p className="text-sm text-gray-600 mb-4 sm:mb-6">Verify exit load status and add remarks below.</p>

            <div className="space-y-5">
              {/* Vehicle Number (read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Number</label>
                <input type="text" value={anprData.vehicleNumber} disabled
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-green-50 border-2 border-green-200 rounded-lg text-base sm:text-lg font-bold text-green-900" />
              </div>

              {/* Matched vehicle info */}
              {selectedVehicle && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Vendor</div>
                    <div className="font-semibold text-gray-900">{selectedVehicle.vendor ?? "Unknown"}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Driver</div>
                    <div className="font-semibold text-gray-900">{selectedVehicle.driver ?? "N/A"}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Entry Time</div>
                    <div className="font-semibold text-gray-900">{selectedVehicle.entryTime ?? "N/A"}</div>
                  </div>
                </div>
              )}

              {/* Exit Load Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Exit Load Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {["empty", "returned", "loaded"].map((status) => (
                    <button key={status}
                      onClick={() => setExitData({ ...exitData, exitLoadStatus: status })}
                      className={`px-4 py-3 rounded-lg font-semibold transition ${
                        exitData.exitLoadStatus === status
                          ? "bg-green-600 text-white border-2 border-green-600"
                          : "bg-white text-gray-700 border-2 border-gray-300 hover:border-green-300"
                      }`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                {exitData.exitLoadStatus === "loaded" && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Return Material Type <span className="text-red-500">*</span>
                    </label>
                    <input type="text" value={exitData.returnMaterialType}
                      onChange={(e) => setExitData({ ...exitData, returnMaterialType: e.target.value })}
                      placeholder="e.g. Empty Drums, Pallets, Equipment..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
                  </div>
                )}
              </div>

              {/* Supervisor Remarks */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Supervisor Remarks <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea value={exitData.exitNotes}
                  onChange={(e) => setExitData({ ...exitData, exitNotes: e.target.value })}
                  rows={3} placeholder="Enter any observations, issues, or special notes..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button onClick={handleBack}
                  className="py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold flex items-center justify-center gap-2">
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button onClick={handleNext}
                  disabled={exitData.exitLoadStatus === "loaded" && !exitData.returnMaterialType.trim()}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next Step <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            STEP 3 — Media Capture & Confirm
        ══════════════════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-4 sm:space-y-6">
            {/* 4 Mandatory Photos */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">Required Photos</h3>
                  <p className="text-sm text-gray-600">Tap a card to capture image from camera.</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Vehicle:</div>
                  <div className="text-base sm:text-lg font-bold text-green-600">{anprData.vehicleNumber}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { key: "frontView", label: "Front View", desc: "Number plate & cabin" },
                  { key: "backView", label: "Back View", desc: "Tail & cargo doors" },
                  { key: "driverView", label: "Driver / Cabin", desc: "Driver or empty cabin" },
                  { key: "loadView", label: "Material / Load", desc: "Cargo or empty bed" },
                ].map((item) => (
                  <div key={item.key}
                    className={`relative border-2 border-dashed rounded-lg p-4 transition cursor-pointer ${
                      exitData.exitMedia[item.key]
                        ? "border-green-300 bg-green-50"
                        : "border-blue-300 bg-blue-50 hover:bg-blue-100"
                    }`}
                    onClick={() => !exitData.exitMedia[item.key] && startCamera(item.key)}>
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        exitData.exitMedia[item.key] ? "bg-green-600 text-white" : "bg-red-100 text-red-700"
                      }`}>Required</span>
                    </div>
                    {exitData.exitMedia[item.key] ? (
                      <div className="text-center">
                        <img src={exitData.exitMedia[item.key]} alt={item.label} className="w-full h-24 sm:h-32 object-cover rounded-lg mb-2" />
                        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900 text-sm sm:text-base mb-1">{item.label}</div>
                        <p className="text-xs text-gray-600 mb-2">{item.desc}</p>
                        <button onClick={(e) => {
                          e.stopPropagation();
                          setExitData((prev) => ({ ...prev, exitMedia: { ...prev.exitMedia, [item.key]: null } }));
                        }} className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold">Retake Photo</button>
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

            {/* Entry Evidence Preview */}
            {selectedVehicle?.entryMedia?.photos && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Entry Evidence (Captured at Entry)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {["frontView", "backView", "loadView", "driverView"].map((key) => {
                    const photoUrl = resolvedEntryMedia.photos[key];
                    return (
                      <div key={key} className="border rounded-lg overflow-hidden">
                        {photoUrl ? (
                          <img src={photoUrl} className="w-full h-32 object-cover cursor-pointer hover:opacity-90"
                            onClick={() => window.open(photoUrl, "_blank")} />
                        ) : (
                          <div className="h-32 flex items-center justify-center text-gray-400 bg-gray-100 text-xs text-center px-2">
                            Not Available
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Barrier Control */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Barrier Control</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Open gate for vehicle exit</p>
                </div>
              </div>
              <button onClick={actuateBarrier} disabled={barrierLoading}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg">
                {barrierLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Opening Barrier...</>
                ) : (
                  <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>OPEN BARRIER</>
                )}
              </button>
              {barrierMessage && (
                <div className={`mt-3 p-3 rounded-lg ${
                  ["error", "not found", "failed"].some((w) => barrierMessage.toLowerCase().includes(w))
                    ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"
                }`}>
                  <p className={`text-xs sm:text-sm font-medium ${
                    ["error", "not found", "failed"].some((w) => barrierMessage.toLowerCase().includes(w))
                      ? "text-red-700" : "text-green-700"
                  }`}>{barrierMessage}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button onClick={handleBack}
                className="py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-semibold">
                Back
              </button>
              <button onClick={() => { setStep(1); setSelectedVehicle(null); resetExitData(); setAnprData({ vehicleNumber: "", capturedImage: null, frameImage: null, confidence: 0, timestamp: "", cameraId: "Main Gate (Out)", isEntry: false }); }}
                className="py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition font-semibold">
                Hold Exit
              </button>
              <button onClick={handleAllowExit}
                disabled={
                  loading ||
                  !exitData.exitMedia.frontView ||
                  !exitData.exitMedia.backView ||
                  !exitData.exitMedia.driverView ||
                  !exitData.exitMedia.loadView
                }
                className="py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Processing Exit...</>
                ) : (
                  <><CheckCircle className="w-5 h-5" />Approve & Allow Exit</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </SupervisorLayout>
  );
};

export default ExitVehicles;