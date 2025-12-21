import { investmentProfileAPI } from './investmentProfileAPI';

/**
 * Syncs investment form data to the Investment Profile (Online Access)
 * @param {Object} formData - The data from the investment form
 * @param {string} type - The type of investment ('NpsPpfInvestment' or 'GoldSgbInvestment')
 */
export const syncInvestmentProfileFromForm = async (formData, type) => {
    try {
        if (!formData) return;

        if (type === 'NpsPpfInvestment') {
            // For NPS/PPF, we only sync if we have an account number or it's a specific named account
            if (!formData.accountNumber && !formData.name) return;

            // Check if profile exists (simple check by name for now, or fetch all and filter)
            // Since we don't want to create duplicates, we'll fetch existing first
            const existingRes = await investmentProfileAPI.getNpsPpf();
            const existingProfiles = existingRes.data.data || [];

            // Check for duplicate based on Account Number (if clear unique ID) or Name + Investor combo
            const exists = existingProfiles.some(profile => {
                if (formData.accountNumber && profile.accountNumber === formData.accountNumber) return true;
                if (profile.name === formData.name && profile.nameOfInvestor === formData.nameOfInvestor) return true;
                return false;
            });

            if (!exists) {
                const newProfile = {
                    name: formData.name,
                    accountNumber: formData.accountNumber || '',
                    subBroker: formData.subBroker || '',
                    nameOfInvestor: formData.nameOfInvestor || '',
                    notes: formData.notes || `Auto-created from ${formData.type} Investment`
                };
                await investmentProfileAPI.createNpsPpf(newProfile);
                console.log('Synced to NPS/PPF Profile:', newProfile.name);
            }
        } else if (type === 'GoldSgbInvestment') {
            // For Gold/SGB
            if (!formData.provider && !formData.name) return;

            const existingRes = await investmentProfileAPI.getGoldBonds();
            const existingProfiles = existingRes.data.data || [];

            const exists = existingProfiles.some(profile => {
                // Gold doesn't always have a unique account number in the form, so use Provider + Name match
                // Or if user provided specific details that match
                return profile.name === formData.name &&
                    profile.provider === formData.provider &&
                    profile.nameOfInvestor === formData.nameOfInvestor;
            });

            if (!exists) {
                const newProfile = {
                    name: formData.name,
                    provider: formData.provider || '',
                    subBroker: formData.subBroker || '',
                    nameOfInvestor: formData.nameOfInvestor || '',
                    notes: formData.notes || `Auto-created from ${formData.type} Investment`
                };
                await investmentProfileAPI.createGoldBonds(newProfile);
                console.log('Synced to Gold/Bonds Profile:', newProfile.name);
            }
        }
    } catch (error) {
        console.error('Error syncing to Investment Profile:', error);
        // Silent fail so we don't block the main save
    }
};
