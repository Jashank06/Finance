const Reminder = require('../models/monitoring/Reminder');

/**
 * Core function to sync a single reminder
 */
const syncReminder = async ({
    userId,
    title,
    date,
    category = 'personal',
    referenceId,
    referenceType,
    description = '',
    daysBefore = 0, // 0 means on the day
    recurring = false,
    frequency = 'yearly' // only used if recurring is true
}) => {
    if (!date) return;

    try {
        let reminderDate;
        if (date instanceof Date) {
            reminderDate = new Date(date);
        } else if (typeof date === 'string') {
            // Check for DD/MM/YYYY or DD-MM-YYYY format (common in India)
            if (/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.test(date)) {
                const parts = date.split(/[-/]/);
                // Note: Month is 0-indexed in JS Date
                reminderDate = new Date(parts[2], parts[1] - 1, parts[0]);
            } else {
                reminderDate = new Date(date);
            }
        } else {
            reminderDate = new Date(date);
        }

        if (isNaN(reminderDate.getTime())) {
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // For recurring events (birthday, anniversary, cyclic bills), 
        // ensure the dateTime is the NEXT occurrence.
        // We compare against the actual event date (not subtracted date).
        if (recurring) {
            reminderDate.setFullYear(today.getFullYear());
            // If the date has already passed this year, move to next year
            if (reminderDate < today) {
                if (frequency === 'yearly') {
                    reminderDate.setFullYear(today.getFullYear() + 1);
                } else if (frequency === 'monthly') {
                    reminderDate.setMonth(today.getMonth() + 1);
                    if (reminderDate < today) {
                        reminderDate.setMonth(today.getMonth() + 2);
                    }
                }
            }
        } else {
            // For one-time events, if the date has passed, we don't sync it
            if (reminderDate < today) {
                return;
            }
        }

        // Set leadDays based on frequency or default
        let leadDaysCount = 7;
        if (recurring) {
            if (frequency === 'yearly') leadDaysCount = 15;
            else if (frequency === 'monthly') leadDaysCount = 10;
        }

        const query = {
            userId,
            referenceId,
            referenceType
        };

        const reminderData = {
            userId,
            title,
            description,
            dateTime: reminderDate, // THE ACTUAL EVENT DATE
            category,
            type: recurring ? 'recurring' : 'one-time',
            repeat: recurring ? frequency : undefined,
            leadDays: leadDaysCount,
            referenceId,
            referenceType,
            status: 'active',
            priority: 'medium'
        };

        // Check if reminder exists
        const existingReminder = await Reminder.findOne(query);

        if (existingReminder) {
            // Update existing
            Object.assign(existingReminder, reminderData);
            await existingReminder.save();
        } else {
            // Create new
            await Reminder.create(reminderData);
        }
    } catch (error) {
        console.error('Error syncing reminder:', error);
    }
};

/**
 * Delete reminders linked to a reference
 */
const deleteReminders = async (referenceId) => {
    try {
        await Reminder.deleteMany({ referenceId });
        console.log(`Deleted reminders for reference: ${referenceId}`);
    } catch (error) {
        console.error('Error deleting reminders:', error);
    }
};


// --- Module Specific Sync Functions ---

const syncInventoryToReminders = async (item) => {
    if (item.warrantyExpiry) {
        await syncReminder({
            userId: item.userId,
            title: `Warranty Expiry: ${item.itemName}`,
            date: item.warrantyExpiry,
            category: 'bills', // or 'shopping' / 'maintenance'
            referenceId: item._id,
            referenceType: 'InventoryRecord',
            description: `Warranty expiring for ${item.itemName} (${item.companyName || ''})`,
            daysBefore: 7 // Remind 1 week before
        });
    }
};

const syncFamilyProfileToReminders = async (profile) => {
    console.log(`Syncing Family Profile reminders for user: ${profile.userId}`);

    // 1. Top-level Anniversary
    if (profile.anniversaryDate) {
        console.log(`Found top-level anniversary: ${profile.anniversaryDate}`);
        await syncReminder({
            userId: profile.userId,
            title: `Anniversary: ${profile.firstName || 'Family'}`,
            date: profile.anniversaryDate,
            category: 'family',
            referenceId: profile._id,
            referenceType: 'FamilyProfile_Anniversary',
            recurring: true,
            frequency: 'yearly',
            daysBefore: 3
        });
    }

    // 2. Family Members
    let members = [];
    if (profile.familyMembers && profile.familyMembers.length > 0) {
        members = profile.familyMembers;
    } else if (profile.members && profile.members.length > 0) {
        members = profile.members;
    }

    if (members && members.length > 0) {
        for (const member of members) {

            // Birthday
            if (member.dateOfBirth) {
                await syncReminder({
                    userId: profile.userId,
                    title: `Birthday: ${member.name}`,
                    date: member.dateOfBirth,
                    category: 'family',
                    referenceId: member._id,
                    referenceType: 'FamilyMember_Birthday',
                    recurring: true,
                    frequency: 'yearly',
                    daysBefore: 1
                });
            }

            // Anniversary
            if (member.anniversaryDate) {
                await syncReminder({
                    userId: profile.userId,
                    title: `Anniversary: ${member.name}`,
                    date: member.anniversaryDate,
                    category: 'family',
                    referenceId: member._id,
                    referenceType: 'FamilyMember_Anniversary',
                    recurring: true,
                    frequency: 'yearly',
                    daysBefore: 1
                });
            }

            // Documents
            if (member.documents && Array.isArray(member.documents)) {
                for (const doc of member.documents) {
                    if (doc.expiryDate) {
                        await syncReminder({
                            userId: profile.userId,
                            title: `Document Expiry: ${doc.documentType} (${member.name})`,
                            date: doc.expiryDate,
                            category: 'personal',
                            referenceId: doc._id,
                            referenceType: 'FamilyMember_Document_Expiry',
                            description: `ID Number: ${doc.idNumber}`,
                            daysBefore: 30
                        });
                    }
                }
            }
        }
    }
};

const syncBasicDetailsToReminders = async (details) => {
    // 1. Birthday
    if (details.dateOfBirth) {
        await syncReminder({
            userId: details.userId,
            title: `Birthday: ${details.firstName || 'My'} Birthday`,
            date: details.dateOfBirth,
            category: 'personal',
            referenceId: details._id,
            referenceType: 'BasicDetails_Birthday',
            recurring: true,
            frequency: 'yearly',
            daysBefore: 1
        });
    }

    // 2. Anniversary
    if (details.anniversaryDate) {
        await syncReminder({
            userId: details.userId,
            title: `Anniversary: ${details.firstName || 'My'} Anniversary`,
            date: details.anniversaryDate,
            category: 'family',
            referenceId: details._id,
            referenceType: 'BasicDetails_Anniversary',
            recurring: true,
            frequency: 'yearly',
            daysBefore: 3
        });
    }

    // 3. Cards
    if (details.cards && Array.isArray(details.cards)) {
        for (const card of details.cards) {
            if (card.expiryDate) {
                await syncReminder({
                    userId: details.userId,
                    title: `Card Expiry: ${card.bankName} (${card.cardType || 'Card'})`,
                    date: card.expiryDate,
                    category: 'bills',
                    referenceId: card._id,
                    referenceType: 'BasicDetails_Card_Expiry',
                    description: `Card number ending in ${card.cardNumber ? card.cardNumber.slice(-4) : '****'}`,
                    daysBefore: 30
                });
            }
        }
    }

    // 4. Insurance Portfolio
    if (details.insurancePortfolio && Array.isArray(details.insurancePortfolio)) {
        for (const policy of details.insurancePortfolio) {
            if (policy.maturityDate) {
                await syncReminder({
                    userId: details.userId,
                    title: `Policy Maturity: ${policy.policyName} (${policy.insuranceCompany})`,
                    date: policy.maturityDate,
                    category: 'health',
                    referenceId: policy._id,
                    referenceType: 'BasicDetails_Insurance_Maturity',
                    daysBefore: 30
                });
            }
        }
    }
};

const syncMembershipToReminders = async (membership) => {
    if (membership.expiryDate) {
        await syncReminder({
            userId: membership.userId,
            title: `Membership Renewal: ${membership.name || 'Membership'}`,
            date: membership.expiryDate,
            category: 'personal',
            referenceId: membership._id,
            referenceType: 'MembershipList',
            daysBefore: 15
        });
    }
};

const syncPersonalRecordToReminders = async (record) => {
    if (record.expiryDate) {
        await syncReminder({
            userId: record.userId,
            title: `Document Expiry: ${record.docType}`,
            date: record.expiryDate,
            category: 'personal',
            referenceId: record._id,
            referenceType: 'PersonalRecords',
            description: `Expiry for ${record.docType} (${record.idNumber})`,
            daysBefore: 30
        });
    }
};

const syncDigitalAssetToReminders = async (asset) => {
    // Domain Renewal
    if (asset.domain && asset.domain.renewalDate) {
        await syncReminder({
            userId: asset.userId,
            title: `Domain Renewal: ${asset.domain.domainName}`,
            date: asset.domain.renewalDate,
            category: 'work',
            referenceId: asset._id,
            referenceType: 'DigitalAsset_Domain',
            daysBefore: 30
        });
    }

    // Hosting Renewal
    if (asset.hosting && asset.hosting.renewalDate) {
        await syncReminder({
            userId: asset.userId,
            title: `Hosting Renewal: ${asset.projectName}`,
            date: asset.hosting.renewalDate,
            category: 'work',
            referenceId: asset._id,
            referenceType: 'DigitalAsset_Hosting',
            daysBefore: 15
        });
    }

    // SSL Expiry
    if (asset.domain && asset.domain.sslExpiry) {
        await syncReminder({
            userId: asset.userId,
            title: `SSL Expiry: ${asset.domain.domainName}`,
            date: asset.domain.sslExpiry,
            category: 'work',
            referenceId: asset._id,
            referenceType: 'DigitalAsset_SSL',
            daysBefore: 7
        });
    }
};

const syncInsuranceToReminders = async (policy) => {
    // Premium Due
    if (policy.premiumDate || policy.nextPremiumDue) {
        // This is tricky if it's just "5th" or a calculated virtual.
        // Ideally we use a calculated date.
        // For now, if there is a 'nextPremiumDue' (virtual), we might need to handle it on the fly or if the model saves it.
        // If the policy has a specific 'premiumDate' string like "5th", we can't easily make a one-time reminder without logic.
        // BUT if we have `nextPremiumDue` logic in the usage, we can use that.
        // Let's assume we might need to rely on `premiumDate` (Date object) if it exists, or `maturityDate`.
    }

    // Maturity
    if (policy.maturityDate) {
        await syncReminder({
            userId: policy.userId,
            title: `Policy Maturity: ${policy.policyName}`,
            date: policy.maturityDate,
            category: 'health', // or finance
            referenceId: policy._id,
            referenceType: 'Insurance_Maturity',
            daysBefore: 30
        });
    }
};

const syncLoanToReminders = async (loan) => {
    // Closure Date
    if (loan.closureDate) {
        await syncReminder({
            userId: loan.userId,
            title: `Loan Closure: ${loan.loanType}`,
            date: loan.closureDate,
            category: 'bills',
            referenceId: loan._id,
            referenceType: 'Loan_Closure',
            daysBefore: 30
        });
    }
};

const syncInvestmentToReminders = async (investment) => {
    // Collect potential dates
    const targetDate = investment.payableDate || investment.maturityDate;

    // Cleanup old reference types if they exist (Migration/Cleanup)
    if (investment.category === 'daily-bill-checklist' || investment.category === 'daily-bill-checklist-new') {
        const Reminder = require('../models/monitoring/Reminder');
        await Reminder.deleteMany({
            referenceId: investment._id,
            referenceType: 'Investment_Maturity'
        });
    }

    if (targetDate) {
        let title = `Investment Maturity: ${investment.name}`;
        let category = 'bills';
        let referenceType = 'Investment_Maturity';
        let recurring = false;
        let frequency = 'yearly';

        // Check for 'paid' status in notes or root
        let isPaid = investment.status === 'paid';
        if (!isPaid && investment.notes) {
            try {
                const notes = JSON.parse(investment.notes);
                if (notes.status === 'paid') isPaid = true;
            } catch (e) { }
        }

        // Custom handling based on category
        if (investment.category === 'static-inventory-record') {
            title = `Warranty Expiry: ${investment.name}`;
            referenceType = 'InventoryRecord';
        } else if (investment.category === 'daily-bill-checklist' || investment.category === 'daily-bill-checklist-new') {
            title = `Bill Payment: ${investment.name}`;
            referenceType = 'Bill_Payment';
            recurring = (investment.frequency && investment.frequency !== 'one-time');
            frequency = investment.frequency || 'monthly';
        }

        await syncReminder({
            userId: investment.userId,
            title: title,
            date: targetDate,
            category: category,
            referenceId: investment._id,
            referenceType: referenceType,
            recurring: recurring,
            frequency: frequency,
            status: isPaid ? 'paused' : 'active' // Auto-pause if bill is paid
        });
    }
};

module.exports = {
    syncReminder,
    deleteReminders,
    syncInventoryToReminders,
    syncFamilyProfileToReminders,
    syncBasicDetailsToReminders,
    syncMembershipToReminders,
    syncPersonalRecordToReminders,
    syncDigitalAssetToReminders,
    syncInsuranceToReminders,
    syncLoanToReminders,
    syncInvestmentToReminders
};
