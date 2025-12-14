import { investmentAPI } from './investmentAPI';

const REMINDERS_CATEGORY = 'reminders-notifications';

/**
 * Sync important dates and reminders from forms to Reminders & Notifications
 * This extracts renewal dates, expiry dates, warranty dates etc. and creates reminders
 * Stores reminders in backend for user-specific data isolation
 * 
 * @param {Object} formData - The form data containing date fields
 * @param {String} formType - The type/name of the source form
 * @returns {Promise<Object>} Result of the sync operation
 */
export const syncRemindersFromForm = async (formData, formType) => {
    try {
        const reminders = extractRemindersFromForm(formData, formType);

        if (reminders.length === 0) {
            console.log('No reminders to sync from', formType);
            return { success: true, message: 'No reminders to sync', count: 0 };
        }

        // Create reminders in backend
        const results = [];
        for (const reminder of reminders) {
            try {
                await createReminder(reminder);
                results.push({ success: true, title: reminder.title });
            } catch (error) {
                console.error(`Error creating reminder: ${reminder.title}`, error);
                results.push({ success: false, title: reminder.title });
            }
        }

        console.log(`✅ Created ${results.length} reminder(s) from ${formType}:`, results);

        return {
            success: true,
            message: `Created ${results.length} reminder(s)`,
            count: results.length,
            reminders: results
        };
    } catch (error) {
        console.error('Error in syncRemindersFromForm:', error);
        return {
            success: false,
            message: error.message,
            count: 0
        };
    }
};

/**
 * Extract reminder/date information from form data based on form type
 */
const extractRemindersFromForm = (formData, formType) => {
    const reminders = [];

    switch (formType) {
        case 'InventoryRecord':
            // Extract warranty expiry reminder
            if (formData.warrantyExpiry) {
                const warrantyDate = new Date(formData.warrantyExpiry);
                const reminderDate = new Date(warrantyDate);
                reminderDate.setDate(reminderDate.getDate() - 30); // 30 days before expiry

                reminders.push({
                    title: `Warranty Expiring - ${formData.itemName || 'Item'}`,
                    description: `Warranty for ${formData.itemName} (${formData.companyName || 'N/A'}) expires on ${warrantyDate.toLocaleDateString()}`,
                    dateTime: reminderDate.toISOString().slice(0, 16),
                    type: 'one-time',
                    repeat: 'none',
                    priority: 'medium',
                    category: 'personal',
                    method: 'notification',
                    status: 'active',
                    source: 'Inventory Record',
                    sourceData: {
                        itemName: formData.itemName,
                        companyName: formData.companyName,
                        expiryDate: formData.warrantyExpiry
                    }
                });
            }

            // Extract AMC renewal reminder
            if (formData.amcRenewalDate) {
                const amcDate = new Date(formData.amcRenewalDate);
                const reminderDate = new Date(amcDate);
                reminderDate.setDate(reminderDate.getDate() - 15); // 15 days before renewal

                reminders.push({
                    title: `AMC Renewal - ${formData.itemName || 'Item'}`,
                    description: `AMC for ${formData.itemName} needs renewal on ${amcDate.toLocaleDateString()}`,
                    dateTime: reminderDate.toISOString().slice(0, 16),
                    type: 'one-time',
                    repeat: 'none',
                    priority: 'high',
                    category: 'personal',
                    method: 'notification',
                    status: 'active',
                    source: 'Inventory Record',
                    sourceData: {
                        itemName: formData.itemName,
                        renewalDate: formData.amcRenewalDate
                    }
                });
            }
            break;

        case 'MembershipList':
            // Extract membership renewal reminder
            if (formData.renewalDate || formData.endDate) {
                const renewalDate = new Date(formData.renewalDate || formData.endDate);
                const reminderDate = new Date(renewalDate);
                reminderDate.setDate(reminderDate.getDate() - 7); // 7 days before renewal

                reminders.push({
                    title: `Membership Renewal - ${formData.organizationName}`,
                    description: `${formData.membershipType} membership at ${formData.organizationName} ${formData.renewalDate ? 'renewal' : 'expires'} on ${renewalDate.toLocaleDateString()}. Amount: ${formData.amount} ${formData.currency}`,
                    dateTime: reminderDate.toISOString().slice(0, 16),
                    type: formData.paymentFrequency === 'Monthly' ? 'recurring' : 'one-time',
                    repeat: formData.paymentFrequency === 'Monthly' ? 'monthly' : (formData.paymentFrequency === 'Yearly' ? 'yearly' : 'none'),
                    priority: 'high',
                    category: 'bills',
                    method: 'notification',
                    status: formData.status === 'Active' ? 'active' : 'paused',
                    source: 'Membership List',
                    sourceData: {
                        organizationName: formData.organizationName,
                        membershipType: formData.membershipType,
                        amount: formData.amount,
                        currency: formData.currency,
                        renewalDate: formData.renewalDate || formData.endDate
                    }
                });
            }

            // Extract end date expiry reminder
            if (formData.endDate) {
                const endDate = new Date(formData.endDate);
                const today = new Date();

                // Only add if end date is in future
                if (endDate > today) {
                    const reminderDate = new Date(endDate);
                    reminderDate.setDate(reminderDate.getDate() - 3); // 3 days before expiry

                    reminders.push({
                        title: `Membership Expiring - ${formData.organizationName}`,
                        description: `${formData.membershipType} membership at ${formData.organizationName} expires on ${endDate.toLocaleDateString()}`,
                        dateTime: reminderDate.toISOString().slice(0, 16),
                        type: 'one-time',
                        repeat: 'none',
                        priority: 'medium',
                        category: 'personal',
                        method: 'notification',
                        status: 'active',
                        source: 'Membership List',
                        sourceData: {
                            organizationName: formData.organizationName,
                            endDate: formData.endDate
                        }
                    });
                }
            }
            break;

        case 'MobileEmailDetails':
            // Extract plan expiry/renewal reminder
            if (formData.planExpiryDate) {
                const expiryDate = new Date(formData.planExpiryDate);
                const reminderDate = new Date(expiryDate);
                reminderDate.setDate(reminderDate.getDate() - 5); // 5 days before expiry

                reminders.push({
                    title: `${formData.type} Plan Expiry - ${formData.carrier || formData.provider}`,
                    description: `${formData.type} plan (${formData.planName || 'N/A'}) for ${formData.mobile || formData.email} expires on ${expiryDate.toLocaleDateString()}`,
                    dateTime: reminderDate.toISOString().slice(0, 16),
                    type: 'one-time',
                    repeat: 'none',
                    priority: 'high',
                    category: 'bills',
                    method: 'notification',
                    status: 'active',
                    source: 'Mobile & Email Details',
                    sourceData: {
                        type: formData.type,
                        carrier: formData.carrier || formData.provider,
                        planName: formData.planName,
                        identifier: formData.mobile || formData.email,
                        expiryDate: formData.planExpiryDate
                    }
                });
            }

            // Extract bill date reminder (if monthly)
            if (formData.billDate && formData.planName) {
                // Calculate next bill date
                const today = new Date();
                const billDay = parseInt(formData.billDate);
                let nextBillDate = new Date(today.getFullYear(), today.getMonth(), billDay);

                if (nextBillDate < today) {
                    nextBillDate.setMonth(nextBillDate.getMonth() + 1);
                }

                const reminderDate = new Date(nextBillDate);
                reminderDate.setDate(reminderDate.getDate() - 2); // 2 days before bill date

                reminders.push({
                    title: `${formData.type} Bill Due - ${formData.carrier || formData.provider}`,
                    description: `Monthly bill for ${formData.mobile || formData.email} (${formData.planName}) due on ${formData.billDate}th of every month`,
                    dateTime: reminderDate.toISOString().slice(0, 16),
                    type: 'recurring',
                    repeat: 'monthly',
                    priority: 'high',
                    category: 'bills',
                    method: 'notification',
                    status: 'active',
                    source: 'Mobile & Email Details',
                    sourceData: {
                        type: formData.type,
                        carrier: formData.carrier || formData.provider,
                        billDate: formData.billDate
                    }
                });
            }
            break;

        case 'PersonalRecords':
            // Extract expiry date reminder
            if (formData.expiryDate) {
                const expiryDate = new Date(formData.expiryDate);
                const reminderDate = new Date(expiryDate);
                reminderDate.setDate(reminderDate.getDate() - 30); // 30 days before expiry

                reminders.push({
                    title: `${formData.docType} Expiring`,
                    description: `${formData.docType} for ${formData.nameOnId} expires on ${expiryDate.toLocaleDateString()}. ID: ${formData.idNumber || 'N/A'}`,
                    dateTime: reminderDate.toISOString().slice(0, 16),
                    type: 'one-time',
                    repeat: 'none',
                    priority: 'high',
                    category: 'personal',
                    method: 'notification',
                    status: 'active',
                    source: 'Personal Records',
                    sourceData: {
                        docType: formData.docType,
                        nameOnId: formData.nameOnId,
                        idNumber: formData.idNumber,
                        expiryDate: formData.expiryDate
                    }
                });
            }
            break;

        default:
            console.warn(`Unknown form type for reminder sync: ${formType}`);
            break;
    }

    // Filter out past reminders and invalid dates
    const today = new Date();
    return reminders.filter(reminder => {
        try {
            const reminderDate = new Date(reminder.dateTime);
            return reminderDate > today && !isNaN(reminderDate.getTime());
        } catch {
            return false;
        }
    });
};

/**
 * Get all reminders from backend
 */
export const getRemindersFromStorage = async () => {
    try {
        const response = await investmentAPI.getAll(REMINDERS_CATEGORY);
        const reminders = (response.data.investments || []).map(inv => {
            let notes = {};
            try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { }
            return {
                id: inv._id,
                title: notes.title || inv.name || '',
                description: notes.description || '',
                dateTime: notes.dateTime || inv.startDate || '',
                type: notes.type || 'one-time',
                repeat: notes.repeat || 'none',
                priority: notes.priority || 'medium',
                category: notes.category || 'personal',
                method: notes.method || 'notification',
                status: notes.status || 'active',
                source: notes.source || '',
                sourceData: notes.sourceData || {}
            };
        });
        return reminders;
    } catch (error) {
        console.error('Error fetching reminders:', error);
        return [];
    }
};

/**
 * Create a new reminder in backend
 */
export const createReminder = async (reminder) => {
    try {
        const payload = {
            category: REMINDERS_CATEGORY,
            type: 'Reminder',
            name: reminder.title,
            startDate: reminder.dateTime || new Date().toISOString().slice(0, 10),
            frequency: reminder.type === 'recurring' ? reminder.repeat : 'one-time',
            notes: JSON.stringify(reminder)
        };
        await investmentAPI.create(payload);
        return true;
    } catch (error) {
        console.error('Error creating reminder:', error);
        return false;
    }
};

/**
 * Save reminders list to backend (batch operation)
 */
export const saveRemindersToStorage = async (reminders) => {
    // This is called from RemindersNotifications when adding a new reminder
    // We should create individual reminders instead
    return true;
};

/**
 * Delete a reminder from backend
 */
export const deleteReminderFromStorage = async (reminderId) => {
    try {
        await investmentAPI.delete(reminderId);
        return true;
    } catch (error) {
        console.error('Error deleting reminder:', error);
        return false;
    }
};

/**
 * Update reminder status in backend
 */
export const updateReminderStatus = async (reminderId, newStatus) => {
    try {
        // First get the reminder
        const reminders = await getRemindersFromStorage();
        const reminder = reminders.find(r => r.id === reminderId);

        if (reminder) {
            reminder.status = newStatus;
            const payload = {
                category: REMINDERS_CATEGORY,
                type: 'Reminder',
                name: reminder.title,
                startDate: reminder.dateTime || new Date().toISOString().slice(0, 10),
                frequency: reminder.type === 'recurring' ? reminder.repeat : 'one-time',
                notes: JSON.stringify(reminder)
            };
            await investmentAPI.update(reminderId, payload);
        }

        return true;
    } catch (error) {
        console.error('Error updating reminder status:', error);
        return false;
    }
};

export default {
    syncRemindersFromForm,
    getRemindersFromStorage,
    createReminder,
    saveRemindersToStorage,
    deleteReminderFromStorage,
    updateReminderStatus
};
