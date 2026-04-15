const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
require('dotenv').config();

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const testEmail = 'test@123.com';
        const testPassword = 'test@123';
        const premiumPlanName = 'Premium'; // Name from SubscriptionPlan data

        // Find the Premium plan
        const premiumPlan = await SubscriptionPlan.findOne({ name: premiumPlanName });
        if (!premiumPlan) {
            console.warn(`Premium plan not found! Available plans will be used.`);
        }

        // Check if user already exists
        let user = await User.findOne({ email: testEmail });

        if (user) {
            console.log(`User ${testEmail} already exists. Updating...`);
            user.password = testPassword; // Will be hashed by pre-save
            user.isAdmin = false;
            user.subscriptionStatus = 'active';
            user.subscriptionPlan = premiumPlan ? premiumPlan._id : user.subscriptionPlan;
            user.name = 'Test User';
            user.totalStorage = 100; // 100 GB for test user
            await user.save();
            console.log(`User ${testEmail} updated successfully.`);
        } else {
            console.log(`Creating user ${testEmail}...`);
            user = new User({
                email: testEmail,
                password: testPassword,
                name: 'Test User',
                isAdmin: false,
                subscriptionStatus: 'active',
                subscriptionPlan: premiumPlan ? premiumPlan._id : null,
                totalStorage: 100
            });
            await user.save();
            console.log(`User ${testEmail} created successfully.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error creating test user:', error);
        process.exit(1);
    }
};

createTestUser();
