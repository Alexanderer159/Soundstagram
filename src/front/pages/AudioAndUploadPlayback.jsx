import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import EnvelopePlugin from 'wavesurfer.js/dist/plugins/envelope.js';
import {Box, Button, Typography, Stack, IconButton,TextField, Slider, Modal} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import SendIcon from "@mui/icons-material/Send";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import WavEncoder from "wav-encoder";
import "../styles/upload_play.css"
import "../styles/index.css"

const currentUser = "Test User";

export const AudioUploaderAndPoster = () => {

const [projectTags, setProjectTags] = useState("");
const [projectDescription, setProjectDescription] = useState("");
const [keySignature, setKeySignature] = useState("C");
const [timeSignature, setTimeSignature] = useState("4/4");
const [bpm, setBpm] = useState(120);
const [zoomLevel, setZoomLevel] = useState(30);
const [tracks, setTracks] = useState([]);
const [modalOpen, setModalOpen] = useState(false);
const [newTrackData, setNewTrackData] = useState({ title: "", instrument: "", file: null, });
const waveformRefs = useRef({});
const wavesurferRefs = useRef({});


const openModal = () => setModalOpen(true);

  const closeModal = () => {
    setModalOpen(false);
    setNewTrackData({ title: "", instrument: "", file: null });
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
    const { file, title, instrument } = newTrackData;
    if (!file || !title.trim()) {
      alert("Please provide a file and a title.");
      return;
    }

    const id = crypto.randomUUID();
    const url = URL.createObjectURL(file);
    setTracks((prev) => [...prev, { 
        id, 
        file, 
        title, 
        instrument, 
        url,
        startTime: 0,
        volume: 1,
     }]);
    closeModal();
  };

  //Opciones de wavesurfer, si quieren toquenlas a ver que sacan
  useEffect(() => {
    tracks.forEach((track) => {
      if (!wavesurferRefs.current[track.id] && waveformRefs.current[track.id]) {
        const ws = WaveSurfer.create({
            container: waveformRefs.current[track.id],
            url: track.url,
            draggable: true,
            minPxPerSec: zoomLevel,
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
            plugins: [
                RegionsPlugin.create({ 
                    dragSelection: false }),
                 EnvelopePlugin.create({
                    minValue: 0,
                    maxValue: 1,
                    height: 10,
                    drag: true,
                    lineColor: 'white',
                    lineWidth: 2,
                    dragPointSize: 5,
                    dragPointFill: 'rgb(255, 255, 255)',}),
            ],
        });
        wavesurferRefs.current[track.id] = ws;

         ws.on('ready', () => {
        const duration = ws.getDuration();
        const region = ws.addRegion({
          id: `${track.id}-region`,
          start: track.startTime || 0,
          end: duration,
          drag: true,
          resize: false,
          color: 'rgba(255, 255, 255, 0.1)',
        });
      });

      ws.on('region-update-end', (region) => {
        const newStart = region.start;
        setTracks((prevTracks) =>
          prevTracks.map((t) =>
            t.id === track.id ? { ...t, startTime: newStart } : t
          )
        );
      });
    }
  });

    return () => {
      Object.values(wavesurferRefs.current).forEach((ws) => ws.destroy());
      wavesurferRefs.current = {};
    };}, [tracks, zoomLevel]);

//controles para TODOS LOS TRACKS
    const handlePlayPauseAll = () => {
  Object.values(wavesurferRefs.current).forEach((ws) => ws.playPause());
};

const handleSkipForwardsAll = () => {
  Object.values(wavesurferRefs.current).forEach((ws) => ws.skip(5));
};

const handleSkipBackwardsAll = () => {
  Object.values(wavesurferRefs.current).forEach((ws) => ws.skip(-5));
};


  const handlePlayPause = (id) => {
    const ws = wavesurferRefs.current[id];
    if (ws) ws.playPause();
  };

  const handleStop = (id) => {
    const ws = wavesurferRefs.current[id];
    if (ws) ws.stop();
  };

  const handleSkipForwards = (id) => {
    const ws = wavesurferRefs.current[id];
    if (ws) ws.skip(5);
  };

  const handleSkipBackwards = (id) => {
    const ws = wavesurferRefs.current[id];
    if (ws) ws.skip(-5);
  };
      
    const handleZoomChange = (e, value) => {
        setZoomLevel(value);
    };

useEffect(() => {
  Object.values(wavesurferRefs.current).forEach((ws) => {
    ws.zoom(zoomLevel);
  });
}, [zoomLevel]);

    const handlePost = () => {
        console.log({
            tags: projectTags,
            description: projectDescription,
            keySignature,
            timeSignature,
            bpm,
            tracks: tracks.map(({ title, instrument, user, name }) => ({
                title, instrument, user, originalFilename: name
            })
        )});
        alert("Publish is WIP");
    };

    const handleExportMix = async () => {
        if (tracks.length === 0) {
            alert("No tracks to download yet");
            return;
        }

        const buffers = [];

        // Paso 1: Cargar y decodificar cada pista
        for (const track of tracks) {
        const response = await fetch(track.url);
        const arrayBuffer = await response.arrayBuffer();
        const tempCtx = new AudioContext();
        const decodedBuffer = await tempCtx.decodeAudioData(arrayBuffer);
        buffers.push({ buffer: decodedBuffer, startTime: track.startTime || 0, volume: track.volume || 1, });
        tempCtx.close();}

        // Paso 2: Calcular duración total
        const sampleRate = 44100;
        const endTimes = buffers.map(({ buffer, startTime }) => startTime + buffer.duration);
        const lengthInSeconds = Math.max(...endTimes);

        // Paso 3: Crear contexto offline y mezclar
        const offlineCtx = new OfflineAudioContext(2, sampleRate * lengthInSeconds, sampleRate);

        buffers.forEach(({ buffer, startTime, volume }) => {
            const source = offlineCtx.createBufferSource();
            source.buffer = buffer;

            const gain = offlineCtx.createGain();
            gain.gain.value = volume;

            source.connect(gain).connect(offlineCtx.destination);
            source.start(startTime);
        });

        const renderedBuffer = await offlineCtx.startRendering();

        // Paso 4: Exportar como WAV
        const wavData = await WavEncoder.encode({
            sampleRate: renderedBuffer.sampleRate,
            channelData: [
                renderedBuffer.getChannelData(0),
                renderedBuffer.numberOfChannels > 1
                    ? renderedBuffer.getChannelData(1)
                    : renderedBuffer.getChannelData(0)
            ]
        });

        const blob = new Blob([wavData], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "Mix.wav";
        a.click();
    };


    return (
        <div className="container-fluid">

            <div className="row">            
                <p className="uppy text-center">Project Maker</p>
            </div>


            <div className="row all-info m-2 p-4 shadow">

                <div className="col-2 buttons d-flex flex-column">
                    
                    <div className="d-flex justify-content-between">
                        
                        <div className="">
                            <label className="text-white">Key</label>
                            <select className="controls-uppy ps-3" label="Clave musical" value={keySignature} onChange={e => setKeySignature(e.target.value)} >
                                {["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"].map(key => (<option key={key} value={key}>{key}</option>))}
                            </select>
                        </div>

                        <div className="">

                            <label className="text-white">Compass</label>
                            <select className="controls-uppy ps-3" label="Compás" value={timeSignature} onChange={e => setTimeSignature(e.target.value)} >
                                {["4/4", "3/4", "2/4", "6/8", "5/4"].map(ts => (<option key={ts} value={ts}>{ts}</option>))}
                            </select>

                        </div>

                    </div>

                        <div className="">

                            <label className="text-white">BPM</label>
                            <input className="controls-uppy ps-3" label="BPM" type="number" value={bpm} onChange={e => setBpm(Number(e.target.value))} inputProps={{ min: 40, max: 240 }} />

                        </div>
                </div>

                <div className="col d-flex flex-column">

                    <label className="text-white fs-5">Details</label>
                    
                    <div className="text-uppy gap-3 d-flex flex-column">

                        <div className="top-text-uppy d-flex flex-row justifyc-content-between gap-3">
                            <input className="text-uppy-input ps-3" placeholder="Project Name" />
                            <input className="text-uppy-input ps-3" placeholder="Instruments" />
                            <input className="text-uppy-input ps-3" placeholder="Roles" />
                            <input className="text-uppy-input ps-3" placeholder="Genre" />
                            <input className="text-uppy-input ps-3" placeholder="Visibility" />
                            <input className="text-uppy-input ps-3" placeholder="Tags (comma separated)" value={projectTags} onChange={e => setProjectTags(e.target.value)}/>
                        </div>

                        <textarea placeholder="Short Description" onChange={e => setProjectDescription(e.target.value)} className="text-uppy-input ps-3" rows="4" value={projectDescription} />
                    
                    </div>
                </div>
            </div>

            <div className="row m-3">

                <div className="col d-flex flex-row gap-3 ps-5">

                       <button className="btn-uppy d-flex flex-row align-items-center p-2" onClick={openModal}><UploadIcon /> Upload Track </button>

                    <button className="btn-uppy d-flex flex-row align-items-center p-2" onClick={handleExportMix}>
                        <p className="m-0 flex-row align-items-center">Download Project</p>
                    </button>

                    <button className="btn-uppy d-flex flex-row align-items-center p-2" onClick={handlePost}>
                        <p className="m-0 flex-row align-items-center"> <SendIcon /> Publish Project</p> 
                    </button>

                    <button className="btn-uppy d-flex flex-row align-items-center p-2">
                        <Link to="/mixer" style={{ textDecoration: "none" }}>
                            <p className="m-0 flex-row align-items-center text-dark">Mixer</p>
                        </Link>
                    </button>

      <Modal open={modalOpen} onClose={closeModal}>
            <div className="d-flex justify-content-center">
              <div className="modal d-flex flex-column gap-2 p-4 bg-dark text-light" >
                <p className="fs-3">Upload New Track</p>
                <input className="text-uppy-input p-3" placeholder="Title" value={newTrackData.title} onChange={(e) => setNewTrackData((prev) => ({ ...prev, title: e.target.value }))} />
                <input className="text-uppy-input p-3" placeholder="Instrument" value={newTrackData.instrument} onChange={(e) => setNewTrackData((prev) => ({ ...prev, instrument: e.target.value, }))} />
                <input type="file" accept="audio/*" onChange={handleFileInput} />
                <button className="btn-uppy d-flex flex-row align-items-center p-2" onClick={handleTrackSubmit}> Submit </button>
              </div>
            </div>
            </Modal>

                </div>

                <div className="col">
                    <p className="magic-uppy">Heres where the magic happens...</p>
                </div>

            </div>

            <div className="row m-3">

                <div className="col-2 mt-1">

                    <p className="mix-header text-white text-center">Preview</p>

                    <div className="d-flex flex-row justify-content-between">

                        <button className="controller-mixer p-2" onClick={handleSkipBackwardsAll}>◀◀</button>

                        <button className="controller-mixer p-2" onClick={handlePlayPauseAll}><PlayArrowIcon /></button>

                        <button className="controller-mixer p-2" onClick={handleSkipForwardsAll}>▶▶</button>

                    </div>

                </div>
                    
                <div className="col mt-1 d-flex align-items-end">

                    <div className="zoom-line">

                        <label className="text-white fs-4" for="zoom-control" >Zoom</label>

                        <Slider className="zoom-control" id="zoom-control" value={zoomLevel} onChange={handleZoomChange}/>
                        
                    </div>

                </div>
                
            </div>
            
                    {tracks.map((track) => (
                    <div key={track.id} className="row mx-2 pb-4 pt-3 px-2 my-2 up-info-box">
                        <div className="col-2">
                        <p className="text-white">{track.title}</p>
                        <p className="text-white"> {track.instrument} </p>
                        <p className="text-white">Uploaded by: </p>
                        <p className="text-white">{currentUser}</p>
                        </div>

                        <div className="up-container-waves col-10">
                            <div ref={(el) => (waveformRefs.current[track.id] = el)} className="wavesurfer-container" />
                        </div>

                    </div>))}
                
        </div>
    );
};
