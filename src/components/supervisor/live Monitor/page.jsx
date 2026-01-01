"use client"

import React, { useState } from 'react';
import { 
  Video, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Camera,
  Car,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Sidebar from '../sidebar';


const NewVehicleEntry = () => {
  const [capturedPlate, setCapturedPlate] = useState('MH12-DE-1992');
  const [confidence, setConfidence] = useState(98.5);
  const [captureTime, setCaptureTime] = useState('10:42:15 AM');
  const [isLive, setIsLive] = useState(true);

  const router = useRouter()

  const handleProceed = () => {
    console.log('Proceeding to check-in with plate:', capturedPlate);
    router.push("") 
    // Add your proceed logic here
  };

  const handleCaptureAgain = () => {
    console.log('Capturing again...');
    // Add your re-capture logic here
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
     <Sidebar/>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Vehicle Entry</h1>
            <p className="text-gray-500 text-sm mt-1">Step 1: Vehicle Identification</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="font-medium text-gray-900">Sarah Connor</div>
              <div className="text-sm text-gray-500">Site Supervisor</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
              SC
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 grid grid-cols-3 gap-6">
          {/* Live Feed - 2 columns */}
          <div className="col-span-2 bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shadow-xl relative">
            {/* Simulated camera feed background */}
            <div className="absolute inset-0">
              {/* Map simulation with streets */}
              <div className="w-full h-full relative">
                {/* Street grid overlay */}
                <svg className="w-full h-full opacity-20" viewBox="0 0 800 600">
                  <line x1="0" y1="150" x2="800" y2="150" stroke="white" strokeWidth="2"/>
                  <line x1="0" y1="300" x2="800" y2="300" stroke="white" strokeWidth="2"/>
                  <line x1="0" y1="450" x2="800" y2="450" stroke="white" strokeWidth="2"/>
                  <line x1="200" y1="0" x2="200" y2="600" stroke="white" strokeWidth="2"/>
                  <line x1="400" y1="0" x2="400" y2="600" stroke="white" strokeWidth="2"/>
                  <line x1="600" y1="0" x2="600" y2="600" stroke="white" strokeWidth="2"/>
                </svg>
                
                {/* Location labels */}
                <div className="absolute inset-0 text-gray-600 text-xs p-8">
                  <div className="absolute top-12 left-12">California Academy</div>
                  <div className="absolute top-12 right-32">JAPANTOWN</div>
                  <div className="absolute top-1/3 left-1/4">University<br/>San Francisco</div>
                  <div className="absolute top-1/3 right-24">Asian Art Museum</div>
                  <div className="absolute bottom-1/3 left-12">FOREST KNOLLS</div>
                  <div className="absolute bottom-1/3 right-32">TWIN PEAKS</div>
                  <div className="absolute bottom-12 left-32">STONESTOWN</div>
                  <div className="absolute bottom-12 right-24">GLEN PARK</div>
                </div>
              </div>
            </div>

            {/* Live Feed Badge */}
            <div className="absolute top-6 left-6 z-20">
              <div className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE FEED - CAM 01
              </div>
            </div>

            {/* Detection Frame */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-[400px] h-[320px] border-4 border-white rounded-lg relative animate-pulse">
                {/* Corner brackets - enhanced */}
                <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl"></div>
                <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr"></div>
                <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl"></div>
                <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-white rounded-br"></div>
                
                {/* Scanning line effect */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan"></div>
                </div>
              </div>
            </div>

            {/* Vehicle Detected Badge */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-gray-900 bg-opacity-90 backdrop-blur text-white px-6 py-3 rounded-lg text-sm font-medium shadow-lg border border-gray-700">
                Vehicle Detected in Zone
              </div>
            </div>
          </div>

          {/* ANPR Capture Result - 1 column */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">ANPR Capture Result</h2>
            <p className="text-sm text-gray-500 mb-6">Confirm vehicle number before proceeding.</p>

            {/* Captured Image Crop */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                Captured Image Crop
              </div>
              <div className="bg-gray-800 rounded-lg h-24 flex items-center justify-center text-gray-500 text-xs border-2 border-gray-700">
                [ Plate Crop Image Placeholder ]
              </div>
            </div>

            {/* License Plate Display */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 shadow-inner">
              <div className="bg-white border-4 border-gray-900 rounded-lg p-6 text-center shadow-md">
                <div className="text-4xl font-bold text-gray-900 tracking-wider font-mono">
                  {capturedPlate}
                </div>
              </div>
              <div className="text-center mt-4">
                <div className="text-3xl font-bold text-green-600">{confidence}%</div>
                <div className="text-sm text-gray-600 font-medium">Confidence</div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4 mb-6 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Capture Time
                </span>
                <span className="font-semibold text-gray-900">{captureTime}</span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Camera ID
                </span>
                <span className="font-semibold text-gray-900">Main Gate (In)</span>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Vehicle Type
                </span>
                <span className="font-semibold text-gray-900">Four Wheeler</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto space-y-3">
              <button 
                onClick={handleProceed}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                Proceed to Check-in
              </button>
              <button 
                onClick={handleCaptureAgain}
                className="w-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 py-3.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Capture Again
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(320px); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default NewVehicleEntry;