require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

// Import all models
const User = require('../models/User');
const Bank = require('../models/Bank');
const BankTransaction = require('../models/BankTransaction');
const BudgetPlan = require('../models/BudgetPlan');
const Card = require('../models/Card');
const Cash = require('../models/Cash');
const CashMember = require('../models/CashMember');
const CashTransaction = require('../models/CashTransaction');
const Document = require('../models/Document');
const FeatureUsage = require('../models/FeatureUsage');
const Folder = require('../models/Folder');
const IncomeExpense = require('../models/IncomeExpense');
const Insurance = require('../models/Insurance');
const Investment = require('../models/Investment');
const Loan = require('../models/Loan');
const MutualFund = require('../models/MutualFund');
const Payment = require('../models/Payment');
const ProfitLoss = require('../models/ProfitLoss');
const Project = require('../models/Project');
const Share = require('../models/Share');
const Target = require('../models/Target');
const TradingDetails = require('../models/TradingDetails');
const Transaction = require('../models/Transaction');

// Import Investment Profile models
const InvestmentProfile = require('../models/InvestmentProfile');
const BankAccount = mongoose.model('BankAccount');
const CardDetail = mongoose.model('CardDetail');
const PaymentGateway = mongoose.model('PaymentGateway');
const InsuranceProfile = mongoose.model('InsuranceProfile');
const MutualFundProfile = mongoose.model('MutualFundProfile');
const ShareProfile = mongoose.model('ShareProfile');
const NpsPpfProfile = mongoose.model('NpsPpfProfile');
const GoldBondProfile = mongoose.model('GoldBondProfile');

// Import monitoring models
const CalendarEvent = require('../models/monitoring/CalendarEvent');
const CalendarType = require('../models/monitoring/CalendarType');
const Category = require('../models/monitoring/Category');
const Notification = require('../models/monitoring/Notification');
const Reminder = require('../models/monitoring/Reminder');

const EMAIL_TO_DELETE = 'venkates1674@gmail.com';

async function deleteUserData() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find the user
        const user = await User.findOne({ email: EMAIL_TO_DELETE });
        
        if (!user) {
            console.log(`❌ User with email ${EMAIL_TO_DELETE} not found!`);
            process.exit(0);
        }

        console.log(`📧 Found user: ${user.name} (${user.email})`);
        console.log(`🆔 User ID: ${user._id}\n`);

        const userId = user._id;
        let totalDeleted = 0;

        // Delete from all collections
        const collections = [
            { model: Bank, name: 'Banks' },
            { model: BankTransaction, name: 'Bank Transactions' },
            { model: BudgetPlan, name: 'Budget Plans' },
            { model: Card, name: 'Cards' },
            { model: Cash, name: 'Cash' },
            { model: CashMember, name: 'Cash Members' },
            { model: CashTransaction, name: 'Cash Transactions' },
            { model: Document, name: 'Documents' },
            { model: FeatureUsage, name: 'Feature Usage' },
            { model: Folder, name: 'Folders' },
            { model: IncomeExpense, name: 'Income/Expenses' },
            { model: Insurance, name: 'Insurance' },
            { model: Investment, name: 'Investments' },
            { model: Loan, name: 'Loans' },
            { model: MutualFund, name: 'Mutual Funds' },
            { model: Payment, name: 'Payments' },
            { model: ProfitLoss, name: 'Profit/Loss' },
            { model: Project, name: 'Projects' },
            { model: Share, name: 'Shares' },
            { model: Target, name: 'Targets' },
            { model: TradingDetails, name: 'Trading Details' },
            { model: Transaction, name: 'Transactions' },
            { model: BankAccount, name: 'Bank Accounts (Investment Profile)' },
            { model: CardDetail, name: 'Card Details (Investment Profile)' },
            { model: PaymentGateway, name: 'Payment Gateways (Investment Profile)' },
            { model: InsuranceProfile, name: 'Insurance Profiles' },
            { model: MutualFundProfile, name: 'Mutual Fund Profiles' },
            { model: ShareProfile, name: 'Share Profiles' },
            { model: NpsPpfProfile, name: 'NPS/PPF Profiles' },
            { model: GoldBondProfile, name: 'Gold Bond Profiles' },
            { model: CalendarEvent, name: 'Calendar Events' },
            { model: CalendarType, name: 'Calendar Types' },
            { model: Category, name: 'Categories' },
            { model: Notification, name: 'Notifications' },
            { model: Reminder, name: 'Reminders' }
        ];

        console.log('🗑️  Starting deletion process...\n');

        for (const { model, name } of collections) {
            try {
                const result = await model.deleteMany({ userId: userId });
                if (result.deletedCount > 0) {
                    console.log(`✅ Deleted ${result.deletedCount} ${name}`);
                    totalDeleted += result.deletedCount;
                }
            } catch (error) {
                console.log(`⚠️  Error deleting ${name}: ${error.message}`);
            }
        }

        console.log(`\n📊 Total records deleted: ${totalDeleted}`);
        
        // Finally, delete the user
        console.log('\n🗑️  Deleting user account...');
        await User.deleteOne({ _id: userId });
        console.log('✅ User account deleted successfully!');

        console.log('\n✨ Data cleanup completed successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed');
        process.exit(0);
    }
}

// Run the script
deleteUserData();
