import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box, Container, IconButton, Menu, MenuItem } from '@mui/material';
import { AccountCircle, AdminPanelSettings, Home, ExitToApp } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
        handleClose();
    };

    const handleGoToAdmin = () => {
        navigate('/admin');
        handleClose();
    };

    const handleGoHome = () => {
        navigate('/');
        handleClose();
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="home"
                        onClick={handleGoHome}
                        sx={{ mr: 2 }}
                    >
                        <Home />
                    </IconButton>

                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Spotify Clone
                    </Typography>

                    {user && (
                        <Box display="flex" alignItems="center">
                            <Typography variant="body1" sx={{ mr: 2 }}>
                                {user.displayName}
                            </Typography>

                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                color="inherit"
                            >
                                <AccountCircle />
                            </IconButton>

                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={handleGoHome}>
                                    <Home sx={{ mr: 1 }} />
                                    Inicio
                                </MenuItem>

                                {user.role === 'admin' && (
                                    <MenuItem onClick={handleGoToAdmin}>
                                        <AdminPanelSettings sx={{ mr: 1 }} />
                                        Admin
                                    </MenuItem>
                                )}

                                <MenuItem onClick={handleLogout}>
                                    <ExitToApp sx={{ mr: 1 }} />
                                    Cerrar Sesión
                                </MenuItem>
                            </Menu>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {children}
            </Container>
        </Box>
    );
};

export default Layout;