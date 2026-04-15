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
        // Admin credentials
        const adminEmail = 'jashankk908@gmail.com';
        const adminPassword = 'Jay123';
        const adminName = 'Jashank';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists. Updating...');
            existingAdmin.isAdmin = true;
            // Update password
            existingAdmin.password = await bcrypt.hash(adminPassword, 10);
            await existingAdmin.save();
            console.log('✅ Admin user updated successfully!');
        } else {
            console.log('Creating new admin user...');

            // Hash password
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            // Create admin user
            const adminUser = new User({
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                isAdmin: true
            });

            await adminUser.save();
            console.log('✅ Admin user created successfully!');
        }

        console.log('\nAdmin Credentials:');
        console.log('Email:', adminEmail);
        console.log('Password:', adminPassword);
        console.log('\nYou can now login with these credentials.');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

// Run the function
createAdminUser();
