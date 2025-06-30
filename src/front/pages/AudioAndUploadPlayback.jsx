import React, { useState, useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import {
    Box, Button, Typography, Stack, IconButton,
    TextField
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

const currentUser = "Adrian Ferrer Torres"; // Simulación, usa tu auth real luego

export const AudioUploaderAndPoster = () => {
    const [projectTags, setProjectTags] = useState("");
    const [projectDescription, setProjectDescription] = useState("");
    const [keySignature, setKeySignature] = useState("C");
    const [timeSignature, setTimeSignature] = useState("4/4");
    const [bpm, setBpm] = useState(120);
    const [audioFiles, setAudioFiles] = useState([]);
    const [playingStates, setPlayingStates] = useState([]);
    const waveformRefs = useRef([]);
    const waveSurfers = useRef([]);

    const handleFileChange = e => {
        const files = Array.from(e.target.files);
        const withMeta = files.map(file => ({
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
        waveSurfers.current = [];
        const newPlayingStates = [];

        audioFiles.forEach((track, idx) => {
            if (!waveformRefs.current[idx]) return;

            const wave = WaveSurfer.create(waveformOptions(waveformRefs.current[idx]));
            wave.load(track.url);

            wave.on("finish", () => {
                setPlayingStates(prev => {
                    const updated = [...prev];
                    updated[idx] = false;
                    return updated;
                });
            });

            waveSurfers.current.push(wave);
            newPlayingStates.push(false);
        });

        setPlayingStates(newPlayingStates);

        return () => {
            waveSurfers.current.forEach(w => w.destroy());
        };
    }, [audioFiles]);

    const toggleTrackPlay = index => {
        const wave = waveSurfers.current[index];
        if (!wave) return;

        if (playingStates[index]) {
            wave.pause();
        } else {
            wave.play();
        }

        setPlayingStates(prev => {
            const updated = [...prev];
            updated[index] = !prev[index];
            return updated;
        });
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
                <TextField
                    select
                    label="Clave musical"
                    value={keySignature}
                    onChange={e => setKeySignature(e.target.value)}
                    SelectProps={{ native: true }}
                    sx={{ label: { color: "#859193" } }}
                    InputProps={{ style: { backgroundColor: "#2C474C", color: "#C0C1C2" } }}
                >
                    {["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"].map(key => (
                        <option key={key} value={key}>{key}</option>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Compás"
                    value={timeSignature}
                    onChange={e => setTimeSignature(e.target.value)}
                    SelectProps={{ native: true }}
                    sx={{ label: { color: "#859193" } }}
                    InputProps={{ style: { backgroundColor: "#2C474C", color: "#C0C1C2" } }}
                >
                    {["4/4", "3/4", "2/4", "6/8", "5/4"].map(ts => (
                        <option key={ts} value={ts}>{ts}</option>
                    ))}
                </TextField>

                <TextField
                    label="BPM"
                    type="number"
                    value={bpm}
                    onChange={e => setBpm(Number(e.target.value))}
                    inputProps={{ min: 40, max: 240 }}
                    sx={{ label: { color: "#859193" } }}
                    InputProps={{ style: { backgroundColor: "#2C474C", color: "#C0C1C2" } }}
                />
            </Stack>

            <Stack spacing={2} mb={4}>
                <TextField
                    label="Tags (separados por coma)"
                    variant="outlined"
                    fullWidth
                    value={projectTags}
                    onChange={e => setProjectTags(e.target.value)}
                    sx={{ input: { color: "#C0C1C2" }, label: { color: "#859193" } }}
                    InputProps={{ style: { backgroundColor: "#2C474C" } }}
                />

                <TextField
                    label="Descripción breve"
                    multiline
                    rows={2}
                    fullWidth
                    value={projectDescription}
                    onChange={e => setProjectDescription(e.target.value)}
                    sx={{ input: { color: "#C0C1C2" }, label: { color: "#859193" } }}
                    InputProps={{ style: { backgroundColor: "#2C474C" } }}
                />
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

            <Box mt={4}>
                {audioFiles.map((track, idx) => (
                    <Box key={idx} sx={{ mb: 6, p: 2, borderRadius: 3, backgroundColor: "#1F3438", border: "1px solid #4F686D" }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography color="#C0C1C2" fontSize="0.9rem" sx={{ flexGrow: 1 }}>
                                🎵 Archivo: {track.name}
                            </Typography>
                            <IconButton onClick={() => toggleTrackPlay(idx)} sx={{ color: "#C0C1C2" }}>
                                {playingStates[idx] ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                        </Stack>

                        <Box ref={el => (waveformRefs.current[idx] = el)} sx={{ mt: 1, backgroundColor: "#2C474C", borderRadius: 2 }} />

                        <Stack direction="row" spacing={2} mt={2}>
                            <TextField
                                label="Título de la pista"
                                value={track.title}
                                onChange={e => updateTrackMeta(idx, "title", e.target.value)}
                                fullWidth
                                sx={{ input: { color: "#C0C1C2" }, label: { color: "#859193" } }}
                                InputProps={{ style: { backgroundColor: "#2C474C" } }}
                            />
                            <TextField
                                label="Instrumento"
                                value={track.instrument}
                                onChange={e => updateTrackMeta(idx, "instrument", e.target.value)}
                                fullWidth
                                sx={{ input: { color: "#C0C1C2" }, label: { color: "#859193" } }}
                                InputProps={{ style: { backgroundColor: "#2C474C" } }}
                            />
                        </Stack>

                        <Typography color="#859193" fontSize="0.8rem" mt={1}>
                            Subido por: {track.user}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};
