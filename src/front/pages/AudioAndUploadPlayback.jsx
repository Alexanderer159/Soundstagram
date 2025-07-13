import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import EnvelopePlugin from 'wavesurfer.js/dist/plugins/envelope.js';
import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js'
import { Slider } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import SendIcon from "@mui/icons-material/Send";
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import TuneIcon from '@mui/icons-material/Tune';
import WavEncoder from "wav-encoder";
import "../styles/upload_play.css"
import "../styles/index.css"

const currentUser = "Test User";

export const AudioUploaderAndPoster = () => {

    const [projectInfo, setProjectInfo] = useState({});
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


    useEffect(() => {
        const stored = sessionStorage.getItem("ProjectInfo");
        if (stored) {
            const form = JSON.parse(stored);
            setProjectInfo(form);
        }
    }, []);


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


    return (
        <div className="container-fluid mb-5">

            <div className="row">
                <p className="uppy text-center">{projectInfo.title}</p>
            </div>

            <div className="row all-info text-uppy m-2">

                <div className="col">
                    <div className="text-center">
                        <p className="controls-uppy-text text-white fs-1 desc-header" >Description</p>
                        <p onChange={e => setProjectDescription(e.target.value)} className="text-white form-info-uppy p-2 fs-5" value={projectDescription}>{projectInfo.description}</p>
                    </div>
                </div>


                <div className="col">
                    <p className="controls-uppy-text text-white text-center fs-1 details-header">Details</p>
                    <div className="d-flex flex-row justify-content-between px-4 py-1 deets-proj">

                        <div className="text-center d-flex flex-column gap-4">
                            <p className="controls-uppy-text text-white">Key</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-2" value={keySignature} onChange={e => setKeySignature(e.target.value)}>{projectInfo.key}</p>
                        </div>

                        <div className="text-center d-flex flex-column gap-4">
                            <p className="controls-uppy-text text-white">Compass</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-2" value={timeSignature} onChange={e => setTimeSignature(e.target.value)}>{projectInfo.meter}</p>
                        </div>

                        <div className="text-center d-flex flex-column gap-4">
                            <p className="controls-uppy-text text-white">BPM</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-2" value={bpm} onChange={e => setBpm(Number(e.target.value))}>{projectInfo.bpm}</p>
                        </div>

                        <div className="text-center d-flex flex-column gap-4">
                            <p className="controls-uppy-text text-white" >Instruments</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-2">{projectInfo.seeking_instrument_ids}</p>
                        </div>

                        <div className="text-center d-flex flex-column gap-4">
                            <p className="controls-uppy-text text-white" >Roles</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-2">{projectInfo.seeking_role_ids}</p>
                        </div>

                        <div className="text-center d-flex flex-column gap-4">
                            <p className="controls-uppy-text text-white" >Genre</p>
                            <p className="controls-uppy-text text-white form-info-uppy p-2">{projectInfo.genre_ids}</p>
                        </div>
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

                    <button className="btn-uppy d-flex flex-row align-items-center p-2 mixbut" onClick={handleGoToMixer}>
                        <Link to="/mixer" className="text-decoration-none">
                            <p className="m-0 flex-row align-items-center text-light" ><TuneIcon /> Mixer</p>
                        </Link>
                    </button>

                    <div className="modal fade" id="UploadModal" tabindex="-1" aria-labelledby="UploadModalLabel" aria-hidden="true">
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

                        <label className="text-white fs-4 zoom-txt" for="zoom-control" >Zoom</label>

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
                </div>))}

        </div>
    );
};
