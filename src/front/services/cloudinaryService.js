import axios from 'axios';

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const trackUploadPreset = import.meta.env.VITE_CLOUDINARY_TRACK_PRESET || uploadPreset;

// Verificar configuración
if (!cloudName) {
  console.error('❌ VITE_CLOUDINARY_CLOUD_NAME no está configurado');
}

if (!uploadPreset) {
  console.error('❌ VITE_CLOUDINARY_UPLOAD_PRESET no está configurado');
}

/**
 * Sube un archivo a Cloudinary y retorna la URL pública
 * @param {File} file - archivo a subir (tipo imagen/audio)
 * @returns {Promise<string>} - URL pública del archivo subido
 */
export const uploadToCloudinary = async (file) => {
  if (!file) throw new Error('No se ha proporcionado ningún archivo');
  if (!cloudName || !uploadPreset) {
    throw new Error('Configuración de Cloudinary incompleta. Verifica las variables de entorno.');
  }

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
  if (!cloudName || !trackUploadPreset) {
    throw new Error('Configuración de Cloudinary incompleta. Verifica las variables de entorno.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', trackUploadPreset);
  formData.append('folder', 'tracks');

  console.log('🚀 Subiendo a Cloudinary:');
  console.log('📁 Archivo:', file.name, `(${file.size} bytes)`);
  console.log('📂 Upload preset:', trackUploadPreset);
  console.log('📂 Carpeta:', 'tracks');
  console.log('📂 Cloud name:', cloudName);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
      formData
    );
    console.log('✅ Subida completada. URL:', response.data.secure_url);
    return response.data.secure_url;
  } catch (error) {
    console.error('❌ Error subiendo a Cloudinary:', error.response?.data || error.message);
    throw new Error(`Error subiendo a Cloudinary: ${error.response?.data?.error?.message || error.message}`);
  }
};
