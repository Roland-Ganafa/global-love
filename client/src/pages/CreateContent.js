import React, { useState, useRef } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    CircularProgress,
    IconButton,
    Grid,
    Card,
    CardMedia,
    useTheme
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    VideoCall as VideoCallIcon,
    Photo as PhotoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { contentAPI } from '../services/api';

const CreateContent = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [mediaPreview, setMediaPreview] = useState(null);
    const fileInputRef = useRef(null);

    const validationSchema = Yup.object({
        title: Yup.string()
            .required('Title is required')
            .min(3, 'Title must be at least 3 characters')
            .max(100, 'Title must not exceed 100 characters'),
        description: Yup.string()
            .required('Description is required')
            .min(10, 'Description must be at least 10 characters')
            .max(1000, 'Description must not exceed 1000 characters'),
    });

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            media: null,
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setUploading(true);
                const formData = new FormData();
                formData.append('title', values.title);
                formData.append('description', values.description);
                if (values.media) {
                    formData.append('media', values.media);
                }

                await contentAPI.createContent(formData);
                navigate('/profile');
            } catch (error) {
                console.error('Error creating content:', error);
            } finally {
                setUploading(false);
            }
        },
    });

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            formik.setFieldValue('media', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveMedia = () => {
        formik.setFieldValue('media', null);
        setMediaPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Create New Content
            </Typography>

            <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="title"
                            name="title"
                            label="Title"
                            value={formik.values.title}
                            onChange={formik.handleChange}
                            error={formik.touched.title && Boolean(formik.errors.title)}
                            helperText={formik.touched.title && formik.errors.title}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="description"
                            name="description"
                            label="Description"
                            multiline
                            rows={4}
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            error={formik.touched.description && Boolean(formik.errors.description)}
                            helperText={formik.touched.description && formik.errors.description}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<PhotoIcon />}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Upload Photo
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<VideoCallIcon />}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Upload Video
                            </Button>
                        </Box>

                        {mediaPreview && (
                            <Card sx={{ position: 'relative', mb: 2 }}>
                                <CardMedia
                                    component={formik.values.media?.type.startsWith('video/') ? 'video' : 'img'}
                                    src={mediaPreview}
                                    controls={formik.values.media?.type.startsWith('video/')}
                                    sx={{ height: 300, objectFit: 'contain' }}
                                />
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                                        '&:hover': {
                                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                                        },
                                    }}
                                    onClick={handleRemoveMedia}
                                >
                                    <DeleteIcon sx={{ color: 'white' }} />
                                </IconButton>
                            </Card>
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={uploading}
                                startIcon={uploading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                            >
                                {uploading ? 'Uploading...' : 'Create Post'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default CreateContent;
