import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardMedia, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import type { Genre } from '../types';
import { GenreRepository } from '../repositories/GenreRepository';

const GenresPage: React.FC = () => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const genreRepository = new GenreRepository();

    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const data = await genreRepository.getAll();
                setGenres(data);
            } catch (error) {
                console.error('Error fetching genres:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGenres();
    }, []);

    const handleGenreClick = (genreId: string) => {
        navigate(`/genre/${genreId}`);
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
            <Typography variant="h4" component="h1" gutterBottom>
                Géneros Musicales
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={3}>
                {genres.map((genre) => (
                    <Box
                        key={genre.id}
                        width={{ xs: '100%', sm: '48%', md: '31%', lg: '23%' }}
                        onClick={() => handleGenreClick(genre.id)}
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
                                image={genre.image}
                                alt={genre.name}
                            />
                            <CardContent>
                                <Typography variant="h6" component="div">
                                    {genre.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default GenresPage;