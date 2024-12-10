import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Link,
    MenuItem,
    CircularProgress
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { countries } from '../utils/countries';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Name is required')
            .min(2, 'Name must be at least 2 characters')
            .max(50, 'Name must not exceed 50 characters'),
        email: Yup.string()
            .required('Email is required')
            .email('Invalid email format'),
        password: Yup.string()
            .required('Password is required')
            .min(6, 'Password must be at least 6 characters'),
        confirmPassword: Yup.string()
            .required('Please confirm your password')
            .oneOf([Yup.ref('password')], 'Passwords must match'),
        age: Yup.number()
            .required('Age is required')
            .min(18, 'You must be at least 18 years old')
            .max(100, 'Invalid age'),
        country: Yup.string()
            .required('Country is required')
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            age: '',
            country: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);
                setError('');
                
                console.log('Submitting registration with data:', {
                    ...values,
                    password: '[REDACTED]'
                });
                
                // Remove confirmPassword before sending to API
                const { confirmPassword, ...registerData } = values;
                
                // Convert age to number
                registerData.age = parseInt(registerData.age, 10);
                
                // Log the actual data being sent to the API
                console.log('Sending to API:', {
                    ...registerData,
                    password: '[REDACTED]'
                });
                
                try {
                    const response = await register(registerData);
                    console.log('Registration response:', response);
                    navigate('/profile/edit');
                } catch (apiError) {
                    console.error('API Error:', {
                        status: apiError.response?.status,
                        statusText: apiError.response?.statusText,
                        data: apiError.response?.data,
                        message: apiError.message
                    });
                    throw apiError;
                }
            } catch (err) {
                console.error('Registration error:', {
                    message: err.message,
                    response: err.response?.data,
                    stack: err.stack
                });
                setError(err.response?.data?.error || err.message || 'Registration failed. Please try again.');
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
                    maxWidth: 500,
                    width: '100%'
                }}
            >
                <Typography variant="h4" align="center" gutterBottom>
                    Join Global Love
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
                    Find your perfect match across borders
                </Typography>

                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                id="name"
                                name="name"
                                label="Full Name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                        </Grid>

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
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
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
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                value={formik.values.confirmPassword}
                                onChange={formik.handleChange}
                                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="age"
                                name="age"
                                label="Age"
                                type="number"
                                value={formik.values.age}
                                onChange={formik.handleChange}
                                error={formik.touched.age && Boolean(formik.errors.age)}
                                helperText={formik.touched.age && formik.errors.age}
                                inputProps={{ min: 18, max: 100 }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                id="country"
                                name="country"
                                label="Country"
                                select
                                value={formik.values.country}
                                onChange={formik.handleChange}
                                error={formik.touched.country && Boolean(formik.errors.country)}
                                helperText={formik.touched.country && formik.errors.country}
                            >
                                {countries.map((country) => (
                                    <MenuItem key={country.code} value={country.code}>
                                        {country.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {error && (
                            <Grid item xs={12}>
                                <Typography color="error" align="center">
                                    {error}
                                </Typography>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                disabled={loading}
                                sx={{ mt: 2 }}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Register'}
                            </Button>
                        </Grid>
                    </Grid>
                </form>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2">
                        Already have an account?{' '}
                        <Link component={RouterLink} to="/login">
                            Sign in
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default Register;
