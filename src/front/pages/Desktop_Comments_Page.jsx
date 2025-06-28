import React from "react";
import { Avatar, IconButton, Typography, TextField, Button } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ReplyIcon from "@mui/icons-material/Reply";
import SendIcon from "@mui/icons-material/Send";

const comments = [
    {
        user: "Michael Brown",
        avatar: "/avatars/usuario_leo.png",
        message: "Love the smooth groove! A saxophone solo could add an interesting touch.",
        time: "2 days ago",
        likes: 5,
        shares: 2
    },
    {
        user: "Emily Carter",
        avatar: "/avatars/usuaria_luna.png",
        message: "@SophiaLee The keyboard layers are fantastic! 🔥 They add so much depth to the track.",
        time: "5 days ago",
        likes: 12,
        shares: 7
    },
    {
        user: "Javi Gonzales",
        avatar: "/avatars/usuario_javi.png",
        message: "The bassline is really groovy! It fits perfectly with the melody. 🎶",
        time: "1 week ago",
        likes: 9,
        shares: 0
    }
];

export const CommentsPage = () => {
    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-6 max-w-2xl mx-auto">
            <div className="text-[#4DE7F3] flex items-center gap-2 mb-4">
                <span className="text-2xl font-semibold">💬 COMMENTS</span>
            </div>

            <div className="space-y-6">
                {comments.map((c, i) => (
                    <div key={i} className="bg-[#1F2937] p-4 rounded-xl">
                        <div className="flex items-start gap-4">
                            <Avatar src={c.avatar} alt={c.user} sx={{ width: 48, height: 48 }} />
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <Typography className="text-[#4DE7F3] font-medium">{c.user}</Typography>
                                    <Typography className="text-sm text-[#94A3B8]">{c.time}</Typography>
                                </div>
                                <Typography className="text-white mt-1 leading-snug">{c.message}</Typography>
                                <div className="flex gap-4 mt-2 text-[#CBD5E1] text-sm items-center">
                                    <span className="flex items-center gap-1">
                                        <FavoriteBorderIcon fontSize="small" /> {c.likes}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <ReplyIcon fontSize="small" /> {c.shares}
                                    </span>
                                    <button className="text-[#4DE7F3] hover:underline ml-4">Reply</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-[#1F2937] mt-8 p-4 rounded-xl flex items-center">
                <TextField
                    fullWidth
                    placeholder="Add a comment..."
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    className="bg-transparent text-white placeholder-[#94A3B8]"
                />
                <IconButton className="text-[#4DE7F3] ml-2">
                    <SendIcon />
                </IconButton>
            </div>
        </div>
    );
}
