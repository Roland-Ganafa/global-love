const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
    try {
        console.log('Registration attempt received');
        const { email, password, name, age, country } = req.body;

        // Input validation
        if (!email || !password || !name || !age || !country) {
            console.log('Missing required fields:', {
                email: !!email,
                password: !!password,
                name: !!name,
                age: !!age,
                country: !!country
            });
            return res.status(400).json({
                error: 'All fields are required',
                missingFields: Object.entries({ email, password, name, age, country })
                    .filter(([_, value]) => !value)
                    .map(([key]) => key)
            });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Password validation
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Age validation
        const numericAge = Number(age);
        if (isNaN(numericAge) || numericAge < 18) {
            return res.status(400).json({ error: 'You must be at least 18 years old' });
        }

        // Check if user exists
        console.log('Checking for existing user');
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Hash password
        console.log('Hashing password');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        console.log('Creating new user');
        const user = new User({
            email: email.toLowerCase(),
            password: hashedPassword,
            name,
            age: numericAge,
            country
        });

        // Save user
        console.log('Saving user to database');
        await user.save();

        // Generate JWT
        console.log('Generating JWT');
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send response
        console.log('Registration successful');
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                country: user.country
            }
        });

    } catch (error) {
        console.error('Registration error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            error: 'Registration failed',
            details: error.message
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                age: user.age,
                country: user.country,
                isAdmin: user.isAdmin,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
    res.json(req.user.toPublicProfile());
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'country', 'bio', 'partnerPreferences', 'interests'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.json(req.user.toPublicProfile());
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Logout user
router.post('/logout', auth, async (req, res) => {
    try {
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
