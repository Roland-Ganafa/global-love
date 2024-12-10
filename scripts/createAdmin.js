require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123456', salt);

        // Admin user data
        const adminData = {
            name: 'Admin User',
            email: 'admin@globallove.com',
            password: hashedPassword,
            age: 25,
            country: 'Global',
            isAdmin: true,
            role: 'admin'
        };

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });
        if (existingAdmin) {
            console.log('Admin user already exists with email:', adminData.email);
            process.exit(0);
        }

        // Create admin user
        const admin = new User(adminData);
        await admin.save();

        console.log('----------------------------------------');
        console.log('Admin user created successfully!');
        console.log('Use these credentials to login:');
        console.log('----------------------------------------');
        console.log('Email:', adminData.email);
        console.log('Password: admin123456');
        console.log('----------------------------------------');
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createAdmin();
