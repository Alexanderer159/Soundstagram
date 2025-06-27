import React from "react";
import { Typography, Paper, Avatar, Divider } from "@mui/material";

const mockNotifications = [
    {
        id: 1,
        type: "like",
        user: "Luna Vox",
        avatar: "/avatars/usuaria_luna.png",
        message: "le ha dado like a tu colaboración vocal",
        time: "hace 2h"
    },
    {
        id: 2,
        type: "comment",
        user: "Javi Beats",
        avatar: "/avatars/usuario_javi.png",
        message: "comentó: '🔥 brutal ese groove!'",
        time: "hace 5h"
    },
    {
        id: 3,
        type: "follow",
        user: "Leo Strings",
        avatar: "/avatars/usuario_leo.png",
        message: "ha comenzado a seguirte",
        time: "ayer"
    }
];

export const NotificationsPage = () => {
    return (
        <div className="min-h-screen bg-[#1F3438] text-[#C0C1C2] px-12 py-10">
            <Typography variant="h4" className="mb-6">
                Notificaciones
            </Typography>

            <div className="flex flex-col gap-4">
                {mockNotifications.map((notif) => (
                    <Paper key={notif.id} className="p-4 rounded-xl bg-[#2C474C] flex items-center gap-4">
                        <Avatar src={notif.avatar} alt={notif.user} />
                        <div className="flex flex-col">
                            <Typography className="text-sm">
                                <strong>{notif.user}</strong> {notif.message}
                            </Typography>
                            <Typography className="text-xs text-[#859193] mt-1">{notif.time}</Typography>
                        </div>
                    </Paper>
                ))}
            </div>

            <Divider className="mt-10 bg-[#4F686D]" />
        </div>
    );
}
