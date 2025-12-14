import { investmentAPI } from './investmentAPI';

/**
 * Sync bill dates and payment schedules to Bill Dates & Bill Checklist
 * Extracts billing information from various forms and creates/updates bill entries
 * 
 * @param {Object} formData - The form data containing billing information
 * @param {String} formType - The type/name of the source form
 * @returns {Promise<Object>} Result of the sync operation
 */
export const syncBillScheduleFromForm = async (formData, formType) => {
    try {
        const bills = extractBillsFromForm(formData, formType);

        if (bills.length === 0) {
            console.log('No bills to sync from', formType);
            return { success: true, message: 'No bills to sync', count: 0 };
        }

        const results = [];
        for (const bill of bills) {
            try {
                // Check if bill already exists
                const existing = await findExistingBill(bill);

                if (existing) {
                    // Update existing bill
                    await investmentAPI.update(existing._id, toBillPayload(bill));
                    results.push({ action: 'updated', provider: bill.provider });
                } else {
                    // Create new bill
                    await investmentAPI.create(toBillPayload(bill));
                    results.push({ action: 'created', provider: bill.provider });
                }
            } catch (error) {
                console.error(`Error syncing bill for ${bill.provider}:`, error);
                results.push({ action: 'failed', provider: bill.provider, error: error.message });
            }
        }

        console.log(`✅ Synced ${results.length} bill(s) from ${formType}:`, results);

        return {
            success: true,
            message: `Synced ${results.length} bill(s)`,
            count: results.length,
            results
        };
    } catch (error) {
        console.error('Error in syncBillScheduleFromForm:', error);
        return {
            success: false,
            message: error.message,
            count: 0
        };
    }
};

/**
 * Convert bill data to investment API payload format
 */
const toBillPayload = (bill) => ({
    category: 'daily-bill-checklist',
    type: 'Bill',
    name: `${bill.billType} - ${bill.billName || bill.provider || ''}`.trim(),
    provider: bill.provider || bill.billType,
    accountNumber: bill.accountNumber || '',
    amount: Number(bill.amount) || 0,
    startDate: bill.startDate || new Date().toISOString().slice(0, 10),
    maturityDate: bill.dueDate || undefined,
    frequency: bill.cycle || 'monthly',
    notes: JSON.stringify({
        ...bill,
        syncedFrom: bill.source,
        lastSynced: new Date().toISOString()
    }),
});

/**
 * Extract bill information from form data based on form type
 */
const extractBillsFromForm = (formData, formType) => {
    const bills = [];

    switch (formType) {
        case 'MobileEmailDetails':
            // Extract mobile bill
            if (formData.type === 'Mobile' && formData.planName && formData.amount) {
                bills.push({
                    billType: 'Mobile',
                    billName: formData.planName,
                    provider: formData.carrier || 'Mobile Carrier',
                    accountNumber: formData.mobile || formData.accountNo || '',
                    cycle: 'monthly',
                    amount: formData.amount || formData.planCost || 0,
                    dueDate: formData.planExpiryDate || calculateNextBillDate(formData.billDate),
                    autoDebit: formData.autoRenewal || false,
                    paymentMethod: 'UPI',
                    status: 'pending',
                    startDate: formData.planStartDate || new Date().toISOString().slice(0, 10),
                    source: 'MobileEmailDetails',
                    notes: `Mobile: ${formData.mobile || 'N/A'}, Plan: ${formData.planName || 'N/A'}`
                });
            }

            // Extract email subscription bill (if paid)
            if (formData.type === 'Email' && formData.isPaid && formData.subscriptionCost) {
                bills.push({
                    billType: 'Internet',
                    billName: `Email - ${formData.provider}`,
                    provider: formData.provider || 'Email Provider',
                    accountNumber: formData.email || '',
                    cycle: 'yearly',
                    amount: formData.subscriptionCost || 0,
                    dueDate: formData.renewalDate || calculateNextYearlyDate(),
                    autoDebit: formData.autoRenewal || false,
                    paymentMethod: 'Card',
                    status: 'pending',
                    startDate: new Date().toISOString().slice(0, 10),
                    source: 'MobileEmailDetails',
                    notes: `Email: ${formData.email || 'N/A'}`
                });
            }
            break;

        case 'MfInsuranceShares':
            // Extract insurance premium
            if (formData.insuranceType && formData.premium) {
                bills.push({
                    billType: 'Insurance',
                    billName: formData.policyName || 'Insurance Policy',
                    provider: formData.insuranceCompany || 'Insurance Company',
                    accountNumber: formData.policyNumber || '',
                    cycle: formData.premiumFrequency === 'Monthly' ? 'monthly' :
                        formData.premiumFrequency === 'Quarterly' ? 'quarterly' : 'yearly',
                    amount: formData.premium || 0,
                    dueDate: formData.nextPremiumDate || formData.maturityDate,
                    autoDebit: formData.autoDebit || false,
                    paymentMethod: 'NetBanking',
                    status: 'pending',
                    startDate: formData.startDate || new Date().toISOString().slice(0, 10),
                    source: 'MfInsuranceShares',
                    notes: `Policy: ${formData.policyNumber || 'N/A'}, Sum Assured: ${formData.sumAssured || 'N/A'}`
                });
            }

            // Extract SIP
            if (formData.investmentType === 'SIP' && formData.sipAmount) {
                bills.push({
                    billType: 'Investment',
                    billName: `SIP - ${formData.fundName || 'Mutual Fund'}`,
                    provider: formData.amcName || 'AMC',
                    accountNumber: formData.folioNumber || '',
                    cycle: 'monthly',
                    amount: formData.sipAmount || 0,
                    dueDate: formData.sipDate || calculateNextSIPDate(formData.sipDay),
                    autoDebit: true,
                    paymentMethod: 'SIP',
                    status: 'pending',
                    startDate: formData.sipStartDate || new Date().toISOString().slice(0, 10),
                    source: 'MfInsuranceShares',
                    notes: `Fund: ${formData.fundName || 'N/A'}, Folio: ${formData.folioNumber || 'N/A'}`
                });
            }
            break;

        case 'NpsPpfInvestment':
            // Extract NPS contribution
            if (formData.accountType === 'NPS' && formData.contributionAmount) {
                bills.push({
                    billType: 'Investment',
                    billName: 'NPS Contribution',
                    provider: 'National Pension System',
                    accountNumber: formData.pranNumber || formData.accountNumber || '',
                    cycle: formData.contributionFrequency || 'monthly',
                    amount: formData.contributionAmount || 0,
                    dueDate: formData.nextContributionDate || calculateNextMonthlyDate(),
                    autoDebit: formData.autoDebit || false,
                    paymentMethod: 'NetBanking',
                    status: 'pending',
                    startDate: formData.startDate || new Date().toISOString().slice(0, 10),
                    source: 'NpsPpfInvestment',
                    notes: `PRAN: ${formData.pranNumber || 'N/A'}`
                });
            }

            // Extract PPF contribution
            if (formData.accountType === 'PPF' && formData.annualContribution) {
                bills.push({
                    billType: 'Investment',
                    billName: 'PPF Annual Contribution',
                    provider: 'Public Provident Fund',
                    accountNumber: formData.accountNumber || '',
                    cycle: 'yearly',
                    amount: formData.annualContribution || 0,
                    dueDate: formData.contributionDate || calculateNextYearlyDate(),
                    autoDebit: false,
                    paymentMethod: 'NetBanking',
                    status: 'pending',
                    startDate: formData.startDate || new Date().toISOString().slice(0, 10),
                    source: 'NpsPpfInvestment',
                    notes: `Account: ${formData.accountNumber || 'N/A'}`
                });
            }
            break;

        case 'GoldSgbInvestment':
            // Extract SGB interest payment (semi-annual)
            if (formData.investmentType === 'SGB' && formData.interestRate) {
                const interestAmount = (formData.currentValue || formData.purchasePrice || 0) *
                    (formData.interestRate || 2.5) / 100 / 2; // Semi-annual

                bills.push({
                    billType: 'Investment',
                    billName: 'SGB Interest Payment',
                    provider: formData.provider || 'SGB',
                    accountNumber: formData.certificateNumber || '',
                    cycle: 'half-yearly',
                    amount: interestAmount,
                    dueDate: formData.nextInterestDate || calculateNextHalfYearlyDate(),
                    autoDebit: false,
                    paymentMethod: 'Direct Credit',
                    status: 'pending',
                    startDate: formData.purchaseDate || new Date().toISOString().slice(0, 10),
                    source: 'GoldSgbInvestment',
                    notes: `Certificate: ${formData.certificateNumber || 'N/A'}, Maturity: ${formData.maturityDate || 'N/A'}`
                });
            }
            break;

        case 'DigitalAssets':
            // Extract domain renewal
            if (formData.domain && formData.domain.domainName && formData.domain.expiryDate) {
                const renewalDate = new Date(formData.domain.expiryDate);
                renewalDate.setDate(renewalDate.getDate() - 30); // 30 days before expiry

                bills.push({
                    billType: 'Internet',
                    billName: `Domain - ${formData.domain.domainName}`,
                    provider: formData.domain.serviceProvider || 'Domain Registrar',
                    accountNumber: formData.domain.adminId || '',
                    cycle: 'yearly',
                    amount: formData.domain.cost || 1000,
                    dueDate: renewalDate.toISOString().slice(0, 10),
                    autoDebit: formData.domain.autoRenewal || false,
                    paymentMethod: 'Card',
                    status: 'pending',
                    startDate: formData.domain.startDate || new Date().toISOString().slice(0, 10),
                    source: 'DigitalAssets',
                    notes: `Domain: ${formData.domain.domainName}, Expiry: ${formData.domain.expiryDate}`
                });
            }

            // Extract hosting renewal
            if (formData.hosting && formData.hosting.serviceProvider && formData.hosting.expiryDate) {
                bills.push({
                    billType: 'Internet',
                    billName: `Hosting - ${formData.projectName || 'Website'}`,
                    provider: formData.hosting.serviceProvider || 'Hosting Provider',
                    accountNumber: formData.hosting.userId || '',
                    cycle: formData.hosting.billingCycle || 'yearly',
                    amount: formData.hosting.cost || 2000,
                    dueDate: formData.hosting.expiryDate,
                    autoDebit: formData.hosting.autoRenewal || false,
                    paymentMethod: 'Card',
                    status: 'pending',
                    startDate: formData.hosting.startDate || new Date().toISOString().slice(0, 10),
                    source: 'DigitalAssets',
                    notes: `Project: ${formData.projectName || 'N/A'}, Server: ${formData.hosting.serverType || 'N/A'}`
                });
            }

            // Extract SSL renewal
            if (formData.ssl && formData.ssl.expiryDate && formData.ssl.cost) {
                bills.push({
                    billType: 'Internet',
                    billName: `SSL Certificate - ${formData.projectName || 'Website'}`,
                    provider: formData.ssl.provider || 'SSL Provider',
                    accountNumber: '',
                    cycle: 'yearly',
                    amount: formData.ssl.cost || 500,
                    dueDate: formData.ssl.expiryDate,
                    autoDebit: formData.ssl.autoRenewal || false,
                    paymentMethod: 'Card',
                    status: 'pending',
                    startDate: new Date().toISOString().slice(0, 10),
                    source: 'DigitalAssets',
                    notes: `SSL Type: ${formData.ssl.type || 'N/A'}`
                });
            }
            break;

        case 'MembershipList':
            // Extract membership renewal
            if (formData.organizationName && formData.amount) {
                const cycle = formData.paymentFrequency === 'Monthly' ? 'monthly' :
                    formData.paymentFrequency === 'Quarterly' ? 'quarterly' :
                        formData.paymentFrequency === 'Yearly' ? 'yearly' : 'one-time';

                bills.push({
                    billType: formData.membershipType || 'Membership',
                    billName: formData.organizationName,
                    provider: formData.organizationName,
                    accountNumber: formData.membershipNumber || '',
                    cycle: cycle,
                    amount: formData.amount || 0,
                    dueDate: formData.renewalDate || formData.endDate,
                    autoDebit: formData.autoRenewal || false,
                    paymentMethod: 'UPI',
                    status: formData.status === 'Active' ? 'pending' : 'inactive',
                    startDate: formData.startDate || new Date().toISOString().slice(0, 10),
                    source: 'MembershipList',
                    notes: `Member: ${formData.memberName || 'N/A'}, Benefits: ${(formData.benefits || []).join(', ')}`
                });
            }
            break;

        default:
            console.warn(`Unknown form type for bill sync: ${formType}`);
            break;
    }

    return bills.filter(bill =>
        bill.provider &&
        bill.provider.trim() !== '' &&
        bill.amount > 0
    );
};

/**
 * Find existing bill by provider and account number
 */
const findExistingBill = async (bill) => {
    try {
        const response = await investmentAPI.getAll('daily-bill-checklist');
        const bills = response.data.investments || [];

        // Try to find by provider + account number match
        const existing = bills.find(b => {
            const bProvider = (b.provider || '').toLowerCase().trim();
            const billProvider = (bill.provider || '').toLowerCase().trim();
            const bAccount = (b.accountNumber || '').toLowerCase().trim();
            const billAccount = (bill.accountNumber || '').toLowerCase().trim();

            // Match by provider and account number
            if (bProvider === billProvider && bAccount === billAccount && bAccount !== '') {
                return true;
            }

            // Match by provider and bill type if no account number
            if (bProvider === billProvider && !billAccount) {
                let notes = {};
                try { notes = b.notes ? JSON.parse(b.notes) : {}; } catch { }
                return notes.billType === bill.billType;
            }

            return false;
        });

        return existing || null;
    } catch (error) {
        console.error('Error finding existing bill:', error);
        return null;
    }
};

// Helper functions for date calculations

const calculateNextBillDate = (billDay) => {
    if (!billDay) return null;
    const today = new Date();
    let nextDate = new Date(today.getFullYear(), today.getMonth(), parseInt(billDay));
    if (nextDate < today) {
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    return nextDate.toISOString().slice(0, 10);
};

const calculateNextMonthlyDate = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return nextMonth.toISOString().slice(0, 10);
};

const calculateNextYearlyDate = () => {
    const today = new Date();
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    return nextYear.toISOString().slice(0, 10);
};

const calculateNextHalfYearlyDate = () => {
    const today = new Date();
    const nextDate = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
    return nextDate.toISOString().slice(0, 10);
};

const calculateNextSIPDate = (sipDay) => {
    if (!sipDay) return calculateNextMonthlyDate();
    return calculateNextBillDate(sipDay);
};

export default {
    syncBillScheduleFromForm,
};
