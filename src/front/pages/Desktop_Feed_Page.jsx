import React from "react";
import { Avatar, IconButton, Typography, Paper } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

const mockPosts = [
  {
    id: 1,
    user: "Javi Beats",
    avatar: "/avatars/usuario_javi.png",
    instrument: "🎸",
    title: "Guitar Loop #1",
    genre: "Rock & Roll",
    tags: ["rock", "loop", "electric"],
    waveform: "/waves/wave1.svg"
  },
  {
    id: 2,
    user: "Luna Vox",
    avatar: "/avatars/usuaria_luna.png",
    instrument: "🎤",
    title: "Vocal Idea",
    genre: "Chill Out",
    tags: ["chill", "vocals"],
    waveform: "/waves/wave2.svg"
  }
];

export const FeedPage = () => {
  return (
    <div className="min-h-screen bg-[#1F3438] text-[#C0C1C2] px-10 py-6">
      <Typography variant="h4" className="mb-6">
        Explora colaboraciones recientes
      </Typography>

      <div className="flex flex-col gap-6">
        {mockPosts.map((post) => (
          <Paper key={post.id} elevation={3} className="p-6 rounded-2xl bg-[#2C474C]">
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={post.avatar} alt={post.user} />
              <div>
                <Typography variant="h6">{post.user}</Typography>
                <Typography className="text-sm text-[#A3AAAB]">
                  {post.genre} • {post.instrument}
                </Typography>
              </div>
            </div>

            <Typography variant="subtitle1" className="mb-2">
              {post.title}
            </Typography>

            <img src={post.waveform} alt="waveform" className="w-full h-20 object-contain mb-3" />

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <IconButton className="text-[#C0C1C2] hover:text-white">
                  <PlayArrowIcon />
                </IconButton>
                <IconButton className="text-[#C0C1C2] hover:text-pink-400">
                  <FavoriteIcon />
                </IconButton>
                <IconButton className="text-[#C0C1C2] hover:text-[#A3AAAB]">
                  <ChatBubbleOutlineIcon />
                </IconButton>
              </div>
              <div className="flex gap-2 text-sm text-[#A3AAAB]">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-[#37555B] px-2 py-1 rounded-full"
                  >
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
