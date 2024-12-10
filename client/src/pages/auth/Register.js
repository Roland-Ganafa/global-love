import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import {
    Box,
    Button,
    TextField,
    Typography,
    Link,
    Grid,
    InputAdornment,
    IconButton,
    MenuItem
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { registerSchema } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import countries from '../../utils/countries';

const Register = () => {
    const [showPassword, setShowPassword] = React.useState(false);
    const { register } = useAuth();

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: '',
            age: '',
            country: ''
        },
        validationSchema: registerSchema,
        onSubmit: async (values, { setSubmitting }) => {
            try {
                const success = await register(values);
                if (success) {
                    toast.success('Welcome to Global Love!');
                }
            } catch (error) {
                toast.error(error.message);
            } finally {
                setSubmitting(false);
            }
        }
    });

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom align="center">
                Join Global Love
            </Typography>
            <Typography variant="subtitle1" gutterBottom align="center" color="text.secondary">
                Find meaningful connections worldwide
            </Typography>

            <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 4 }}>
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
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="password"
                            name="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            error={formik.touched.password && Boolean(formik.errors.password)}
                            helperText={formik.touched.password && formik.errors.password}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
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
                            InputProps={{ inputProps: { min: 18 } }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            id="country"
                            name="country"
                            select
                            label="Country"
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
                </Grid>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={formik.isSubmitting}
                    sx={{ mt: 3, mb: 2 }}
                >
                    Create Account
                </Button>

                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                    Already have an account?{' '}
                    <Link component={RouterLink} to="/login" variant="body2">
                        Sign in here
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default Register;
