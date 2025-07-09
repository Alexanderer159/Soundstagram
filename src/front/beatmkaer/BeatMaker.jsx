import React, { useState, useEffect, useRef, useCallback } from 'react';
import TrackRow from './TrackRow';
import TransportControls from './TransportControls';
import './MusicLoopMaker.css';

const AUDIO_SAMPLES = {
    kicks: ['kick_01.wav', 'kick_02.wav', 'kick_heavy.wav'],
    snares: ['snare_01.wav', 'snare_02.wav', 'snare_heavy.wav'],
    hihats: ['hihat_closed.wav', 'hihat_open.wav', 'hihat_short.wav'],
    bass: ['bass_01.wav', 'bass_02.wav', 'bass_stab.wav'],
    percussion: ['perc_01.wav', 'perc_02.wav', 'perc_wood.wav'],
    drums: ['clap.wav', 'rim_shot.wav', 'tom.wav'],
};

const TRACKS = [
    { id: 0, name: 'Kick', category: 'kicks', defaultSample: 0 },
    { id: 1, name: 'Snare', category: 'snares', defaultSample: 0 },
    { id: 2, name: 'Hi-Hat', category: 'hihats', defaultSample: 0 },
    { id: 3, name: 'Bass 1', category: 'bass', defaultSample: 0 },
    { id: 4, name: 'Bass 2', category: 'bass', defaultSample: 1 },
    { id: 5, name: 'Perc 1', category: 'percussion', defaultSample: 0 },
    { id: 6, name: 'Perc 2', category: 'percussion', defaultSample: 1 },
    { id: 7, name: 'Clap', category: 'drums', defaultSample: 0 },
    { id: 8, name: 'Rim', category: 'drums', defaultSample: 1 },
    { id: 9, name: 'Tom', category: 'drums', defaultSample: 2 },
    { id: 10, name: 'Kick 2', category: 'kicks', defaultSample: 1 },
    { id: 11, name: 'Snare 2', category: 'snares', defaultSample: 1 },
    { id: 12, name: 'Hi-Hat 2', category: 'hihats', defaultSample: 1 },
    { id: 13, name: 'Bass 3', category: 'bass', defaultSample: 2 },
    { id: 14, name: 'Perc 3', category: 'percussion', defaultSample: 2 },
    { id: 15, name: 'Extra', category: 'kicks', defaultSample: 2 },
];

const useAudioManager = () => {
    const audioContextRef = useRef(null);
    const audioBuffersRef = useRef({});
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const initAudio = async () => {
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                audioContextRef.current = new AudioContextClass();

                const loadPromises = [];

                for (const [category, samples] of Object.entries(AUDIO_SAMPLES)) {
                    for (let i = 0; i < samples.length; i++) {
                        const sample = samples[i];
                        const url = `PUBLIC/sounds/${category}/${sample}`;

                        const promise = fetch(url)
                            .then((res) => res.arrayBuffer())
                            .then((data) => audioContextRef.current.decodeAudioData(data))
                            .then((buffer) => {
                                if (!audioBuffersRef.current[category]) {
                                    audioBuffersRef.current[category] = [];
                                }
                                audioBuffersRef.current[category][i] = buffer;
                            })
                            .catch((err) => console.warn(`Failed to load ${url}`, err));

                        loadPromises.push(promise);
                    }
                }

                await Promise.all(loadPromises);
                setIsLoaded(true);
            } catch (err) {
                console.error('Error initializing audio:', err);
            }
        };

        initAudio();
    }, []);

    const playSound = useCallback((category, sampleIndex, volume = 1) => {
        if (!audioContextRef.current || !audioBuffersRef.current[category]?.[sampleIndex]) return;

        try {
            const source = audioContextRef.current.createBufferSource();
            const gainNode = audioContextRef.current.createGain();

            source.buffer = audioBuffersRef.current[category][sampleIndex];
            gainNode.gain.value = volume;

            source.connect(gainNode);
            gainNode.connect(audioContextRef.current.destination);
            source.start();
        } catch (err) {
            console.error('Playback error:', err);
        }
    }, []);

    return { isLoaded, playSound };
};

const BeatMaker = () => {
    const { isLoaded, playSound } = useAudioManager();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [tempo, setTempo] = useState(120);
    const [pattern, setPattern] = useState({});
    const [trackSamples, setTrackSamples] = useState({});
    const [trackVolumes, setTrackVolumes] = useState({});
    const intervalRef = useRef(null);

    useEffect(() => {
        const samples = {};
        const volumes = {};
        TRACKS.forEach(({ id, defaultSample }) => {
            samples[id] = defaultSample;
            volumes[id] = 0.8;
        });
        setTrackSamples(samples);
        setTrackVolumes(volumes);
    }, []);

    useEffect(() => {
        if (isPlaying) {
            const interval = setInterval(() => {
                setCurrentStep((prev) => {
                    const next = (prev + 1) % 16;

                    TRACKS.forEach(({ id, category, defaultSample }) => {
                        if (pattern[id]?.[next]) {
                            const sample = trackSamples[id] ?? defaultSample;
                            const volume = trackVolumes[id] ?? 0.8;
                            playSound(category, sample, volume);
                        }
                    });

                    return next;
                });
            }, (60 / tempo / 4) * 1000);

            intervalRef.current = interval;
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isPlaying, tempo, pattern, trackSamples, trackVolumes, playSound]);

    const handleStepToggle = (trackId, stepIndex) => {
        setPattern((prev) => ({
            ...prev,
            [trackId]: {
                ...prev[trackId],
                [stepIndex]: !prev[trackId]?.[stepIndex],
            },
        }));
    };

    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-lg text-gray-600">Loading Audio Samples...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-light text-gray-800 mb-2">16-Bit Music Loop Maker</h1>
                <p className="text-sm text-gray-500">Create authentic 16-bit music loops with precision and simplicity</p>
            </header>

            <TransportControls
                isPlaying={isPlaying}
                onPlayPause={() => setIsPlaying((prev) => !prev)}
                onStop={() => {
                    setIsPlaying(false);
                    setCurrentStep(0);
                }}
                tempo={tempo}
                onTempoChange={setTempo}
            />

            <div className="space-y-2">
                {TRACKS.map((track) => (
                    <TrackRow
                        key={track.id}
                        track={track}
                        pattern={pattern}
                        currentStep={currentStep}
                        onStepToggle={handleStepToggle}
                        onSampleChange={(id, index) => setTrackSamples((prev) => ({ ...prev, [id]: index }))}
                        onVolumeChange={(id, volume) => setTrackVolumes((prev) => ({ ...prev, [id]: volume }))}
                        playSound={playSound}
                    />
                ))}
            </div>
        </div>
    );
};

export default BeatMaker;
