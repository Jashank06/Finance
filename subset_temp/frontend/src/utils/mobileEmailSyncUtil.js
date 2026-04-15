import { staticAPI } from './staticAPI';

/**
 * Sync mobile and email information from Family Profile to Mobile & Email Details
 * Extracts contact details from family member data and creates/updates entries
 * 
 * @param {Object} memberData - The family member data containing contact information
 * @returns {Promise<Object>} Result of the sync operation
 */
export const syncMobileEmailFromFamilyProfile = async (memberData) => {
  try {
    const entries = extractMobileEmailFromMember(memberData);

    if (entries.length === 0) {
      return { success: true, message: 'No mobile/email to sync', count: 0 };
    }

    const results = [];
    for (const entry of entries) {
      try {
        // Check if entry already exists
        const existing = await findExistingEntry(entry);

        if (existing) {
          // Update existing entry
          await staticAPI.updateMobileEmailDetails(existing._id, entry);
          results.push({ action: 'updated', type: entry.type, value: entry.mobile || entry.email });
        } else {
          // Create new entry
          await staticAPI.createMobileEmailDetails(entry);
          results.push({ action: 'created', type: entry.type, value: entry.mobile || entry.email });
        }
      } catch (error) {
        console.error(`Error syncing ${entry.type}:`, error);
        results.push({ action: 'failed', type: entry.type, error: error.message });
      }
    }

    return {
      success: true,
      message: `Synced ${results.length} mobile/email entry(ies)`,
      count: results.length,
      results
    };
  } catch (error) {
    console.error('Error in syncMobileEmailFromFamilyProfile:', error);
    return {
      success: false,
      message: error.message,
      count: 0
    };
  }
};

/**
 * Extract mobile and email information from family member data
 * Creates a single combined entry with both mobile and email
 */
const extractMobileEmailFromMember = (memberData) => {
  const entries = [];

  // 1. Mobile Entry
  if (memberData.mobile && memberData.mobile.trim() !== '') {
    entries.push({
      type: 'Mobile',
      name: `${memberData.name || 'Member'} - Personal Mobile`,
      relation: memberData.relation || '',
      mobile: memberData.mobile,
      carrier: '', // Can be filled if available
      simType: 'Prepaid',
      address: memberData.additionalInfo?.residentialAddress || '',
      email: '', // Separate entry for email
      purpose: 'Personal',
      isPrimary: true,
      ownerName: memberData.name || '',
      relationship: memberData.relation || '',
      notes: `Auto-synced from Family Profile - Personal Mobile`,
      twoFA: false
    });
  }

  // 2. Email Entry
  if (memberData.email && memberData.email.trim() !== '') {
    entries.push({
      type: 'Email',
      name: `${memberData.name || 'Member'} - Personal Email`,
      relation: memberData.relation || '',
      mobile: '',
      email: memberData.email,
      provider: 'Gmail', // Default or extract domain
      googleAccountEmail: memberData.email,
      purpose: 'Personal',
      isPrimary: true,
      ownerName: memberData.name || '',
      relationship: memberData.relation || '',
      notes: `Auto-synced from Family Profile - Personal Email`,
      twoFA: false
    });
  }

  // 3. Work Phone Entry
  if (memberData.workPhone && memberData.workPhone.trim() !== '') {
    entries.push({
      type: 'Mobile',
      name: `${memberData.name || 'Member'} - Work Phone`,
      relation: memberData.relation || '',
      mobile: memberData.workPhone,
      carrier: '',
      simType: 'Postpaid',
      address: memberData.additionalInfo?.workAddress || '',
      email: memberData.workEmail || '',
      purpose: 'Work',
      isPrimary: false,
      ownerName: memberData.name || '',
      relationship: memberData.relation || '',
      notes: `Auto-synced from Family Profile - Work Phone`,
      twoFA: false
    });
  }

  // 4. Emergency Contact Mobile
  if (memberData.additionalInfo?.emergencyContactMobile && memberData.additionalInfo.emergencyContactMobile.trim() !== '') {
    entries.push({
      type: 'Mobile',
      name: `${memberData.additionalInfo.emergencyContactName || 'Emergency Contact'}`,
      relation: memberData.additionalInfo.emergencyContactRelation || 'Emergency Contact',
      mobile: memberData.additionalInfo.emergencyContactMobile,
      carrier: '',
      simType: 'Prepaid', // Default assumption
      address: memberData.additionalInfo?.emergencyContactAddress || '',
      email: '',
      purpose: 'Emergency',
      isPrimary: false,
      ownerName: memberData.additionalInfo.emergencyContactName || 'Emergency Contact',
      relationship: memberData.additionalInfo.emergencyContactRelation || '',
      notes: `Auto-synced from Family Profile - Emergency Contact for ${memberData.name || 'Member'}`,
      twoFA: false
    });
  }

  // 5. Alternate Phone
  if (memberData.additionalInfo?.alternatePhone && memberData.additionalInfo.alternatePhone.trim() !== '') {
    entries.push({
      type: 'Mobile',
      name: `${memberData.name || 'Member'} - Alternate Phone`,
      relation: memberData.relation || '',
      mobile: memberData.additionalInfo.alternatePhone,
      carrier: '',
      simType: 'Prepaid',
      address: memberData.additionalInfo?.residentialAddress || '',
      email: '',
      purpose: 'Personal',
      isPrimary: false,
      ownerName: memberData.name || '',
      relationship: memberData.relation || '',
      notes: `Auto-synced from Family Profile - Alternate Phone`,
      twoFA: false
    });
  }

  return entries;
};

/**
 * Find existing mobile/email entry by name and relation (to avoid duplicates for same person)
 */
const findExistingEntry = async (entry) => {
  try {
    const response = await staticAPI.getMobileEmailDetails();
    const entries = response.data || [];

    // Find if a record exists with SAME TYPE and SAME MOBILE/EMAIL for the SAME OWNER
    // This allows one person to have multiple distinct entries (Mobile, Email, Work Phone)
    const existing = entries.find(e => {
      // Must match owner name (or relation implies owner in some contexts, but strict ownerName check is better)
      const ownerMatch = e.ownerName && entry.ownerName &&
        e.ownerName.toLowerCase().trim() === entry.ownerName.toLowerCase().trim();

      if (!ownerMatch) return false;

      // For Mobile type entries
      if (entry.type === 'Mobile' && e.type === 'Mobile') {
        const mobileMatch = entry.mobile && e.mobile &&
          e.mobile.replace(/\s/g, '') === entry.mobile.replace(/\s/g, '');
        // Also distinguish between "Personal Mobile" and "Work Phone" if numbers are same (rare but possible) or different.
        // We rely on 'notes' or 'name' to distinguish if numbers are remarkably same? 
        // Actually, if numbers are same, we might not want duplicates unless purpose differs.
        // But user ASKED for separate entries. 
        // Let's use 'purpose' or 'name' as secondary differentiator if needed.
        const purposeMatch = (e.purpose || '').toLowerCase() === (entry.purpose || '').toLowerCase();

        return mobileMatch && purposeMatch;
      }

      // For Email type entries
      if (entry.type === 'Email' && e.type === 'Email') {
        return entry.email && e.email &&
          e.email.toLowerCase().trim() === entry.email.toLowerCase().trim();
      }

      return false;
    });

    return existing || null;
  } catch (error) {
    console.error('Error finding existing mobile/email entry:', error);
    return null;
  }
};

/**
 * Sync all family members' mobile and email data
 */
export const syncAllFamilyMembersToMobileEmail = async (members) => {
  try {
    if (!Array.isArray(members) || members.length === 0) {
      return { success: true, message: 'No members to sync', count: 0 };
    }

    const allResults = [];
    for (const member of members) {
      const result = await syncMobileEmailFromFamilyProfile(member);
      if (result.results) {
        allResults.push(...result.results);
      }
    }

    return {
      success: true,
      message: `Synced contact info for ${members.length} family member(s)`,
      totalMembers: members.length,
      totalEntries: allResults.length,
      results: allResults
    };
  } catch (error) {
    console.error('Error in syncAllFamilyMembersToMobileEmail:', error);
    return {
      success: false,
      message: error.message,
      count: 0
    };
  }
};
