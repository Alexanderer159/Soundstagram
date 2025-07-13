import React, { useState } from 'react';
import StepButton from './StepButton';
import './MusicLoopMaker.css';

const AUDIO_SAMPLES = {
    kicks: ['kick_01.wav', 'kick_02.wav', 'kick_heavy.wav'],
    snares: ['snare_01.wav', 'snare_02.wav', 'snare_heavy.wav'],
    hihats: ['hihat_closed.wav', 'hihat_open.wav', 'hihat_short.wav'],
    bass: ['bass_01.wav', 'bass_02.wav', 'bass_stab.wav'],
    percussion: ['perc_01.wav', 'perc_02.wav', 'perc_wood.wav'],
    drums: ['clap.wav', 'rim_shot.wav', 'tom.wav'],
};

const TrackRow = ({
    track,
    pattern,
    currentStep,
    onStepToggle,
    onSampleChange,
    onVolumeChange,
    playSound,
}) => {
    const [selectedSample, setSelectedSample] = useState(track.defaultSample);
    const [volume, setVolume] = useState(0.8);

    const handleSampleChange = (sampleIndex) => {
        setSelectedSample(sampleIndex);
        onSampleChange(track.id, sampleIndex);
        playSound(track.category, sampleIndex, volume);
    };

    const handleVolumeChange = (newVolume) => {
        setVolume(newVolume);
        onVolumeChange(track.id, newVolume);
    };

    return (
        <div className="track-row">
            <div className="track-label">{track.name}</div>

            <select
                className="sample-selector"
                value={selectedSample}
                onChange={(e) => handleSampleChange(parseInt(e.target.value, 10))}
            >
                {AUDIO_SAMPLES[track.category].map((sample, index) => (
                    <option key={sample} value={index}>
                        {sample.replace('.wav', '').replace('_', ' ')}
                    </option>
                ))}
            </select>

            <input
                type="range"
                className="volume-slider"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            />

            <div className="sequencer-grid">
                {Array.from({ length: 16 }, (_, stepIndex) => (
                    <StepButton
                        key={stepIndex}
                        active={pattern[track.id]?.[stepIndex] || false}
                        playing={currentStep === stepIndex}
                        onClick={() => onStepToggle(track.id, stepIndex)}
                    />
                ))}
            </div>
        </div>
    );
};

export default TrackRow;
