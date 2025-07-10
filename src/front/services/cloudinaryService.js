import axios from 'axios';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const trackUploadPreset = import.meta.env.VITE_CLOUDINARY_TRACK_PRESET;

/**
 * Sube un archivo a Cloudinary y retorna la URL pública
 * @param {File} file - archivo a subir (tipo imagen/audio)
 * @returns {Promise<string>} - URL pública del archivo subido
 */
export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error('No se ha proporcionado ningún archivo');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
    formData
  );

  return response.data.secure_url;
};

export const uploadTrackToCloudinary = async (file) => {
  if (!file) throw new Error('No se ha proporcionado ningún archivo de audio');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', trackUploadPreset);
  formData.append('folder', 'tracks');

  console.log('🚀 Subiendo a Cloudinary:');
  console.log('📁 Archivo:', file);
  console.log('📂 Upload preset:', trackUploadPreset);
  console.log('📂 Carpeta:', 'tracks');

  const response = await axios.post(
    `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
    formData
  );
  console.log('✅ Subida completada. URL:', response.data.secure_url);
  return response.data.secure_url;
};
