import React from "react";
import { Avatar, Button, TextField, Typography, Paper } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";

export const EditProfilePage = () => {
    return (
        <div className="min-h-screen bg-[#0F172A] text-white flex justify-center items-start py-10 px-4">
            <div className="w-full max-w-md bg-[#1F2937] p-8 rounded-2xl shadow-lg">
                <Typography variant="h4" className="text-white text-center mb-8 font-semibold">
                    Edit Profile
                </Typography>

                <div className="flex flex-col items-center gap-4 mb-8 relative">
                    <Avatar
                        src="/avatars/usuaria_luna.png"
                        alt="Profile"
                        sx={{ width: 100, height: 100 }}
                    />
                    <Button
                        variant="contained"
                        className="!absolute bottom-0 right-[calc(50%-10px)] translate-x-1/2 bg-[#4DE7F3] text-black hover:bg-[#3ad9e2] min-w-0 p-2 rounded-full"
                    >
                        <CameraAltIcon fontSize="small" />
                    </Button>
                </div>

                <form className="flex flex-col gap-6">
                    <div>
                        <Typography className="text-[#94A3B8] text-sm mb-1">Full name</Typography>
                        <TextField
                            variant="outlined"
                            fullWidth
                            defaultValue="Ana Johnson"
                            InputProps={{ style: { color: "#4DE7F3" } }}
                            className="bg-[#0F172A] rounded-md"
                        />
                    </div>

                    <div>
                        <Typography className="text-[#94A3B8] text-sm mb-1">Bio</Typography>
                        <TextField
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={3}
                            defaultValue="Music enthusiast and guitarist"
                            InputProps={{ style: { color: "#4DE7F3" } }}
                            className="bg-[#0F172A] rounded-md"
                        />
                    </div>

                    <Button
                        variant="contained"
                        className="bg-[#4DE7F3] text-black hover:bg-[#3ad9e2] font-semibold text-md py-2 rounded-md"
                    >
                        Save Changes
                    </Button>
                </form>
            </div>
        </div>
    );
}
