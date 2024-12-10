const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get users based on preferences and location
router.get('/discover', auth, async (req, res) => {
    try {
        const { maxDistance = 100000, page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const users = await User.find({
            _id: { $ne: req.user._id },
            age: {
                $gte: req.user.partnerPreferences.ageRange.min,
                $lte: req.user.partnerPreferences.ageRange.max
            }
        })
        .select('-password -email')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ lastActive: -1 });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user profile by ID
router.get('/:userId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password -email');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const allowedUpdates = [
            'name', 'bio', 'age', 'gender', 'location', 
            'interests', 'photos', 'videoProfile',
            'partnerPreferences', 'relationshipGoals'
        ];
        
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        
        if (!isValidOperation) {
            return res.status(400).json({ 
                error: 'Invalid updates!',
                message: `Allowed updates are: ${allowedUpdates.join(', ')}`
            });
        }

        // Validate required fields
        if (updates.includes('name') && !req.body.name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        if (updates.includes('age') && (req.body.age < 18 || req.body.age > 120)) {
            return res.status(400).json({ error: 'Age must be between 18 and 120' });
        }

        if (updates.includes('gender') && !['male', 'female', 'other'].includes(req.body.gender)) {
            return res.status(400).json({ error: 'Invalid gender value' });
        }

        // Validate partner preferences
        if (updates.includes('partnerPreferences')) {
            const { ageRange, gender, maxDistance } = req.body.partnerPreferences;
            
            if (ageRange) {
                if (ageRange.min < 18 || ageRange.max > 120 || ageRange.min > ageRange.max) {
                    return res.status(400).json({ error: 'Invalid age range in partner preferences' });
                }
            }
            
            if (gender && !['male', 'female', 'other', 'any'].includes(gender)) {
                return res.status(400).json({ error: 'Invalid gender in partner preferences' });
            }
            
            if (maxDistance && (maxDistance < 0 || maxDistance > 20000)) {
                return res.status(400).json({ error: 'Max distance must be between 0 and 20000 km' });
            }
        }

        // Get user and apply updates
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Apply updates
        updates.forEach(update => {
            if (update === 'location' && req.body.location) {
                // Handle location update
                const { address, city, country, coordinates } = req.body.location;
                user.location = {
                    type: 'Point',
                    coordinates: coordinates || user.location.coordinates,
                    address: address || user.location.address,
                    city: city || user.location.city,
                    country: country || user.location.country
                };
            } else {
                user[update] = req.body[update];
            }
        });

        // Save user
        await user.save();
        
        // Return updated user without sensitive information
        const userResponse = user.toObject();
        delete userResponse.password;
        delete userResponse.__v;
        
        res.json(userResponse);
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ 
            error: 'Error updating profile',
            message: error.message 
        });
    }
});

// Get user profile
router.get('/profile/:userId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password -email');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update photos
router.post('/photos', auth, async (req, res) => {
    try {
        const { url } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user.photos) {
            user.photos = [];
        }
        
        user.photos.push({ url });
        await user.save();
        
        res.json(user.photos);
    } catch (error) {
        console.error('Photo update error:', error);
        res.status(500).json({ error: error.message || 'Error updating photos' });
    }
});

// Update video profile
router.post('/video-profile', auth, async (req, res) => {
    try {
        const { url } = req.body;
        const user = await User.findById(req.user.id);
        
        user.videoProfile = { url };
        await user.save();
        
        res.json(user.videoProfile);
    } catch (error) {
        console.error('Video profile update error:', error);
        res.status(500).json({ error: error.message || 'Error updating video profile' });
    }
});

// Delete photo
router.delete('/photos/:photoId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.photos = user.photos.filter(photo => photo._id.toString() !== req.params.photoId);
        await user.save();
        res.json(user.photos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete video profile
router.delete('/video-profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.videoProfile = null;
        await user.save();
        res.json({ message: 'Video profile deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update location
router.post('/location', auth, async (req, res) => {
    try {
        const { coordinates } = req.body;
        
        req.user.location.coordinates = coordinates;
        await req.user.save();
        
        res.json(req.user.toPublicProfile());
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
