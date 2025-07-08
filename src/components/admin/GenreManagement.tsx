import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
    List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, Alert, Input } from '@mui/material';
import { Add, Edit, Delete, CloudUpload } from '@mui/icons-material';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../config/firebase';
import type { Genre } from '../../types';
import { GenreRepository } from '../../repositories/GenreRepository';

const GenreManagement: React.FC = () => {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [open, setOpen] = useState(false);
    const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
    const [formData, setFormData] = useState({ name: '', image: '' });
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const genreRepository = new GenreRepository();

    useEffect(() => {
        fetchGenres();
    }, []);

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
        const fileName = `genres/${timestamp}_${file.name}`;
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
        if (!formData.name) {
            setError('El nombre es obligatorio');
            return;
        }

        if (!editingGenre && !selectedFile) {
            setError('Por favor selecciona una imagen');
            return;
        }

        try {
            let imageUrl = formData.image;

            if (selectedFile) {
                imageUrl = await uploadImage(selectedFile);

                if (editingGenre && editingGenre.image) {
                    await deleteImage(editingGenre.image);
                }
            }

            const genreData = {
                name: formData.name,
                image: imageUrl
            };

            if (editingGenre) {
                await genreRepository.update(editingGenre.id, genreData);
            } else {
                await genreRepository.create(genreData);
            }

            setOpen(false);
            setFormData({ name: '', image: '' });
            setEditingGenre(null);
            setSelectedFile(null);
            setError('');
            fetchGenres();
        } catch (error) {
            setError('Error al guardar género: ' + error);
        }
    };

    const handleEdit = (genre: Genre) => {
        setEditingGenre(genre);
        setFormData({ name: genre.name, image: genre.image });
        setSelectedFile(null);
        setOpen(true);
    };

    const handleDelete = async (genre: Genre) => {
        if (window.confirm('¿Estás seguro de eliminar este género?')) {
            try {
                if (genre.image) {
                    await deleteImage(genre.image);
                }
                await genreRepository.delete(genre.id);
                fetchGenres();
            } catch (error) {
                setError('Error al eliminar género: ' + error);
            }
        }
    };

    const handleClose = () => {
        setOpen(false);
        setEditingGenre(null);
        setFormData({ name: '', image: '' });
        setSelectedFile(null);
        setError('');
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Gestión de Géneros</Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setOpen(true)}
                >
                    Agregar Género
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <List>
                {genres.map((genre) => (
                    <ListItem key={genre.id} divider>
                        <ListItemText
                            primary={genre.name}
                            secondary={
                                <img
                                    src={genre.image}
                                    alt={genre.name}
                                    style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                            }
                        />
                        <ListItemSecondaryAction>
                            <IconButton onClick={() => handleEdit(genre)}>
                                <Edit />
                            </IconButton>
                            <IconButton onClick={() => handleDelete(genre)}>
                                <Delete />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingGenre ? 'Editar Género' : 'Agregar Género'}
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
                            {editingGenre ? 'Cambiar imagen (opcional)' : 'Imagen del género'}
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

                        {editingGenre && editingGenre.image && !selectedFile && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                    Imagen actual:
                                </Typography>
                                <img
                                    src={editingGenre.image}
                                    alt={editingGenre.name}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                            </Box>
                        )}
                    </Box>
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
                        {uploading ? 'Subiendo...' : (editingGenre ? 'Actualizar' : 'Crear')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default GenreManagement;