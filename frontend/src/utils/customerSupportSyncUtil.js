import { staticAPI } from './staticAPI';

/**
 * Sync customer care/support information to Customer Support
 * Extracts customer support details from form data and creates/updates support entries
 * 
 * @param {Object} formData - The form data containing customer support information
 * @param {String} formType - The type/name of the source form
 * @returns {Promise<Object>} Result of the sync operation
 */
export const syncCustomerSupportFromForm = async (formData, formType) => {
    try {
        const supportEntries = extractCustomerSupportFromForm(formData, formType);

        if (supportEntries.length === 0) {
            return { success: true, message: 'No customer support to sync', count: 0 };
        }

        const results = [];
        for (const entry of supportEntries) {
            try {
                // Check if support entry already exists
                const existing = await findExistingSupport(entry);

                if (existing) {
                    // Update existing entry
                    await staticAPI.updateCustomerSupport(existing._id, entry);
                    results.push({ action: 'updated', company: entry.companyName });
                } else {
                    // Create new entry
                    await staticAPI.createCustomerSupport(entry);
                    results.push({ action: 'created', company: entry.companyName });
                }
            } catch (error) {
                console.error(`Error syncing support for ${entry.companyName}:`, error);
                results.push({ action: 'failed', company: entry.companyName, error: error.message });
            }
        }

        return {
            success: true,
            message: `Synced ${results.length} customer support record(s)`,
            count: results.length,
            results
        };
    } catch (error) {
        console.error('Error in syncCustomerSupportFromForm:', error);
        return {
            success: false,
            message: error.message,
            count: 0
        };
    }
};

/**
 * Extract customer support information from form data based on form type
 */
const extractCustomerSupportFromForm = (formData, formType) => {
    const supportEntries = [];

    switch (formType) {
        case 'InventoryRecord':
            // Extract customer care contact
            if (formData.companyName && (formData.customerCareNumber || formData.customerCareEmail)) {
                supportEntries.push({
                    type: 'Product Support',
                    companyName: formData.companyName,
                    serviceCategory: 'Product Support',
                    contactPerson: '',
                    phone: formData.customerCareNumber || '',
                    email: formData.customerCareEmail || '',
                    website: '',
                    supportHours: '',
                    notes: `Source: Inventory Record - ${formData.itemName || 'Item'}\nModel: ${formData.modelName || 'N/A'}\nService Center: ${formData.serviceCenterNumber || 'N/A'}`,
                });
            }

            // Extract service center contact (if different)
            if (formData.serviceCenterNumber && formData.companyName) {
                supportEntries.push({
                    type: 'Technical Support',
                    companyName: `${formData.companyName} Service Center`,
                    serviceCategory: 'Technical Support',
                    contactPerson: '',
                    phone: formData.serviceCenterNumber || '',
                    email: formData.customerCareEmail || '',
                    website: '',
                    supportHours: '',
                    notes: `Source: Inventory Record - Service Center for ${formData.itemName || 'Item'}`,
                });
            }
            break;

        case 'DigitalAssets':
            // Extract hosting support
            if (formData.hosting?.serviceProvider && formData.hosting?.userId) {
                supportEntries.push({
                    type: 'Technical Support',
                    companyName: formData.hosting.serviceProvider,
                    serviceCategory: 'Technical Support',
                    contactPerson: '',
                    phone: '',
                    email: formData.hosting.userId || '',
                    website: '',
                    supportHours: '',
                    notes: `Source: Digital Assets - Hosting Support for ${formData.projectName || 'Website'}\nServer Type: ${formData.hosting.serverType || 'N/A'}`,
                });
            }

            // Extract domain support
            if (formData.domain?.serviceProvider && formData.domain?.adminId) {
                supportEntries.push({
                    type: 'Account Support',
                    companyName: formData.domain.serviceProvider,
                    serviceCategory: 'Account Support',
                    contactPerson: '',
                    phone: '',
                    email: formData.domain.adminId || formData.admin?.recoveryEmail || '',
                    website: '',
                    supportHours: '',
                    notes: `Source: Digital Assets - Domain Support for ${formData.projectName || 'Website'}\nDomain: ${formData.domain.domainName || 'N/A'}`,
                });
            }
            break;

        case 'PersonalRecords':
            // Extract issuing authority support (if has contact info)
            if (formData.issuingAuthority && (formData.mobileNumber || formData.emailId)) {
                supportEntries.push({
                    type: 'General Inquiry',
                    companyName: formData.issuingAuthority,
                    serviceCategory: 'General Inquiry',
                    contactPerson: formData.nameOnId || '',
                    phone: formData.mobileNumber || '',
                    email: formData.emailId || '',
                    website: formData.url || '',
                    supportHours: '',
                    notes: `Source: Personal Records - ${formData.docType || 'Document'}\nID: ${formData.idNumber || 'N/A'}`,
                });
            }
            break;

        case 'MobileEmailDetails':
            // Extract carrier/provider customer care
            if ((formData.carrier || formData.provider) && (formData.customerCareNo || formData.customerCareEmail)) {
                const serviceType = formData.type === 'Mobile' ? 'Mobile Carrier' : 'Email Provider';
                supportEntries.push({
                    type: 'Customer Service',
                    companyName: formData.carrier || formData.provider,
                    serviceCategory: formData.type === 'Mobile' ? 'Technical Support' : 'Account Support',
                    contactPerson: '',
                    phone: formData.customerCareNo || '',
                    email: formData.customerCareEmail || '',
                    website: '',
                    supportHours: '',
                    notes: `Source: Mobile & Email Details - ${serviceType}\n${formData.type === 'Mobile' ? 'Mobile' : 'Email'}: ${formData.mobile || formData.email || 'N/A'}\nPlan: ${formData.planName || 'N/A'}\nAccount No: ${formData.accountNo || 'N/A'}`,
                });
            }
            break;

        default:
            console.warn(`Unknown form type for customer support sync: ${formType}`);
            break;
    }

    return supportEntries.filter(entry =>
        entry.companyName &&
        entry.companyName.trim() !== '' &&
        (entry.phone || entry.email)
    );
};

/**
 * Find existing customer support entry by company name
 */
const findExistingSupport = async (entry) => {
    try {
        const response = await staticAPI.getCustomerSupport();
        const entries = response.data || [];

        // Try to find by exact company name match
        const existing = entries.find(e =>
            e.companyName && entry.companyName &&
            e.companyName.toLowerCase().trim() === entry.companyName.toLowerCase().trim()
        );

        return existing || null;
    } catch (error) {
        console.error('Error finding existing support entry:', error);
        return null;
    }
};
