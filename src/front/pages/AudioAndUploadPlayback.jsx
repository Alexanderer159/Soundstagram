import React, { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import {
    Box, Button, Typography, Stack, IconButton,
    TextField, Slider
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import SendIcon from "@mui/icons-material/Send";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

const waveformOptions = container => ({
    container,
    waveColor: "#C0C1C2",
    progressColor: "#37555B",
    cursorColor: "#859193",
    height: 80,
    barWidth: 2,
    responsive: true,
    normalize: true,
});

const currentUser = "Ja Jaja";

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

    useEffect(() => {
        if (audioFiles.length === 0 || !containerRef.current) return;

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
                    waveColor: 'hsl(200, 87%, 49%)',
                    progressColor: 'hsl(200, 87%, 20%)',
                },
            }));

            const multitrack = Multitrack.create(tracks, {
                container: containerRef.current,
                minPxPerSec: zoomLevel,
                cursorWidth: 2,
                cursorColor: '#D72F21',
                trackBackground: '#2D2D2D',
                trackBorderColor: '#7C7C7C',
                dragBounds: true,
                envelopeOptions: {
                    lineColor: 'rgba(255, 0, 0, 0.7)',
                    lineWidth: 4,
                    dragPointSize: 10,
                    dragPointFill: 'rgba(255, 255, 255, 0.8)',
                    dragPointStroke: 'rgba(255, 255, 255, 0.3)',
                },
            });

            multitrack.once('canplay', async () => {
                await multitrack.setSinkId('default');
            });

            multitrack.on('volume-change', ({ id, volume }) => {
                console.log(`Track ${id} volume updated to ${volume}`);
            });

            multitrack.on('start-position-change', ({ id, startPosition }) => {
                console.log(`Track ${id} start position updated to ${startPosition}`);
            });

            multitrack.on('start-cue-change', ({ id, startCue }) => {
                console.log(`Track ${id} start cue updated to ${startCue}`);
            });

            multitrack.on('end-cue-change', ({ id, endCue }) => {
                console.log(`Track ${id} end cue updated to ${endCue}`);
            });

            multitrack.on('fade-in-change', ({ id, fadeInEnd }) => {
                console.log(`Track ${id} fade-in updated to ${fadeInEnd}`);
            });

            multitrack.on('fade-out-change', ({ id, fadeOutStart }) => {
                console.log(`Track ${id} fade-out updated to ${fadeOutStart}`);
            });

            setMultitrackInstance(multitrack);
        };

        document.body.appendChild(script);
        return () => {
            if (multitrackInstance) multitrackInstance.destroy();
        };
    }, [audioFiles, zoomLevel]);

    const handleZoomChange = (e, value) => {
        setZoomLevel(value);
        if (multitrackInstance) {
            multitrackInstance.zoom(value);
        }
    };

    const handlePlayPause = () => {
        if (!multitrackInstance) return;
        if (multitrackInstance.isPlaying()) {
            multitrackInstance.pause();
        } else {
            multitrackInstance.play();
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
            }))
        });
        alert("Publicar aún no implementado");
    };

    return (
        <Box sx={{ p: 4, backgroundColor: "#1F3438", borderRadius: 4 }}>
            <Typography variant="h5" color="#C0C1C2" gutterBottom>
                Subir y publicar proyecto musical
            </Typography>

            <Stack direction="row" spacing={2} mt={2} mb={2}>
                <TextField select label="Clave musical" value={keySignature} onChange={e => setKeySignature(e.target.value)} SelectProps={{ native: true }} sx={{ label: { color: "#859193" } }} InputProps={{ style: { backgroundColor: "#2C474C", color: "#C0C1C2" } }}>
                    {["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"].map(key => (
                        <option key={key} value={key}>{key}</option>
                    ))}
                </TextField>
                <TextField select label="Compás" value={timeSignature} onChange={e => setTimeSignature(e.target.value)} SelectProps={{ native: true }} sx={{ label: { color: "#859193" } }} InputProps={{ style: { backgroundColor: "#2C474C", color: "#C0C1C2" } }}>
                    {["4/4", "3/4", "2/4", "6/8", "5/4"].map(ts => (
                        <option key={ts} value={ts}>{ts}</option>
                    ))}
                </TextField>
                <TextField label="BPM" type="number" value={bpm} onChange={e => setBpm(Number(e.target.value))} inputProps={{ min: 40, max: 240 }} sx={{ label: { color: "#859193" } }} InputProps={{ style: { backgroundColor: "#2C474C", color: "#C0C1C2" } }} />
            </Stack>

            <Stack spacing={2} mb={4}>
                <TextField label="Tags (separados por coma)" variant="outlined" fullWidth value={projectTags} onChange={e => setProjectTags(e.target.value)} sx={{ input: { color: "#C0C1C2" }, label: { color: "#859193" } }} InputProps={{ style: { backgroundColor: "#2C474C" } }} />
                <TextField label="Descripción breve" multiline rows={2} fullWidth value={projectDescription} onChange={e => setProjectDescription(e.target.value)} sx={{ input: { color: "#C0C1C2" }, label: { color: "#859193" } }} InputProps={{ style: { backgroundColor: "#2C474C" } }} />
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
                <Button variant="contained" component="label" startIcon={<UploadIcon />} sx={{ backgroundColor: "#37555B" }}>
                    Subir pistas
                    <input hidden type="file" accept="audio/*" multiple onChange={handleFileChange} />
                </Button>
                <Button variant="contained" startIcon={<SendIcon />} onClick={handlePost} sx={{ backgroundColor: "#37555B" }}>
                    Publicar proyecto
                </Button>
            </Stack>

            <Box mt={6} mb={2}>
                <Typography color="#C0C1C2" fontSize={18} fontWeight={600} mb={1}>Controles de mezcla</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Button variant="outlined" onClick={handlePlayPause} sx={{ color: "#C0C1C2", borderColor: "#C0C1C2" }}>Play / Pause</Button>
                    <Button variant="outlined" onClick={() => handleSeek(-10)} sx={{ color: "#C0C1C2", borderColor: "#C0C1C2" }}>◀ Retroceder</Button>
                    <Button variant="outlined" onClick={() => handleSeek(10)} sx={{ color: "#C0C1C2", borderColor: "#C0C1C2" }}>Avanzar ▶</Button>
                    <Box sx={{ width: 200 }}>
                        <Typography color="#C0C1C2" fontSize={12}>Zoom</Typography>
                        <Slider min={10} max={100} value={zoomLevel} onChange={handleZoomChange} sx={{ color: "#37555B" }} />
                    </Box>
                </Stack>
            </Box>

            <Box ref={containerRef} sx={{ width: "100%", minHeight: 300, backgroundColor: "#2D2D2D", borderRadius: 2 }} />
        </Box>
    );
};
