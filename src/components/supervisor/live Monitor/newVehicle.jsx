"use client"

import React, { useState } from 'react';
import { 
  Camera, 
  Video,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import Sidebar from '../sidebar';

const MediaCaptureValidation = () => {
  const [capturedPhotos, setCapturedPhotos] = useState({
    frontView: null,
    backView: null,
    driverCabin: null,
    materialLoad: null
  });
  const [videoRecorded, setVideoRecorded] = useState(false);
  const vehicleNumber = 'MH12-DE-1992';

  const photoCards = [
    {
      id: 'frontView',
      title: 'Front View',
      subtitle: 'Capture number plate & cabin',
      required: true
    },
    {
      id: 'backView',
      title: 'Back View',
      subtitle: 'Capture tail & cargo doors',
      required: true
    },
    {
      id: 'driverCabin',
      title: 'Driver / Cabin',
      subtitle: 'Driver photo or empty cabin',
      required: true
    },
    {
      id: 'materialLoad',
      title: 'Material / Load',
      subtitle: 'Visible cargo or empty bed',
      required: true
    }
  ];

  const handlePhotoCapture = (photoId) => {
    console.log(`Capturing ${photoId}...`);
    // Simulate photo capture
    setCapturedPhotos(prev => ({
      ...prev,
      [photoId]: true
    }));
  };

  const handleVideoRecord = () => {
    console.log('Recording video...');
    setVideoRecorded(true);
  };

  const handleCancelEntry = () => {
    console.log('Entry cancelled');
  };

  const handleBack = () => {
    console.log('Going back');
  };

  const handleAllowEntry = () => {
    console.log('Entry allowed');
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
            <p className="text-gray-500 text-sm mt-1">Step 3: Media Capture & Validation</p>
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
        <div className="flex-1 p-8 max-w-6xl mx-auto w-full">
          <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Required Photos</h2>
                <p className="text-gray-500 text-sm">Tap a card to capture image from connected tablet camera.</p>
              </div>
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <div className="text-sm text-gray-600 mb-0.5">Vehicle:</div>
                <div className="font-semibold text-gray-900">{vehicleNumber}</div>
              </div>
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {photoCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => handlePhotoCapture(card.id)}
                  className="relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-md group"
                >
                  {/* Required Badge */}
                  {card.required && (
                    <div className="absolute top-4 right-4">
                      <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded">
                        Required
                      </span>
                    </div>
                  )}

                  {/* Camera Icon */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Camera className="w-8 h-8 text-blue-600" />
                    </div>
                    
                    {/* Title and Subtitle */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.subtitle}</p>
                  </div>

                  {/* Captured Indicator */}
                  {capturedPhotos[card.id] && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-10 rounded-xl border-2 border-green-500 flex items-center justify-center">
                      <div className="bg-green-500 text-white p-2 rounded-full">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Video Evidence Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Video Evidence</h2>
                <span className="text-sm text-gray-500">(Optional)</span>
              </div>

              <button
                onClick={handleVideoRecord}
                className="w-full relative bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border-2 border-blue-200 hover:border-blue-400 transition-all hover:shadow-md group"
              >
                <div className="flex items-center gap-6">
                  {/* Video Icon */}
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Video className="w-8 h-8 text-blue-600" />
                  </div>
                  
                  {/* Text */}
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Record Video Clip</h3>
                    <p className="text-sm text-gray-600">Record a 360° walkaround of the vehicle</p>
                  </div>
                </div>

                {/* Recorded Indicator */}
                {videoRecorded && (
                  <div className="absolute inset-0 bg-green-500 bg-opacity-10 rounded-xl border-2 border-green-500 flex items-center justify-center">
                    <div className="bg-green-500 text-white p-2 rounded-full">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                  </div>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={handleCancelEntry}
                className="px-6 py-3 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition-colors"
              >
                Cancel Entry
              </button>
              <div className="flex-1"></div>
              <button
                onClick={handleBack}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleAllowEntry}
                className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Allow Entry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaCaptureValidation;