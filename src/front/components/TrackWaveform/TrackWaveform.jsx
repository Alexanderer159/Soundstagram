import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions";
import EnvelopePlugin from "wavesurfer.js/dist/plugins/envelope";
import Hover from "wavesurfer.js/dist/plugins/hover";
import { FaCirclePlay, FaCirclePause, FaCircleStop } from "react-icons/fa6";
import './TrackWaveform.css'

const TrackWaveform = ({ track, zoomLevel = 0, onInit }) => {
    const containerRef = useRef(null);
    const waveSurferRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null)

    useEffect(() => {
        // Asegúrate de que el track y su URL están definidos y que el contenedor existe
        if (!track?.file_url || !containerRef.current) return;

        // Destruye instancia anterior si existe
        if (waveSurferRef.current) {
            waveSurferRef.current.destroy();
            waveSurferRef.current = null;
        }

        // Crea nueva instancia
        const ws = WaveSurfer.create({
            container: containerRef.current,
            autoCenter: true,
            autoScroll: true,
            minPxPerSec: zoomLevel,
            barWidth: 4,
            interact: true,
            dragToSeek: true,
            hideScrollbar: true,
            barRadius: 3,
            waveColor: ['rgb(13, 202, 240)', 'rgb(0, 255, 191)', 'rgb(0, 255, 136)'],
            progressColor: ['rgba(13, 202, 240,0.6)', 'rgba(0, 255, 191,0.6)', 'rgba(0, 255, 136,0.6)'],
            cursorColor: "white",
            cursorWidth: 4,
            responsive: true,
            normalize: true,
            backend: "mediaelement",
            media: audioRef.current,
            plugins: [
                RegionsPlugin.create(),
                Hover.create({
                    lineColor: 'white',
                    lineWidth: 3,
                    labelBackground: 'rgba(39, 39, 39, 0.8)',
                    labelColor: 'white',
                    labelSize: '13px',
                    labelPreferLeft: false,
                }),
            ]
        })


        waveSurferRef.current = ws;

        // 🔁 Escuchar evento "ready" para confirmar que se cargó bien
        ws.once("ready", () => {
            const duration = ws.getDuration();
            const envelope = EnvelopePlugin.create({
                volume: 0.8,
                dragLine: true,
                lineColor: 'white',
                lineWidth: 2,
                dragPointSize: 5,
                dragPointFill: 'white',
                points: [
                    { time: 1, volume: 0.8 },
                    { time: 25, volume: 0.6 },
                    { time: duration / 2, volume: 0.2 },
                    { time: 68.2, volume: 0.5 },
                    { time: duration - 2, volume: 0.2 },
                ],
            });
            ws.registerPlugin(envelope);
            console.log(`✅ Audio ${track.track_name} cargado correctamente`);
            if (onInit) onInit(track.id, ws);
        });

        // 🔴 Escuchar errores (opcional)
        ws.on("error", (err) => {
            console.error(`❌ WaveSurfer error con ${track.track_name}:`, err);
        });

        // ✅ Cargar la pista desde la URL
        ws.load(track.file_url);

        return () => {
            ws.destroy();
        };
    }, [track?.file_url]);

    useEffect(() => {
        if (waveSurferRef.current && zoomLevel) {
            waveSurferRef.current.zoom(zoomLevel);
        }
    }, [zoomLevel]);

    const handlePlayPause = () => {
        if (waveSurferRef.current) {
            waveSurferRef.current.playPause();
            setIsPlaying(prev => !prev);
        }
    };

    const handleStop = () => {
        if (waveSurferRef.current) {
            waveSurferRef.current.stop();
            setIsPlaying(false);
        }
    };

    return (
        <>
            <div className="d-flex flex-column gap-4 justify-content-center align-items-center">
                <div onClick={handlePlayPause} >
                    {isPlaying ? <FaCirclePause size={'35px'} className="controller-btn" /> : <FaCirclePlay size={'35px'} className="controller-btn" />}
                </div>
                <FaCircleStop onClick={handleStop} size={'35px'} className="controller-btn" />
            </div>
            <div ref={containerRef} className="wavesurfer-container p-2" />
            <audio ref={audioRef} src={track.file_url} preload="auto" controls style={{ display: "none" }} />
        </>
    )
};

export default TrackWaveform;