import React from 'react';
import './MusicLoopMaker.css';

const TransportControls = ({ isPlaying, onPlayPause, onStop, tempo, onTempoChange }) => {
    const playPauseClass = `control-button ${isPlaying ? 'active' : ''}`;

    return (
        <div className="flex items-center justify-center gap-4 mb-8 p-6 bg-gray-50 rounded-lg">
            <button className={playPauseClass} onClick={onPlayPause}>
                {isPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>

            <button className="control-button" onClick={onStop}>
                ⏹️ Stop
            </button>

            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-600">Tempo:</label>
                <input
                    type="range"
                    min="60"
                    max="180"
                    value={tempo}
                    onChange={(e) => onTempoChange(parseInt(e.target.value, 10))}
                    className="w-24"
                />
                <span className="text-sm font-mono text-gray-700 w-12">{tempo}</span>
            </div>
        </div>
    );
};

export default TransportControls;
