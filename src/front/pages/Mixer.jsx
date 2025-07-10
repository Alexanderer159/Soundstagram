import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import { Box, Button, Typography, Slider, Stack, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import SendIcon from "@mui/icons-material/Send";
import "../styles/mixer.css"
import "../styles/index.css"
import * as Tone from "tone";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import MicIcon from "@mui/icons-material/Mic";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import EnvelopePlugin from 'wavesurfer.js/dist/plugins/envelope.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js'
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import TuneIcon from '@mui/icons-material/Tune';
import WavEncoder from "wav-encoder";
import "../styles/upload_play.css"
import "../styles/index.css"

const currentUser = "Test User";

export const Mixer = () => {

    const [projectTags, setProjectTags] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [keySignature, setKeySignature] = useState("C");
    const [timeSignature, setTimeSignature] = useState("4/4");
    const [bpm, setBpm] = useState(120);
    const [zoomLevel, setZoomLevel] = useState(0);
    const [tracks, setTracks] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [newTrackData, setNewTrackData] = useState({ title: "", instrument: "", file: null, });
    const waveformRefs = useRef({});
    const wavesurferRefs = useRef({});

    const [mediaRecorder, setMediaRecorder] = useState(null);
    const recordedChunksRef = useRef([]);
    const streamRef = useRef(null);
    const [players, setPlayers] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [micTrackName, setMicTrackName] = useState("Mic Recording");
    const [micInstrument, setMicInstrument] = useState("Voice");
    const [micTrackDescription, setMicTrackDescription] = useState("");



    const navigate = useNavigate();

    useEffect(() => {
        const stored = sessionStorage.getItem("mixerTracks");
        if (stored) {
            const parsed = JSON.parse(stored);
            const loadedPlayers = parsed.map((track) => {
                const newTrack = {
                    id: crypto.randomUUID(),
                    player: new Tone.Player({ url: track.url }),
                    title: track.title,
                    instrument: track.instrument,
                    volume: track.volume || 1,
                    pan: 0,
                    url: track.url,
                    channel: new Tone.Channel({ volume: Tone.gainToDb(track.volume || 1) }),
                    panner: new Tone.Panner(0),
                    reverb: new Tone.Reverb({ decay: 2 }),
                    delay: new Tone.FeedbackDelay("8n", 0.5),
                    distortion: new Tone.Distortion(0.4),
                    effect: "none"
                };

                // Connect the new track to the audio chain
                newTrack.player.connect(newTrack.channel);
                newTrack.channel.connect(newTrack.panner);
                newTrack.panner.toDestination();

                return newTrack;
            });
            setPlayers(loadedPlayers);
        }
    }, []);

    useEffect(() => {
        players.forEach((track) => {
            if (!wavesurferRefs.current[track.id] && waveformRefs.current[track.id]) {
                const ws = WaveSurfer.create({
                    container: waveformRefs.current[track.id],
                    url: track.url,
                    barWidth: 4,
                    barRadius: 4,
                    height: 80,
                    waveColor: "#3BC9DB",
                    progressColor: "#1098AD",
                    cursorColor: "#FFF",
                    plugins: [
                        RegionsPlugin.create({ dragSelection: false }),
                        EnvelopePlugin.create({ volume: 0.8 }),
                        Hover.create({})
                    ]
                });
                wavesurferRefs.current[track.id] = ws;
            }
        });
        return () => {
            Object.values(wavesurferRefs.current).forEach((ws) => ws.destroy());
            wavesurferRefs.current = {};
        }
    }, [players]);

    const handleStart = async () => {
        await Tone.start();
        Tone.Transport.cancel();
        players.forEach((track) => track.player.sync().start(0));
        Tone.Transport.start();
        setIsPlaying(true);
    };

    const handlePause = () => {
        Tone.Transport.pause();
        setIsPlaying(false);
    };

    const handleStop = () => {
        Tone.Transport.stop();
        Tone.Transport.cancel();
        setIsPlaying(false);
    };

    const handleVolumeChange = (index, value) => {
        const newPlayers = [...players];
        newPlayers[index].volume = value;
        newPlayers[index].channel.volume.value = Tone.gainToDb(value);
        setPlayers(newPlayers);
    };

    const handlePanChange = (index, value) => {
        const updatedPlayers = [...players];
        const track = updatedPlayers[index];
        if (!track) return;

        // Update pan value
        track.pan = value;
        track.panner.pan.value = value;

        console.log(`Pan updated for track: ${track.title}, value: ${value}`);

        setPlayers(updatedPlayers);
    };

    const handleEffectChange = (index, effect) => {
        const updatedPlayers = [...players];
        const track = updatedPlayers[index];
        if (!track) return;

        console.log(`Applying effect: ${effect} to track: ${track.title}`);

        // Disconnect all effects
        track.player.disconnect();
        track.reverb.disconnect();
        track.delay.disconnect();
        track.distortion.disconnect();

        // Connect the selected effect
        if (effect === "reverb") {
            track.player.connect(track.reverb);
            track.reverb.connect(track.channel);
        } else if (effect === "delay") {
            track.player.connect(track.delay);
            track.delay.connect(track.channel);
        } else if (effect === "distortion") {
            track.player.connect(track.distortion);
            track.distortion.connect(track.channel);
        } else {
            // Default connection (no effect)
            track.player.connect(track.channel);
        }

        console.log(`Effect applied: ${effect}`);
        track.effect = effect;
        setPlayers(updatedPlayers);
    };


    const startMicRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const recorder = new MediaRecorder(stream);
            recordedChunksRef.current = [];
            recorder.ondataavailable = (e) => recordedChunksRef.current.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
                const url = URL.createObjectURL(blob);

                const newTrack = {
                    id: crypto.randomUUID(),
                    player: new Tone.Player({ url }),
                    title: micTrackName,
                    instrument: micInstrument,
                    description: micTrackDescription,
                    volume: 1,
                    pan: 0,
                    url,
                    channel: new Tone.Channel({ volume: Tone.gainToDb(1) }),
                    panner: new Tone.Panner(0),
                    reverb: new Tone.Reverb({ decay: 2 }),
                    delay: new Tone.FeedbackDelay("8n", 0.5),
                    distortion: new Tone.Distortion(0.4),
                    effect: "none"
                };

                // Connect the new track to the audio chain
                newTrack.player.connect(newTrack.channel);
                newTrack.channel.connect(newTrack.panner);
                newTrack.panner.toDestination();

                setPlayers((prev) => [...prev, newTrack]);
                alert("Recording added to the mixer!");
            };
            recorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Mic error:", err);
        }
    };

    const stopMicRecording = () => {
        if (!streamRef.current) return;

        // Stop the media stream
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        setIsRecording(false);

        // Process the recorded audio
        const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);

        const newTrack = {
            id: crypto.randomUUID(),
            player: new Tone.Player({ url }),
            title: micTrackName,
            instrument: micInstrument,
            description: micTrackDescription,
            volume: 1,
            pan: 0,
            url,
            channel: new Tone.Channel({ volume: Tone.gainToDb(1) }),
            panner: new Tone.Panner(0),
            reverb: new Tone.Reverb({ decay: 2 }),
            delay: new Tone.FeedbackDelay("8n", 0.5),
            distortion: new Tone.Distortion(0.4),
            effect: "none"
        };

        // Connect the new track to the audio chain
        newTrack.player.connect(newTrack.channel);
        newTrack.channel.connect(newTrack.panner);
        newTrack.panner.toDestination();

        setPlayers((prev) => [...prev, newTrack]);
        alert("Recording added to the mixer!");
    };

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

        const newTrack = {
            id,
            player: new Tone.Player({ url }),
            title,
            instrument,
            volume: 1,
            pan: 0,
            url,
            channel: new Tone.Channel({ volume: Tone.gainToDb(1) }),
            panner: new Tone.Panner(0),
            reverb: new Tone.Reverb({ decay: 2 }),
            delay: new Tone.FeedbackDelay("8n", 0.5),
            distortion: new Tone.Distortion(0.4),
            effect: "none"
        };

        // Connect the new track to the audio chain
        newTrack.player.connect(newTrack.channel);
        newTrack.channel.connect(newTrack.panner);
        newTrack.panner.toDestination();

        setTracks((prev) => [...prev, newTrack]);
        closeModal();
    };

    //Opciones de wavesurfer, si quieren toquenlas a ver que sacan
    useEffect(() => {
        tracks.forEach((track) => {
            if (!wavesurferRefs.current[track.id] && waveformRefs.current[track.id]) {
                const ws = WaveSurfer.create({
                    container: waveformRefs.current[track.id],
                    url: track.url,
                    autoCenter: true,
                    autoScroll: true,
                    minPxPerSec: zoomLevel,
                    barWidth: 4,
                    interact: true,
                    dragToSeek: true,
                    hideScrollbar: true,
                    barRadius: 7,
                    waveColor: ['rgb(13, 202, 240)', 'rgb(0, 255, 191)', 'rgb(0, 255, 136)'],
                    progressColor: ['rgba(13, 202, 240,0.6)', 'rgba(0, 255, 191,0.6)', 'rgba(0, 255, 136,0.6)'],
                    normalize: true,
                    cursorWidth: 6,
                    cursorColor: 'white',
                    trackBackground: 'transparent',
                    trackBorderColor: 'white',
                    dragBounds: false,
                    plugins: [
                        RegionsPlugin.create({
                            dragSelection: false
                        }),
                        EnvelopePlugin.create({
                            volume: 0.8,
                            dragLine: true,
                            lineColor: 'white',
                            lineWidth: 2,
                            dragPointSize: 5,
                            dragPointFill: 'rgb(255, 255, 255)',
                            points: [
                                { time: 1, volume: 0.9 }],
                        }),
                        Hover.create({
                            lineColor: 'white',
                            lineWidth: 3,
                            labelBackground: 'rgba(39, 39, 39, 0.8)',
                            labelColor: 'white',
                            labelSize: '13px',
                            labelPreferLeft: false,
                        })
                    ],
                });
                wavesurferRefs.current[track.id] = ws;

            }
        });

        return () => {
            Object.values(wavesurferRefs.current).forEach((ws) => ws.destroy());
            wavesurferRefs.current = {};
        };
    }, [tracks]);



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

    const handleSkipForwards = (id) => {
        const ws = wavesurferRefs.current[id];
        if (ws) ws.skip(5);
    };

    const handleSkipBackwards = (id) => {
        const ws = wavesurferRefs.current[id];
        if (ws) ws.skip(-5);
    };

    const handleRemoveTrack = (id) => {
        if (wavesurferRefs.current[id]) {
            wavesurferRefs.current[id].destroy();
            delete wavesurferRefs.current[id];
        }
        setTracks((prev) => prev.filter((track) => track.id !== id));
    };

    useEffect(() => {
        Object.values(wavesurferRefs.current).forEach((ws) => {
            ws.zoom(zoomLevel);
        });
    }, [zoomLevel]);

    const handleZoomChange = (e, value) => {
        setZoomLevel(value);
    };


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
            )
        });
        alert("Publish is WIP");
    };

    const handleGoToMixer = () => {
        const tracksToSave = tracks.map(t => ({
            url: t.url,
            title: t.title,
            instrument: t.instrument,
            startTime: t.startTime || 0,
            volume: t.volume || 1,
        }));
        sessionStorage.setItem("mixerTracks", JSON.stringify(tracksToSave));
        navigate("/mixer");
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



    useEffect(() => {
        const stored = sessionStorage.getItem("mixerTracks");
        if (stored) {
            const parsed = JSON.parse(stored);
            const loadedPlayers = parsed.map((track) => {
                const reverb = new Tone.Reverb({ decay: 2 }).toDestination();
                const delay = new Tone.FeedbackDelay("8n", 0.5).toDestination();
                const distortion = new Tone.Distortion(0.4).toDestination();
                const panner = new Tone.Panner(0).toDestination();

                const channel = new Tone.Channel({ volume: Tone.gainToDb(track.volume || 1) }).connect(panner);

                const player = new Tone.Player({
                    url: track.url,
                    autostart: false,
                });

                player.connect(channel);

                return {
                    player,
                    title: track.title,
                    instrument: track.instrument,
                    volume: track.volume || 1,
                    pan: 0,
                    channel,
                    panner,
                    reverb,
                    delay,
                    distortion,
                    effect: "none"
                };
            });
            setPlayers(loadedPlayers);
        }
    }, []);



    // const stopMicRecording = () => {
    //     if (!mediaRecorder) return;

    //     mediaRecorder.onstop = () => {
    //         const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
    //         const url = URL.createObjectURL(blob);

    //         const newTrack = {
    //             player: new Tone.Player({ url }).toDestination(),
    //             title: micTrackName,
    //             instrument: micInstrument,
    //             volume: 1,
    //             pan: 0,
    //             channel: new Tone.Channel({ volume: Tone.gainToDb(1) }).toDestination(),
    //             panner: new Tone.Panner(0).toDestination(),
    //             reverb: new Tone.Reverb({ decay: 2 }).toDestination(),
    //             delay: new Tone.FeedbackDelay("8n", 0.5).toDestination(),
    //             distortion: new Tone.Distortion(0.4).toDestination(),
    //             effect: "none"
    //         };

    //         newTrack.player.connect(newTrack.channel.connect(newTrack.panner));
    //         setPlayers(prev => [...prev, newTrack]);
    //         alert("Grabación finalizada y añadida al mixer.");

    //         streamRef.current.getTracks().forEach(track => track.stop());
    //         setIsRecording(false);
    //     };

    //     mediaRecorder.stop();
    // };

    return (
        <div className="container-fluid mb-5">
            <div className="row">
                <p className="uppy text-center">Project Maker</p>
            </div>

            <div className="row all-info m-2 p-4">
                <div className="col-2 buttons d-flex flex-column">
                    <div className="d-flex justify-content-between">
                        <div>
                            <label className="controls-uppy-text text-white">Key</label>
                            <select className="controls-uppy ps-3" value={keySignature} onChange={e => setKeySignature(e.target.value)}>
                                {["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"].map(k => <option key={k} value={k}>{k}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="controls-uppy-text text-white">Compass</label>
                            <select className="controls-uppy ps-3" value={timeSignature} onChange={e => setTimeSignature(e.target.value)}>
                                {["4/4", "3/4", "2/4", "6/8", "5/4"].map(ts => <option key={ts} value={ts}>{ts}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="controls-uppy-text text-white">BPM</label>
                        <input className="controls-uppy ps-3" type="number" value={bpm} onChange={e => setBpm(Number(e.target.value))} min={40} max={240} />
                    </div>
                </div>

                <div className="col d-flex flex-column">
                    <label className="controls-uppy-text text-white fs-5">Details</label>
                    <div className="text-uppy gap-3 d-flex flex-column">
                        <div className="top-text-uppy d-flex flex-row justify-content-between gap-3">
                            <input className="text-uppy-input ps-3" placeholder="Project Name" value={projectTags || ""} onChange={e => setProjectTags(e.target.value)} />
                            <input className="text-uppy-input ps-3" placeholder="Instruments" value={""} />
                            <input className="text-uppy-input ps-3" placeholder="Roles" value={""} />
                            <input className="text-uppy-input ps-3" placeholder="Genre" value={""} />
                            <input className="text-uppy-input ps-3" placeholder="Visibility" value={""} />
                            <input className="text-uppy-input ps-3" placeholder="Tags (comma separated)" value={projectTags || ""} onChange={e => setProjectTags(e.target.value)} />
                        </div>
                        <textarea className="text-uppy-input ps-3" placeholder="Short Description" rows="4" value={projectDescription || ""} onChange={e => setProjectDescription(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="row m-3">

                <div className="col d-flex flex-row gap-3 ps-5">

                    <button className="btn-uppy d-flex flex-row align-items-center p-2 uptrack" data-bs-toggle="modal" data-bs-target="#UploadModal">
                        <p className="m-0 flex-row align-items-center"><UploadIcon /> Upload track</p>
                    </button>

                    <button className="btn-uppy d-flex flex-row align-items-center p-2 downproj" onClick={handleExportMix}>
                        <p className="m-0 flex-row align-items-center"> <DownloadIcon /> Download Project</p>
                    </button>

                    <button className="btn-uppy d-flex flex-row align-items-center p-2 pubproj" onClick={handlePost}>
                        <p className="m-0 flex-row align-items-center"> <SendIcon /> Publish Project</p>
                    </button>

                    {!isRecording ? (
                        <Button variant="contained" onClick={startMicRecording} startIcon={<MicIcon />}>Start Mic</Button>
                    ) : (
                        <Button variant="outlined" color="error" onClick={stopMicRecording}>Stop Mic</Button>
                    )}


                    <button className="btn-uppy d-flex flex-row align-items-center p-2 mixbut" onClick={handleGoToMixer}>
                        <Link to="/mixer" className="text-decoration-none">
                            <p className="m-0 flex-row align-items-center text-light" ><TuneIcon /> Mixer</p>
                        </Link>
                    </button>

                    <div className="modal fade" id="UploadModal" tabIndex="-1" aria-labelledby="UploadModalLabel" aria-hidden="true">
                        <div className="modal-dialog">
                            <div className="modal-content bg-dark text-white">
                                <div className="modal-header d-flex flex-column gap-2 p-4 bg-dark text-white">
                                    <p className="fs-1 m-0 p-0">Upload New Track</p>
                                </div>

                                <div className="modal-body d-flex flex-column gap-4 ">
                                    <input className="text-uppy-input p-3" placeholder="Title" value={newTrackData.title} onChange={(e) => setNewTrackData((prev) => ({ ...prev, title: e.target.value }))} />
                                    <input className="text-uppy-input p-3" placeholder="Instrument" value={newTrackData.instrument} onChange={(e) => setNewTrackData((prev) => ({ ...prev, instrument: e.target.value, }))} />
                                    <input className="file-in m-1 p-1" type="file" accept="audio/*" onChange={handleFileInput} />
                                    <button className="btn-uppy d-flex flex-row align-items-center p-2" onClick={handleTrackSubmit}> Submit </button>
                                </div>

                                <div className="modal-footer">
                                    <button className="btn-close-modal" data-bs-dismiss="modal">Close</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="col">
                    <p className="magic-uppy">Here's where the magic happens...</p>
                </div>

            </div>

            <div className="row mx-3">

                <div className="col-2 mt-1">

                    <p className="mix-header text-white text-center">Preview</p>

                    <div className="d-flex flex-row justify-content-between">

                        <button className="btn-uppy p-2 seektop" onClick={handleSkipBackwardsAll}>◀◀</button>

                        <button className="btn-uppy px-5 playtop" onClick={handlePlayPauseAll}>▶</button>

                        <button className="btn-uppy p-2 seekfortop" onClick={handleSkipForwardsAll}>▶▶</button>

                    </div>

                </div>

                <div className="col mt-1 d-flex align-items-end">

                    <div className="zoom-line">

                        <label className="text-white fs-4 zoom-txt" htmlFor="zoom-control" >Zoom</label>

                        <Slider className="zoom-control" id="zoom-control" value={zoomLevel} onChange={handleZoomChange} />

                    </div>

                </div>

            </div>

            {tracks.map((track) => (
                <div key={track.id} className="row mx-2 py-2 pt-2 px-2 mb-4 mt-3 up-info-box">
                    <div className="col-1">
                        <p className="text-white">{track.title}</p>
                        <p className="text-white"> {track.instrument} </p>
                        <p className="text-white">Uploaded by: </p>
                        <p className="text-white">{currentUser}</p>
                    </div>

                    <div className="col-2 d-flex flex-column justify-content-center gap-1">

                        <button className="btn-uppy" onClick={() => handleSkipBackwards(track.id)}>◀◀</button>

                        <button className="btn-uppy" onClick={() => handlePlayPause(track.id)}>▶</button>

                        <button className="btn-uppy" onClick={() => handleSkipForwards(track.id)}>▶▶</button>

                    </div>

                    <div className="up-container-waves col-8 d-flex align-items-center">
                        <div ref={(el) => (waveformRefs.current[track.id] = el)} className="wavesurfer-container" />
                    </div>
                    <div className="col-1">
                        <button className="btn-uppy d-flex flex-row align-items-center p-2" onClick={() => handleRemoveTrack(track.id)}><DeleteIcon /></button>
                    </div>
                    <Slider
                        value={track.pan}
                        min={-1}
                        max={1}
                        step={0.01}
                        onChange={(e, newValue) => handlePanChange(players.findIndex(p => p.id === track.id), newValue)}
                        sx={{ width: 300 }}
                    />

                    <FormControl sx={{ minWidth: 200, mt: 2 }}>
                        <InputLabel>Effect</InputLabel>
                        <Select
                            value={track.effect}
                            onChange={(e) => handleEffectChange(players.findIndex(p => p.id === track.id), e.target.value)}
                            label="Effect"
                        >
                            <MenuItem value="none">None</MenuItem>
                            <MenuItem value="reverb">Reverb</MenuItem>
                            <MenuItem value="delay">Delay</MenuItem>
                            <MenuItem value="distortion">Distortion</MenuItem>
                        </Select>
                    </FormControl>
                </div>))}

        </div>
    );
};


