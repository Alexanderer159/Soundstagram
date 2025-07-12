import React, { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import { uploadTrackToCloudinary } from '../../services/cloudinaryService';
import { useParams } from 'react-router-dom';

export const Mixer = () => {
    const { projectId } = useParams();
    const [tracks, setTracks] = useState([]);
    const [isGlobalPlaying, setIsGlobalPlaying] = useState(false);
    const [masterVolume, setMasterVolume] = useState(0.8);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [projectName, setProjectName] = useState("Epic Mix Project");
    const [bpm, setBpm] = useState(128);
    const [isInitialized, setIsInitialized] = useState(false);
    const [loadingTracks, setLoadingTracks] = useState([]);
    const [mixUrl, setMixUrl] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

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

            // Verificar duración del audio
            let duration = 0;
            if (player.buffer) {
                duration = player.buffer.duration;
                console.log(`📏 ${title} - Duración detectada: ${duration}s`);
            } else {
                console.warn(`⚠️ ${title} - No se pudo detectar duración`);
            }

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
                duration: duration,
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

            console.log(`🎵 Track created: ${title} - Duración: ${duration}s - Tamaño: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
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
                console.log(`🎛️ Applying ${effectType} to ${track.title}...`);

                // Desconectar todo completamente
                track.player.disconnect();
                track.reverb.disconnect();
                track.delay.disconnect();
                track.distortion.disconnect();
                track.filter.disconnect();
                track.chorus.disconnect();
                track.channel.disconnect();

                // Reconectar según efecto usando connect() individual
                switch (effectType) {
                    case "reverb":
                        track.player.connect(track.reverb);
                        track.reverb.connect(track.channel);
                        track.channel.connect(masterDestination.current);
                        console.log(`✅ Reverb connected: player → reverb → channel → master`);
                        break;
                    case "delay":
                        track.player.connect(track.delay);
                        track.delay.connect(track.channel);
                        track.channel.connect(masterDestination.current);
                        console.log(`✅ Delay connected: player → delay → channel → master`);
                        break;
                    case "distortion":
                        track.player.connect(track.distortion);
                        track.distortion.connect(track.channel);
                        track.channel.connect(masterDestination.current);
                        console.log(`✅ Distortion connected: player → distortion → channel → master`);
                        break;
                    case "filter":
                        track.player.connect(track.filter);
                        track.filter.connect(track.channel);
                        track.channel.connect(masterDestination.current);
                        console.log(`✅ Filter connected: player → filter → channel → master`);
                        break;
                    case "chorus":
                        track.player.connect(track.chorus);
                        track.chorus.connect(track.channel);
                        track.channel.connect(masterDestination.current);
                        console.log(`✅ Chorus connected: player → chorus → channel → master`);
                        break;
                    case "combo":
                        track.player.connect(track.distortion);
                        track.distortion.connect(track.delay);
                        track.delay.connect(track.reverb);
                        track.reverb.connect(track.channel);
                        track.channel.connect(masterDestination.current);
                        console.log(`✅ Combo connected: player → distortion → delay → reverb → channel → master`);
                        break;
                    default:
                        track.player.connect(track.channel);
                        track.channel.connect(masterDestination.current);
                        console.log(`✅ Clean connected: player → channel → master`);
                        break;
                }

                console.log(`🎛️ Successfully applied ${effectType} to ${track.title}`);
                return { ...track, effect: effectType };
            } catch (error) {
                console.error(`❌ Error applying ${effectType} to ${track.title}:`, error);
                // En caso de error, reconectar sin efectos
                try {
                    track.player.connect(track.channel);
                    track.channel.connect(masterDestination.current);
                } catch (reconnectError) {
                    console.error("❌ Failed to reconnect track:", reconnectError);
                }
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
                    sampleRate: 44100,
                    channelCount: 2
                }
            });

            streamRef.current = stream;

            // Configuración optimizada para grabaciones largas (3+ minutos)
            const recorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 128000 // 128kbps para mejor calidad
            });

            mediaRecorderRef.current = recorder;
            recordedChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    recordedChunksRef.current.push(e.data);
                    console.log(`📦 Chunk recibido: ${e.data.size} bytes`);
                }
            };

            recorder.onstop = async () => {
                console.log(`🎙️ Grabación terminada. Total chunks: ${recordedChunksRef.current.length}`);

                // Verificar el tamaño total de todos los chunks
                const totalSize = recordedChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0);
                console.log(`📊 Tamaño total de chunks: ${totalSize} bytes (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);

                const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
                const file = new File([blob], `Recording_${Date.now()}.webm`, { type: 'audio/webm' });

                console.log(`📁 Archivo de grabación creado: ${file.size} bytes (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

                // Intentar obtener la duración del archivo
                try {
                    const audioContext = new AudioContext();
                    const arrayBuffer = await file.arrayBuffer();
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                    console.log(`⏱️ Duración detectada del archivo grabado: ${audioBuffer.duration}s`);
                    audioContext.close();
                } catch (error) {
                    console.warn(`⚠️ No se pudo detectar la duración del archivo:`, error);
                }

                try {
                    const track = await createAudioTrack(file, `Recording ${tracks.length + 1}`, "Microphone");
                    setTracks(prev => [...prev, track]);
                    console.log("🎙️ Recording added successfully!");
                } catch (error) {
                    console.error("Failed to process recording:", error);
                    alert("❌ Failed to process recording");
                }
            };

            // Iniciar grabación sin parámetros para capturar toda la duración
            recorder.start();
            setIsRecording(true);
            console.log("🎙️ Grabación iniciada - capturando duración completa");
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

    const calculateRecordingSize = (durationSeconds) => {
        // Estimación: 128kbps = ~16KB por segundo
        const bytesPerSecond = 16000;
        const estimatedBytes = durationSeconds * bytesPerSecond;
        const estimatedMB = estimatedBytes / 1024 / 1024;
        return estimatedMB.toFixed(2);
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

    // Función para convertir audio a AudioBuffer válido
    const getValidAudioBuffer = async (track) => {
        try {
            // Si ya tenemos un buffer válido, usarlo
            if (track.player.buffer && track.player.buffer instanceof AudioBuffer) {
                console.log(`📏 Usando buffer existente para ${track.title}: ${track.player.buffer.duration}s`);
                return track.player.buffer;
            }

            // Si no, intentar crear uno desde la URL
            if (track.url) {
                console.log(`🔄 Decodificando audio desde URL para ${track.title}...`);
                const response = await fetch(track.url);
                const arrayBuffer = await response.arrayBuffer();
                const audioContext = new AudioContext();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                audioContext.close();

                console.log(`✅ Audio decodificado para ${track.title}: ${audioBuffer.duration}s`);
                return audioBuffer;
            }

            throw new Error("No se puede obtener AudioBuffer válido");
        } catch (error) {
            console.error(`❌ Error obteniendo AudioBuffer para ${track.title}:`, error);
            throw error;
        }
    };

    // Función para aplicar efectos durante la exportación
    const applyEffectToOfflineContext = (offlineCtx, source, track) => {
        let lastNode = source;

        // Aplicar efectos según el tipo
        switch (track.effect) {
            case "reverb":
                const reverb = offlineCtx.createConvolver();
                // Crear impulso de reverb simple
                const reverbLength = offlineCtx.sampleRate * 2; // 2 segundos de reverb
                const reverbBuffer = offlineCtx.createBuffer(2, reverbLength, offlineCtx.sampleRate);
                for (let channel = 0; channel < 2; channel++) {
                    const channelData = reverbBuffer.getChannelData(channel);
                    for (let i = 0; i < reverbLength; i++) {
                        channelData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (offlineCtx.sampleRate * 0.5));
                    }
                }
                reverb.buffer = reverbBuffer;

                const reverbGain = offlineCtx.createGain();
                reverbGain.gain.value = 0.3; // Wet level

                lastNode.connect(reverb);
                reverb.connect(reverbGain);
                reverbGain.connect(offlineCtx.destination);
                break;

            case "delay":
                const delay = offlineCtx.createDelay(2.0);
                delay.delayTime.value = 0.5; // 500ms delay

                const delayGain = offlineCtx.createGain();
                delayGain.gain.value = 0.5; // Feedback level

                const delayOutput = offlineCtx.createGain();
                delayOutput.gain.value = 0.3; // Wet level

                lastNode.connect(delay);
                delay.connect(delayGain);
                delayGain.connect(delay);
                delay.connect(delayOutput);
                delayOutput.connect(offlineCtx.destination);
                break;

            case "distortion":
                const distortion = offlineCtx.createWaveShaper();
                const curve = new Float32Array(44100);
                for (let i = 0; i < 44100; i++) {
                    const x = (i * 2) / 44100 - 1;
                    curve[i] = (Math.PI + x) * Math.tan(Math.PI * x) / (Math.PI + x * x);
                }
                distortion.curve = curve;
                distortion.oversample = '4x';

                const distortionGain = offlineCtx.createGain();
                distortionGain.gain.value = 0.3; // Wet level

                lastNode.connect(distortion);
                distortion.connect(distortionGain);
                distortionGain.connect(offlineCtx.destination);
                break;

            case "filter":
                const filter = offlineCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 1000;
                filter.Q.value = 1;

                lastNode.connect(filter);
                filter.connect(offlineCtx.destination);
                break;

            case "chorus":
                const chorus = offlineCtx.createDelay(0.1);
                chorus.delayTime.value = 0.02;

                const lfo = offlineCtx.createOscillator();
                lfo.frequency.value = 2;
                const lfoGain = offlineCtx.createGain();
                lfoGain.gain.value = 0.01;

                lfo.connect(lfoGain);
                lfoGain.connect(chorus.delayTime);
                lfo.start();

                const chorusGain = offlineCtx.createGain();
                chorusGain.gain.value = 0.3; // Wet level

                lastNode.connect(chorus);
                chorus.connect(chorusGain);
                chorusGain.connect(offlineCtx.destination);
                break;

            case "combo":
                // Combinación de efectos: distortion + delay + reverb
                const comboDistortion = offlineCtx.createWaveShaper();
                const comboCurve = new Float32Array(44100);
                for (let i = 0; i < 44100; i++) {
                    const x = (i * 2) / 44100 - 1;
                    comboCurve[i] = (Math.PI + x) * Math.tan(Math.PI * x) / (Math.PI + x * x);
                }
                comboDistortion.curve = comboCurve;
                comboDistortion.oversample = '4x';

                const comboDelay = offlineCtx.createDelay(2.0);
                comboDelay.delayTime.value = 0.3;

                const comboDelayGain = offlineCtx.createGain();
                comboDelayGain.gain.value = 0.4;

                const comboReverb = offlineCtx.createConvolver();
                const comboReverbLength = offlineCtx.sampleRate * 1.5;
                const comboReverbBuffer = offlineCtx.createBuffer(2, comboReverbLength, offlineCtx.sampleRate);
                for (let channel = 0; channel < 2; channel++) {
                    const channelData = comboReverbBuffer.getChannelData(channel);
                    for (let i = 0; i < comboReverbLength; i++) {
                        channelData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (offlineCtx.sampleRate * 0.3));
                    }
                }
                comboReverb.buffer = comboReverbBuffer;

                const comboGain = offlineCtx.createGain();
                comboGain.gain.value = 0.2; // Wet level

                lastNode.connect(comboDistortion);
                comboDistortion.connect(comboDelay);
                comboDelay.connect(comboDelayGain);
                comboDelayGain.connect(comboDelay);
                comboDelay.connect(comboReverb);
                comboReverb.connect(comboGain);
                comboGain.connect(offlineCtx.destination);
                break;

            default:
                // Sin efectos, conectar directamente
                lastNode.connect(offlineCtx.destination);
                break;
        }
    };

    // Función para exportar la duración completa garantizada
    const exportFullDuration = async () => {
        if (tracks.length === 0) {
            alert("❌ No hay tracks para mezclar");
            return;
        }

        setIsExporting(true);
        try {
            await initializeAudio();

            // Verificar que todos los tracks estén cargados
            const loadedTracks = tracks.filter(track => {
                if (!track.player) {
                    console.warn(`Track ${track.title} no tiene player`);
                    return false;
                }
                return true;
            });

            if (loadedTracks.length === 0) {
                throw new Error("No hay tracks cargados para exportar");
            }

            console.log(`🎵 Exportando duración completa: ${loadedTracks.length} tracks...`);
            loadedTracks.forEach((track, index) => {
                console.log(`  ${index + 1}. ${track.title} - Duración: ${track.duration}s - Efecto: ${track.effect} - Volumen: ${track.volume}`);
            });

            // Validar que todos los tracks tengan duración válida
            const validTracks = loadedTracks.filter(track => {
                if (!track.duration || track.duration <= 0) {
                    console.warn(`⚠️ Track ${track.title} no tiene duración válida: ${track.duration}`);
                    return false;
                }
                return true;
            });

            if (validTracks.length === 0) {
                throw new Error("No hay tracks con duración válida para exportar");
            }

            console.log(`✅ ${validTracks.length} tracks válidos para exportar`);

            // Crear contexto offline para renderizar la mezcla
            const sampleRate = 44100;
            const maxDuration = Math.max(...validTracks.map(t => t.duration || 0));
            console.log(`📏 Duración máxima de la mezcla: ${maxDuration}s`);

            // Asegurar que tenemos al menos 1 segundo de duración
            const finalDuration = Math.max(maxDuration, 1);
            console.log(`📏 Duración final del contexto: ${finalDuration}s`);

            const offlineCtx = new OfflineAudioContext(2, sampleRate * finalDuration, sampleRate);

            // Procesar cada track con sus efectos
            for (const track of validTracks) {
                try {
                    console.log(`🎛️ Procesando track: ${track.title} con efecto: ${track.effect}`);

                    // Obtener AudioBuffer válido
                    const audioBuffer = await getValidAudioBuffer(track);

                    if (!audioBuffer || audioBuffer.length === 0) {
                        console.warn(`⚠️ Saltando track ${track.title} - buffer inválido`);
                        continue;
                    }

                    console.log(`✅ Buffer válido para ${track.title}: ${audioBuffer.duration}s`);

                    const source = offlineCtx.createBufferSource();
                    source.buffer = audioBuffer;

                    // Aplicar volumen y pan
                    const gainNode = offlineCtx.createGain();
                    gainNode.gain.value = track.volume * masterVolume;
                    source.connect(gainNode);

                    const pannerNode = offlineCtx.createStereoPanner();
                    pannerNode.pan.value = track.pan;
                    gainNode.connect(pannerNode);

                    // Aplicar efectos según el tipo seleccionado
                    applyEffectToOfflineContext(offlineCtx, pannerNode, track);

                    // Iniciar el source en el tiempo 0 para que se reproduzca completo
                    source.start(0);
                    console.log(`✅ Track ${track.title} procesado exitosamente - Efecto: ${track.effect} - Volumen: ${track.volume * masterVolume} - Duración: ${audioBuffer.duration}s`);

                } catch (trackError) {
                    console.error(`❌ Error procesando track ${track.title}:`, trackError);
                }
            }

            console.log("🎵 Renderizando mezcla con efectos...");
            // Renderizar la mezcla
            const renderedBuffer = await offlineCtx.startRendering();
            console.log(`✅ Mezcla renderizada con efectos - Duración: ${renderedBuffer.duration}s`);

            // Verificar que la duración sea correcta
            if (renderedBuffer.duration < finalDuration * 0.9) {
                console.warn(`⚠️ La duración renderizada (${renderedBuffer.duration}s) es menor que la esperada (${finalDuration}s)`);
            } else {
                console.log(`✅ Duración del archivo final correcta: ${renderedBuffer.duration}s`);
            }

            console.log("🎵 Codificando WebM con efectos...");

            // Convertir a WebM usando MediaRecorder con configuración optimizada
            const audioContext = new AudioContext();
            const source = audioContext.createBufferSource();
            source.buffer = renderedBuffer;
            const destination = audioContext.createMediaStreamDestination();
            source.connect(destination);

            const mediaRecorder = new MediaRecorder(destination.stream, {
                mimeType: 'audio/webm;codecs=opus',
                audioBitsPerSecond: 128000 // 128kbps para mejor calidad
            });

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                    console.log(`📦 Chunk WebM recibido: ${e.data.size} bytes`);
                }
            };

            mediaRecorder.onstop = async () => {
                const webmBlob = new Blob(chunks, { type: 'audio/webm' });
                console.log(`📁 Archivo WebM completo creado: ${webmBlob.size} bytes (${(webmBlob.size / 1024 / 1024).toFixed(2)} MB)`);
                console.log(`⏱️ Duración final: ${renderedBuffer.duration}s`);

                console.log("☁️ Subiendo a Cloudinary...");
                // Subir a Cloudinary
                const file = new File([webmBlob], `${projectName}_Mix.webm`, { type: 'audio/webm' });
                const cloudinaryUrl = await uploadTrackToCloudinary(file);

                console.log("💾 Guardando en backend...");
                // Guardar en backend
                await fetch('/api/projects/save-mix', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        projectId,
                        mixUrl: cloudinaryUrl,
                        projectName,
                        bpm,
                        trackCount: validTracks.length
                    }),
                });

                setMixUrl(cloudinaryUrl);
                console.log("✅ Export de duración completa con efectos completado y guardado");
                alert("✅ Mezcla exportada y guardada exitosamente con efectos aplicados!");

                audioContext.close();
            };

            source.start(0);
            mediaRecorder.start();

            // Detener después de la duración completa con margen
            const stopTime = (renderedBuffer.duration + 1) * 1000; // +1 segundo de margen
            console.log(`⏱️ Programando parada en: ${stopTime}ms para duración completa`);

            setTimeout(() => {
                console.log("🛑 Deteniendo MediaRecorder para duración completa...");
                mediaRecorder.stop();
                source.stop();
            }, stopTime);

        } catch (error) {
            console.error("❌ Error en export de duración completa:", error);
            alert("❌ Error en export de duración completa: " + error.message);
        } finally {
            setIsExporting(false);
        }
    };

    // Función para codificar audio como WAV (mantenida por compatibilidad pero no usada)
    const encodeWAV = async (audioBuffer) => {
        const sampleRate = audioBuffer.sampleRate;
        const length = audioBuffer.length;
        const numberOfChannels = audioBuffer.numberOfChannels;

        const buffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
        const view = new DataView(buffer);

        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * numberOfChannels * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * numberOfChannels * 2, true);

        // Audio data
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }

        return new Uint8Array(buffer);
    };

    // Función para descargar la mezcla
    const downloadMix = async () => {
        if (!mixUrl) {
            alert("❌ No hay mezcla guardada para descargar");
            return;
        }

        try {
            console.log("📥 Iniciando descarga de mezcla...");
            console.log("🔗 URL:", mixUrl);

            const response = await fetch(mixUrl);
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const blob = await response.blob();
            console.log(`📁 Archivo descargado: ${blob.size} bytes (${(blob.size / 1024 / 1024).toFixed(2)} MB)`);

            // Verificar la duración del archivo descargado
            try {
                const audioContext = new AudioContext();
                const arrayBuffer = await blob.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                console.log(`⏱️ Duración del archivo descargado: ${audioBuffer.duration}s`);
                audioContext.close();

                if (audioBuffer.duration < 10) {
                    console.warn("⚠️ El archivo descargado parece ser muy corto!");
                }
            } catch (error) {
                console.warn("⚠️ No se pudo verificar la duración del archivo descargado:", error);
            }

            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${projectName}_Mix.webm`;
            a.click();
            URL.revokeObjectURL(url);

            console.log("✅ Descarga completada");
        } catch (error) {
            console.error("❌ Error downloading mix:", error);
            alert("❌ Error al descargar la mezcla: " + error.message);
        }
    };

    // Función para exportar directamente (sin Cloudinary)
    const directExport = async () => {
        if (tracks.length === 0) {
            alert("❌ No hay tracks para mezclar");
            return;
        }

        try {
            await initializeAudio();

            // Verificar que todos los tracks estén cargados
            const loadedTracks = tracks.filter(track => {
                if (!track.player) {
                    console.warn(`Track ${track.title} no tiene player`);
                    return false;
                }
                return true;
            });

            if (loadedTracks.length === 0) {
                throw new Error("No hay tracks cargados para exportar");
            }

            console.log(`🎵 Exportando ${loadedTracks.length} tracks directamente...`);
            loadedTracks.forEach((track, index) => {
                console.log(`  ${index + 1}. ${track.title} - Duración: ${track.duration}s - Efecto: ${track.effect} - Volumen: ${track.volume}`);
            });

            // Validar que todos los tracks tengan duración válida
            const validTracks = loadedTracks.filter(track => {
                if (!track.duration || track.duration <= 0) {
                    console.warn(`⚠️ Track ${track.title} no tiene duración válida: ${track.duration}`);
                    return false;
                }
                return true;
            });

            if (validTracks.length === 0) {
                throw new Error("No hay tracks con duración válida para exportar");
            }

            console.log(`✅ ${validTracks.length} tracks válidos para exportar`);

            // Crear contexto offline para renderizar la mezcla
            const sampleRate = 44100;
            const maxDuration = Math.max(...validTracks.map(t => t.duration || 0));
            console.log(`📏 Duración máxima de la mezcla: ${maxDuration}s`);

            // Asegurar que tenemos al menos 1 segundo de duración
            const finalDuration = Math.max(maxDuration, 1);
            console.log(`📏 Duración final del contexto: ${finalDuration}s`);

            const offlineCtx = new OfflineAudioContext(2, sampleRate * finalDuration, sampleRate);

            // Procesar cada track con sus efectos
            for (const track of validTracks) {
                try {
                    console.log(`🎛️ Procesando track: ${track.title} con efecto: ${track.effect}`);

                    // Obtener AudioBuffer válido
                    const audioBuffer = await getValidAudioBuffer(track);

                    if (!audioBuffer || audioBuffer.length === 0) {
                        console.warn(`⚠️ Saltando track ${track.title} - buffer inválido`);
                        continue;
                    }

                    console.log(`✅ Buffer válido para ${track.title}: ${audioBuffer.duration}s`);

                    const source = offlineCtx.createBufferSource();
                    source.buffer = audioBuffer;

                    // Aplicar volumen y pan
                    const gainNode = offlineCtx.createGain();
                    gainNode.gain.value = track.volume * masterVolume;
                    source.connect(gainNode);

                    const pannerNode = offlineCtx.createStereoPanner();
                    pannerNode.pan.value = track.pan;
                    gainNode.connect(pannerNode);

                    // Aplicar efectos según el tipo seleccionado
                    applyEffectToOfflineContext(offlineCtx, pannerNode, track);

                    // Iniciar el source en el tiempo 0 para que se reproduzca completo
                    source.start(0);
                    console.log(`✅ Track ${track.title} procesado exitosamente - Efecto: ${track.effect} - Volumen: ${track.volume * masterVolume} - Duración: ${audioBuffer.duration}s`);

                } catch (trackError) {
                    console.error(`❌ Error procesando track ${track.title}:`, trackError);
                }
            }

            console.log("🎵 Renderizando mezcla con efectos...");
            // Renderizar la mezcla
            const renderedBuffer = await offlineCtx.startRendering();
            console.log(`✅ Mezcla renderizada con efectos - Duración: ${renderedBuffer.duration}s`);

            // Verificar que la duración sea correcta
            if (renderedBuffer.duration < finalDuration * 0.9) {
                console.warn(`⚠️ La duración renderizada (${renderedBuffer.duration}s) es menor que la esperada (${finalDuration}s)`);
            } else {
                console.log(`✅ Duración del archivo final correcta: ${renderedBuffer.duration}s`);
            }

            console.log("🎵 Codificando WebM con efectos...");

            // Convertir a WebM usando MediaRecorder
            const audioContext = new AudioContext();
            const source = audioContext.createBufferSource();
            source.buffer = renderedBuffer;
            const destination = audioContext.createMediaStreamDestination();
            source.connect(destination);

            const mediaRecorder = new MediaRecorder(destination.stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            const chunks = [];
            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                    console.log(`📦 Chunk WebM recibido: ${e.data.size} bytes`);
                }
            };

            mediaRecorder.onstop = async () => {
                const webmBlob = new Blob(chunks, { type: 'audio/webm' });
                console.log(`📁 Archivo WebM creado: ${webmBlob.size} bytes (${(webmBlob.size / 1024 / 1024).toFixed(2)} MB)`);

                // Descargar directamente sin subir a Cloudinary
                const url = URL.createObjectURL(webmBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${projectName}_Direct_Mix.webm`;
                a.click();
                URL.revokeObjectURL(url);

                console.log("✅ Export directo completado - archivo descargado localmente");
                alert("✅ Export directo completado - revisa el archivo descargado");

                audioContext.close();
            };

            source.start(0);
            mediaRecorder.start();

            // Detener después de la duración completa
            setTimeout(() => {
                mediaRecorder.stop();
                source.stop();
            }, renderedBuffer.duration * 1000);

        } catch (error) {
            console.error("❌ Error en export directo:", error);
            alert("❌ Error en export directo: " + error.message);
        }
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

                {/* Export Controls */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '20px',
                    marginBottom: '20px',
                    flexWrap: 'wrap'
                }}>
                    <button
                        onClick={exportFullDuration}
                        disabled={isExporting || tracks.length === 0}
                        className="mixer-btn"
                        style={{
                            padding: '15px 30px',
                            fontSize: '16px',
                            opacity: isExporting || tracks.length === 0 ? 0.5 : 1,
                            cursor: isExporting || tracks.length === 0 ? 'not-allowed' : 'pointer',
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(147, 51, 234, 0.2))',
                            borderColor: '#a855f7'
                        }}
                    >
                        {isExporting ? '🔄 EXPORTING...' : '💾 EXPORT & SAVE MIX (Full Duration)'}
                    </button>

                    {mixUrl && (
                        <button
                            onClick={downloadMix}
                            className="mixer-btn"
                            style={{
                                padding: '15px 30px',
                                fontSize: '16px'
                            }}
                        >
                            📥 DOWNLOAD MIX
                        </button>
                    )}
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
                    {mixUrl && (
                        <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                            ✅ MIX SAVED
                        </span>
                    )}
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
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
                                gap: '5px',
                                minWidth: '120px'
                            }}
                        >
                            <div>🔴 REC</div>
                            <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                                {formatTime(recordingTime)}
                            </div>
                            <div style={{ fontSize: '10px', opacity: 0.8 }}>
                                ~{calculateRecordingSize(recordingTime)} MB
                            </div>
                        </button>
                    )}

                    {/* Recording Info */}
                    <div style={{
                        fontSize: '10px',
                        color: 'var(--accent)',
                        textAlign: 'center',
                        opacity: 0.8,
                        maxWidth: '100px'
                    }}>
                        {!isRecording ? 'Optimized for 3+ min' : 'Recording...'}
                    </div>
                </div>

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
                                    </div>
                                </div>

                                {/* Waveform */}
                                <div style={{ marginBottom: '20px' }}>
                                    <WaveformVisualizer track={track} />
                                </div>

                                {/* Controls Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr auto',
                                    gap: '20px',
                                    alignItems: 'center'
                                }}>
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

                                    {/* Remove Button */}
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


