import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import GenresPage from '../pages/GenresPage';
import ArtistsPage from '../pages/ArtistsPage';
import SongsPage from '../pages/SongsPage';
import AdminPage from '../pages/AdminPage';
import Layout from '../components/Layout';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return user ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return user && user.role === 'admin' ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Router>
            <Routes>
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
                <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />

                <Route path="/" element={
                    <PrivateRoute>
                        <Layout>
                            <GenresPage />
                        </Layout>
                    </PrivateRoute>
                } />

                <Route path="/genre/:genreId" element={
                    <PrivateRoute>
                        <Layout>
                            <ArtistsPage />
                        </Layout>
                    </PrivateRoute>
                } />

                <Route path="/artist/:artistId" element={
                    <PrivateRoute>
                        <Layout>
                            <SongsPage />
                        </Layout>
                    </PrivateRoute>
                } />

                <Route path="/admin" element={
                    <AdminRoute>
                        <Layout>
                            <AdminPage />
                        </Layout>
                    </AdminRoute>
                } />
            </Routes>
        </Router>
    );
};

export default AppRoutes;