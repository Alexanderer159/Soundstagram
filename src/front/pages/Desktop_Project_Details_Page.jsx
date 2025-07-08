import React from "react";
import { Typography, Avatar, IconButton, Paper, Button, InputBase } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { CommentsPage } from "./Desktop_Comments_Page";
import "../styles/index.css"
import { Loader } from "../components/Loader.jsx"
import CommentSection from "../components/CommentSection";


const mockProject = {
    title: "Electric Groove Remix",
    description: "A high-energy electronic remix featuring lush synth leads, rhythmic keyboard patterns, and groovy basslines.",
    createdAt: "3 days ago",
    owner: {
        name: "Alex Mitchell",
        avatar: "/avatars/usuario_javi.png"
    },
    tags: ["synthwave", "dance", "uplifting"],
    tracks: [
        { name: "Guitar", user: "Emily Carter", avatar: "/avatars/usuaria_luna.png", waveform: "/waves/guitar.svg", date: "2 days ago" },
        { name: "Keyboard", user: "Sophia Lee", avatar: "/avatars/usuario_javi.png", waveform: "/waves/drums.svg", date: "3 days ago" },
        { name: "Bass", user: "Michael Brown", avatar: "/avatars/usuario_leo.png", waveform: "/waves/vocals.svg", date: "5 days ago" }
    ],
    comments: [
        { comment: "aweesome", user: "Emily Carter", avatar: "/avatars/usuaria_luna.png", waveform: "/waves/guitar.svg", date: "2 days ago" },
        { comment: "good", user: "Sophia Lee", avatar: "/avatars/usuario_javi.png", waveform: "/waves/drums.svg", date: "3 days ago" },
        { comment: "Bass", user: "Michael Brown", avatar: "/avatars/usuario_leo.png", waveform: "/waves/vocals.svg", date: "5 days ago" }
    ]
};

export const ProjectDetailPage = () => {
    return (
        <div className="min-h-screen bg-dark-custom text-white px-8 py-10">
            <div className="max-w-5xl bg-dark-custom mx-auto grid md:grid-cols-3 gap-10">

                <div className="md:col-span-1 space-y-4">
                    <Typography variant="h5" className="text-white font-semibold">
                        {mockProject.title}
                    </Typography>
                    <Typography className="text-[#94A3B8] text-sm">{mockProject.createdAt}</Typography>

                    <div className="flex items-center gap-3 mt-4">
                        <Avatar src={mockProject.owner.avatar} alt={mockProject.owner.name} />
                        <div>
                            <Typography className="text-sm text-white">{mockProject.owner.name}</Typography>
                            <Typography className="text-xs text-[#94A3B8]">Owner</Typography>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                        {mockProject.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-[#1F2937] text-[#4DE7F3] rounded-full text-xs font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <Typography className="mt-6 text-sm text-[#CBD5E1] leading-snug">
                        {mockProject.description}
                    </Typography>
                </div>

                {/* Main content */}
                <div className="md:col-span-2 space-y-6 bg-dark-custom">
                    <div className="bg-[#1F2937] p-6 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <IconButton className="bg-[#4DE7F3] text-black hover:bg-[#3ad9e2]">
                                    <PlayArrowIcon />
                                </IconButton>
                                <Typography className="text-white font-medium">1:00 / 3:45</Typography>
                            </div>
                            <Button variant="outlined" className="text-[#4DE7F3] border-[#4DE7F3] hover:bg-[#1e40af22]">
                                Export Mix
                            </Button>
                        </div>
                    </div>

                    {mockProject.tracks.map((track, index) => (
                        <Paper key={index}
                            sx={{
                                backgroundColor: "rgb(33, 37, 41)",
                                padding: "1rem",
                                borderRadius: "12px",
                            }}
                            className="bg-dark-custom p-4 rounded-xl">
                            <div className="flex items-center justify-between bg-dark-custom">
                                <div className="flex items-center gap-3 bg-dark-custom">
                                    <Avatar src={track.avatar} alt={track.user} />
                                    <div>
                                        <Typography className="text-white text-sm font-medium">{track.name}</Typography>
                                        <Typography className="text-xs text-[#94A3B8]">{track.user}</Typography>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-[#1e293b]">
                                    <IconButton className="text-[#4DE7F3]">
                                        <PlayArrowIcon />
                                    </IconButton>
                                    <div className="bg-[#1e293b] rounded-md p-1">
                                        <Loader />
                                    </div>
                                    <Typography className="text-xs text-[#94A3B8]">{track.date}</Typography>
                                    <Button size="small" className="text-[#4DE7F3] hover:underline text-xs">View details</Button>
                                </div>
                            </div>
                        </Paper>
                    ))}

                    <div className="bg-[#1F2937] p-6 rounded-xl space-y-4">
                        <Typography className="text-[#4DE7F3] font-semibold text-lg">Comments</Typography>
                        <>
                            <CommentSection projectId={project.id} currentUser={store.user} />
                        </>
                    </div>
                    <Button className="bg-[#1F2937] text-[#4DE7F3] border border-[#4DE7F3] hover:bg-[#1e293b] w-full py-2 rounded-md mt-4">
                        + Add Track
                    </Button>
                </div>
            </div>
        </div>
    );
}
