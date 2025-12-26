const mongoose = require('mongoose');
const BankTransaction = require('./models/BankTransaction');
require('dotenv').config();

async function checkLatestTransaction() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Fetch the 5 most recently UPDATED transactions
        const transactions = await BankTransaction.find().sort({ updatedAt: -1 }).limit(5);

        if (transactions.length > 0) {
            console.log('Top 5 Latest Updated Transactions:');
            transactions.forEach((t, i) => {
                console.log(`\n--- Transaction ${i + 1} ---`);
                console.log(`ID: ${t._id}`);
                console.log(`Created At: ${t.createdAt}`);
                console.log(`Updated At: ${t.updatedAt}`);
                console.log(`Merchant: ${t.merchant}`);
                console.log(`Broader Category: '${t.broaderCategory}'`);
                console.log(`Main Category: '${t.mainCategory}'`);
                console.log(`Sub Category: '${t.subCategory}'`);
            });
        } else {
            console.log('No transactions found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

checkLatestTransaction();
