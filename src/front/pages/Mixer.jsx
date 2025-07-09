import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import EnvelopePlugin from 'wavesurfer.js/dist/plugins/envelope.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js'
import { Box, Button, Typography, Slider, Stack, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import SendIcon from "@mui/icons-material/Send"; import WavEncoder from "wav-encoder";
import "../styles/mixer.css"
import "../styles/index.css"
import * as Tone from "tone";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import MicIcon from "@mui/icons-material/Mic";


export const Mixer = () => {
    const [players, setPlayers] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [micTrackName, setMicTrackName] = useState("Mic Recording");
    const [micInstrument, setMicInstrument] = useState("Voice");
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isSynced, setIsSynced] = useState(false);
    const recordedChunksRef = useRef([]);
    const streamRef = useRef(null);
    // const wavesurferRefs = useRef({});
    // const waveformRefs = useRef({});

    //  const wavesurfer = WaveSurfer.create({
    //         container: waveformRefs.current,
    //         url: track.url,
    //         autoCenter:true,
    //         autoScroll:true,
    //         barWidth: 4,
    //         interact:true,
    //         dragToSeek:true,
    //         hideScrollbar: true,
    //         barRadius: 7,
    //         waveColor: ['rgb(13, 202, 240)', 'rgb(0, 255, 191)', 'rgb(0, 255, 136)'],
    //         progressColor: ['rgba(13, 202, 240,0.6)', 'rgba(0, 255, 191,0.6)', 'rgba(0, 255, 136,0.6)'],
    //         normalize: true,
    //         cursorWidth: 6,
    //         cursorColor: 'white',
    //         trackBackground: 'transparent',
    //         trackBorderColor: 'white',
    //         dragBounds: false,
    //         plugins: [
    //             RegionsPlugin.create({ 
    //                 dragSelection: false }),
    //             EnvelopePlugin.create({
    //                 volume: 0.8,
    //                 dragLine: true,
    //                 lineColor: 'white',
    //                 lineWidth: 2,
    //                 dragPointSize: 5,
    //                 dragPointFill: 'rgb(255, 255, 255)',
    //                 points: [
    //                     { time: 1, volume: 0.9 }],}),
    //             Hover.create({
    //                 lineColor: 'white',
    //                 lineWidth: 3,
    //                 labelBackground: 'rgba(39, 39, 39, 0.8)',
    //                 labelColor: 'white',
    //                 labelSize: '13px',
    //                 labelPreferLeft: false,})],});

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

const handleStart = async () => {
    await Tone.start();
    Tone.Transport.cancel();
    if (!isSynced) {
        players.forEach((track) => {
            track.player.sync().start(0);
        });
        setIsSynced(true);
    }
    Tone.Transport.start();
    setIsPlaying(true);
};

const handleStop = () => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    setIsPlaying(false);
    setIsSynced(false);
};

    const handlePause = () => {
        Tone.Transport.pause();
        setIsPlaying(false);
    };

    const handleVolumeChange = (index, value) => {
        const newPlayers = [...players];
        newPlayers[index].volume = value;
        newPlayers[index].channel.volume.value = Tone.gainToDb(value);
        setPlayers(newPlayers);
    };

    const handlePanChange = (index, value) => {
        const newPlayers = [...players];
        newPlayers[index].pan = value;
        newPlayers[index].panner.pan.value = value;
        setPlayers(newPlayers);
    };

    const handleEffectChange = (index, effect) => {
        const updatedPlayers = [...players];
        const track = updatedPlayers[index];

        track.player.disconnect();

        if (effect === "reverb") {
            track.player.connect(track.reverb);
        } else if (effect === "delay") {
            track.player.connect(track.delay);
        } else if (effect === "distortion") {
            track.player.connect(track.distortion);
        } else {
            track.player.connect(track.channel);
        }

        track.effect = effect;
        setPlayers(updatedPlayers);
    };

    const startMicRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const recorder = new MediaRecorder(stream);
            recordedChunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) recordedChunksRef.current.push(event.data);
            };

            setMediaRecorder(recorder);
            recorder.start();
            setIsRecording(true);
            alert("Grabación iniciada.");
        } catch (err) {
            console.error("No se pudo acceder al micrófono:", err);
            alert("Error accediendo al micrófono.");
        }
    };

    const stopMicRecording = () => {
        if (!mediaRecorder) return;

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
            const url = URL.createObjectURL(blob);

            const newTrack = {
                player: new Tone.Player({ url }).toDestination(),
                title: micTrackName,
                instrument: micInstrument,
                volume: 1,
                pan: 0,
                channel: new Tone.Channel({ volume: Tone.gainToDb(1) }).toDestination(),
                panner: new Tone.Panner(0).toDestination(),
                reverb: new Tone.Reverb({ decay: 2 }).toDestination(),
                delay: new Tone.FeedbackDelay("8n", 0.5).toDestination(),
                distortion: new Tone.Distortion(0.4).toDestination(),
                effect: "none"
            };

            newTrack.player.connect(newTrack.channel.connect(newTrack.panner));
            setPlayers(prev => [...prev, newTrack]);
            alert("Grabación finalizada y añadida al mixer.");

            streamRef.current.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        };

        mediaRecorder.stop();
    };

    return (
    <>
        <div className="container-fluid m-5">
            <div className="row">
                <p className="fs-1 text-white">Soundstagram Mixer</p>
            </div>
            
            <div className="row mb-3 d-flex flex-row align-items-center gap-2">
            
                <div className="col d-flex flex-row gap-2">

                    <button className="mixer-btn" onClick={() => handleStart(players.id)} disabled={isPlaying}><PlayArrowIcon /> Play</button>

                    <button className="mixer-btn" onClick={() => handlePause(players.id)}><PauseIcon /> Pause</button>

                    <button className="mixer-btn" onClick={() => handleStop(players.id)}><StopIcon /> Stop</button>
                    
                    {!isRecording ? (<button className="mixer-btn" onClick={startMicRecording}><MicIcon /> Start Mic</button>) : (
                        <button className="mixer-btn-red" onClick={stopMicRecording}>Stop Mic</button>)}

                    <div className="d-flex flex-column align-items-center justify-content-center ms-2">
                        <label className="mixer-label text-white">Microphone track name</label>
                        <input className="mixer-input p-2" value={micTrackName} onChange={(e) => setMicTrackName(e.target.value)} />
                    </div>

                    <div className="d-flex flex-column align-items-center justify-content-center ms-2">

                        <label className="mixer-label text-white">Instrument</label>
                        <select className="mixer-input p-2" value={micInstrument} onChange={(e) => setMicInstrument(e.target.value)} label="Instrumento" >

                            <option value="Voice">Voice</option>
                            <option value="Guitar">Guitar</option>
                            <option value="Drums">Drums</option>
                            <option value="Bass">Bass</option>
                            <option value="Piano">Piano</option>
                            <option value="Other">Other</option>

                        </select>
                    </div>
                </div>
            </div>

            <div className="row">
                {players.map((track, index) => (
                    <div className="mb-4" key={index}>

                        <p className="fs-4 text-white">{track.title} - {track.instrument}</p>

                        <div className="d-flex flex-column align-items-start my-2">

                            <label className="mixer-label text-white">Effect</label>
                            <select className="mixer-input p-2" value={track.effect} onChange={(e) => handleEffectChange(index, e.target.value)} label="Effect" >
                                <option value="none">None</option>
                                <option value="reverb">Reverb</option>
                                <option value="delay">Delay</option>
                                <option value="distortion">Distortion</option>
                            </select>

                        </div>

                        <div className="d-flex flex-column align-items-start my-2">

                            <label className="mixer-label text-white">Volume</label>
                            <Slider value={track.volume} min={0} max={1} step={0.01} onChange={(e, newValue) => handleVolumeChange(index, newValue)} sx={{ width: 300 }} />

                        </div>
                        <div className="d-flex flex-column align-items-start my-2">

                            <label className="mixer-label text-white mt-2">Pan</label>
                            <Slider value={track.pan} min={-1} max={1} step={0.01} onChange={(e, newValue) => handlePanChange(index, newValue)} sx={{ width: 300 }} />
                        
                        </div>

                        {/* <div className="up-container-waves col-8 d-flex align-items-center">
                            <div ref={(el) => (waveformRefs.current[track.id] = el)} className="wavesurfer-container" />
                        </div> */}

                    </div>))}
            </div>
        </div>
    </>
    );
};
