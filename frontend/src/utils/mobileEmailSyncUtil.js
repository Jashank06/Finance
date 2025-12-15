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

  // Check if member has any contact information
  const hasMobile = memberData.mobile && memberData.mobile.trim() !== '';
  const hasEmail = memberData.email && memberData.email.trim() !== '';
  const hasWorkPhone = memberData.workPhone && memberData.workPhone.trim() !== '';
  const hasAlternatePhone = memberData.additionalInfo?.alternatePhone && memberData.additionalInfo.alternatePhone.trim() !== '';

  // If member has either mobile or email, create a combined entry
  if (hasMobile || hasEmail) {
    const entry = {
      type: hasMobile ? 'Mobile' : 'Email',
      name: memberData.name || 'Family Member',
      relation: memberData.relation || '',
      mobile: memberData.mobile || '',
      carrier: '',
      simType: 'Prepaid',
      planName: '',
      planAmount: '',
      address: memberData.additionalInfo?.residentialAddress || '',
      alternateNumber: memberData.additionalInfo?.alternatePhone || memberData.workPhone || '',
      customerCareNo: '',
      customerCareEmail: '',
      billingCycle: '',
      accountNo: '',
      email: memberData.email || '',
      provider: hasEmail ? 'Gmail' : '',
      googleAccountEmail: memberData.email || '',
      recoveryEmail: '',
      recoveryNumber: memberData.mobile || '',
      alternateEmails: '',
      passkeysAndSecurityKey: '',
      password: '',
      purpose: 'Personal',
      twoFA: false,
      notes: `Auto-synced from Family Profile - ${memberData.relation || 'Member'}`,
      ownerName: memberData.name || '',
      relationship: memberData.relation || '',
      isPrimary: true
    };
    
    console.log('📧 Syncing mobile/email entry:', {
      name: entry.name,
      mobile: entry.mobile,
      email: entry.email,
      hasMobile,
      hasEmail
    });
    
    entries.push(entry);
  }

  // Create separate entry for work phone if it exists and is different from primary mobile
  if (hasWorkPhone && memberData.workPhone !== memberData.mobile) {
    entries.push({
      type: 'Mobile',
      name: memberData.name || 'Family Member',
      relation: memberData.relation || '',
      mobile: memberData.workPhone,
      carrier: '',
      simType: 'Postpaid',
      planName: '',
      planAmount: '',
      address: memberData.additionalInfo?.workAddress || '',
      alternateNumber: memberData.mobile || '',
      customerCareNo: '',
      customerCareEmail: '',
      billingCycle: '',
      accountNo: '',
      email: '',
      provider: '',
      googleAccountEmail: '',
      recoveryEmail: '',
      recoveryNumber: '',
      alternateEmails: '',
      passkeysAndSecurityKey: '',
      password: '',
      purpose: 'Work Phone',
      twoFA: false,
      notes: `Auto-synced from Family Profile - Work Phone - ${memberData.relation || 'Member'}`,
      ownerName: memberData.name || '',
      relationship: memberData.relation || '',
      isPrimary: false
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

    // Try to find by name and relation to update the same person's entry
    const existing = entries.find(e => {
      const nameMatch = e.name && entry.name && 
                       e.name.toLowerCase().trim() === entry.name.toLowerCase().trim();
      const relationMatch = e.relation && entry.relation && 
                           e.relation.toLowerCase().trim() === entry.relation.toLowerCase().trim();
      
      // If both name and relation match, it's the same person
      if (nameMatch && relationMatch) {
        return true;
      }
      
      // Also check by mobile or email as fallback
      if (entry.mobile && e.mobile && e.mobile.replace(/\s/g, '') === entry.mobile.replace(/\s/g, '')) {
        return true;
      }
      if (entry.email && e.email && e.email.toLowerCase().trim() === entry.email.toLowerCase().trim()) {
        return true;
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
