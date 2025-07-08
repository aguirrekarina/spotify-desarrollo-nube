import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, Alert,
    Select, MenuItem, FormControl, InputLabel, Input, LinearProgress } from '@mui/material';
import { Add, Edit, Delete, AudioFile } from '@mui/icons-material';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase';
import type { Song, Artist } from '../../types';
import { SongRepository } from '../../repositories/SongRepository';
import { ArtistRepository } from '../../repositories/ArtistRepository';

const SongManagement: React.FC = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [artists, setArtists] = useState<Artist[]>([]);
    const [open, setOpen] = useState(false);
    const [editingSong, setEditingSong] = useState<Song | null>(null);
    const [formData, setFormData] = useState({ name: '', audioUrl: '', artistId: '' });
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const songRepository = new SongRepository();
    const artistRepository = new ArtistRepository();

    useEffect(() => {
        fetchSongs();
        fetchArtists();
    }, []);

    const fetchSongs = async () => {
        try {
            const data = await songRepository.getAll();
            setSongs(data);
        } catch (error) {
            setError('Error al cargar canciones: ' + error);
        }
    };

    const fetchArtists = async () => {
        try {
            const data = await artistRepository.getAll();
            setArtists(data);
        } catch (error) {
            setError('Error al cargar artistas: ' + error);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('audio/')) {
                setError('Por favor selecciona un archivo de audio válido (MP3, WAV, etc.)');
                return;
            }
            if (file.size > 50 * 1024 * 1024) {
                setError('El archivo debe ser menor a 50MB');
                return;
            }

            setSelectedFile(file);
            setError('');
        }
    };

    const uploadAudio = async (file: File): Promise<string> => {
        const timestamp = Date.now();
        const fileName = `songs/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);

        try {
            setUploading(true);
            setUploadProgress(0);

            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 200);

            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            clearInterval(progressInterval);
            setUploadProgress(100);

            return downloadURL;
        } catch (error) {
            console.error('Error uploading audio:', error);
            throw new Error('Error al subir el archivo de audio');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const deleteAudio = async (audioUrl: string) => {
        try {
            const url = new URL(audioUrl);
            const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
            const audioRef = ref(storage, path);
            await deleteObject(audioRef);
        } catch (error) {
            console.error('Error deleting audio:', error);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.artistId) {
            setError('El nombre y el artista son obligatorios');
            return;
        }

        if (!editingSong && !selectedFile) {
            setError('Por favor selecciona un archivo de audio');
            return;
        }

        try {
            let audioUrl = formData.audioUrl;

            if (selectedFile) {
                audioUrl = await uploadAudio(selectedFile);
                if (editingSong && editingSong.audioUrl) {
                    await deleteAudio(editingSong.audioUrl);
                }
            }

            const songData = {
                name: formData.name,
                audioUrl: audioUrl,
                artistId: formData.artistId
            };

            if (editingSong) {
                await songRepository.update(editingSong.id, songData);
            } else {
                await songRepository.create(songData);
            }

            setOpen(false);
            setFormData({ name: '', audioUrl: '', artistId: '' });
            setEditingSong(null);
            setSelectedFile(null);
            setError('');
            fetchSongs();
        } catch (error) {
            setError('Error al guardar canción: ' + error);
        }
    };

    const handleEdit = (song: Song) => {
        setEditingSong(song);
        setFormData({ name: song.name, audioUrl: song.audioUrl, artistId: song.artistId });
        setSelectedFile(null);
        setOpen(true);
    };

    const handleDelete = async (song: Song) => {
        if (window.confirm('¿Estás seguro de eliminar esta canción?')) {
            try {
                if (song.audioUrl) {
                    await deleteAudio(song.audioUrl);
                }
                await songRepository.delete(song.id);
                fetchSongs();
            } catch (error) {
                setError('Error al eliminar canción: ' + error);
            }
        }
    };

    const handleClose = () => {
        setOpen(false);
        setEditingSong(null);
        setFormData({ name: '', audioUrl: '', artistId: '' });
        setSelectedFile(null);
        setError('');
    };

    const getArtistName = (artistId: string) => {
        const artist = artists.find(a => a.id === artistId);
        return artist ? artist.name : 'Desconocido';
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Gestión de Canciones</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpen(true)}
                >
                    Agregar Canción
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <List>
                {songs.map((song) => (
                    <ListItem key={song.id} divider>
                        <ListItemText
                            primary={song.name}
                            secondary={
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Artista: {getArtistName(song.artistId)}
                                    </Typography>
                                    <Box mt={1}>
                                        <audio controls style={{ width: '100%', maxWidth: '300px' }}>
                                            <source src={song.audioUrl} type="audio/mpeg" />
                                            Tu navegador no soporta audio.
                                        </audio>
                                    </Box>
                                </Box>
                            }
                        />
                        <ListItemSecondaryAction>
                            <IconButton onClick={() => handleEdit(song)}>
                                <Edit />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(song)}>
                                <Delete />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingSong ? 'Editar Canción' : 'Agregar Canción'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nombre de la canción"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        margin="normal"
                    />

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            {editingSong ? 'Cambiar archivo de audio (opcional)' : 'Archivo de audio'}
                        </Typography>

                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<AudioFile />}
                            fullWidth
                            sx={{ mb: 2 }}
                            disabled={uploading}
                        >
                            Seleccionar Archivo de Audio
                            <Input
                                type="file"
                                onChange={handleFileSelect}
                                sx={{ display: 'none' }}
                            />
                        </Button>

                        {selectedFile && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="primary">
                                    Archivo seleccionado: {selectedFile.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Tamaño: {formatFileSize(selectedFile.size)}
                                </Typography>
                            </Box>
                        )}

                        {uploading && (
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Subiendo archivo... {uploadProgress}%
                                </Typography>
                                <LinearProgress variant="determinate" value={uploadProgress} />
                            </Box>
                        )}

                        {editingSong && editingSong.audioUrl && !selectedFile && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Audio actual:
                                </Typography>
                                <audio controls style={{ width: '100%' }}>
                                    <source src={editingSong.audioUrl} type="audio/mpeg" />
                                    Tu navegador no soporta audio.
                                </audio>
                            </Box>
                        )}
                    </Box>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Artista</InputLabel>
                        <Select
                            value={formData.artistId}
                            onChange={(e) => setFormData({ ...formData, artistId: e.target.value })}
                        >
                            {artists.map((artist) => (
                                <MenuItem key={artist.id} value={artist.id}>
                                    {artist.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {selectedFile && (
                        <Box mt={2}>
                            <Typography variant="body2" gutterBottom>
                                Vista previa del archivo seleccionado:
                            </Typography>
                            <audio controls style={{ width: '100%' }}>
                                <source src={URL.createObjectURL(selectedFile)} type="audio/mpeg" />
                                Tu navegador no soporta audio.
                            </audio>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} disabled={uploading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={uploading}
                    >
                        {uploading ? 'Subiendo...' : (editingSong ? 'Actualizar' : 'Crear')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SongManagement;