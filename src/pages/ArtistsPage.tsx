import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Box, CircularProgress, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import type { Artist } from '../types';
import { ArtistRepository } from '../repositories/ArtistRepository';

const ArtistsPage: React.FC = () => {
    const { genreId } = useParams<{ genreId: string }>();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const artistRepository = new ArtistRepository();

    useEffect(() => {
        const fetchArtists = async () => {
            if (!genreId) return;

            try {
                const data = await artistRepository.getByGenre(genreId);
                setArtists(data);
            } catch (error) {
                console.error('Error fetching artists:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArtists();
    }, [genreId]);

    const handleArtistClick = (artistId: string) => {
        navigate(`/artist/${artistId}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/')}
                    sx={{ mr: 2 }}
                >
                    Volver a Géneros
                </Button>
                <Typography variant="h4" component="h1">
                    Artistas
                </Typography>
            </Box>

            <Box display="flex" flexWrap="wrap" gap={3}>
                {artists.map((artist) => (
                    <Box
                        key={artist.id}
                        width={{ xs: '100%', sm: '48%', md: '31%', lg: '23%' }}
                        onClick={() => handleArtistClick(artist.id)}
                        sx={{
                            cursor: 'pointer',
                            '&:hover': { transform: 'scale(1.05)' },
                            transition: 'transform 0.2s',
                        }}
                    >
                        <Card>
                            <CardMedia
                                component="img"
                                height="200"
                                image={artist.image}
                                alt={artist.name}
                            />
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {artist.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default ArtistsPage;