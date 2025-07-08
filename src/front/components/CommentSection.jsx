// src/front/components/CommentSection.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box, TextField, Button, Typography, Stack, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001"; // ajusta si usas .env

const CommentSection = ({ projectId, currentUser }) => {
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState("");

    const fetchComments = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/comments/${projectId}`);
            setComments(res.data);
        } catch (err) {
            console.error("Error al cargar comentarios", err);
        }
    };

    const handleAddComment = async () => {
        if (!content.trim()) return;
        try {
            await axios.post(`${API_URL}/api/comments`, {
                user_id: currentUser.id,
                project_id: projectId,
                content: content.trim()
            });
            setContent("");
            fetchComments();
        } catch (err) {
            console.error("Error al enviar comentario", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_URL}/api/comments/${id}`);
            fetchComments();
        } catch (err) {
            console.error("Error al borrar comentario", err);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [projectId]);

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Comentarios</Typography>
            <Stack spacing={2} mt={2}>
                {comments.map(comment => (
                    <Box key={comment.id} sx={{ borderBottom: "1px solid #ccc", pb: 1 }}>
                        <Typography variant="subtitle2">
                            {comment.user?.username || "Usuario"} — {new Date(comment.created_at).toLocaleString()}
                        </Typography>
                        <Typography variant="body1">{comment.content}</Typography>
                        {currentUser?.id === comment.user_id && (
                            <IconButton onClick={() => handleDelete(comment.id)} size="small">
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                ))}
            </Stack>
            {currentUser && (
                <Box mt={2}>
                    <TextField
                        label="Escribe un comentario..."
                        multiline
                        rows={2}
                        fullWidth
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <Button variant="contained" onClick={handleAddComment} sx={{ mt: 1 }}>
                        Comentar
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default CommentSection;
