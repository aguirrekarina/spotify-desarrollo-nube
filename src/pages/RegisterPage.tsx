import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Link, Alert, Divider, Stack } from '@mui/material';
import { Google } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(email, password, displayName);
            navigate('/');
        } catch (err) {
            setError('Error al registrar usuario: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setError('');
        setGoogleLoading(true);

        try {
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError('Error al registrarse con Google: ' + (err as Error).message);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Registrarse
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Stack spacing={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            size="large"
                            startIcon={<Google />}
                            onClick={handleGoogleRegister}
                            disabled={googleLoading || loading}
                            sx={{
                                py: 1.5,
                                borderColor: '#55db37',
                                color: '#55db37',
                                '&:hover': {
                                    borderColor: '#26a61c',
                                    backgroundColor: '#fef7f7'
                                }
                            }}
                        >
                            {googleLoading ? 'Registrando con Google...' : 'Registrarse con Google'}
                        </Button>
                        <Divider>
                            <Typography variant="body2" color="text.secondary">
                                o
                            </Typography>
                        </Divider>

                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Nombre"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Contraseña"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                margin="normal"
                                required
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading || googleLoading}
                                sx={{ mt: 3, mb: 2 }}
                            >
                                {loading ? 'Registrando...' : 'Registrarse'}
                            </Button>
                        </form>
                    </Stack>

                    <Box textAlign="center" sx={{ mt: 2 }}>
                        <Link component={RouterLink} to="/login">
                            ¿Ya tienes cuenta? Inicia sesión
                        </Link>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default RegisterPage;