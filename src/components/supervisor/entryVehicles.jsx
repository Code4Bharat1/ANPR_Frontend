"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  X,
  Car,
  Clock,
  Camera,
  ArrowRight,
  ArrowLeft,
  Plus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const SOCKET_URL = "https://webhooks.nexcorealliance.com";
const API_URL = "https://webhooks.nexcorealliance.com/api"; // Adjust to your API base URL

export default function LiveAnpr() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("disconnected");
  const [showPopup, setShowPopup] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    numberPlate: "",
    vehicleType: "",
    cameraName: "",
    direction: "",
    speed: "",
    isEntry: true,
    timestamp: "",
    siteId: "",
    siteName: "",
    laneId: "",
    vehicleImage: "",
    frameImage: "",
    notes: "",
    driverName: "",
    purpose: "",
  });

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socket.on("connect", () => {
      console.log("✅ Connected to socket:", socket.id);
      setStatus("connected");
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err);
      setStatus("error");
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected from socket");
      setStatus("disconnected");
    });

    socket.on("anpr:new-event", (data) => {
      console.log("🚗 New ANPR Event:", data);
      setEvents((prev) => [data, ...prev]);
      setCurrentEvent(data);
      setShowPopup(true);
    });

    // Listen for trip creation confirmations
    socket.on("anpr:trip-created", (data) => {
      console.log("✅ Trip created:", data);
      setSubmitStatus({
        type: "success",
        message: `${data.type} recorded successfully!`,
      });
    });

    socket.on("anpr:trip-completed", (data) => {
      console.log("✅ Trip completed:", data);
      setSubmitStatus({
        type: "success",
        message: "Exit recorded successfully!",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handlePopupContinue = () => {
    if (currentEvent) {
      populateFormFromEvent(currentEvent);
      setShowPopup(false);
      setShowForm(true);
      setCurrentStep(1);
    }
  };

  const populateFormFromEvent = (event) => {
    setFormData({
      numberPlate: event.numberPlate || "",
      vehicleType: event.vehicleType?.toString() || "",
      cameraName: event.cameraName || "",
      direction: event.direction?.toString() || "",
      speed: event.speed?.toString() || "",
      isEntry: event.isEntry ?? true,
      timestamp: event.timestamp || new Date().toISOString(),
      siteId: event.siteId?.toString() || "",
      siteName: event.siteName || "",
      laneId: event.laneId?.toString() || "",
      vehicleImage: event.image || "",
      frameImage: event.frame || "",
      notes: "",
      driverName: "",
      purpose: "",
    });
  };

  const handleManualEntry = () => {
    setFormData({
      numberPlate: "",
      vehicleType: "",
      cameraName: "",
      direction: "",
      speed: "",
      isEntry: true,
      timestamp: new Date().toISOString(),
      siteId: "",
      siteName: "",
      laneId: "",
      vehicleImage: "",
      frameImage: "",
      notes: "",
      driverName: "",
      purpose: "",
    });
    setShowManualEntry(false);
    setShowForm(true);
    setCurrentStep(1);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.numberPlate || !formData.siteId) {
      setSubmitStatus({
        type: "error",
        message: "Number plate and site ID are required!",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus({ type: "", message: "" });

   try {
  const response = await axios.post(
    "http://localhost:5000/api/supervisor/trips/manual",
    formData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  // axios me response.data hota hai
  setSubmitStatus({
    type: "success",
    message: response.data.message || "Entry recorded successfully!",
  });

  setTimeout(() => {
    setShowForm(false);
    setCurrentStep(1);
    setSubmitStatus({ type: "", message: "" });
  }, 2000);

} catch (error) {
  console.error("Submit error:", error);

  // backend se proper error message ho to
  const message =
    error.response?.data?.message ||
    "Network error. Please try again.";

  setSubmitStatus({
    type: "error",
    message,
  });
} finally {
  setIsSubmitting(false);
}
  };

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-orange-500";
    }
  };

  const base64ToImageSrc = (base64String) => {
    if (!base64String) return "";
    if (base64String.startsWith("data:image")) return base64String;
    return `data:image/jpeg;base64,${base64String}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-slate-800 rounded-lg shadow-2xl p-6 mb-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Car className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Live ANPR System
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Real-time vehicle tracking and management
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${getStatusColor()} animate-pulse`}
                ></div>
                <span className="text-white font-medium capitalize">
                  {status}
                </span>
              </div>
              <button
                onClick={() => setShowManualEntry(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Manual Entry
              </button>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-slate-800 rounded-lg shadow-2xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Recent Events ({events.length})
          </h2>

          {events.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No events received yet. Waiting for ANPR data...
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {events.map((e, index) => (
                <div
                  key={e._id || index}
                  className="bg-slate-700 p-4 rounded-lg border border-slate-600 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          e.isEntry
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {e.isEntry ? "ENTRY" : "EXIT"}
                      </div>
                      <div>
                        <p className="text-white font-bold text-lg">
                          {e.numberPlate}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {e.cameraName} •{" "}
                          {new Date(e.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentEvent(e);
                        setShowPopup(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event Popup */}
      {showPopup && currentEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Car className="w-6 h-6 text-blue-400" />
                  Vehicle Detected
                </h3>
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Images */}
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400 text-sm font-medium mb-2 block">
                      Vehicle Image
                    </label>
                    {currentEvent.image && (
                      <img
                        src={base64ToImageSrc(currentEvent.image)}
                        alt="Vehicle"
                        className="w-full h-48 object-cover rounded-lg border-2 border-slate-600"
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-slate-400 text-sm font-medium mb-2 block">
                      Frame Capture
                    </label>
                    {currentEvent.frame && (
                      <img
                        src={base64ToImageSrc(currentEvent.frame)}
                        alt="Frame"
                        className="w-full h-48 object-cover rounded-lg border-2 border-slate-600"
                      />
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                    <p className="text-slate-400 text-sm">Number Plate</p>
                    <p className="text-white text-2xl font-bold mt-1">
                      {currentEvent.numberPlate}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700 p-3 rounded-lg border border-slate-600">
                      <p className="text-slate-400 text-xs">Type</p>
                      <p className="text-white font-medium mt-1">
                        {currentEvent.isEntry ? "ENTRY" : "EXIT"}
                      </p>
                    </div>
                    <div className="bg-slate-700 p-3 rounded-lg border border-slate-600">
                      <p className="text-slate-400 text-xs">Camera</p>
                      <p className="text-white font-medium mt-1">
                        {currentEvent.cameraName}
                      </p>
                    </div>
                    <div className="bg-slate-700 p-3 rounded-lg border border-slate-600">
                      <p className="text-slate-400 text-xs">Speed</p>
                      <p className="text-white font-medium mt-1">
                        {currentEvent.speed !== -1
                          ? `${currentEvent.speed} km/h`
                          : "N/A"}
                      </p>
                    </div>
                    <div className="bg-slate-700 p-3 rounded-lg border border-slate-600">
                      <p className="text-slate-400 text-xs">Vehicle Type</p>
                      <p className="text-white font-medium mt-1">
                        Type {currentEvent.vehicleType}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-700 p-3 rounded-lg border border-slate-600">
                    <p className="text-slate-400 text-xs">Timestamp</p>
                    <p className="text-white font-medium mt-1">
                      {new Date(currentEvent.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-slate-700 p-3 rounded-lg border border-slate-600">
                    <p className="text-slate-400 text-xs">Site</p>
                    <p className="text-white font-medium mt-1">
                      {currentEvent.siteName} (ID: {currentEvent.siteId})
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handlePopupContinue}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Continue to Form
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Confirmation */}
      {showManualEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">Manual Entry</h3>
            <p className="text-slate-400 mb-6">
              Create a manual vehicle entry record.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleManualEntry}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Proceed
              </button>
              <button
                onClick={() => setShowManualEntry(false)}
                className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Step Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full my-8 border border-slate-700">
            <div className="p-6">
              {/* Status Message */}
              {submitStatus.message && (
                <div
                  className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                    submitStatus.type === "success"
                      ? "bg-green-500/20 border border-green-500 text-green-200"
                      : "bg-red-500/20 border border-red-500 text-red-200"
                  }`}
                >
                  {submitStatus.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <span>{submitStatus.message}</span>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className="flex items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          currentStep >= step
                            ? "bg-blue-600 text-white"
                            : "bg-slate-700 text-slate-400"
                        }`}
                      >
                        {currentStep > step ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          step
                        )}
                      </div>
                      {step < 4 && (
                        <div
                          className={`flex-1 h-1 mx-2 ${
                            currentStep > step ? "bg-blue-600" : "bg-slate-700"
                          }`}
                        ></div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                  <span>Vehicle Info</span>
                  <span>Entry Details</span>
                  <span>Images</span>
                  <span>Additional</span>
                </div>
              </div>

              {/* Step 1: Vehicle Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Step 1: Vehicle Information
                  </h3>

                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">
                      Number Plate *
                    </label>
                    <input
                      type="text"
                      name="numberPlate"
                      value={formData.numberPlate}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="Enter vehicle number plate"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 text-sm font-medium mb-2 block">
                        Vehicle Type
                      </label>
                      <select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleInputChange}
                        className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select type</option>
                        <option value="TRUCK_12_WHEEL">Truck 12 Wheel</option>
                        <option value="TRUCK_10_WHEEL">Truck 10 Wheel</option>
                        <option value="TRUCK_6_WHEEL">Truck 6 Wheel</option>
                        <option value="TRAILER">Trailer</option>
                        <option value="PICKUP">Pickup</option>
                        <option value="CAR">Car</option>
                        <option value="BIKE">Bike</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm font-medium mb-2 block">
                        Camera Name
                      </label>
                      <input
                        type="text"
                        name="cameraName"
                        value={formData.cameraName}
                        onChange={handleInputChange}
                        className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Camera name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 text-sm font-medium mb-2 block">
                        Direction
                      </label>
                      <select
                        name="direction"
                        value={formData.direction}
                        onChange={handleInputChange}
                        className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Select direction</option>
                        <option value="0">Inbound</option>
                        <option value="1">Outbound</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm font-medium mb-2 block">
                        Speed (km/h)
                      </label>
                      <input
                        type="number"
                        name="speed"
                        value={formData.speed}
                        onChange={handleInputChange}
                        className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Speed"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Entry/Exit Details */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Step 2: Entry/Exit Details
                  </h3>

                  <div className="flex items-center gap-4 bg-slate-700 p-4 rounded-lg border border-slate-600">
                    <input
                      type="checkbox"
                      name="isEntry"
                      checked={formData.isEntry}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <label className="text-white font-medium">
                      This is an Entry (uncheck for Exit)
                    </label>
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">
                      Timestamp
                    </label>
                    <input
                      type="datetime-local"
                      name="timestamp"
                      value={
                        formData.timestamp
                          ? new Date(formData.timestamp)
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-300 text-sm font-medium mb-2 block">
                        Site ID *
                      </label>
                      <input
                        type="text"
                        name="siteId"
                        value={formData.siteId}
                        onChange={handleInputChange}
                        className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Site ID"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-sm font-medium mb-2 block">
                        Site Name
                      </label>
                      <input
                        type="text"
                        name="siteName"
                        value={formData.siteName}
                        onChange={handleInputChange}
                        className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                        placeholder="Site name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">
                      Lane ID
                    </label>
                    <input
                      type="text"
                      name="laneId"
                      value={formData.laneId}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="Lane ID"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Images */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Step 3: Images
                  </h3>

                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">
                      Vehicle Image
                    </label>
                    {formData.vehicleImage ? (
                      <div className="space-y-2">
                        <img
                          src={base64ToImageSrc(formData.vehicleImage)}
                          alt="Vehicle"
                          className="w-full h-64 object-cover rounded-lg border-2 border-slate-600"
                        />
                        <button
                          onClick={() =>
                            setFormData({ ...formData, vehicleImage: "" })
                          }
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                        <Camera className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">
                          No vehicle image available
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">
                      Frame Capture
                    </label>
                    {formData.frameImage ? (
                      <div className="space-y-2">
                        <img
                          src={base64ToImageSrc(formData.frameImage)}
                          alt="Frame"
                          className="w-full h-64 object-cover rounded-lg border-2 border-slate-600"
                        />
                        <button
                          onClick={() =>
                            setFormData({ ...formData, frameImage: "" })
                          }
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                        <Camera className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                        <p className="text-slate-400 text-sm">
                          No frame capture available
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Step 4: Additional Information */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Step 4: Additional Information
                  </h3>

                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">
                      Driver Name
                    </label>
                    <input
                      type="text"
                      name="driverName"
                      value={formData.driverName}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="Enter driver name"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">
                      Purpose of Visit
                    </label>
                    <input
                      type="text"
                      name="purpose"
                      value={formData.purpose}
                      onChange={handleInputChange}
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none"
                      placeholder="Enter purpose"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none resize-none"
                      placeholder="Enter any additional notes"
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-700 p-4 rounded-lg border border-slate-600 mt-6">
                    <h4 className="text-white font-bold mb-3">Entry Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Number Plate:</span>
                        <span className="text-white font-medium">
                          {formData.numberPlate || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Type:</span>
                        <span className="text-white font-medium">
                          {formData.isEntry ? "Entry" : "Exit"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Site:</span>
                        <span className="text-white font-medium">
                          {formData.siteName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Driver:</span>
                        <span className="text-white font-medium">
                          {formData.driverName || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex gap-3">
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevStep}
                    className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowForm(false);
                    setCurrentStep(1);
                  }}
                  className="px-6 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>

                {currentStep < 4 ? (
                  <button
                    onClick={handleNextStep}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Submit Entry
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
