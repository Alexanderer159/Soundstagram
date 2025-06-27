import { Button, TextField, Typography, Container, Box, Paper } from "@mui/material";
import { Link } from "react-router-dom";

export const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-[#1F3438] flex items-center justify-center">
      <Container maxWidth="sm">
        <Paper elevation={4} className="p-8 rounded-2xl shadow-lg bg-[#2C474C]">
          <Typography variant="h4" className="text-[#C0C1C2] mb-6 text-center">
            Crear cuenta en Soundstagram
          </Typography>

          <Box className="flex flex-col gap-4">
            <TextField 
              label="Nombre completo" 
              variant="outlined" 
              fullWidth 
              className="bg-white rounded-md"
            />
            <TextField 
              label="Email" 
              variant="outlined" 
              fullWidth 
              className="bg-white rounded-md"
            />
            <TextField 
              label="Contraseña" 
              type="password" 
              variant="outlined" 
              fullWidth 
              className="bg-white rounded-md"
            />
            <TextField 
              label="Confirmar contraseña" 
              type="password" 
              variant="outlined" 
              fullWidth 
              className="bg-white rounded-md"
            />

            <Button 
              variant="contained" 
              fullWidth 
              className="bg-[#37555B] hover:bg-[#4F686D] text-white py-3 rounded-md">
              Registrarse
            </Button>

            <Typography className="text-center text-[#A3AAAB] mt-4">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#C0C1C2] hover:underline">
                Inicia sesión
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </div>
  );
}
