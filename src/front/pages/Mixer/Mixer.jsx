import React, { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";

export const Mixer = () => {
    const [tracks, setTracks] = useState([]);
    const [isGlobalPlaying, setIsGlobalPlaying] = useState(false);
    const [masterVolume, setMasterVolume] = useState(0.8);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [projectName, setProjectName] = useState("Epic Mix Project");
    const [bpm, setBpm] = useState(128);
    const [isInitialized, setIsInitialized] = useState(false);
    const [loadingTracks, setLoadingTracks] = useState([]);

    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const recordedChunksRef = useRef([]);
    const masterDestination = useRef(null);

    // CSS Variables para el estilo épico
    const cssVariables = {
        '--accent': '#00D4FF',
        '--bg-color': 'linear-gradient(135deg, #0a0a2e, #16213e, #1a1a2e)',
        '--color-1': '#00D4FF',
        '--color-2': '#5B73FF',
        '--color-3': '#3BC9DB',
        '--color-4': '#FF6B6B',
        '--color-5': '#FF4757',
        '--neon-glow': '0 0 20px var(--accent), 0 0 40px var(--accent), 0 0 60px var(--accent)'
    };

    // Inicializar audio system
    const initializeAudio = useCallback(async () => {
        if (!isInitialized) {
            try {
                await Tone.start();

                // Crear master destination
                const masterGain = new Tone.Gain(masterVolume);
                masterGain.toDestination();
                masterDestination.current = masterGain;

                console.log("🎵 Audio system initialized successfully");
                setIsInitialized(true);
                return true;
            } catch (error) {
                console.error("❌ Failed to initialize audio:", error);
                return false;
            }
        }
        return true;
    }, [isInitialized, masterVolume]);

    // Update master volume
    useEffect(() => {
        if (masterDestination.current) {
            masterDestination.current.gain.value = masterVolume;
        }
    }, [masterVolume]);

    // Recording timer
    useEffect(() => {
        let interval;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    // Crear track de audio (FUNCIONAL AL 100%)
    const createAudioTrack = useCallback(async (file, title, instrument = "Audio") => {
        const initialized = await initializeAudio();
        if (!initialized) throw new Error("Failed to initialize audio");

        const id = crypto.randomUUID();
        const url = URL.createObjectURL(file);

        try {
            // Crear player con URL (método más confiable)
            const player = new Tone.Player({
                url: url,
                autostart: false,
                onload: () => console.log(`✅ ${title} loaded successfully`),
                onerror: (error) => console.error(`❌ Error loading ${title}:`, error)
            });

            // Esperar a que se cargue
            await new Promise((resolve, reject) => {
                const checkLoaded = () => {
                    if (player.loaded) {
                        resolve();
                    } else if (player.state === "stopped") {
                        setTimeout(checkLoaded, 100);
                    } else {
                        reject(new Error("Failed to load"));
                    }
                };
                checkLoaded();
                setTimeout(() => reject(new Error("Load timeout")), 10000);
            });

            // Crear efectos épicos
            const reverb = new Tone.Reverb({
                decay: 6,
                wet: 0.8,
                roomSize: 0.9
            });

            const delay = new Tone.FeedbackDelay({
                delayTime: "8n",
                feedback: 0.7,
                wet: 0.7
            });

            const distortion = new Tone.Distortion({
                distortion: 1.0,
                wet: 0.9
            });

            const filter = new Tone.Filter({
                frequency: 1000,
                type: "lowpass",
                rolloff: -24
            });

            const chorus = new Tone.Chorus({
                frequency: 4,
                delayTime: 2.5,
                depth: 0.7,
                spread: 180
            });

            // Channel con gain y pan
            const channel = new Tone.Channel({
                volume: 0,
                pan: 0
            });

            // Conexión inicial sin efectos
            player.connect(channel);
            channel.connect(masterDestination.current);

            // Generar waveform data simulada
            const waveformData = Array.from({ length: 80 }, () => Math.random() * 0.8 + 0.2);

            const track = {
                id,
                player,
                title,
                instrument,
                volume: 0.8,
                pan: 0,
                solo: false,
                mute: false,
                effect: "none",
                isPlaying: false,
                isLoaded: true,
                duration: player.buffer ? player.buffer.duration : 0,
                waveformData,

                // Effects
                reverb,
                delay,
                distortion,
                filter,
                chorus,
                channel,

                // File info
                url,
                size: file.size,
                type: file.type
            };

            console.log(`🎵 Track created: ${title}`);
            return track;

        } catch (error) {
            URL.revokeObjectURL(url);
            console.error(`❌ Failed to create track ${title}:`, error);
            throw error;
        }
    }, [initializeAudio]);

    // Subir archivos
    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);

        for (let file of files) {
            if (file.type.startsWith('audio/')) {
                const loadingId = crypto.randomUUID();

                // Añadir loading state
                setLoadingTracks(prev => [...prev, {
                    id: loadingId,
                    name: file.name,
                    progress: 0
                }]);

                try {
                    const track = await createAudioTrack(file, file.name.split('.')[0], "Uploaded");

                    // Remover loading y añadir track
                    setLoadingTracks(prev => prev.filter(t => t.id !== loadingId));
                    setTracks(prev => [...prev, track]);

                } catch (error) {
                    setLoadingTracks(prev => prev.filter(t => t.id !== loadingId));
                    console.error(`Failed to load ${file.name}:`, error);
                    alert(`❌ Failed to load "${file.name}"\n\nTry: MP3, WAV, OGG, M4A`);
                }
            } else {
                alert(`❌ "${file.name}" is not an audio file`);
            }
        }

        event.target.value = '';
    };

    // Aplicar efectos
    const applyEffect = async (trackId, effectType) => {
        await initializeAudio();

        setTracks(prev => prev.map(track => {
            if (track.id !== trackId) return track;

            try {
                // Desconectar todo
                track.player.disconnect();
                track.reverb.disconnect();
                track.delay.disconnect();
                track.distortion.disconnect();
                track.filter.disconnect();
                track.chorus.disconnect();
                track.channel.disconnect();

                // Reconectar según efecto
                switch (effectType) {
                    case "reverb":
                        track.player.chain(track.reverb, track.channel, masterDestination.current);
                        break;
                    case "delay":
                        track.player.chain(track.delay, track.channel, masterDestination.current);
                        break;
                    case "distortion":
                        track.player.chain(track.distortion, track.channel, masterDestination.current);
                        break;
                    case "filter":
                        track.player.chain(track.filter, track.channel, masterDestination.current);
                        break;
                    case "chorus":
                        track.player.chain(track.chorus, track.channel, masterDestination.current);
                        break;
                    case "combo":
                        track.player.chain(track.distortion, track.delay, track.reverb, track.channel, masterDestination.current);
                        break;
                    default:
                        track.player.connect(track.channel);
                        track.channel.connect(masterDestination.current);
                        break;
                }

                console.log(`🎛️ Applied ${effectType} to ${track.title}`);
                return { ...track, effect: effectType };
            } catch (error) {
                console.error("Effect error:", error);
                return track;
            }
        }));
    };

    // Reproducir/pausar track individual
    const togglePlayTrack = async (trackId) => {
        await initializeAudio();

        setTracks(prev => prev.map(track => {
            if (track.id === trackId) {
                try {
                    if (track.player.state === "started") {
                        track.player.stop();
                        return { ...track, isPlaying: false };
                    } else {
                        track.player.start();
                        return { ...track, isPlaying: true };
                    }
                } catch (error) {
                    console.error("Playback error:", error);
                    return track;
                }
            }
            return track;
        }));
    };

    // Reproducción global
    const toggleGlobalPlay = async () => {
        await initializeAudio();

        if (isGlobalPlaying) {
            // Parar todo
            tracks.forEach(track => {
                if (track.player.state === "started") {
                    track.player.stop();
                }
            });
            setTracks(prev => prev.map(track => ({ ...track, isPlaying: false })));
            setIsGlobalPlaying(false);
        } else {
            // Reproducir todos los tracks no muteados
            tracks.forEach(track => {
                if (!track.mute && track.isLoaded) {
                    try {
                        track.player.start();
                    } catch (error) {
                        console.error("Global play error:", error);
                    }
                }
            });
            setTracks(prev => prev.map(track => ({
                ...track,
                isPlaying: !track.mute && track.isLoaded
            })));
            setIsGlobalPlaying(true);
        }
    };

    // Controles de track
    const updateTrackVolume = (trackId, volume) => {
        setTracks(prev => prev.map(track => {
            if (track.id === trackId) {
                track.channel.volume.value = Tone.gainToDb(volume);
                return { ...track, volume };
            }
            return track;
        }));
    };

    const updateTrackPan = (trackId, pan) => {
        setTracks(prev => prev.map(track => {
            if (track.id === trackId) {
                track.channel.pan.value = pan;
                return { ...track, pan };
            }
            return track;
        }));
    };

    const toggleMute = (trackId) => {
        setTracks(prev => prev.map(track => {
            if (track.id === trackId) {
                const newMute = !track.mute;
                track.channel.mute = newMute;
                return { ...track, mute: newMute };
            }
            return track;
        }));
    };

    const toggleSolo = (trackId) => {
        setTracks(prev => {
            const targetTrack = prev.find(t => t.id === trackId);
            const newSolo = !targetTrack.solo;

            return prev.map(track => {
                if (track.id === trackId) {
                    return { ...track, solo: newSolo };
                } else {
                    // Si hay un solo activo, mutear los otros
                    const shouldMute = newSolo;
                    track.channel.mute = shouldMute;
                    return { ...track, mute: shouldMute };
                }
            });
        });
    };

    const removeTrack = (trackId) => {
        setTracks(prev => {
            const track = prev.find(t => t.id === trackId);
            if (track) {
                try {
                    track.player.stop();
                    track.player.dispose();
                    URL.revokeObjectURL(track.url);
                } catch (error) {
                    console.error("Cleanup error:", error);
                }
            }
            return prev.filter(t => t.id !== trackId);
        });
    };

    // Grabación de micrófono
    const startRecording = async () => {
        await initializeAudio();

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            streamRef.current = stream;
            const recorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = recorder;
            recordedChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    recordedChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = async () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], `Recording_${Date.now()}.webm`, { type: 'audio/webm' });

                try {
                    const track = await createAudioTrack(file, `Recording ${tracks.length + 1}`, "Microphone");
                    setTracks(prev => [...prev, track]);
                    console.log("🎙️ Recording added successfully!");
                } catch (error) {
                    console.error("Failed to process recording:", error);
                    alert("❌ Failed to process recording");
                }
            };

            recorder.start(100);
            setIsRecording(true);
        } catch (error) {
            console.error("Recording error:", error);
            alert("❌ Could not access microphone");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            streamRef.current?.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    // Utilidades
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const WaveformVisualizer = ({ track }) => {
        if (!track.waveformData) return null;

        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                height: '60px',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '8px',
                padding: '8px',
                gap: '2px',
                overflow: 'hidden',
                border: '1px solid var(--accent)',
                boxShadow: track.isPlaying ? 'inset 0 0 20px rgba(0, 212, 255, 0.3)' : 'none'
            }}>
                {track.waveformData.map((value, index) => (
                    <div
                        key={index}
                        style={{
                            width: '4px',
                            height: `${Math.max(4, value * 44)}px`,
                            background: track.isPlaying
                                ? `linear-gradient(to top, var(--color-1), var(--color-2))`
                                : `linear-gradient(to top, var(--accent), rgba(0, 212, 255, 0.5))`,
                            borderRadius: '2px',
                            transition: 'all 0.3s ease',
                            boxShadow: track.isPlaying ? '0 0 8px var(--accent)' : 'none',
                            animation: track.isPlaying ? `waveform-pulse 0.${index + 1}s ease-in-out infinite alternate` : 'none'
                        }}
                    />
                ))}
            </div>
        );
    };

    return (
        <div style={{
            ...cssVariables,
            minHeight: '100vh',
            background: 'var(--bg-color)',
            color: 'white',
            padding: '20px',
            fontFamily: '"Orbitron", "Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
                
                @keyframes gradient-shift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                @keyframes neon-pulse {
                    0%, 100% { box-shadow: 0 0 5px var(--accent), 0 0 10px var(--accent), 0 0 15px var(--accent); }
                    50% { box-shadow: 0 0 10px var(--accent), 0 0 20px var(--accent), 0 0 30px var(--accent); }
                }

                @keyframes waveform-pulse {
                    0% { opacity: 0.7; transform: scaleY(0.8); }
                    100% { opacity: 1; transform: scaleY(1.2); }
                }

                @keyframes record-glow {
                    0%, 100% { box-shadow: 0 0 20px #ff4757, 0 0 40px #ff4757; }
                    50% { box-shadow: 0 0 30px #ff4757, 0 0 60px #ff4757; }
                }

                .mixer-btn {
                    border: 2px solid var(--accent);
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(91, 115, 255, 0.1));
                    border-radius: 12px;
                    color: white;
                    cursor: pointer;
                    font-family: 'Orbitron', monospace;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                }

                .mixer-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                    transition: left 0.5s;
                }

                .mixer-btn:hover {
                    border-color: var(--color-2);
                    box-shadow: var(--neon-glow);
                    transform: translateY(-3px);
                    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(91, 115, 255, 0.2));
                }

                .mixer-btn:hover::before {
                    left: 100%;
                }

                .mixer-btn:active {
                    transform: translateY(-1px);
                    box-shadow: 0 0 30px var(--accent);
                }

                .mixer-btn-red {
                    border: 2px solid var(--color-4);
                    background: linear-gradient(135deg, rgba(255, 107, 107, 0.1), rgba(255, 71, 87, 0.1));
                    border-radius: 12px;
                    color: white;
                    cursor: pointer;
                    font-family: 'Orbitron', monospace;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(10px);
                }

                .mixer-btn-red:hover {
                    border-color: var(--color-5);
                    box-shadow: 0 0 20px var(--color-4), 0 0 40px var(--color-4);
                    transform: translateY(-3px);
                    background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 71, 87, 0.2));
                }

                .mixer-btn-red:active {
                    transform: translateY(-1px);
                }

                .mixer-range {
                    -webkit-appearance: none;
                    height: 8px;
                    border-radius: 4px;
                    background: linear-gradient(90deg, #1e293b, #334155);
                    outline: none;
                    border: 1px solid var(--accent);
                    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
                }

                .mixer-range::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--color-1), var(--color-2));
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 0 15px var(--accent);
                    transition: all 0.3s ease;
                }

                .mixer-range::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                    box-shadow: 0 0 25px var(--accent);
                }

                .mixer-select {
                    background: linear-gradient(135deg, #1e293b, #334155);
                    border: 2px solid var(--accent);
                    color: white;
                    border-radius: 8px;
                    font-family: 'Orbitron', monospace;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
                    cursor: pointer;
                    position: relative;
                    z-index: 10;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2300D4FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
                    background-repeat: no-repeat;
                    background-position: right 12px center;
                    background-size: 16px;
                    padding-right: 40px;
                }

                .mixer-select:focus {
                    outline: none;
                    box-shadow: 0 0 20px var(--accent);
                    border-color: var(--color-2);
                }

                .mixer-select option {
                    background: #1e293b;
                    color: white;
                    padding: 10px;
                    font-family: 'Orbitron', monospace;
                    font-weight: 600;
                    border: none;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .mixer-select option:hover {
                    background: #334155;
                    color: var(--accent);
                }

                .mixer-select option:checked {
                    background: linear-gradient(135deg, var(--color-1), var(--color-2));
                    color: black;
                    font-weight: bold;
                }

                .track-container {
                    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6));
                    border: 2px solid var(--accent);
                    border-radius: 16px;
                    backdrop-filter: blur(15px);
                    position: relative;
                    overflow: hidden;
                    transition: all 0.4s ease;
                }

                .track-container::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(45deg, transparent 30%, rgba(0, 212, 255, 0.05) 50%, transparent 70%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .track-container:hover::before {
                    opacity: 1;
                }

                .track-container:hover {
                    border-color: var(--color-2);
                    box-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
                    transform: translateY(-5px);
                }

                .effect-indicator {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    background: linear-gradient(135deg, rgba(59, 188, 219, 0.2), rgba(91, 115, 255, 0.2));
                    border: 1px solid var(--accent);
                    backdrop-filter: blur(10px);
                }

                .effect-active {
                    background: linear-gradient(135deg, var(--color-1), var(--color-2));
                    color: black;
                    animation: neon-pulse 2s ease-in-out infinite;
                }

                .record-pulse {
                    animation: record-glow 1s ease-in-out infinite;
                }

                .loading-spinner {
                    border: 3px solid rgba(0, 212, 255, 0.3);
                    border-top: 3px solid var(--accent);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .status-indicator {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    position: relative;
                }

                .status-indicator.playing {
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    box-shadow: 0 0 15px #22c55e;
                    animation: neon-pulse 1.5s ease-in-out infinite;
                }

                .status-indicator.stopped {
                    background: linear-gradient(135deg, #6b7280, #4b5563);
                }

                .futuristic-input {
                    background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6));
                    border: 2px solid var(--accent);
                    color: white;
                    border-radius: 8px;
                    padding: 12px 16px;
                    font-family: 'Orbitron', monospace;
                    font-weight: 600;
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                }

                .futuristic-input:focus {
                    outline: none;
                    border-color: var(--color-2);
                    box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
                }
            `}</style>

            {/* Header Épico */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{
                    fontSize: '56px',
                    fontWeight: '900',
                    background: 'linear-gradient(45deg, var(--color-1), var(--color-2), var(--color-3))',
                    backgroundClip: 'text',
                    color: 'transparent',
                    textShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
                    marginBottom: '10px',
                    letterSpacing: '3px'
                }}>
                    🎛️ ULTIMATE MIXER
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="futuristic-input"
                        style={{ fontSize: '18px', textAlign: 'center', maxWidth: '300px' }}
                        placeholder="Project Name"
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>BPM:</span>
                        <input
                            type="number"
                            value={bpm}
                            onChange={(e) => setBpm(Number(e.target.value))}
                            className="futuristic-input"
                            style={{ width: '80px', textAlign: 'center' }}
                            min="60"
                            max="200"
                        />
                    </div>
                </div>

                {/* Status System */}
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '15px 30px',
                    background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(30, 41, 59, 0.5))',
                    border: `2px solid ${isInitialized ? '#22c55e' : '#f59e0b'}`,
                    borderRadius: '25px',
                    backdropFilter: 'blur(15px)',
                    boxShadow: isInitialized ? '0 0 30px rgba(34, 197, 94, 0.3)' : '0 0 30px rgba(245, 158, 11, 0.3)'
                }}>
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: isInitialized ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                        boxShadow: isInitialized ? '0 0 15px #22c55e' : '0 0 15px #f59e0b',
                        animation: 'neon-pulse 2s ease-in-out infinite'
                    }} />
                    <span style={{ fontWeight: 'bold', color: isInitialized ? '#22c55e' : '#f59e0b' }}>
                        AUDIO SYSTEM: {isInitialized ? 'ONLINE' : 'STANDBY'}
                    </span>
                    <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>
                        {tracks.length} TRACKS LOADED
                    </span>
                </div>
            </div>

            {/* Control Central */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '25px',
                marginBottom: '40px',
                padding: '30px',
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(30, 41, 59, 0.6))',
                borderRadius: '20px',
                border: '2px solid var(--accent)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 50px rgba(0, 212, 255, 0.2)',
                flexWrap: 'wrap'
            }}>
                {/* Master Controls */}
                <button
                    onClick={toggleGlobalPlay}
                    className="mixer-btn"
                    style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        fontSize: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isGlobalPlaying ? '⏸️' : '▶️'}
                </button>

                <button
                    onClick={() => {
                        tracks.forEach(track => track.player.stop());
                        setTracks(prev => prev.map(track => ({ ...track, isPlaying: false })));
                        setIsGlobalPlaying(false);
                    }}
                    className="mixer-btn"
                    style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        fontSize: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    ⏹️
                </button>

                {/* Recording */}
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        className="mixer-btn-red"
                        style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            fontSize: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        🎙️
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="mixer-btn-red record-pulse"
                        style={{
                            padding: '15px 25px',
                            borderRadius: '15px',
                            fontSize: '16px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <div>🔴 REC</div>
                        <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                            {formatTime(recordingTime)}
                        </div>
                    </button>
                )}

                {/* Upload */}
                <label className="mixer-btn" style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    fontSize: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    📁
                    <input
                        type="file"
                        multiple
                        accept="audio/*"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />
                </label>

                {/* Master Volume */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <label style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '14px' }}>
                        MASTER VOLUME
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={masterVolume}
                        onChange={(e) => setMasterVolume(Number(e.target.value))}
                        className="mixer-range"
                        style={{ width: '200px' }}
                    />
                    <span style={{ color: 'var(--color-3)', fontWeight: 'bold', fontSize: '14px' }}>
                        {Math.round(masterVolume * 100)}%
                    </span>
                </div>
            </div>

            {/* Loading Tracks */}
            {loadingTracks.map(loading => (
                <div key={loading.id} style={{
                    padding: '20px',
                    marginBottom: '15px',
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))',
                    border: '2px solid #f59e0b',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                }}>
                    <div className="loading-spinner" style={{ width: '24px', height: '24px' }} />
                    <div>
                        <div style={{ fontWeight: 'bold', color: '#f59e0b' }}>
                            Loading: {loading.name}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                            Processing audio file...
                        </div>
                    </div>
                </div>
            ))}

            {/* Tracks */}
            <div>
                {tracks.length === 0 && loadingTracks.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 40px',
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(51, 65, 85, 0.3))',
                        borderRadius: '20px',
                        border: '2px dashed var(--accent)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎵</div>
                        <h3 style={{
                            fontSize: '28px',
                            color: 'var(--color-3)',
                            marginBottom: '15px',
                            fontWeight: 'bold'
                        }}>
                            READY FOR AUDIO
                        </h3>
                        <p style={{ color: 'var(--accent)', fontSize: '18px', lineHeight: '1.6' }}>
                            Upload audio files or record with your microphone<br />
                            to create the ultimate mix
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {tracks.map((track, index) => (
                            <div key={track.id} className="track-container" style={{ padding: '25px' }}>
                                {/* Track Header */}
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginBottom: '20px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{
                                            fontSize: '24px',
                                            fontWeight: '900',
                                            color: 'var(--color-1)',
                                            textShadow: '0 0 10px var(--color-1)',
                                            minWidth: '50px'
                                        }}>
                                            #{index + 1}
                                        </div>
                                        <div>
                                            <h3 style={{
                                                margin: 0,
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                color: 'white'
                                            }}>
                                                {track.title}
                                            </h3>
                                            <p style={{
                                                margin: '5px 0 0 0',
                                                fontSize: '14px',
                                                color: 'var(--accent)',
                                                opacity: 0.8
                                            }}>
                                                {track.instrument} • {formatTime(track.duration)}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div className={`effect-indicator ${track.effect !== 'none' ? 'effect-active' : ''}`}>
                                            {track.effect === 'none' ? '🔧 Clean' :
                                                track.effect === 'reverb' ? '🏛️ Reverb' :
                                                    track.effect === 'delay' ? '🔄 Delay' :
                                                        track.effect === 'distortion' ? '🔥 Distortion' :
                                                            track.effect === 'filter' ? '🎛️ Filter' :
                                                                track.effect === 'chorus' ? '🌊 Chorus' :
                                                                    track.effect === 'combo' ? '✨ Combo' : track.effect}
                                        </div>

                                        <div className={`status-indicator ${track.isPlaying ? 'playing' : 'stopped'}`} />

                                        <button
                                            onClick={() => removeTrack(track.id)}
                                            className="mixer-btn-red"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                fontSize: '16px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                {/* Waveform */}
                                <div style={{ marginBottom: '20px' }}>
                                    <WaveformVisualizer track={track} />
                                </div>

                                {/* Controls Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'auto 1fr 1fr 1fr auto',
                                    gap: '20px',
                                    alignItems: 'center'
                                }}>
                                    {/* Play Button */}
                                    <button
                                        onClick={() => togglePlayTrack(track.id)}
                                        className={track.isPlaying ? "mixer-btn-red" : "mixer-btn"}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            fontSize: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        {track.isPlaying ? '⏸️' : '▶️'}
                                    </button>

                                    {/* Volume Control */}
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            color: 'var(--accent)',
                                            fontWeight: 'bold',
                                            fontSize: '12px',
                                            marginBottom: '8px',
                                            textTransform: 'uppercase'
                                        }}>
                                            Volume
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={track.volume}
                                            onChange={(e) => updateTrackVolume(track.id, Number(e.target.value))}
                                            className="mixer-range"
                                            style={{ width: '100%' }}
                                        />
                                        <div style={{
                                            textAlign: 'center',
                                            color: 'var(--color-3)',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            marginTop: '5px'
                                        }}>
                                            {Math.round(track.volume * 100)}%
                                        </div>
                                    </div>

                                    {/* Pan Control */}
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            color: 'var(--accent)',
                                            fontWeight: 'bold',
                                            fontSize: '12px',
                                            marginBottom: '8px',
                                            textTransform: 'uppercase'
                                        }}>
                                            Pan
                                        </label>
                                        <input
                                            type="range"
                                            min="-1"
                                            max="1"
                                            step="0.01"
                                            value={track.pan}
                                            onChange={(e) => updateTrackPan(track.id, Number(e.target.value))}
                                            className="mixer-range"
                                            style={{ width: '100%' }}
                                        />
                                        <div style={{
                                            textAlign: 'center',
                                            color: 'var(--color-3)',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            marginTop: '5px'
                                        }}>
                                            {track.pan < 0 ? `L${Math.abs(Math.round(track.pan * 100))}` :
                                                track.pan > 0 ? `R${Math.round(track.pan * 100)}` : 'CENTER'}
                                        </div>
                                    </div>

                                    {/* Effects */}
                                    <div>
                                        <label style={{
                                            display: 'block',
                                            color: 'var(--accent)',
                                            fontWeight: 'bold',
                                            fontSize: '12px',
                                            marginBottom: '8px',
                                            textTransform: 'uppercase'
                                        }}>
                                            Effect
                                        </label>
                                        <select
                                            value={track.effect}
                                            onChange={(e) => applyEffect(track.id, e.target.value)}
                                            className="mixer-select"
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                fontSize: '14px'
                                            }}
                                        >
                                            <option value="none">None</option>
                                            <option value="reverb">🏛️ Reverb</option>
                                            <option value="delay">🔄 Delay</option>
                                            <option value="distortion">🔥 Distortion</option>
                                            <option value="filter">🎛️ Filter</option>
                                            <option value="chorus">🌊 Chorus</option>
                                            <option value="combo">✨ Combo</option>
                                        </select>
                                    </div>

                                    {/* Mute/Solo */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <button
                                            onClick={() => toggleMute(track.id)}
                                            className={track.mute ? "mixer-btn-red" : "mixer-btn"}
                                            style={{
                                                fontSize: '12px',
                                                padding: '8px 16px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {track.mute ? 'MUTED' : 'MUTE'}
                                        </button>
                                        <button
                                            onClick={() => toggleSolo(track.id)}
                                            className={track.solo ? "mixer-btn-red" : "mixer-btn"}
                                            style={{
                                                fontSize: '12px',
                                                padding: '8px 16px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {track.solo ? 'SOLO' : 'SOLO'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Épico */}
            <div style={{
                marginTop: '50px',
                textAlign: 'center',
                padding: '30px',
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(30, 41, 59, 0.3))',
                borderRadius: '15px',
                border: '1px solid var(--accent)',
                backdropFilter: 'blur(10px)'
            }}>
                <p style={{
                    fontSize: '18px',
                    color: 'var(--accent)',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    margin: 0
                }}>
                    🎛️ ULTIMATE AUDIO MIXER • {tracks.length} TRACKS LOADED • POWERED BY TONE.JS
                </p>
            </div>
        </div>
    );
};
 
// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import WaveSurfer from "wavesurfer.js";
// import { Box, Button, Typography, Slider, Stack, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
// import UploadIcon from "@mui/icons-material/Upload";
// import SendIcon from "@mui/icons-material/Send";
// import "./mixer.css"
// import "../../styles/index.css"
// import * as Tone from "tone";
// import PlayArrowIcon from "@mui/icons-material/PlayArrow";
// import PauseIcon from "@mui/icons-material/Pause";
// import StopIcon from "@mui/icons-material/Stop";
// import MicIcon from "@mui/icons-material/Mic";
// import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
// import EnvelopePlugin from 'wavesurfer.js/dist/plugins/envelope.js';
// import Hover from 'wavesurfer.js/dist/plugins/hover.esm.js'
// import DownloadIcon from '@mui/icons-material/Download';
// import DeleteIcon from '@mui/icons-material/Delete';
// import TuneIcon from '@mui/icons-material/Tune';
// import WavEncoder from "wav-encoder";
// import "../../styles/upload_play.css"

// const currentUser = "Test User";

// export const Mixer = () => {

//     const [projectTags, setProjectTags] = useState("");
//     const [projectDescription, setProjectDescription] = useState("");
//     const [keySignature, setKeySignature] = useState("C");
//     const [timeSignature, setTimeSignature] = useState("4/4");
//     const [bpm, setBpm] = useState(120);
//     const [zoomLevel, setZoomLevel] = useState(0);
//     const [tracks, setTracks] = useState([]);
//     const [modalOpen, setModalOpen] = useState(false);
//     const [newTrackData, setNewTrackData] = useState({ title: "", instrument: "", file: null, });
//     const waveformRefs = useRef({});
//     const wavesurferRefs = useRef({});

//     const [mediaRecorder, setMediaRecorder] = useState(null);
//     const recordedChunksRef = useRef([]);
//     const streamRef = useRef(null);
//     const [players, setPlayers] = useState([]);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [isRecording, setIsRecording] = useState(false);
//     const [micTrackName, setMicTrackName] = useState("Mic Recording");
//     const [micInstrument, setMicInstrument] = useState("Voice");
//     const [micTrackDescription, setMicTrackDescription] = useState("");

//     // 1. Agregar un ref para el MediaRecorder
//     const mediaRecorderRef = useRef(null);


//     const navigate = useNavigate();

//     useEffect(() => {
//         const stored = sessionStorage.getItem("mixerTracks");
//         if (stored) {
//             const parsed = JSON.parse(stored);
//             const loadedPlayers = parsed.map((track) => {
//                 const newTrack = {
//                     id: crypto.randomUUID(),
//                     player: new Tone.Player({ url: track.url }),
//                     title: track.title,
//                     instrument: track.instrument,
//                     volume: track.volume || 1,
//                     pan: 0,
//                     url: track.url,
//                     channel: new Tone.Channel({ volume: Tone.gainToDb(track.volume || 1) }),
//                     panner: new Tone.Panner(0),
//                     reverb: new Tone.Reverb({ decay: 2 }),
//                     delay: new Tone.FeedbackDelay("8n", 0.5),
//                     distortion: new Tone.Distortion(0.4),
//                     effect: "none"
//                 };

//                 // Connect the new track to the audio chain
//                 newTrack.player.connect(newTrack.channel);
//                 newTrack.channel.connect(newTrack.panner);
//                 newTrack.panner.toDestination();

//                 return newTrack;
//             });
//             setPlayers(loadedPlayers);
//         }
//     }, []);

//     useEffect(() => {
//         players.forEach((track) => {
//             if (!wavesurferRefs.current[track.id] && waveformRefs.current[track.id]) {
//                 const ws = WaveSurfer.create({
//                     container: waveformRefs.current[track.id],
//                     url: track.url,
//                     barWidth: 4,
//                     barRadius: 4,
//                     height: 80,
//                     waveColor: "#3BC9DB",
//                     progressColor: "#1098AD",
//                     cursorColor: "#FFF",
//                     plugins: [
//                         RegionsPlugin.create({ dragSelection: false }),
//                         EnvelopePlugin.create({ volume: 0.8 }),
//                         Hover.create({})
//                     ]
//                 });
//                 wavesurferRefs.current[track.id] = ws;
//             }
//         });
//         return () => {
//             Object.values(wavesurferRefs.current).forEach((ws) => ws.destroy());
//             wavesurferRefs.current = {};
//         }
//     }, [players]);

//     const handleStart = async () => {
//         await Tone.start();
//         Tone.Transport.cancel();
//         players.forEach((track) => track.player.sync().start(0));
//         Tone.Transport.start();
//         setIsPlaying(true);
//     };

//     const handlePause = () => {
//         Tone.Transport.pause();
//         setIsPlaying(false);
//     };

//     const handleStop = () => {
//         Tone.Transport.stop();
//         Tone.Transport.cancel();
//         setIsPlaying(false);
//     };

//     const handleVolumeChange = (index, value) => {
//         const newPlayers = [...players];
//         newPlayers[index].volume = value;
//         newPlayers[index].channel.volume.value = Tone.gainToDb(value);
//         setPlayers(newPlayers);
//     };

//     const handlePanChange = (index, value) => {
//         const updatedPlayers = [...players];
//         const track = updatedPlayers[index];
//         if (!track) return;

//         // Update pan value
//         track.pan = value;
//         track.panner.pan.value = value;

//         console.log(`Pan updated for track: ${track.title}, value: ${value}`);

//         setPlayers(updatedPlayers);
//     };

//     const handleEffectChange = (index, effect) => {
//         const updatedPlayers = [...players];
//         const track = updatedPlayers[index];
//         if (!track) return;

//         console.log(`Applying effect: ${effect} to track: ${track.title}`);

//         // Disconnect all effects
//         track.player.disconnect();
//         track.reverb.disconnect();
//         track.delay.disconnect();
//         track.distortion.disconnect();

//         // Connect the selected effect
//         if (effect === "reverb") {
//             track.player.connect(track.reverb);
//             track.reverb.connect(track.channel);
//         } else if (effect === "delay") {
//             track.player.connect(track.delay);
//             track.delay.connect(track.channel);
//         } else if (effect === "distortion") {
//             track.player.connect(track.distortion);
//             track.distortion.connect(track.channel);
//         } else {
//             // Default connection (no effect)
//             track.player.connect(track.channel);
//         }

//         console.log(`Effect applied: ${effect}`);
//         track.effect = effect;
//         setPlayers(updatedPlayers);
//     };


//     const startMicRecording = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//             streamRef.current = stream;
//             const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
//             mediaRecorderRef.current = recorder;
//             recordedChunksRef.current = [];
//             recorder.ondataavailable = (e) => recordedChunksRef.current.push(e.data);
//             recorder.onstop = () => {
//                 const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
//                 const url = URL.createObjectURL(blob);

//                 const newTrack = {
//                     id: crypto.randomUUID(),
//                     player: new Tone.Player({ url }),
//                     title: micTrackName,
//                     instrument: micInstrument,
//                     description: micTrackDescription,
//                     volume: 1,
//                     pan: 0,
//                     url,
//                     channel: new Tone.Channel({ volume: Tone.gainToDb(1) }),
//                     panner: new Tone.Panner(0),
//                     reverb: new Tone.Reverb({ decay: 2 }),
//                     delay: new Tone.FeedbackDelay("8n", 0.5),
//                     distortion: new Tone.Distortion(0.4),
//                     effect: "none"
//                 };


//                 // Conecta el nuevo track a la cadena de audio
//                 newTrack.player.connect(newTrack.channel);
//                 newTrack.channel.connect(newTrack.panner);
//                 newTrack.panner.toDestination();

//                 setPlayers((prev) => [...prev, newTrack]);
//                 setTracks((prev) => [...prev, newTrack]);
//                 alert("Recording added to the mixer!");
//             };
//             recorder.start();
//             setIsRecording(true);
//         } catch (err) {
//             console.error("Mic error:", err);
//         }
//     };

//     const stopMicRecording = () => {
//         if (!streamRef.current || !mediaRecorderRef.current) return;

//         // Detener el MediaRecorder (esto disparará onstop y agregará el track)
//         mediaRecorderRef.current.stop();

//         // Detener el stream
//         streamRef.current.getTracks().forEach((track) => track.stop());
//         streamRef.current = null;
//         setIsRecording(false);
//     };

//     const openModal = () => setModalOpen(true);

//     const closeModal = () => {
//         setModalOpen(false);
//         setNewTrackData({ title: "", instrument: "", file: null });
//     };

//     const handleFileInput = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setNewTrackData((prev) => ({
//                 ...prev,
//                 file,
//             }));
//         }
//     };

//     const handleTrackSubmit = () => {
//         const { file, title, instrument } = newTrackData;
//         if (!file || !title.trim()) {
//             alert("Please provide a file and a title.");
//             return;
//         }

//         const id = crypto.randomUUID();
//         const url = URL.createObjectURL(file);

//         const newTrack = {
//             id,
//             player: new Tone.Player({ url }),
//             title,
//             instrument,
//             volume: 1,
//             pan: 0,
//             url,
//             channel: new Tone.Channel({ volume: Tone.gainToDb(1) }),
//             panner: new Tone.Panner(0),
//             reverb: new Tone.Reverb({ decay: 2 }),
//             delay: new Tone.FeedbackDelay("8n", 0.5),
//             distortion: new Tone.Distortion(0.4),
//             effect: "none"
//         };

//         // Connect the new track to the audio chain
//         newTrack.player.connect(newTrack.channel);
//         newTrack.channel.connect(newTrack.panner);
//         newTrack.panner.toDestination();

//         setTracks((prev) => [...prev, newTrack]);
//         setPlayers((prev) => [...prev, newTrack]);
//         closeModal();
//     };

//     //Opciones de wavesurfer, si quieren toquenlas a ver que sacan
//     useEffect(() => {
//         tracks.forEach((track) => {
//             if (!wavesurferRefs.current[track.id] && waveformRefs.current[track.id]) {
//                 const ws = WaveSurfer.create({
//                     container: waveformRefs.current[track.id],
//                     url: track.url,
//                     autoCenter: true,
//                     autoScroll: true,
//                     minPxPerSec: zoomLevel,
//                     barWidth: 4,
//                     interact: true,
//                     dragToSeek: true,
//                     hideScrollbar: true,
//                     barRadius: 7,
//                     waveColor: ['rgb(13, 202, 240)', 'rgb(0, 255, 191)', 'rgb(0, 255, 136)'],
//                     progressColor: ['rgba(13, 202, 240,0.6)', 'rgba(0, 255, 191,0.6)', 'rgba(0, 255, 136,0.6)'],
//                     normalize: true,
//                     cursorWidth: 6,
//                     cursorColor: 'white',
//                     trackBackground: 'transparent',
//                     trackBorderColor: 'white',
//                     dragBounds: false,
//                     plugins: [
//                         RegionsPlugin.create({
//                             dragSelection: false
//                         }),
//                         EnvelopePlugin.create({
//                             volume: 0.8,
//                             dragLine: true,
//                             lineColor: 'white',
//                             lineWidth: 2,
//                             dragPointSize: 5,
//                             dragPointFill: 'rgb(255, 255, 255)',
//                             points: [
//                                 { time: 1, volume: 0.9 }],
//                         }),
//                         Hover.create({
//                             lineColor: 'white',
//                             lineWidth: 3,
//                             labelBackground: 'rgba(39, 39, 39, 0.8)',
//                             labelColor: 'white',
//                             labelSize: '13px',
//                             labelPreferLeft: false,
//                         })
//                     ],
//                 });
//                 wavesurferRefs.current[track.id] = ws;

//             }
//         });

//         return () => {
//             Object.values(wavesurferRefs.current).forEach((ws) => ws.destroy());
//             wavesurferRefs.current = {};
//         };
//     }, [tracks]);



//     //controles para TODOS LOS TRACKS
//     const handlePlayPauseAll = () => {
//         Object.values(wavesurferRefs.current).forEach((ws) => ws.playPause());
//     };

//     const handleSkipForwardsAll = () => {
//         Object.values(wavesurferRefs.current).forEach((ws) => ws.skip(5));
//     };

//     const handleSkipBackwardsAll = () => {
//         Object.values(wavesurferRefs.current).forEach((ws) => ws.skip(-5));
//     };


//     const handlePlayPause = (id) => {
//         const ws = wavesurferRefs.current[id];
//         if (ws) ws.playPause();
//     };

//     const handleSkipForwards = (id) => {
//         const ws = wavesurferRefs.current[id];
//         if (ws) ws.skip(5);
//     };

//     const handleSkipBackwards = (id) => {
//         const ws = wavesurferRefs.current[id];
//         if (ws) ws.skip(-5);
//     };

//     const handleRemoveTrack = (id) => {
//         if (wavesurferRefs.current[id]) {
//             wavesurferRefs.current[id].destroy();
//             delete wavesurferRefs.current[id];
//         }
//         setTracks((prev) => prev.filter((track) => track.id !== id));
//     };

//     useEffect(() => {
//         Object.values(wavesurferRefs.current).forEach((ws) => {
//             ws.zoom(zoomLevel);
//         });
//     }, [zoomLevel]);

//     const handleZoomChange = (e, value) => {
//         setZoomLevel(value);
//     };


//     const handlePost = () => {
//         console.log({
//             tags: projectTags,
//             description: projectDescription,
//             keySignature,
//             timeSignature,
//             bpm,
//             tracks: tracks.map(({ title, instrument, user, name }) => ({
//                 title, instrument, user, originalFilename: name
//             })
//             )
//         });
//         alert("Publish is WIP");
//     };

//     const handleGoToMixer = () => {
//         const tracksToSave = tracks.map(t => ({
//             url: t.url,
//             title: t.title,
//             instrument: t.instrument,
//             startTime: t.startTime || 0,
//             volume: t.volume || 1,
//         }));
//         sessionStorage.setItem("mixerTracks", JSON.stringify(tracksToSave));
//         navigate("/mixer");
//     };

//     const handleExportMix = async () => {
//         if (tracks.length === 0) {
//             alert("No tracks to download yet");
//             return;
//         }

//         const buffers = [];

//         // Paso 1: Cargar y decodificar cada pista
//         for (const track of tracks) {
//             const response = await fetch(track.url);
//             const arrayBuffer = await response.arrayBuffer();
//             const tempCtx = new AudioContext();
//             const decodedBuffer = await tempCtx.decodeAudioData(arrayBuffer);
//             buffers.push({ buffer: decodedBuffer, startTime: track.startTime || 0, volume: track.volume || 1, });
//             tempCtx.close();
//         }

//         // Paso 2: Calcular duración total
//         const sampleRate = 44100;
//         const endTimes = buffers.map(({ buffer, startTime }) => startTime + buffer.duration);
//         const lengthInSeconds = Math.max(...endTimes);

//         // Paso 3: Crear contexto offline y mezclar
//         const offlineCtx = new OfflineAudioContext(2, sampleRate * lengthInSeconds, sampleRate);

//         buffers.forEach(({ buffer, startTime, volume }) => {
//             const source = offlineCtx.createBufferSource();
//             source.buffer = buffer;

//             const gain = offlineCtx.createGain();
//             gain.gain.value = volume;

//             source.connect(gain).connect(offlineCtx.destination);
//             source.start(startTime);
//         });

//         const renderedBuffer = await offlineCtx.startRendering();

//         // Paso 4: Exportar como WAV
//         const wavData = await WavEncoder.encode({
//             sampleRate: renderedBuffer.sampleRate,
//             channelData: [
//                 renderedBuffer.getChannelData(0),
//                 renderedBuffer.numberOfChannels > 1
//                     ? renderedBuffer.getChannelData(1)
//                     : renderedBuffer.getChannelData(0)
//             ]
//         });

//         const blob = new Blob([wavData], { type: "audio/wav" });
//         const url = URL.createObjectURL(blob);

//         const a = document.createElement("a");
//         a.href = url;
//         a.download = "Mix.wav";
//         a.click();
//     };



//     useEffect(() => {
//         const stored = sessionStorage.getItem("mixerTracks");
//         if (stored) {
//             const parsed = JSON.parse(stored);
//             const loadedPlayers = parsed.map((track) => {
//                 const reverb = new Tone.Reverb({ decay: 2 }).toDestination();
//                 const delay = new Tone.FeedbackDelay("8n", 0.5).toDestination();
//                 const distortion = new Tone.Distortion(0.4).toDestination();
//                 const panner = new Tone.Panner(0).toDestination();

//                 const channel = new Tone.Channel({ volume: Tone.gainToDb(track.volume || 1) }).connect(panner);

//                 const player = new Tone.Player({
//                     url: track.url,
//                     autostart: false,
//                 });

//                 player.connect(channel);

//                 return {
//                     player,
//                     title: track.title,
//                     instrument: track.instrument,
//                     volume: track.volume || 1,
//                     pan: 0,
//                     channel,
//                     panner,
//                     reverb,
//                     delay,
//                     distortion,
//                     effect: "none"
//                 };
//             });
//             setPlayers(loadedPlayers);
//         }
//     }, []);



//     // const stopMicRecording = () => {
//     //     if (!mediaRecorder) return;

//     //     mediaRecorder.onstop = () => {
//     //         const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
//     //         const url = URL.createObjectURL(blob);

//     //         const newTrack = {
//     //             player: new Tone.Player({ url }).toDestination(),
//     //             title: micTrackName,
//     //             instrument: micInstrument,
//     //             volume: 1,
//     //             pan: 0,
//     //             channel: new Tone.Channel({ volume: Tone.gainToDb(1) }).toDestination(),
//     //             panner: new Tone.Panner(0).toDestination(),
//     //             reverb: new Tone.Reverb({ decay: 2 }).toDestination(),
//     //             delay: new Tone.FeedbackDelay("8n", 0.5).toDestination(),
//     //             distortion: new Tone.Distortion(0.4).toDestination(),
//     //             effect: "none"
//     //         };

//     //         newTrack.player.connect(newTrack.channel.connect(newTrack.panner));
//     //         setPlayers(prev => [...prev, newTrack]);
//     //         alert("Grabación finalizada y añadida al mixer.");

//     //         streamRef.current.getTracks().forEach(track => track.stop());
//     //         setIsRecording(false);
//     //     };

//     //     mediaRecorder.stop();
//     // };

//     return (
//         <div className="container-fluid mb-5">
//             <div className="row">
//                 <p className="uppy text-center">Project Maker</p>
//             </div>

//             <div className="row all-info m-2 p-4">
//                 <div className="col-2 buttons d-flex flex-column">
//                     <div className="d-flex justify-content-between">
//                         <div>
//                             <label className="controls-uppy-text text-white">Key</label>
//                             <select className="controls-uppy ps-3" value={keySignature} onChange={e => setKeySignature(e.target.value)}>
//                                 {["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"].map(k => <option key={k} value={k}>{k}</option>)}
//                             </select>
//                         </div>
//                         <div>
//                             <label className="controls-uppy-text text-white">Compass</label>
//                             <select className="controls-uppy ps-3" value={timeSignature} onChange={e => setTimeSignature(e.target.value)}>
//                                 {["4/4", "3/4", "2/4", "6/8", "5/4"].map(ts => <option key={ts} value={ts}>{ts}</option>)}
//                             </select>
//                         </div>
//                     </div>
//                     <div>
//                         <label className="controls-uppy-text text-white">BPM</label>
//                         <input className="controls-uppy ps-3" type="number" value={bpm} onChange={e => setBpm(Number(e.target.value))} min={40} max={240} />
//                     </div>
//                 </div>

//                 <div className="col d-flex flex-column">
//                     <label className="controls-uppy-text text-white fs-5">Details</label>
//                     <div className="text-uppy gap-3 d-flex flex-column">
//                         <div className="top-text-uppy d-flex flex-row justify-content-between gap-3">
//                             <input className="text-uppy-input ps-3" placeholder="Project Name" value={projectTags || ""} onChange={e => setProjectTags(e.target.value)} />
//                             <input className="text-uppy-input ps-3" placeholder="Instruments" value={""} />
//                             <input className="text-uppy-input ps-3" placeholder="Roles" value={""} />
//                             <input className="text-uppy-input ps-3" placeholder="Genre" value={""} />
//                             <input className="text-uppy-input ps-3" placeholder="Visibility" value={""} />
//                             <input className="text-uppy-input ps-3" placeholder="Tags (comma separated)" value={projectTags || ""} onChange={e => setProjectTags(e.target.value)} />
//                         </div>
//                         <textarea className="text-uppy-input ps-3" placeholder="Short Description" rows="4" value={projectDescription || ""} onChange={e => setProjectDescription(e.target.value)} />
//                     </div>
//                 </div>
//             </div>

//             <div className="row m-3">

//                 <div className="col d-flex flex-row gap-3 ps-5">

//                     <button className="btn-uppy d-flex flex-row align-items-center p-2 uptrack" data-bs-toggle="modal" data-bs-target="#UploadModal">
//                         <p className="m-0 flex-row align-items-center"><UploadIcon /> Upload track</p>
//                     </button>

//                     <button className="btn-uppy d-flex flex-row align-items-center p-2 downproj" onClick={handleExportMix}>
//                         <p className="m-0 flex-row align-items-center"> <DownloadIcon /> Download Project</p>
//                     </button>

//                     <button className="btn-uppy d-flex flex-row align-items-center p-2 pubproj" onClick={handlePost}>
//                         <p className="m-0 flex-row align-items-center"> <SendIcon /> Publish Project</p>
//                     </button>

//                     {!isRecording ? (
//                         <Button variant="contained" onClick={startMicRecording} startIcon={<MicIcon />}>Start Mic</Button>
//                     ) : (
//                         <Button variant="outlined" color="error" onClick={stopMicRecording}>Stop Mic</Button>
//                     )}


//                     <button className="btn-uppy d-flex flex-row align-items-center p-2 mixbut" onClick={handleGoToMixer}>
//                         <Link to="/mixer" className="text-decoration-none">
//                             <p className="m-0 flex-row align-items-center text-light" ><TuneIcon /> Mixer</p>
//                         </Link>
//                     </button>

//                     <div className="modal fade" id="UploadModal" tabIndex="-1" aria-labelledby="UploadModalLabel" aria-hidden="true">
//                         <div className="modal-dialog">
//                             <div className="modal-content bg-dark text-white">
//                                 <div className="modal-header d-flex flex-column gap-2 p-4 bg-dark text-white">
//                                     <p className="fs-1 m-0 p-0">Upload New Track</p>
//                                 </div>

//                                 <div className="modal-body d-flex flex-column gap-4 ">
//                                     <input className="text-uppy-input p-3" placeholder="Title" value={newTrackData.title} onChange={(e) => setNewTrackData((prev) => ({ ...prev, title: e.target.value }))} />
//                                     <input className="text-uppy-input p-3" placeholder="Instrument" value={newTrackData.instrument} onChange={(e) => setNewTrackData((prev) => ({ ...prev, instrument: e.target.value, }))} />
//                                     <input className="file-in m-1 p-1" type="file" accept="audio/*" onChange={handleFileInput} />
//                                     <button className="btn-uppy d-flex flex-row align-items-center p-2" onClick={handleTrackSubmit}> Submit </button>
//                                 </div>

//                                 <div className="modal-footer">
//                                     <button className="btn-close-modal" data-bs-dismiss="modal">Close</button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                 </div>

//                 <div className="col">
//                     <p className="magic-uppy">Here's where the magic happens...</p>
//                 </div>

//             </div>

//             <div className="row mx-3">

//                 <div className="col-2 mt-1">

//                     <p className="mix-header text-white text-center">Preview</p>

//                     <div className="d-flex flex-row justify-content-between">

//                         <button className="btn-uppy p-2 seektop" onClick={handleSkipBackwardsAll}>◀◀</button>

//                         <button className="btn-uppy px-5 playtop" onClick={handlePlayPauseAll}>▶</button>

//                         <button className="btn-uppy p-2 seekfortop" onClick={handleSkipForwardsAll}>▶▶</button>

//                     </div>

//                 </div>

//                 <div className="col mt-1 d-flex align-items-end">

//                     <div className="zoom-line">

//                         <label className="text-white fs-4 zoom-txt" htmlFor="zoom-control" >Zoom</label>

//                         <Slider className="zoom-control" id="zoom-control" value={zoomLevel} onChange={handleZoomChange} />

//                     </div>

//                 </div>

//             </div>

//             {tracks.map((track) => (
//                 <div key={track.id} className="row mx-2 py-2 pt-2 px-2 mb-4 mt-3 up-info-box">
//                     <div className="col-1">
//                         <p className="text-white">{track.title}</p>
//                         <p className="text-white"> {track.instrument} </p>
//                         <p className="text-white">Uploaded by: </p>
//                         <p className="text-white">{currentUser}</p>
//                     </div>

//                     <div className="col-2 d-flex flex-column justify-content-center gap-1">

//                         <button className="btn-uppy" onClick={() => handleSkipBackwards(track.id)}>◀◀</button>

//                         <button className="btn-uppy" onClick={() => handlePlayPause(track.id)}>▶</button>

//                         <button className="btn-uppy" onClick={() => handleSkipForwards(track.id)}>▶▶</button>

//                     </div>

//                     <div className="up-container-waves col-8 d-flex align-items-center">
//                         <div ref={(el) => (waveformRefs.current[track.id] = el)} className="wavesurfer-container" />
//                     </div>
//                     <div className="col-1">
//                         <button className="btn-uppy d-flex flex-row align-items-center p-2" onClick={() => handleRemoveTrack(track.id)}><DeleteIcon /></button>
//                     </div>
//                     <Slider
//                         value={track.pan}
//                         min={-1}
//                         max={1}
//                         step={0.01}
//                         onChange={(e, newValue) => handlePanChange(players.findIndex(p => p.id === track.id), newValue)}
//                         sx={{ width: 300 }}
//                     />

//                     <FormControl sx={{ minWidth: 200, mt: 2 }}>
//                         <InputLabel>Effect</InputLabel>
//                         <Select
//                             value={track.effect}
//                             onChange={(e) => handleEffectChange(players.findIndex(p => p.id === track.id), e.target.value)}
//                             label="Effect"
//                         >
//                             <MenuItem value="none">None</MenuItem>
//                             <MenuItem value="reverb">Reverb</MenuItem>
//                             <MenuItem value="delay">Delay</MenuItem>
//                             <MenuItem value="distortion">Distortion</MenuItem>
//                         </Select>
//                     </FormControl>
//                 </div>))}

//         </div>
//     );
// };


