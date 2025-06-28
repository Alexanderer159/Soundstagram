import React from "react";
import { Typography, Paper, Chip, Avatar, IconButton } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";

const mockProjects = [
    {
        id: 1,
        title: "Lo-Fi Chill Collab",
        author: "Luna Vox",
        avatar: "/avatars/usuaria_luna.png",
        genre: ["lofi", "chill", "ambient"],
        waveform: "/waves/vocals.svg"
    },
    {
        id: 2,
        title: "Funky Sunset Jam",
        author: "Leo Strings",
        avatar: "/avatars/usuario_leo.png",
        genre: ["funk", "groove"],
        waveform: "/waves/guitar.svg"
    }
];

export const ExploreProjectsPage = () => {
    return (
        <div className="min-h-screen bg-[#1F3438] text-[#C0C1C2] px-10 py-10">
            <Typography variant="h4" className="mb-6">
                Explorar proyectos por estilo
            </Typography>

            <div className="flex flex-wrap gap-4 mb-8">
                {["lofi", "funk", "rock", "chill", "ambient", "jazz"].map((tag) => (
                    <Chip
                        key={tag}
                        label={`#${tag}`}
                        className="bg-[#37555B] text-[#C0C1C2] hover:cursor-pointer"
                    />
                ))}
            </div>

            <div className="flex flex-col gap-6">
                {mockProjects.map((project) => (
                    <Paper key={project.id} className="p-6 rounded-2xl bg-[#2C474C]">
                        <div className="flex items-center gap-4 mb-4">
                            <Avatar src={project.avatar} alt={project.author} />
                            <div>
                                <Typography variant="subtitle1">{project.author}</Typography>
                                <Typography className="text-sm text-[#A3AAAB]">{project.title}</Typography>
                            </div>
                        </div>

                        <img
                            src={project.waveform}
                            alt="waveform"
                            className="w-full h-20 object-contain mb-4"
                        />

                        <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                                <IconButton className="text-[#C0C1C2] hover:text-white">
                                    <PlayArrowIcon />
                                </IconButton>
                                <IconButton className="text-[#C0C1C2] hover:text-pink-400">
                                    <FavoriteBorderIcon />
                                </IconButton>
                            </div>

                            <div className="flex gap-2 text-sm text-[#A3AAAB]">
                                {project.genre.map((tag, i) => (
                                    <span key={i} className="bg-[#37555B] px-2 py-1 rounded-full">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Paper>
                ))}
            </div>
        </div>
    );
}
