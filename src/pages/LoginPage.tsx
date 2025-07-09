import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Box, Link, Alert, Divider, Stack } from '@mui/material';
import { Google } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Error al iniciar sesión: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        setGoogleLoading(true);

        try {
            await loginWithGoogle();
            navigate('/');
        } catch (err) {
            setError('Error al iniciar sesión con Google: ' + (err as Error).message);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, mb: 4 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Spotify Clone
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Stack spacing={3}>
                        <Button
                            fullWidth
                            variant="outlined"
                            size="large"
                            startIcon={<Google />}
                            onClick={handleGoogleLogin}
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
                            {googleLoading ? 'Iniciando con Google...' : 'Continuar con Google'}
                        </Button>
                        <Divider>
                            <Typography variant="body2" color="text.secondary">
                                o
                            </Typography>
                        </Divider>
                        <form onSubmit={handleSubmit}>
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
                                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                            </Button>
                        </form>
                    </Stack>

                    <Box textAlign="center" sx={{ mt: 2 }}>
                        <Link component={RouterLink} to="/register">
                            ¿No tienes cuenta? Regístrate
                        </Link>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default LoginPage;