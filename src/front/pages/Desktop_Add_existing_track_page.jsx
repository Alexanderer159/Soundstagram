import React from "react";
import { Typography, Paper, Button, IconButton, Avatar } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ZoomInMapIcon from "@mui/icons-material/ZoomInMap";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";

export const AddExistingTrackPage = () => {
  return (
    <div className="min-h-screen bg-[#1F3438] text-[#C0C1C2] px-12 py-10">
      <Typography variant="h4" className="mb-4">
        Subir pista desde dispositivo
      </Typography>

      <Paper className="bg-[#2C474C] rounded-2xl p-6 mb-6">
        <Typography variant="h6" className="mb-2">
          Pista original
        </Typography>
        <div className="flex items-center gap-4 mb-4">
          <Avatar src="/avatars/usuario_leo.png" alt="Leo Strings" />
          <div>
            <Typography variant="subtitle1">Leo Strings - Funky Bassline 🎸</Typography>
            <Typography className="text-sm text-[#A3AAAB]">Funk</Typography>
          </div>
        </div>
        <img src="/waves/bass.svg" alt="waveform original" className="w-full h-20 object-contain mb-4" />
        <Button variant="outlined" className="text-white border-white">
          Reproducir pista original
        </Button>
      </Paper>

      <Paper className="bg-[#2C474C] rounded-2xl p-6">
        <Typography variant="h6" className="mb-4">
          Añadir tu pista existente
        </Typography>

        <div className="flex flex-col gap-4 items-center">
          <Button
            variant="contained"
            component="label"
            className="bg-[#37555B] hover:bg-[#4F686D] text-white"
            startIcon={<UploadFileIcon />}
          >
            Seleccionar archivo
            <input type="file" hidden />
          </Button>

          <img
            src="/waves/placeholder.svg"
            alt="waveform nueva pista"
            className="w-full max-w-3xl h-20 object-contain border border-[#65787C] rounded-md"
          />

          <div className="flex gap-4">
            <IconButton className="text-white">
              <ZoomInMapIcon />
            </IconButton>
            <IconButton className="text-white">
              <ZoomOutMapIcon />
            </IconButton>
          </div>

          <Typography className="text-sm text-center text-[#A3AAAB]">
            Puedes arrastrar la onda para alinear manualmente o usar la IA
          </Typography>
        </div>
      </Paper>
    </div>
  );
}
