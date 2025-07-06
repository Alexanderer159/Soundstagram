// MultitrackEditor.jsx
import React, { useRef, useState } from "react";
import * as Tone from "tone";

export const MultitrackEditor = () => {
  const [tracks, setTracks] = useState([]);
  const fileInputRef = useRef();

  const handleFileChange = async (event) => {
    const files = event.target.files;
    const newTracks = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await Tone.getContext().rawContext.decodeAudioData(arrayBuffer);

      const player = new Tone.Player(audioBuffer).toDestination();

      newTracks.push({
        name: file.name,
        buffer: audioBuffer,
        player,
        volume: 1,
        pan: 0,
        reverb: 0
      });
    }

    setTracks((prev) => [...prev, ...newTracks]);
  };

  const handlePlay = async () => {
    await Tone.start();

    Tone.Transport.stop();
    Tone.Transport.cancel();

    tracks.forEach(({ buffer, volume, pan, reverb }) => {
      const gain = new Tone.Gain(volume);
      const panner = new Tone.Panner(pan);
      const reverbFx = new Tone.Reverb({ decay: reverb });
      const player = new Tone.Player(buffer)
        .connect(gain)
        .connect(panner)
        .connect(reverbFx)
        .toDestination();

      player.sync().start(0);
    });

    Tone.Transport.start();
  };


  const updateTrack = (index, field, value) => {
    const updated = [...tracks];
    updated[index][field] = parseFloat(value);
    setTracks(updated);
  };

  return (
    <div className="container">
      <h2 className="mt-4">🎛️ Multitrack Editor</h2>

      <input
        type="file"
        multiple
        accept="audio/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="form-control mt-3"
      />

      <div className="mt-4">
        {tracks.map((track, index) => (
          <div key={index} className="card mb-3 p-3">
            <h5>{track.name}</h5>
            <label>🎚 Volume: {track.volume.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={track.volume}
              onChange={(e) => updateTrack(index, "volume", e.target.value)}
              className="form-range"
            />

            <label>🌀 Pan: {track.pan.toFixed(2)}</label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.01"
              value={track.pan}
              onChange={(e) => updateTrack(index, "pan", e.target.value)}
              className="form-range"
            />

            <label>🌫 Reverb: {track.reverb.toFixed(2)}</label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={track.reverb}
              onChange={(e) => updateTrack(index, "reverb", e.target.value)}
              className="form-range"
            />
          </div>
        ))}
      </div>

      <div className="text-center">
        <button onClick={handlePlay} className="btn btn-success mt-3">
          ▶️ Play Mix
        </button>
      </div>
    </div>
  );
};
