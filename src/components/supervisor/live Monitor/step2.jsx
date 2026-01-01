"use client" 

import React, { useState } from 'react';
import { 
  Shield,
  Upload,
  CheckCircle,
  AlertCircle,
  Settings,
  Video
} from 'lucide-react';
import Sidebar from '../sidebar';

const VehicleDriverDetails = () => {
  const [vehicleNumber] = useState('MH12-DE-1992');
  const [vendor, setVendor] = useState('');
  const [loadStatus, setLoadStatus] = useState('Full Load');
  const [materialType, setMaterialType] = useState('');
  const [remarks, setRemarks] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  const vendors = [
    'Select Vendor...',
    'Blue Dart Logistics',
    'Amazon Transport',
    'DHL Express',
    'Indian Oil Corp',
    'Local Supplier',
    'Gati KWE',
    'Tech Solutions Ltd'
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      console.log('File uploaded:', file.name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      console.log('File dropped:', file.name);
    }
  };

  const handleBack = () => {
    console.log('Going back...');
  };

  const handleNextStep = () => {
    console.log('Proceeding to next step...');
    console.log({
      vehicleNumber,
      vendor,
      loadStatus,
      materialType,
      uploadedFile: uploadedFile?.name,
      remarks
    });
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
            <p className="text-gray-500 text-sm mt-1">Step 2: Vehicle & Driver Details</p>
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
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              {/* Form Header */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Entry Details</h2>
                <p className="text-gray-500 text-sm">Please fill in the consignment and vendor information below.</p>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Vehicle Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Vehicle Number
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-blue-700 font-semibold">
                    {vehicleNumber}
                  </div>
                </div>

                {/* Vendor / Transporter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Vendor / Transporter
                  </label>
                  <select
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                  >
                    {vendors.map((v, index) => (
                      <option key={index} value={v}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Load Status */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Load Status
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setLoadStatus('Full Load')}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        loadStatus === 'Full Load'
                          ? 'bg-blue-600 text-white border-2 border-blue-600'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      Full Load
                    </button>
                    <button
                      onClick={() => setLoadStatus('Partial')}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        loadStatus === 'Partial'
                          ? 'bg-blue-600 text-white border-2 border-blue-600'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      Partial
                    </button>
                    <button
                      onClick={() => setLoadStatus('Empty')}
                      className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        loadStatus === 'Empty'
                          ? 'bg-blue-600 text-white border-2 border-blue-600'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      Empty
                    </button>
                  </div>
                </div>

                {/* Material Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Material Type <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Steel Rods, Cement Bags..."
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Challan / Bill Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Challan / Bill Upload
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50"
                  >
                    <input
                      type="file"
                      id="fileUpload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="fileUpload" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-700 font-medium mb-1">
                        {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-gray-500 text-sm">PDF, JPG or PNG (max. 5MB)</p>
                    </label>
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Remarks <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    placeholder="Add any additional notes here..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleBack}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDriverDetails;