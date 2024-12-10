const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 500
    },
    age: {
        type: Number,
        min: 18,
        max: 120
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    location: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        },
        address: String,
        city: String,
        country: String
    },
    photos: [{
        url: String,
        isMain: {
            type: Boolean,
            default: false
        }
    }],
    videoProfile: {
        url: String
    },
    interests: [{
        type: String,
        trim: true
    }],
    relationshipGoals: {
        type: String,
        enum: ['casual', 'serious', 'marriage', 'friendship']
    },
    partnerPreferences: {
        ageRange: {
            min: {
                type: Number,
                min: 18,
                default: 18
            },
            max: {
                type: Number,
                max: 120,
                default: 50
            }
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'any']
        },
        maxDistance: {
            type: Number,
            default: 100
        }
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    timestamps: true
});

// Create location index
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

// Generate auth token
userSchema.methods.generateAuthToken = function() {
    const user = this;
    const token = jwt.sign(
        { _id: user._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
    return token;
};

// Compare password
userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Public profile data
userSchema.methods.toPublicProfile = function() {
    const user = this;
    const userObject = user.toObject();
    
    delete userObject.password;
    delete userObject.email;
    delete userObject.role;
    
    return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
