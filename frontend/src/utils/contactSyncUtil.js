import { investmentAPI } from './investmentAPI';

/**
 * Sync contact information to Contact Management
 * Extracts contact details from form data and creates/updates contact entries
 * 
 * @param {Object} formData - The form data containing contact information
 * @param {String} formType - The type/name of the source form
 * @returns {Promise<Object>} Result of the sync operation
 */
export const syncContactsFromForm = async (formData, formType) => {
  try {
    const contacts = extractContactsFromForm(formData, formType);
    
    if (contacts.length === 0) {
      return { success: true, message: 'No contacts to sync', count: 0 };
    }

    const results = [];
    for (const contact of contacts) {
      try {
        // Check if contact already exists
        const existing = await findExistingContact(contact);
        
        if (existing) {
          // Update existing contact
          await investmentAPI.update(existing._id, toContactPayload(contact, formType));
          results.push({ action: 'updated', contact: contact.nameOfPerson });
        } else {
          // Create new contact
          await investmentAPI.create(toContactPayload(contact, formType));
          results.push({ action: 'created', contact: contact.nameOfPerson });
        }
      } catch (error) {
        console.error(`Error syncing contact ${contact.nameOfPerson}:`, error);
        results.push({ action: 'failed', contact: contact.nameOfPerson, error: error.message });
      }
    }

    return {
      success: true,
      message: `Synced ${results.length} contact(s)`,
      count: results.length,
      results
    };
  } catch (error) {
    console.error('Error in syncContactsFromForm:', error);
    return {
      success: false,
      message: error.message,
      count: 0
    };
  }
};

/**
 * Extract contact information from form data based on form type
 */
const extractContactsFromForm = (formData, formType) => {
  const contacts = [];

  switch (formType) {
    case 'InventoryRecord':
      // Extract vendor contact
      if (formData.vendorName && (formData.vendorContactNumber || formData.vendorContactEmail)) {
        contacts.push({
          nameOfPerson: formData.vendorName,
          nameOfCompany: formData.companyName || formData.vendorName,
          mobileNumber1: formData.vendorContactNumber || '',
          emailId: formData.vendorContactEmail || '',
          address: formData.address || '',
          category: 'Vendor',
          serviceProviderOrProductSeller: 'Product Vendor',
          notes: `Source: Inventory Record - ${formData.itemName || 'Item'}`,
        });
      }

      // Extract service provider contact
      if (formData.servicePersonName && (formData.serviceMobileNumber || formData.serviceEmailId)) {
        contacts.push({
          nameOfPerson: formData.servicePersonName,
          nameOfCompany: formData.serviceCompanyName || '',
          mobileNumber1: formData.serviceMobileNumber || '',
          emailId: formData.serviceEmailId || '',
          address: formData.serviceAddress || '',
          category: 'Service Provider',
          serviceProviderOrProductSeller: formData.serviceName || 'Service Provider',
          website: formData.serviceWebsite || '',
          notes: `Source: Inventory Record - Service Provider for ${formData.itemName || 'Item'}`,
        });
      }

      // Extract customer care contact
      if (formData.companyName && (formData.customerCareNumber || formData.customerCareEmail)) {
        contacts.push({
          nameOfPerson: `${formData.companyName} Customer Care`,
          nameOfCompany: formData.companyName,
          mobileNumber1: formData.customerCareNumber || '',
          emailId: formData.customerCareEmail || '',
          category: 'Customer Support',
          serviceProviderOrProductSeller: 'Customer Service',
          notes: `Source: Inventory Record - Customer Care for ${formData.itemName || 'Item'}`,
        });
      }
      break;

    case 'DigitalAssets':
      // Extract domain registrar contact
      if (formData.domain?.registrar && formData.domain?.serviceProvider) {
        contacts.push({
          nameOfPerson: formData.domain.serviceProvider,
          nameOfCompany: formData.domain.registrar,
          emailId: formData.domain.adminId || formData.admin?.recoveryEmail || '',
          category: 'Service Provider',
          serviceProviderOrProductSeller: 'Domain Registrar',
          notes: `Source: Digital Assets - ${formData.projectName || 'Website'} - Domain: ${formData.domain.domainName || ''}`,
        });
      }

      // Extract hosting provider contact
      if (formData.hosting?.serviceProvider) {
        contacts.push({
          nameOfPerson: formData.hosting.serviceProvider,
          nameOfCompany: formData.hosting.serviceProvider,
          mobileNumber1: '',
          emailId: formData.hosting.userId || '',
          category: 'Service Provider',
          serviceProviderOrProductSeller: 'Hosting Provider',
          notes: `Source: Digital Assets - ${formData.projectName || 'Website'} - Hosting: ${formData.hosting.serverType || ''}`,
        });
      }

      // Extract developer contact
      if (formData.development?.developerName) {
        contacts.push({
          nameOfPerson: formData.development.developerName,
          profession: 'Developer',
          category: 'Professional',
          serviceProviderOrProductSeller: 'Web Developer',
          notes: `Source: Digital Assets - Developer for ${formData.projectName || 'Website'}`,
        });
      }

      // Extract monitoring provider contact
      if (formData.monitoring?.monitoringProvider) {
        contacts.push({
          nameOfPerson: formData.monitoring.monitoringProvider,
          nameOfCompany: formData.monitoring.monitoringProvider,
          category: 'Service Provider',
          serviceProviderOrProductSeller: 'Monitoring Service',
          notes: `Source: Digital Assets - Monitoring for ${formData.projectName || 'Website'}`,
        });
      }
      break;

    case 'PersonalRecords':
      // Extract person contact
      if (formData.nameOnId && (formData.mobileNumber || formData.emailId)) {
        contacts.push({
          nameOfPerson: formData.nameOnId,
          mobileNumber1: formData.mobileNumber || '',
          emailId: formData.emailId || '',
          category: 'Personal',
          notes: `Source: Personal Records - ${formData.docType || 'Document'} - ID: ${formData.idNumber || ''}`,
        });
      }
      break;

    case 'MobileEmailDetails':
      // Extract carrier/provider contact
      if ((formData.carrier || formData.provider) && (formData.customerCareNo || formData.customerCareEmail)) {
        contacts.push({
          nameOfPerson: `${formData.carrier || formData.provider} Customer Care`,
          nameOfCompany: formData.carrier || formData.provider,
          mobileNumber1: formData.customerCareNo || '',
          emailId: formData.customerCareEmail || '',
          category: 'Customer Support',
          serviceProviderOrProductSeller: formData.type === 'Mobile' ? 'Mobile Carrier' : 'Email Provider',
          notes: `Source: Mobile & Email Details - ${formData.type || 'Service'} - ${formData.mobile || formData.email || ''}`,
        });
      }

      // Extract owner contact
      if (formData.ownerName && (formData.mobile || formData.email)) {
        contacts.push({
          nameOfPerson: formData.ownerName,
          mobileNumber1: formData.type === 'Mobile' ? formData.mobile : formData.alternateNumber || '',
          emailId: formData.type === 'Email' ? formData.email : '',
          category: 'Personal',
          notes: `Source: Mobile & Email Details - ${formData.relationship || 'Contact'}`,
        });
      }
      break;

    case 'CompanyRecords':
      // Extract office contacts
      if (formData.registeredOffice?.phone || formData.registeredOffice?.email) {
        contacts.push({
          nameOfPerson: `${formData.companyName} - Registered Office`,
          nameOfCompany: formData.companyName,
          mobileNumber1: formData.registeredOffice.phone || '',
          emailId: formData.registeredOffice.email || '',
          website: formData.registeredOffice.website || '',
          address: formData.registeredOffice.address || '',
          city: formData.registeredOffice.city || '',
          state: formData.registeredOffice.state || '',
          pinCode: formData.registeredOffice.pincode || '',
          category: 'Company',
          notes: `Source: Company Records - ${formData.companyName} - Registered Office`,
        });
      }

      // Extract corporate office contacts (if different)
      if (!formData.sameAsRegistered && (formData.corporateOffice?.phone || formData.corporateOffice?.email)) {
        contacts.push({
          nameOfPerson: `${formData.companyName} - Corporate Office`,
          nameOfCompany: formData.companyName,
          mobileNumber1: formData.corporateOffice.phone || '',
          emailId: formData.corporateOffice.email || '',
          address: formData.corporateOffice.address || '',
          city: formData.corporateOffice.city || '',
          state: formData.corporateOffice.state || '',
          pinCode: formData.corporateOffice.pincode || '',
          category: 'Company',
          notes: `Source: Company Records - ${formData.companyName} - Corporate Office`,
        });
      }

      // Extract director contacts
      if (formData.directors && Array.isArray(formData.directors)) {
        formData.directors.forEach((director) => {
          if (director.name && (director.mcaMobileNumber || director.mcaEmailId || director.gstMobileNumber || director.gstEmailId)) {
            contacts.push({
              nameOfPerson: director.name,
              nameOfCompany: formData.companyName,
              mobileNumber1: director.mcaMobileNumber || director.gstMobileNumber || director.bankMobileNumber || '',
              mobileNumber2: director.gstMobileNumber || director.bankMobileNumber || '',
              emailId: director.mcaEmailId || director.gstEmailId || director.bankEmailId || '',
              profession: 'Director',
              category: 'Corporate',
              notes: `Source: Company Records - Director of ${formData.companyName} - DIN: ${director.din || ''}`,
            });
          }
        });
      }
      break;

    case 'FamilyProfile':
      // Extract emergency contact
      if (formData.emergencyContact?.name && formData.emergencyContact?.mobile) {
        contacts.push({
          nameOfPerson: formData.emergencyContact.name,
          mobileNumber1: formData.emergencyContact.mobile,
          address: formData.emergencyContact.address || '',
          category: 'Emergency Contact',
          notes: `Source: Family Profile - Emergency Contact - Relation: ${formData.emergencyContact.relation || ''}`,
        });
      }

      // Extract family member contacts
      if (formData.members && Array.isArray(formData.members)) {
        formData.members.forEach((member) => {
          if (member.name && (member.mobile || member.email)) {
            contacts.push({
              nameOfPerson: member.name,
              mobileNumber1: member.mobile || '',
              mobileNumber2: member.additionalInfo?.alternatePhone || '',
              emailId: member.email || '',
              category: 'Family',
              profession: member.occupation || '',
              nameOfCompany: member.companyName || '',
              notes: `Source: Family Profile - ${member.relation || 'Family Member'}`,
            });
          }
        });
      }
      break;

    case 'GoldSgbInvestment':
      // Extract provider contact
      if (formData.provider) {
        contacts.push({
          nameOfPerson: formData.provider,
          nameOfCompany: formData.provider,
          category: 'Service Provider',
          serviceProviderOrProductSeller: 'Investment Provider',
          primaryProducts: formData.type || 'Gold/SGB',
          notes: `Source: Gold/SGB Investment - Provider for ${formData.name || 'Investment'}`,
        });
      }
      break;

    default:
      console.warn(`Unknown form type: ${formType}`);
      break;
  }

  return contacts.filter(contact => contact.nameOfPerson && contact.nameOfPerson.trim() !== '');
};

/**
 * Find existing contact by name or company
 */
const findExistingContact = async (contact) => {
  try {
    const response = await investmentAPI.getAll('static-contact-management');
    const contacts = (response.data.investments || []).map(inv => {
      let notes = {};
      try { notes = inv.notes ? JSON.parse(inv.notes) : {}; } catch { notes = {}; }
      return { _id: inv._id, ...notes };
    });

    // Try to find by exact name match
    const existing = contacts.find(c => 
      c.nameOfPerson && contact.nameOfPerson &&
      c.nameOfPerson.toLowerCase().trim() === contact.nameOfPerson.toLowerCase().trim()
    );

    return existing || null;
  } catch (error) {
    console.error('Error finding existing contact:', error);
    return null;
  }
};

/**
 * Convert contact data to Contact Management payload format
 */
const toContactPayload = (contactData, formType) => {
  return {
    category: 'static-contact-management',
    type: 'Contact',
    name: contactData.nameOfPerson || 'Contact',
    provider: contactData.nameOfCompany || contactData.relation || 'Contact',
    amount: 0,
    startDate: new Date().toISOString().slice(0, 10),
    notes: JSON.stringify({
      ...contactData,
      reference: formType,
      lastUpdated: new Date().toISOString(),
    }),
  };
};
