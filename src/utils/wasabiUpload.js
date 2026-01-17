import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Convert Base64 to File object
export const base64ToFile = (base64, filename) => {
  try {
    // Check if base64 string has data URL prefix
    let base64Data = base64;
    let mimeType = 'image/jpeg';
    
    if (base64.includes(',')) {
      const parts = base64.split(',');
      base64Data = parts[1];
      
      // Extract mime type from data URL
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch) mimeType = mimeMatch[1];
    }
    
    // Decode base64
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: mimeType });
    return new File([blob], filename, { type: mimeType });
    
  } catch (error) {
    console.error('Error converting base64 to file:', error);
    throw new Error('Invalid base64 data');
  }
};

// Upload to Wasabi
export const uploadToWasabi = async (file, folder = '') => {
  try {
    const token = localStorage.getItem('accessToken');
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const fileName = `${timestamp}-${randomStr}.${fileExt}`;
    
    const fullFileName = folder ? `${folder}/${fileName}` : fileName;
    
    // Get pre-signed URL from backend
    const urlResponse = await axios.post(
      `${API_URL}/api/uploads/upload-url`,
      {
        fileName: fullFileName,
        fileType: file.type
      },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { uploadURL, fileKey } = urlResponse.data;

    // Upload file to Wasabi using pre-signed URL
    await axios.put(uploadURL, file, {
      headers: {
        'Content-Type': file.type,
      }
    });

    return fileKey;

  } catch (error) {
    console.error('Upload to Wasabi failed:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

// 🔴 NEW: Get download URL for a file key (यही ActiveVehicles में चाहिए)
export const getDownloadUrl = async (fileKey) => {
  try {
    if (!fileKey) return null;
    
    // If already a full URL, return as is
    if (fileKey.startsWith('http')) return fileKey;
    
    const token = localStorage.getItem('accessToken');
    
    const response = await axios.get(`${API_URL}/api/uploads/get-file`, {
      params: { key: fileKey },
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.url;
    
  } catch (error) {
    console.error('Error getting download URL:', error);
    return null;
  }
};

// 🔴 NEW: Get all media URLs for a vehicle
export const getVehicleMediaUrls = async (vehicle) => {
  if (!vehicle) return { entryPhotos: {}, entryVideo: null, exitPhotos: {}, exitVideo: null };
  
  const result = {
    entryPhotos: {},
    entryVideo: null,
    exitPhotos: {},
    exitVideo: null
  };
  
  try {
    // Entry Photos
    if (vehicle.entryMedia?.photos) {
      const entryPhotos = vehicle.entryMedia.photos;
      const photoKeys = ['frontView', 'backView', 'loadView', 'driverView'];
      
      for (const key of photoKeys) {
        if (entryPhotos[key]) {
          result.entryPhotos[key] = await getDownloadUrl(entryPhotos[key]);
        }
      }
    }
    
    // Entry Video
    if (vehicle.entryMedia?.video) {
      result.entryVideo = await getDownloadUrl(vehicle.entryMedia.video);
    }
    
    // Exit Photos (if vehicle has exited)
    if (vehicle.exitMedia?.photos) {
      const exitPhotos = vehicle.exitMedia.photos;
      const photoKeys = ['frontView', 'backView', 'loadView', 'driverView'];
      
      for (const key of photoKeys) {
        if (exitPhotos[key]) {
          result.exitPhotos[key] = await getDownloadUrl(exitPhotos[key]);
        }
      }
    }
    
    // Exit Video
    if (vehicle.exitMedia?.video) {
      result.exitVideo = await getDownloadUrl(vehicle.exitMedia.video);
    }
    
  } catch (error) {
    console.error('Error fetching vehicle media URLs:', error);
  }
  
  return result;
};

// 🔴 NEW: Open media in new tab
export const openMediaInNewTab = (url) => {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};