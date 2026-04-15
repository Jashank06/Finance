import { staticAPI } from './staticAPI';

/**
 * Sync document details from Family Profile to Personal Records
 * Extracts document numbers (PAN, Aadhaar, etc.) from family member data and creates/updates entries
 * 
 * @param {Object} memberData - The family member data containing document information
 * @returns {Promise<Object>} Result of the sync operation
 */
export const syncPersonalRecordsFromFamilyProfile = async (memberData) => {
    try {
        const entries = extractDocumentsFromMember(memberData);

        if (entries.length === 0) {
            return { success: true, message: 'No documents to sync', count: 0 };
        }

        const results = [];
        for (const entry of entries) {
            try {
                // Check if entry already exists
                const existing = await findExistingEntry(entry);

                if (existing) {
                    // Update existing entry
                    await staticAPI.updatePersonalRecord(existing._id, entry);
                    results.push({ action: 'updated', type: entry.docType, value: entry.idNumber });
                } else {
                    // Create new entry
                    await staticAPI.createPersonalRecord(entry);
                    results.push({ action: 'created', type: entry.docType, value: entry.idNumber });
                }
            } catch (error) {
                console.error(`Error syncing ${entry.docType}:`, error);
                results.push({ action: 'failed', type: entry.docType, error: error.message });
            }
        }

        return {
            success: true,
            message: `Synced ${results.length} document entry(ies)`,
            count: results.length,
            results
        };
    } catch (error) {
        console.error('Error in syncPersonalRecordsFromFamilyProfile:', error);
        return {
            success: false,
            message: error.message,
            count: 0
        };
    }
};

/**
 * Extract document information from family member data
 */
const extractDocumentsFromMember = (memberData) => {
    const entries = [];
    const memberName = memberData.name || 'Member';

    // Iterate over dynamic documents array if it exists
    if (memberData.documents && Array.isArray(memberData.documents)) {
        memberData.documents.forEach(doc => {
            if (doc.documentType && doc.idNumber) {
                entries.push({
                    docType: doc.documentType,
                    idNumber: doc.idNumber,
                    nameOnId: memberName, // Always use the family member's name
                    issuingAuthority: doc.issuingAuthority || 'Authority',
                    issueDate: doc.issueDate || '',
                    expiryDate: doc.expiryDate || '',
                    mobileNumber: memberData.mobile || '',
                    emailId: memberData.email || '',
                    notes: `Auto-synced from Family Profile - ${memberName}`,
                    additional: `Relation: ${memberData.relation || ''}`
                });
            }
        });

        return entries;
    }

    // Fallback for legacy fields (preserved for backward compatibility during migration)
    // 1. Aadhaar
    if (memberData.aadhaarNumber && memberData.aadhaarNumber.trim() !== '') {
        entries.push({
            docType: 'Aadhaar',
            idNumber: memberData.aadhaarNumber,
            nameOnId: memberName,
            issuingAuthority: 'UIDAI',
            mobileNumber: memberData.mobile || '',
            emailId: memberData.email || '',
            notes: `Auto-synced from Family Profile - ${memberName}`,
            additional: `Relation: ${memberData.relation || ''}`
        });
    }

    // 2. PAN
    if (memberData.panNumber && memberData.panNumber.trim() !== '') {
        entries.push({
            docType: 'PAN',
            idNumber: memberData.panNumber,
            nameOnId: memberName,
            issuingAuthority: 'Income Tax Department',
            mobileNumber: memberData.mobile || '',
            emailId: memberData.email || '',
            notes: `Auto-synced from Family Profile - ${memberName}`,
            additional: `Relation: ${memberData.relation || ''}`
        });
    }

    // 3. Passport
    if (memberData.passportNumber && memberData.passportNumber.trim() !== '') {
        entries.push({
            docType: 'Passport',
            idNumber: memberData.passportNumber,
            nameOnId: memberName,
            issuingAuthority: 'Passport Office',
            mobileNumber: memberData.mobile || '',
            emailId: memberData.email || '',
            notes: `Auto-synced from Family Profile - ${memberName}`,
            additional: `Relation: ${memberData.relation || ''}`
        });
    }

    // 4. Driving License
    if (memberData.drivingLicense && memberData.drivingLicense.trim() !== '') {
        entries.push({
            docType: 'Driving License',
            idNumber: memberData.drivingLicense,
            nameOnId: memberName,
            issuingAuthority: 'Transport Department',
            mobileNumber: memberData.mobile || '',
            emailId: memberData.email || '',
            notes: `Auto-synced from Family Profile - ${memberName}`,
            additional: `Relation: ${memberData.relation || ''}`
        });
    }

    // 5. Voter ID
    if (memberData.additionalInfo?.voterID && memberData.additionalInfo.voterID.trim() !== '') {
        entries.push({
            docType: 'Voter ID',
            idNumber: memberData.additionalInfo.voterID,
            nameOnId: memberName,
            issuingAuthority: 'Election Commission of India',
            mobileNumber: memberData.mobile || '',
            emailId: memberData.email || '',
            notes: `Auto-synced from Family Profile - ${memberName}`,
            additional: `Relation: ${memberData.relation || ''}`
        });
    }

    return entries;
};

/**
 * Find existing document entry by docType and idNumber
 */
const findExistingEntry = async (entry) => {
    try {
        const response = await staticAPI.getPersonalRecords();
        const entries = response.data || [];

        // Find if a record exists with SAME DOCUMENT TYPE and SAME ID NUMBER
        const existing = entries.find(e =>
            e.docType === entry.docType &&
            e.idNumber && entry.idNumber &&
            e.idNumber.toLowerCase().trim() === entry.idNumber.toLowerCase().trim()
        );

        return existing || null;
    } catch (error) {
        console.error('Error finding existing personal record entry:', error);
        return null;
    }
};
