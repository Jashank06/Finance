const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// User Schema (matching your User model)
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });

        if (existingAdmin) {
            console.log('Admin user already exists. Updating...');
            existingAdmin.isAdmin = true;
            // Update password
            existingAdmin.password = await bcrypt.hash('admin123', 10);
            await existingAdmin.save();
            console.log('✅ Admin user updated successfully!');
        } else {
            console.log('Creating new admin user...');

            // Hash password
            const hashedPassword = await bcrypt.hash('admin123', 10);

            // Create admin user
            const adminUser = new User({
                name: 'Admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                isAdmin: true
            });

            await adminUser.save();
            console.log('✅ Admin user created successfully!');
        }

        console.log('\nAdmin Credentials:');
        console.log('Email: admin@gmail.com');
        console.log('Password: admin123');
        console.log('\nYou can now login with these credentials.');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

// Run the function
createAdminUser();
