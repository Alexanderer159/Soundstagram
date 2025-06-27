import React from "react";
import { Avatar, Button, TextField, Typography, Paper } from "@mui/material";

export const EditProfilePage = () => {
    return (
        <div className="min-h-screen bg-[#1F3438] text-[#C0C1C2] flex justify-center items-start py-10 px-4">
            <Paper className="w-full max-w-xl p-8 rounded-2xl bg-[#2C474C]">
                <Typography variant="h5" className="mb-6 text-center">
                    Editar perfil
                </Typography>

                <div className="flex flex-col items-center gap-4 mb-8">
                    <Avatar
                        src="/avatars/usuaria_luna.png"
                        alt="Foto de perfil"
                        sx={{ width: 100, height: 100 }}
                    />
                    <Button variant="outlined" className="text-[#C0C1C2] border-[#4F686D]">
                        Cambiar foto de perfil
                    </Button>
                </div>

                <form className="flex flex-col gap-6">
                    <TextField
                        label="Nombre completo"
                        defaultValue="Luna Vox"
                        variant="outlined"
                        fullWidth
                        className="bg-white rounded-md"
                    />

                    <TextField
                        label="Bio"
                        defaultValue="Cantante y compositora de soul/chill."
                        multiline
                        rows={4}
                        variant="outlined"
                        fullWidth
                        className="bg-white rounded-md"
                    />

                    <Button
                        variant="contained"
                        className="bg-[#37555B] hover:bg-[#4F686D] text-white py-3 rounded-md"
                        fullWidth
                    >
                        Guardar cambios
                    </Button>
                </form>
            </Paper>
        </div>
    );
}
