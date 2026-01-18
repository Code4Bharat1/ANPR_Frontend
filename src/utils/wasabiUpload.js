import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/* ===============================
   Base64 → File
================================ */
export const base64ToFile = (base64, filename) => {
  let base64Data = base64;
  let mimeType = 'image/jpeg';

  if (base64.includes(',')) {
    const parts = base64.split(',');
    base64Data = parts[1];
    const match = parts[0].match(/:(.*?);/);
    if (match) mimeType = match[1];
  }

  const byteChars = atob(base64Data);
  const byteArrays = [];

  for (let i = 0; i < byteChars.length; i += 512) {
    const slice = byteChars.slice(i, i + 512);
    const nums = new Array(slice.length);
    for (let j = 0; j < slice.length; j++) {
      nums[j] = slice.charCodeAt(j);
    }
    byteArrays.push(new Uint8Array(nums));
  }

  return new File([new Blob(byteArrays, { type: mimeType })], filename, {
    type: mimeType,
  });
};

/* ===============================
   Upload to Wasabi (FIXED)
================================ */
export const uploadToWasabi = async (file) => {
  try {
    const token = localStorage.getItem('accessToken');

    const ext = file.name.split('.').pop();
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    // 🔴 IMPORTANT: send ONLY filename
    const { data } = await axios.post(
      `${API_URL}/api/uploads/upload-url`,
      {
        fileName: filename,
        fileType: file.type,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const { uploadURL, fileKey } = data;

    await axios.put(uploadURL, file, {
      headers: { 'Content-Type': file.type },
      transformRequest: [(d) => d], // 🔥 prevents axios corruption
    });

    return fileKey; // e.g. uploads/12345-front.jpg
  } catch (err) {
    console.error('Wasabi upload failed:', err);
    throw err;
  }
};

/* ===============================
   Get Signed Download URL
================================ */
export const getDownloadUrl = async (fileKey) => {
  if (!fileKey) return null;
  if (fileKey.startsWith('http')) return fileKey;

  try {
    const token = localStorage.getItem('accessToken');
    const res = await axios.get(`${API_URL}/api/uploads/get-file`, {
      params: { key: fileKey },
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data.url;
  } catch (err) {
    console.error('Signed URL error:', err);
    return null;
  }
};

/* ===============================
   Resolve Vehicle Media
================================ */
export const getVehicleMediaUrls = async (vehicle) => {
  const empty = {
    entryPhotos: {},
    entryVideo: null,
    exitPhotos: {},
    exitVideo: null,
  };
  if (!vehicle) return empty;

  const keys = ['frontView', 'backView', 'loadView', 'driverView'];
  const result = structuredClone(empty);

  try {
    for (const k of keys) {
      if (vehicle.entryMedia?.photos?.[k]) {
        result.entryPhotos[k] = await getDownloadUrl(
          vehicle.entryMedia.photos[k]
        );
      }
      if (vehicle.exitMedia?.photos?.[k]) {
        result.exitPhotos[k] = await getDownloadUrl(
          vehicle.exitMedia.photos[k]
        );
      }
    }

    if (vehicle.entryMedia?.video) {
      result.entryVideo = await getDownloadUrl(vehicle.entryMedia.video);
    }
    if (vehicle.exitMedia?.video) {
      result.exitVideo = await getDownloadUrl(vehicle.exitMedia.video);
    }
  } catch (e) {
    console.error('Media resolve failed:', e);
  }

  return result;
};

/* ===============================
   Open Media
================================ */
export const openMediaInNewTab = (url) => {
  if (url) window.open(url, '_blank', 'noopener,noreferrer');
};
