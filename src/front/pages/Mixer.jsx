import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import WaveSurfer from "wavesurfer.js";
import { Box, Button, Typography, Slider, Stack, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import SendIcon from "@mui/icons-material/Send"; import WavEncoder from "wav-encoder";
import "../styles/mixer.css"
import "../styles/index.css"
import * as Tone from "tone";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";

export const Mixer = () => {
    const [players, setPlayers] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [zoom, setZoom] = useState(10);

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

                // Default connection chain: player -> channel -> panner
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
        players.forEach(({ player }) => {
            player.sync().start(0);
        });
        Tone.Transport.start();
        setIsPlaying(true);
    };

    const handleStop = () => {
        Tone.Transport.stop();
        setIsPlaying(false);
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

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Soundstagram Mixer
            </Typography>

            <Stack direction="row" spacing={2} mb={3}>
                <Button variant="contained" onClick={handleStart} disabled={isPlaying} startIcon={<PlayArrowIcon />}>
                    Play
                </Button>
                <Button variant="contained" onClick={handlePause} startIcon={<PauseIcon />}>
                    Pause
                </Button>
                <Button variant="contained" onClick={handleStop} startIcon={<StopIcon />}>
                    Stop
                </Button>
            </Stack>

            {players.map((track, index) => (
                <Box key={index} mb={4}>
                    <Typography variant="h6">{track.title} - {track.instrument}</Typography>
                    <Typography variant="body2">Volume</Typography>
                    <Slider
                        value={track.volume}
                        min={0}
                        max={1}
                        step={0.01}
                        onChange={(e, newValue) => handleVolumeChange(index, newValue)}
                        sx={{ width: 300 }}
                    />

                    <Typography variant="body2" mt={2}>Pan</Typography>
                    <Slider
                        value={track.pan}
                        min={-1}
                        max={1}
                        step={0.01}
                        onChange={(e, newValue) => handlePanChange(index, newValue)}
                        sx={{ width: 300 }}
                    />

                    <FormControl sx={{ minWidth: 200, mt: 2 }}>
                        <InputLabel>Effect</InputLabel>
                        <Select
                            value={track.effect}
                            onChange={(e) => handleEffectChange(index, e.target.value)}
                            label="Effect"
                        >
                            <MenuItem value="none">None</MenuItem>
                            <MenuItem value="reverb">Reverb</MenuItem>
                            <MenuItem value="delay">Delay</MenuItem>
                            <MenuItem value="distortion">Distortion</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            ))}
        </Box>
    );
};
