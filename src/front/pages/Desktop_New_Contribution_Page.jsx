import React from "react";
import { Typography, Paper, Button, IconButton, Avatar } from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";

export const NewContributionPage = () => {
    return (
        <div className="min-h-screen bg-[#1F3438] text-[#C0C1C2] px-12 py-10">
            <Typography variant="h4" className="mb-4">
                Nueva colaboración sobre pista original
            </Typography>

            <Paper className="bg-[#2C474C] rounded-2xl p-6 mb-6">
                <Typography variant="h6" className="mb-2">
                    Pista original
                </Typography>
                <div className="flex items-center gap-4 mb-4">
                    <Avatar src="/avatars/javi.png" alt="Javi Beats" />
                    <div>
                        <Typography variant="subtitle1">Javi Beats - Guitar Loop #1 🎸</Typography>
                        <Typography className="text-sm text-[#A3AAAB]">Rock & Roll</Typography>
                    </div>
                </div>
                <img src="/waves/guitar.svg" alt="waveform original" className="w-full h-20 object-contain mb-4" />
                <Button variant="outlined" startIcon={<PlayArrowIcon />} className="text-white border-white">
                    Reproducir pista original
                </Button>
            </Paper>

            <Paper className="bg-[#2C474C] rounded-2xl p-6">
                <Typography variant="h6" className="mb-4">
                    Graba tu contribución
                </Typography>
                <div className="flex items-center justify-center gap-6">
                    <IconButton className="bg-[#37555B] text-white hover:bg-[#4F686D] w-16 h-16">
                        <MicIcon fontSize="large" />
                    </IconButton>
                    <IconButton className="bg-red-600 text-white hover:bg-red-700 w-16 h-16">
                        <StopIcon fontSize="large" />
                    </IconButton>
                </div>
                <Typography className="text-sm text-center mt-4">Presiona para grabar tu voz o instrumento</Typography>
            </Paper>
        </div>
    );
}
