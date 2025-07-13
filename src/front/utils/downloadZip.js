// utils/downloadZip.js
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export const downloadProjectAsZip = async (tracks, projectTitle = 'project') => {
  if (!Array.isArray(tracks) || tracks.length === 0) {
    alert('No hay pistas para descargar');
    return;
  }

  const zip = new JSZip();

  // Carpeta dentro del ZIP
  const folder = zip.folder(projectTitle.replace(/\s+/g, '_').toLowerCase());

  for (const track of tracks) {
    try {
      const response = await fetch(track.file_url);
      const blob = await response.blob();

      // Nombre del archivo: trackName.mp3 (o .wav si quieres detectarlo)
      const extension = track.file_url.split('.').pop().split('?')[0];
      const safeName = track.track_name.replace(/\s+/g, '_');
      const filename = `${safeName}.${extension}`;

      folder.file(filename, blob);
    } catch (error) {
      console.error(`❌ Error al descargar la pista: ${track.track_name}`, error);
    }
  }

  zip.generateAsync({ type: 'blob' }).then((content) => {
    saveAs(content, `${projectTitle.replace(/\s+/g, '_')}.zip`);
  });
};
