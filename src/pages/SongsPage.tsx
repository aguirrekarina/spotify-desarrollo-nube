import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { List, ListItem, Typography, Box, CircularProgress, Button, Paper, IconButton, Slider, LinearProgress } from '@mui/material';
import { ArrowBack, PlayArrow, Pause, VolumeUp, VolumeDown, SkipNext, SkipPrevious } from '@mui/icons-material';
import type { Song } from '../types';
import { SongRepository } from '../repositories/SongRepository';

const SongsPage: React.FC = () => {
    const { artistId } = useParams<{ artistId: string }>();
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const navigate = useNavigate();
    const songRepository = new SongRepository();

    useEffect(() => {
        const fetchSongs = async () => {
            if (!artistId) return;

            try {
                const data = await songRepository.getByArtist(artistId);
                setSongs(data);
            } catch (error) {
                console.error('Error fetching songs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, [artistId]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        const handleEnded = () => {
            setIsPlaying(false);
            setCurrentPlaying(null);
        };

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentPlaying]);

    const handlePlayPause = (songId: string) => {
        const audio = audioRef.current;

        if (currentPlaying === songId) {
            if (isPlaying) {
                audio?.pause();
                setIsPlaying(false);
            } else {
                audio?.play();
                setIsPlaying(true);
            }
        } else {
            setCurrentPlaying(songId);
            setIsPlaying(true);
            setCurrentTime(0);
        }
    };

    const handleSeek = (_event: Event, newValue: number | number[]) => {
        const audio = audioRef.current;
        if (audio) {
            audio.currentTime = newValue as number;
            setCurrentTime(newValue as number);
        }
    };

    const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
        const audio = audioRef.current;
        const volumeValue = newValue as number;
        if (audio) {
            audio.volume = volumeValue;
            setVolume(volumeValue);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getCurrentSong = () => {
        return songs.find(song => song.id === currentPlaying);
    };

    const playNext = () => {
        const currentIndex = songs.findIndex(song => song.id === currentPlaying);
        const nextIndex = (currentIndex + 1) % songs.length;
        setCurrentPlaying(songs[nextIndex].id);
        setIsPlaying(true);
    };

    const playPrevious = () => {
        const currentIndex = songs.findIndex(song => song.id === currentPlaying);
        const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
        setCurrentPlaying(songs[prevIndex].id);
        setIsPlaying(true);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    const currentSong = getCurrentSong();

    return (
        <Box>
            <Box display="flex" alignItems="center" mb={3}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ mr: 2 }}
                >
                    Volver
                </Button>
                <Typography variant="h4" component="h1"> Canciones </Typography>
            </Box>
            {currentPlaying && (
                <Paper
                    elevation={3}
                    sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, zIndex: 1000,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}
                >
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box flex={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {currentSong?.name}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </Typography>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1}>
                            <IconButton onClick={playPrevious} sx={{ color: 'white' }}>
                                <SkipPrevious />
                            </IconButton>
                            <IconButton
                                onClick={() => currentPlaying && handlePlayPause(currentPlaying)}
                                sx={{
                                    color: 'white',
                                    background: 'rgba(255,255,255,0.2)',
                                    '&:hover': { background: 'rgba(255,255,255,0.3)' }
                                }}
                            >
                                {isPlaying ? <Pause /> : <PlayArrow />}
                            </IconButton>
                            <IconButton onClick={playNext} sx={{ color: 'white' }}>
                                <SkipNext />
                            </IconButton>
                        </Box>

                        <Box display="flex" alignItems="center" gap={1} minWidth={120}>
                            <VolumeDown sx={{ color: 'white' }} />
                            <Slider value={volume} onChange={handleVolumeChange} step={0.1} min={0} max={1}
                                sx={{
                                    color: 'white',
                                    '& .MuiSlider-thumb': { color: 'white' }
                                }}
                            />
                            <VolumeUp sx={{ color: 'white' }} />
                        </Box>
                    </Box>
                    <Box mt={1}>
                        <Slider
                            value={currentTime}
                            onChange={handleSeek}
                            max={duration}
                            sx={{
                                color: 'white',
                                '& .MuiSlider-thumb': { color: 'white' },
                                '& .MuiSlider-track': { color: 'white' }
                            }}
                        />
                    </Box>
                </Paper>
            )}

            <Paper elevation={1} sx={{ mb: currentPlaying ? 15 : 0 }}>
                <List>
                    {songs.map((song, index) => (
                        <ListItem
                            key={song.id}
                            divider={index < songs.length - 1}
                            sx={{
                                background: currentPlaying === song.id ?
                                    'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))' :
                                    'transparent',
                                '&:hover': {
                                    background: currentPlaying === song.id ?
                                        'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))' :
                                        'rgba(0, 0, 0, 0.04)'
                                }
                            }}
                        >
                            <Box display="flex" alignItems="center" width="100%" gap={2}>
                                <Box flex={1}>
                                    <Typography
                                        variant="h6"
                                        component="div"
                                        sx={{
                                            color: currentPlaying === song.id ? 'primary.main' : 'text.primary',
                                            fontWeight: currentPlaying === song.id ? 'bold' : 'normal'
                                        }}
                                    >
                                        {song.name}
                                    </Typography>
                                    {currentPlaying === song.id && (
                                        <Box mt={1}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(currentTime / duration) * 100}
                                                sx={{
                                                    height: 4,
                                                    borderRadius: 2,
                                                    background: 'rgba(102, 126, 234, 0.2)'
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Box>

                                <IconButton
                                    onClick={() => handlePlayPause(song.id)}
                                    sx={{
                                        background: currentPlaying === song.id ?
                                            'linear-gradient(135deg, #667eea, #764ba2)' :
                                            'transparent',
                                        color: currentPlaying === song.id ? 'white' : 'primary.main',
                                        border: currentPlaying === song.id ? 'none' : '2px solid',
                                        borderColor: 'primary.main',
                                        '&:hover': {
                                            background: currentPlaying === song.id ?
                                                'linear-gradient(135deg, #5a67d8, #6b5b95)' :
                                                'rgba(102, 126, 234, 0.1)'
                                        }
                                    }}
                                >
                                    {currentPlaying === song.id && isPlaying ? <Pause /> : <PlayArrow />}
                                </IconButton>
                            </Box>
                        </ListItem>
                    ))}
                </List>
            </Paper>

            {currentPlaying && (
                <audio
                    ref={audioRef}
                    src={currentSong?.audioUrl}
                    autoPlay={isPlaying}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    style={{ display: 'none' }}
                />
            )}
        </Box>
    );
};

export default SongsPage;