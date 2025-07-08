import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, List,
    ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, Alert,
    Select, MenuItem, FormControl, InputLabel, Input } from '@mui/material';
import { Add, Edit, Delete, CloudUpload } from '@mui/icons-material';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase';
import type { Artist, Genre } from '../../types';
import { ArtistRepository } from '../../repositories/ArtistRepository';
import { GenreRepository } from '../../repositories/GenreRepository';

const ArtistManagement: React.FC = () => {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [open, setOpen] = useState(false);
    const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
    const [formData, setFormData] = useState({ name: '', image: '', genreId: '' });
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const artistRepository = new ArtistRepository();
    const genreRepository = new GenreRepository();

    useEffect(() => {
        fetchArtists();
        fetchGenres();
    }, []);

    const fetchArtists = async () => {
        try {
            const data = await artistRepository.getAll();
            setArtists(data);
        } catch (error) {
            setError('Error al cargar artistas: ' + error);
        }
    };

    const fetchGenres = async () => {
        try {
            const data = await genreRepository.getAll();
            setGenres(data);
        } catch (error) {
            setError('Error al cargar géneros: ' + error);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Por favor selecciona un archivo de imagen válido');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setError('El archivo debe ser menor a 5MB');
                return;
            }

            setSelectedFile(file);
            setError('');
        }
    };

    const uploadImage = async (file: File): Promise<string> => {
        const timestamp = Date.now();
        const fileName = `artists/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);

        try {
            setUploading(true);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Error al subir la imagen');
        } finally {
            setUploading(false);
        }
    };

    const deleteImage = async (imageUrl: string) => {
        try {
            const url = new URL(imageUrl);
            const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
            const imageRef = ref(storage, path);
            await deleteObject(imageRef);
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.genreId) {
            setError('El nombre y el género son obligatorios');
            return;
        }

        if (!editingArtist && !selectedFile) {
            setError('Por favor selecciona una imagen');
            return;
        }

        try {
            let imageUrl = formData.image;

            if (selectedFile) {
                imageUrl = await uploadImage(selectedFile);

                if (editingArtist && editingArtist.image) {
                    await deleteImage(editingArtist.image);
                }
            }

            const artistData = {
                name: formData.name,
                image: imageUrl,
                genreId: formData.genreId
            };

            if (editingArtist) {
                await artistRepository.update(editingArtist.id, artistData);
            } else {
                await artistRepository.create(artistData);
            }

            setOpen(false);
            setFormData({ name: '', image: '', genreId: '' });
            setEditingArtist(null);
            setSelectedFile(null);
            setError('');
            fetchArtists();
        } catch (error) {
            setError('Error al guardar artista: ' + error);
        }
    };

    const handleEdit = (artist: Artist) => {
        setEditingArtist(artist);
        setFormData({ name: artist.name, image: artist.image, genreId: artist.genreId });
        setSelectedFile(null);
        setOpen(true);
    };

    const handleDelete = async (artist: Artist) => {
        if (window.confirm('¿Estás seguro de eliminar este artista?')) {
            try {
                if (artist.image) {
                    await deleteImage(artist.image);
                }
                await artistRepository.delete(artist.id);
                fetchArtists();
            } catch (error) {
                setError('Error al eliminar artista: ' + error);
            }
        }
    };

    const handleClose = () => {
        setOpen(false);
        setEditingArtist(null);
        setFormData({ name: '', image: '', genreId: '' });
        setSelectedFile(null);
        setError('');
    };

    const getGenreName = (genreId: string) => {
        const genre = genres.find(g => g.id === genreId);
        return genre ? genre.name : 'Desconocido';
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Gestión de Artistas</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpen(true)}
                >
                    Agregar Artista
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <List>
                {artists.map((artist) => (
                    <ListItem key={artist.id} divider>
                        <ListItemText
                            primary={artist.name}
                            secondary={
                                <Box display="flex" alignItems="center" gap={2}>
                                    <img
                                        src={artist.image}
                                        alt={artist.name}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                    <Typography variant="body2">
                                        Género: {getGenreName(artist.genreId)}
                                    </Typography>
                                </Box>
                            }
                        />
                        <ListItemSecondaryAction>
                            <IconButton onClick={() => handleEdit(artist)}>
                                <Edit />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(artist)}>
                                <Delete />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingArtist ? 'Editar Artista' : 'Agregar Artista'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Nombre"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        margin="normal"
                    />

                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            {editingArtist ? 'Cambiar imagen (opcional)' : 'Imagen del artista'}
                        </Typography>

                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={<CloudUpload />}
                            fullWidth
                            sx={{ mb: 2 }}
                        >
                            Seleccionar Imagen
                            <Input
                                type="file"
                                onChange={handleFileSelect}
                                sx={{ display: 'none' }}
                            />
                        </Button>

                        {selectedFile && (
                            <Typography variant="body2" color="primary">
                                Archivo seleccionado: {selectedFile.name}
                            </Typography>
                        )}

                        {editingArtist && editingArtist.image && !selectedFile && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Imagen actual:
                                </Typography>
                                <img
                                    src={editingArtist.image}
                                    alt={editingArtist.name}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                            </Box>
                        )}
                    </Box>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Género</InputLabel>
                        <Select
                            value={formData.genreId}
                            onChange={(e) => setFormData({ ...formData, genreId: e.target.value })}
                        >
                            {genres.map((genre) => (
                                <MenuItem key={genre.id} value={genre.id}>
                                    {genre.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
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
                        {uploading ? 'Subiendo...' : (editingArtist ? 'Actualizar' : 'Crear')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ArtistManagement;