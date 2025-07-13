// src/services/soundcloudService.js
import axios from 'axios';

const SOUNDCLOUD_TOKEN = import.meta.env.VITE_SOUNDCLOUD_TOKEN; 
const SOUNDCLOUD_UPLOAD_URL = 'https://api.soundcloud.com/tracks';

export const publishMainTrackToSoundCloud = async ({ fileBlob, title }) => {
  if (!fileBlob || !title) throw new Error('Faltan datos para la publicación');

  const formData = new FormData();
  formData.append('track[title]', title);
  formData.append('track[sharing]', 'public');
  formData.append('track[asset_data]', fileBlob);

  try {
    const response = await axios.post(SOUNDCLOUD_UPLOAD_URL, formData, {
      headers: {
        Authorization: `OAuth ${SOUNDCLOUD_TOKEN}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.permalink_url;
  } catch (error) {
    console.error('❌ Error al subir a SoundCloud:', error.response?.data || error.message);
    throw error;
  }
};
