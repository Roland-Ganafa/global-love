import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Link,
    CircularProgress,
    Alert
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Invalid email format')
            .required('Email is required'),
        password: Yup.string()
            .required('Password is required')
    });

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                setError('');
                console.log('Attempting login with:', { email: values.email }); // Log login attempt
                await login(values.email, values.password);
                console.log('Login successful'); // Log success
                navigate('/'); // Redirect to home page after successful login
            } catch (err) {
                console.error('Login error:', err.response?.data || err); // Log detailed error
                setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
            } finally {
                setLoading(false);
            }
        }
    });

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                p: 2
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    maxWidth: 400,
                    width: '100%'
                }}
            >
                <Typography variant="h4" align="center" gutterBottom>
                    Welcome Back
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                    Sign in to continue your journey
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="email"
                                name="email"
                                label="Email Address"
                                type="email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="password"
                                name="password"
                                label="Password"
                                type="password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                                disabled={loading}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Sign In'}
                            </Button>
                        </Grid>

                        <Grid item xs={12} sx={{ textAlign: 'center' }}>
                            <Link
                                component={RouterLink}
                                to="/forgot-password"
                                variant="body2"
                            >
                                Forgot password?
                            </Link>
                        </Grid>

                        <Grid item xs={12} sx={{ textAlign: 'center' }}>
                            <Typography variant="body2">
                                Don't have an account?{' '}
                                <Link component={RouterLink} to="/register">
                                    Sign up
                                </Link>
                            </Typography>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Box>
    );
};

export default Login;
