import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import {Box, Button, Typography, Stack, IconButton,TextField, Slider} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import SendIcon from "@mui/icons-material/Send";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import WavEncoder from "wav-encoder";
import "../styles/upload_play.css"
import "../styles/index.css"

const waveformOptions = container => ({     //Esto sirve para algo?
    container,
    waveColor: "#C0C1C2",
    progressColor: "#37555B",
    cursorColor: "#859193",
    height: 1000,
    barWidth: 2,
    responsive: true,
    normalize: true,
});

const currentUser = "Test User";

export const AudioUploaderAndPoster = () => {
    const [projectTags, setProjectTags] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [keySignature, setKeySignature] = useState("C");
    const [timeSignature, setTimeSignature] = useState("4/4");
    const [bpm, setBpm] = useState(120);
    const [audioFiles, setAudioFiles] = useState([]);
    const [playingStates, setPlayingStates] = useState([]);
    const [multitrackInstance, setMultitrackInstance] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(30);
    const waveformRefs = useRef([]);
    const waveSurfers = useRef([]);
    const containerRef = useRef();
    const [isPlaying, setIsPlaying] = useState(false);


    const handleFileChange = e => {
        const files = Array.from(e.target.files);
        const withMeta = files.map((file, index) => ({
            id: index,
            file,
            url: URL.createObjectURL(file),
            name: file.name,
            title: "",
            instrument: "",
            user: currentUser,
        }));
        setAudioFiles(prev => [...prev, ...withMeta]);
    };



    useEffect(() => {                                                         //PRIMER USEEFFECT
        if (audioFiles.length === 0 || !containerRef.current) return;

        if (multitrackInstance) {
            multitrackInstance.destroy(); //destruye si ya hay track previo, sin embargo, se vuela el title e instrument
            setMultitrackInstance(null);
            containerRef.current.innerHTML = "";
        }

        const script = document.createElement("script");
        script.src = "https://unpkg.com/wavesurfer-multitrack/dist/multitrack.min.js";
        script.onload = () => {
            const Multitrack = window.Multitrack;
            const tracks = audioFiles.map((track, idx) => ({
                id: idx,
                url: track.url,
                draggable: true,
                envelope: true,
                startCue: 0,
                endCue: undefined,
                fadeInEnd: 1,
                fadeOutStart: undefined,
                volume: 0.8,
                options: {
                    mediaControls: true,
                    barWidth: 4,
                    barRadius: 7,
                    normalize: true,
                    waveColor: ['rgb(13, 202, 240)', 'rgb(0, 255, 191)', 'rgb(0, 255, 136)'],
                    progressColor: ['rgba(13, 202, 240,0.6)', 'rgba(0, 255, 191,0.6)', 'rgba(0, 255, 136,0.6)'],
                }}));

            const multitrack = Multitrack.create(tracks, {
                container: containerRef.current,
                minPxPerSec: zoomLevel,
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
                }});

            multitrack.once('canplay', async () => {
                await multitrack.setSinkId('default');
            });

            setMultitrackInstance(multitrack);
        };

        document.body.appendChild(script);

        return () => {
            if (multitrackInstance) {
                multitrackInstance.destroy();     //repetido?
                containerRef.current.innerHTML = "";
            }
        };
    }, [audioFiles]);                            ///TERMINA PRIMER USEEFFECT

    useEffect(() => {                                                                       //SEGUNDO USEEFFECT
        if (multitrackInstance) {
            multitrackInstance.zoom(zoomLevel);
        }
    }, [zoomLevel]);


    const handleZoomChange = (e, value) => {
        setZoomLevel(value);
    };

    const handlePlayPause = () => {
        if (!multitrackInstance) return;
        if (multitrackInstance.isPlaying()) {
            multitrackInstance.pause();
            setIsPlaying(false);
        } else {
            multitrackInstance.play();
            setIsPlaying(true);
        }
    };


    const handleSeek = seconds => {
        if (multitrackInstance) {
            const current = multitrackInstance.getCurrentTime();
            multitrackInstance.setTime(current + seconds);
        }
    };

    const updateTrackMeta = (index, key, value) => {
        setAudioFiles(prev => {
            const updated = [...prev];
            updated[index][key] = value;
            return updated;
        });
    };

    const handlePost = () => {
        console.log({
            tags: projectTags,
            description: projectDescription,
            keySignature,
            timeSignature,
            bpm,
            tracks: audioFiles.map(({ title, instrument, user, name }) => ({
                title, instrument, user, originalFilename: name
            })
        )});
        alert("Publish is WIP");
    };

    const handleExportMix = async () => {
        if (audioFiles.length === 0) {
            alert("No tracks to download yet");
            return;
        }

        const buffers = [];

        // Paso 1: Cargar y decodificar cada pista
        for (const track of audioFiles) {
            const response = await fetch(track.url);
            const arrayBuffer = await response.arrayBuffer();
            const tempCtx = new AudioContext();
            const decodedBuffer = await tempCtx.decodeAudioData(arrayBuffer);
            buffers.push({ buffer: decodedBuffer, startTime: 0, volume: 1 });
            tempCtx.close();
        }

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
                            <input className="text-uppy-input ps-3" placeholder="Instrument" />
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

                    <button className="btn-uppy d-flex flex-row align-items-center p-2">
                        <label className="into-uppy flex-row align-items-center" htmlFor="fileUpload"><UploadIcon /> Upload Track</label>
                        <input className="into-uppy" hidden id="fileUpload" type="file" accept="audio/*" multiple onChange={handleFileChange} />
                    </button>

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

                    <button type="button" className="btn btn-uppy" data-bs-toggle="modal" data-bs-theme="dark" data-bs-target="#Upload">
  <UploadIcon /> Upload Track
</button>

<div className="modal fade text-white" id="Upload" data-bs-theme="dark" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div className="modal-dialog">
    <div className="modal-content">
      <div className="modal-header">
        <p className="modal-title fs-5" id="exampleModalLabel">Upload Track</p>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body">

 <TextField label="Track Title"  sx={{ input: { color: "#C0C1C2" }, label: { color: "#859193" } }} InputProps={{ style: { backgroundColor: "#2C474C" } }} />
<TextField label="Instrument"  sx={{ input: { color: "#C0C1C2" }, label: { color: "#859193" } }}InputProps={{ style: { backgroundColor: "#2C474C" } }} /> 
        
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" className="btn btn-primary">Save changes</button>
      </div>
    </div>
  </div>
</div>

                </div>

             <div className="col">
                <p className="magic-uppy">Heres where the magic happens...</p>
             </div>

            </div>

            <div className="row m-3">

                <div className="col-2 mt-1">

                    <p className="mix-header text-white text-center">Preview</p>

                    <div className="d-flex flex-row justify-content-between">

                        <button className="controller-mixer p-2" onClick={() => handleSeek(-10)}>◀◀</button>

                        <button className="controller-mixer p-2" onClick={handlePlayPause}>{isPlaying ? <PauseIcon /> : <PlayArrowIcon />}</button>

                        <button className="controller-mixer p-2" onClick={() => handleSeek(10)}>▶▶</button>

                    </div>

                </div>
                    
                <div className="col mt-1 d-flex align-items-end">

                    <div className="zoom-line">

                        <label className="text-white fs-4" for="zoom-control" >Zoom</label>

                        <Slider className="zoom-control" id="zoom-control" value={zoomLevel} onChange={handleZoomChange}/>
                        
                    </div>

                </div>
                
            </div>
            <div className="row mx-2 mb-5 pb-5 up-info-box p-5 d-flex flex-column">
            
                    {audioFiles.map((track, idx) => (
                        <div className="up-info my-2 d-flex flex-row gap-3" key={idx}>
                            <div className="col-3 d-flex flex-column mt-2 gap-3">
                                <TextField label="Track Title" value={track.title} onChange={e => updateTrackMeta(idx, "title", e.target.value)} sx={{ input: { color: "#C0C1C2" }, label: { color: "#859193" } }} InputProps={{ style: { backgroundColor: "#2C474C" } }} />
                                <TextField label="Instrument" value={track.instrument} onChange={e => updateTrackMeta(idx, "instrument", e.target.value)} sx={{ input: { color: "#C0C1C2" }, label: { color: "#859193" } }}InputProps={{ style: { backgroundColor: "#2C474C" } }} />
                                <p className="up-by mt-1 text-white"> Uploaded By: {track.user}</p>
                            </div>
                            <div className="col-9 d-flex justify-content-start align-items-start" ref={containerRef}>
                            </div>
                        </div>))}
                
            </div>
        </div>
    );
};
