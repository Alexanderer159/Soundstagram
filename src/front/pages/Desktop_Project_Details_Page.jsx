import React from "react";
import { Avatar, IconButton, Typography, Paper, Chip, Divider } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";

const mockProject = {
    title: "Funky Sunset Jam",
    createdAt: "2025-06-25",
    contributors: [
        { name: "Javi Beats", avatar: "/avatars/usuario_javi.png", instrument: "🥁", waveform: "/waves/drums.svg" },
        { name: "Luna Vox", avatar: "/avatars/usuaria_luna.png", instrument: "🎤", waveform: "/waves/vocals.svg" },
        { name: "Leo Strings", avatar: "/avatars/usuario_leo.png", instrument: "🎸", waveform: "/waves/guitar.svg" }
    ],
    genreTags: ["funk", "sunset", "collab"]
};

export const ProjectDetailPage = () => {
    return (
        <div className="min-h-screen bg-[#1F3438] text-[#C0C1C2] px-12 py-8">
            <Typography variant="h4" className="mb-2">
                {mockProject.title}
            </Typography>
            <Typography className="text-sm text-[#859193] mb-4">
                Subido el {mockProject.createdAt}
            </Typography>

            <div className="flex gap-2 mb-6">
                {mockProject.genreTags.map((tag, i) => (
                    <Chip key={i} label={`#${tag}`} className="bg-[#37555B] text-[#C0C1C2]" />
                ))}
            </div>

            <Divider className="bg-[#65787C] mb-6" />

            <div className="flex flex-col gap-6">
                {mockProject.contributors.map((track, i) => (
                    <Paper key={i} className="p-6 rounded-2xl bg-[#2C474C]">
                        <div className="flex items-center gap-4 mb-3">
                            <Avatar src={track.avatar} alt={track.name} />
                            <div>
                                <Typography variant="subtitle1">{track.name}</Typography>
                                <Typography className="text-sm text-[#A3AAAB]">
                                    Instrumento: {track.instrument}
                                </Typography>
                            </div>
                        </div>
                        <img src={track.waveform} alt="waveform" className="w-full h-20 object-contain mb-4" />
                        <div className="flex gap-2">
                            <IconButton className="text-[#C0C1C2] hover:text-white">
                                <PlayArrowIcon />
                            </IconButton>
                            <IconButton className="text-[#C0C1C2] hover:text-[#859193]">
                                <VolumeUpIcon />
                            </IconButton>
                        </div>
                    </Paper>
                ))}
            </div>
        </div>
    );
}
