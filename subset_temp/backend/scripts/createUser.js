const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/User');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const createUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const newUser = {
            email: 'jay@example.com',
            password: 'password123',
            name: 'Jay',
        };

        // Check if user already exists
        const existingUser = await User.findOne({ email: newUser.email });
        if (existingUser) {
            console.log('User already exists:', newUser.email);
            // If it exists, maybe we want to update password? No, just exit.
            mongoose.connection.close();
            return;
        }

        // Create user
        const user = new User(newUser);
        await user.save();

        console.log('User created successfully:');
        console.log(`Email: ${newUser.email}`);
        console.log(`Password: ${newUser.password}`);
        console.log(`Name: ${newUser.name}`);

    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        mongoose.connection.close();
    }
};

createUser();
