import React, { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import {
  Modal,
  Box,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import "../styles/upload_play.css";
import "../styles/index.css";

export const PruebasWave = () => {
  const [tracks, setTracks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newTrackData, setNewTrackData] = useState({
    title: "",
    description: "",
    file: null,
  });
  const waveformRefs = useRef({});
  const wavesurferRefs = useRef({});

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/wavesurfer-multitrack/dist/multitrack.min.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setNewTrackData({ title: "", description: "", file: null });
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewTrackData((prev) => ({
        ...prev,
        file,
      }));
    }
  };

  const handleTrackSubmit = () => {
    const { file, title, description } = newTrackData;
    if (!file || !title.trim()) {
      alert("Please provide a file and a title.");
      return;
    }

    const id = crypto.randomUUID();
    const url = URL.createObjectURL(file);
    setTracks((prev) => [...prev, { id, file, title, description, url }]);
    closeModal();
  };

  useEffect(() => {
    tracks.forEach((track) => {
      if (!wavesurferRefs.current[track.id] && waveformRefs.current[track.id]) {
        const ws = WaveSurfer.create({
          container: waveformRefs.current[track.id],
          url: track.url,
          draggable: true,
          autoCenter: true,
          autoScroll: true,
          envelope: true,
          volume: 0.8,
          barWidth: 4,
          barRadius: 7,
          waveColor: ['rgb(13, 202, 240)', 'rgb(0, 255, 191)', 'rgb(0, 255, 136)'],
          progressColor: ['rgba(13, 202, 240,0.6)', 'rgba(0, 255, 191,0.6)', 'rgba(0, 255, 136,0.6)'],
          responsive: true,
          cursorWidth: 8,
          cursorColor: 'white',
          trackBackground: 'transparent',
          trackBorderColor: 'white',
          dragBounds: false,
          envelopeOptions: {
            lineColor: 'white',
            lineWidth: 4,
            dragPointSize: 15,
            dragPointFill: 'rgb(255, 255, 255)',
          },
        });
        wavesurferRefs.current[track.id] = ws;
      }
    });

    return () => {
      Object.values(wavesurferRefs.current).forEach((ws) => ws.destroy());
      wavesurferRefs.current = {};
    };
  }, [tracks]);

  const handlePlayPause = (id) => {
    const ws = wavesurferRefs.current[id];
    if (ws) ws.playPause();
  };

  const handleStop = (id) => {
    const ws = wavesurferRefs.current[id];
    if (ws) ws.stop();
  };

  const handleSkip = (id, seconds) => {
    const ws = wavesurferRefs.current[id];
    if (ws) ws.skip(seconds);
  };

  const handleVolumeChange = (id, volume) => {
    const ws = wavesurferRefs.current[id];
    if (ws) ws.setVolume(volume);
  };

  const handleMuteToggle = (id) => {
    const ws = wavesurferRefs.current[id];
    if (ws) ws.toggleMute();
  };

  const handleRemoveTrack = (id) => {
    if (wavesurferRefs.current[id]) {
      wavesurferRefs.current[id].destroy();
      delete wavesurferRefs.current[id];
    }
    setTracks((prev) => prev.filter((track) => track.id !== id));
  };

  return (
    <div className="container-fluid m-5 text-white">
      <Button variant="contained" color="primary" startIcon={<UploadIcon />} onClick={openModal}>
        Upload Track
      </Button>

      <Modal open={modalOpen} onClose={closeModal}>
        <Box
          sx={{
            p: 4,
            bgcolor: "background.paper",
            width: 400,
            mx: "auto",
            my: "20vh",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6">Upload New Track</Typography>
          <TextField
            label="Title"
            value={newTrackData.title}
            onChange={(e) =>
              setNewTrackData((prev) => ({ ...prev, title: e.target.value }))
            }
          />
          <TextField
            label="Description"
            multiline
            minRows={2}
            value={newTrackData.description}
            onChange={(e) =>
              setNewTrackData((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
          <input type="file" accept="audio/*" onChange={handleFileInput} />
          <Button variant="contained" onClick={handleTrackSubmit}>
            Submit
          </Button>
        </Box>
      </Modal>

      <div className="mt-4">
        {tracks.map((track) => (
          <div key={track.id} className="mb-4">
            <Typography variant="h6">{track.title}</Typography>
            {track.description && (
              <Typography variant="body2" sx={{ mb: 1 }}>
                {track.description}
              </Typography>
            )}
            <div
              ref={(el) => (waveformRefs.current[track.id] = el)}
              className="wavesurfer-container mb-2"
            />
            <div className="d-flex gap-2 mb-3">
              <Button variant="outlined" onClick={() => handlePlayPause(track.id)}>
                Play/Pause
              </Button>
              <Button variant="outlined" onClick={() => handleStop(track.id)}>
                Stop
              </Button>
              <Button variant="outlined" onClick={() => handleSkip(track.id, -5)}>
                ⏪ -5s
              </Button>
              <Button variant="outlined" onClick={() => handleSkip(track.id, 5)}>
                ⏩ +5s
              </Button>
              <Button
                variant="outlined"
                color="warning"
                onClick={() => handleMuteToggle(track.id)}
              >
                Mute
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleRemoveTrack(track.id)}
              >
                🗑️ Eliminar
              </Button>
            </div>
            <div className="d-flex align-items-center gap-2">
              <label htmlFor={`volume-${track.id}`}>Volumen:</label>
              <input
                type="range"
                id={`volume-${track.id}`}
                min="0"
                max="1"
                step="0.01"
                defaultValue="0.8"
                onChange={(e) =>
                  handleVolumeChange(track.id, parseFloat(e.target.value))
                }
              />
            </div>
            <hr />
          </div>
        ))}
      </div>
    </div>
  );
};
