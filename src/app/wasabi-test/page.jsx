"use client";

import { useState } from "react";
import { Upload, FileVideo, FileImage, Check, AlertCircle, Play } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function WasabiTestPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileKey, setFileKey] = useState(null);
  const [signedUrl, setSignedUrl] = useState(null);
  const [error, setError] = useState(null);

  const isVideo = file?.type?.startsWith("video");

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setSignedUrl(null);

      const res = await fetch(`${API_URL}/api/uploads/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          folder: "test-uploads",
        }),
      });

      const { uploadURL, fileKey } = await res.json();

      await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      setFileKey(fileKey);
    } catch (err) {
      console.error(err);
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleGetFile = async () => {
    if (!fileKey) return;

    try {
      const res = await fetch(`${API_URL}/api/uploads/get-file?key=${encodeURIComponent(fileKey)}`);
      const data = await res.json();
      setSignedUrl(data.url);
    } catch (err) {
      console.error(err);
      setError("Failed to get signed URL");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileKey(null);
    setSignedUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Upload className="w-8 h-8" />
              Wasabi Storage Test
            </h1>
            <p className="text-blue-100 mt-2">Upload and preview your media files</p>
          </div>

          <div className="p-8 space-y-6">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors bg-gray-50">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                {file ? (
                  <>
                    {isVideo ? (
                      <FileVideo className="w-16 h-16 text-purple-500" />
                    ) : (
                      <FileImage className="w-16 h-16 text-blue-500" />
                    )}
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-700">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Change file
                    </button>
                  </>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-gray-400" />
                    <div>
                      <p className="text-lg font-semibold text-gray-700">
                        Choose a file to upload
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Images and videos supported
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>

            {/* Upload Button */}
            {file && !fileKey && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload to Wasabi
                  </>
                )}
              </button>
            )}

            {/* Success State */}
            {fileKey && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-green-700">
                  <Check className="w-5 h-5" />
                  <p className="font-semibold">Upload successful!</p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <p className="text-sm font-medium text-gray-600 mb-2">File Key:</p>
                  <code className="text-xs text-gray-800 break-all bg-gray-50 p-2 rounded block">
                    {fileKey}
                  </code>
                </div>

                <button
                  onClick={handleGetFile}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Get & Preview File
                </button>
              </div>
            )}

            {/* Preview */}
            {signedUrl && (
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-800">Preview</h3>
                <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
                  {!isVideo ? (
                    <img
                      src={signedUrl}
                      alt="Uploaded"
                      className="w-full h-auto"
                    />
                  ) : (
                    <video
                      src={signedUrl}
                      controls
                      className="w-full h-auto bg-black"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">Error</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}