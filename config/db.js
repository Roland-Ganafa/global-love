const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            heartbeatFrequencyMS: 2000, // Check connection every 2s
        });

        console.log(`MongoDB Connected Successfully to: ${conn.connection.host}`);
        
        // Add connection error handler
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        // Add disconnection handler
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
        });

        // Add reconnection handler
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully');
        });

    } catch (error) {
        console.error('MongoDB Connection Error:', {
            message: error.message,
            code: error.code,
            name: error.name
        });
        process.exit(1);
    }
};

module.exports = connectDB;
