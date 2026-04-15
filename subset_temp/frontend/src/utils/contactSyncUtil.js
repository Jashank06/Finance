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
  console.log(`--- Extracting contacts from ${formType} ---`);
  const contacts = [];

  switch (formType) {
    case 'BasicDetails':
      // Extract primary mobile contact
      if (formData.firstName && formData.primaryMobile) {
        contacts.push({
          nameOfPerson: `${formData.firstName} ${formData.lastName || ''}`.trim(),
          mobileNumber1: formData.primaryMobile,
          mobileNumber2: formData.secondaryMobile || '',
          emailId: formData.primaryEmail || '',
          address: formData.currentAddress ? `${formData.currentAddress.street || ''}, ${formData.currentAddress.area || ''}, ${formData.currentAddress.city || ''}, ${formData.currentAddress.state || ''} - ${formData.currentAddress.pincode || ''}`.trim() : '',
          category: 'Personal',
          notes: 'Source: Basic Details - Personal Contact',
        });
      }

      // Extract work contact
      if (formData.firstName && formData.workPhone) {
        contacts.push({
          nameOfPerson: `${formData.firstName} ${formData.lastName || ''}`.trim(),
          nameOfCompany: formData.companyName || '',
          mobileNumber1: formData.workPhone,
          emailId: formData.workEmail || '',
          address: formData.officeAddress ? `${formData.officeAddress.street || ''}, ${formData.officeAddress.area || ''}, ${formData.officeAddress.city || ''}, ${formData.officeAddress.state || ''} - ${formData.officeAddress.pincode || ''}`.trim() : '',
          category: 'Professional',
          profession: formData.occupation || '',
          notes: `Source: Basic Details - Work Contact${formData.designation ? ` - ${formData.designation}` : ''}`,
        });
      }

      // Extract emergency contact
      if (formData.emergencyContact?.name && formData.emergencyContact?.mobile) {
        contacts.push({
          nameOfPerson: formData.emergencyContact.name,
          mobileNumber1: formData.emergencyContact.mobile,
          address: formData.emergencyContact.address || '',
          category: 'Emergency Contact',
          notes: `Source: Basic Details - Emergency Contact (Relation: ${formData.emergencyContact.relation || 'N/A'})`,
        });
      }

      // Extract contacts from Mutual Funds
      if (formData.mutualFunds && Array.isArray(formData.mutualFunds)) {
        formData.mutualFunds.forEach((mf) => {
          if (mf.registeredMobile) {
            contacts.push({
              nameOfPerson: mf.investorName || formData.firstName || 'Investor',
              nameOfCompany: mf.fundHouse || '',
              mobileNumber1: mf.registeredMobile,
              emailId: mf.customerCareEmail || '',
              category: 'Financial',
              serviceProviderOrProductSeller: 'Mutual Fund',
              notes: `Source: Basic Details - Mutual Fund: ${mf.mfName || 'N/A'}`,
            });
          }
          // Extract RM contact
          if (mf.rmName && mf.rmMobile) {
            contacts.push({
              nameOfPerson: mf.rmName,
              nameOfCompany: mf.fundHouse || '',
              mobileNumber1: mf.rmMobile,
              emailId: mf.rmEmail || '',
              category: 'Financial',
              profession: 'Relationship Manager',
              notes: `Source: Basic Details - RM for ${mf.mfName || 'Mutual Fund'}`,
            });
          }
        });
      }

      // Extract contacts from Shares
      if (formData.shares && Array.isArray(formData.shares)) {
        formData.shares.forEach((share) => {
          if (share.registeredMobile) {
            contacts.push({
              nameOfPerson: share.investorName || formData.firstName || 'Investor',
              nameOfCompany: share.dematCompany || '',
              mobileNumber1: share.registeredMobile,
              emailId: share.customerCareEmail || '',
              category: 'Financial',
              serviceProviderOrProductSeller: 'Shares/Demat',
              notes: `Source: Basic Details - Shares: ${share.scriptName || 'N/A'}`,
            });
          }
          // Extract RM contact
          if (share.rmName && share.rmMobile) {
            contacts.push({
              nameOfPerson: share.rmName,
              nameOfCompany: share.dematCompany || '',
              mobileNumber1: share.rmMobile,
              emailId: share.rmEmail || '',
              category: 'Financial',
              profession: 'Relationship Manager',
              notes: `Source: Basic Details - RM for ${share.scriptName || 'Shares'}`,
            });
          }
        });
      }

      // Extract contacts from Insurance
      if (formData.insurance && Array.isArray(formData.insurance)) {
        formData.insurance.forEach((ins) => {
          if (ins.registeredMobile) {
            contacts.push({
              nameOfPerson: ins.insurerName || formData.firstName || 'Insured',
              nameOfCompany: ins.insuranceCompany || '',
              mobileNumber1: ins.registeredMobile,
              emailId: ins.customerCareEmail || '',
              category: 'Financial',
              serviceProviderOrProductSeller: 'Insurance',
              notes: `Source: Basic Details - Insurance: ${ins.policyName || 'N/A'}`,
            });
          }
          // Extract RM contact
          if (ins.rmName && ins.rmMobile) {
            contacts.push({
              nameOfPerson: ins.rmName,
              nameOfCompany: ins.insuranceCompany || '',
              mobileNumber1: ins.rmMobile,
              emailId: ins.rmEmail || '',
              category: 'Financial',
              profession: 'Relationship Manager',
              notes: `Source: Basic Details - RM for ${ins.policyName || 'Insurance'}`,
            });
          }
        });
      }

      // Extract contacts from Banks
      if (formData.banks && Array.isArray(formData.banks)) {
        formData.banks.forEach((bank) => {
          if (bank.registeredMobile) {
            contacts.push({
              nameOfPerson: bank.accountHolderName || formData.firstName || 'Account Holder',
              nameOfCompany: bank.bankName || '',
              mobileNumber1: bank.registeredMobile,
              emailId: bank.registeredEmail || '',
              category: 'Financial',
              serviceProviderOrProductSeller: 'Banking',
              notes: `Source: Basic Details - Bank Account: ${bank.accountNumber || 'N/A'}`,
            });
          }
          // Extract RM contact
          if (bank.rmName && bank.rmMobile) {
            contacts.push({
              nameOfPerson: bank.rmName,
              nameOfCompany: bank.bankName || '',
              mobileNumber1: bank.rmMobile,
              emailId: bank.rmEmail || '',
              category: 'Financial',
              profession: 'Relationship Manager',
              notes: `Source: Basic Details - RM for ${bank.bankName || 'Bank'}`,
            });
          }
        });
      }

      // Extract contacts from Mobile Bills
      if (formData.mobileBills && Array.isArray(formData.mobileBills)) {
        formData.mobileBills.forEach((bill) => {
          if (bill.mobileNumber) {
            contacts.push({
              nameOfPerson: bill.usedBy || formData.firstName || 'User',
              mobileNumber1: bill.mobileNumber,
              mobileNumber2: bill.alternateNo || '',
              emailId: bill.emailId || '',
              address: bill.address || '',
              category: 'Personal',
              notes: `Source: Basic Details - Mobile Bill: ${bill.mobileNumber}`,
            });
          }
        });
      }

      // Extract contacts from Sub Brokers
      if (formData.subBrokers && Array.isArray(formData.subBrokers)) {
        formData.subBrokers.forEach((broker) => {
          if (broker.contactNumber) {
            contacts.push({
              nameOfPerson: broker.nameOfCompany || 'Sub Broker',
              nameOfCompany: broker.nameOfCompany || '',
              mobileNumber1: broker.contactNumber,
              mobileNumber2: broker.customerCareNumber || '',
              emailId: broker.emailId || '',
              address: `${broker.address || ''}, ${broker.city || ''}, ${broker.state || ''} - ${broker.pinCode || ''}`.trim(),
              category: 'Financial',
              serviceProviderOrProductSeller: 'Sub Broker',
              website: broker.website || '',
              notes: `Source: Basic Details - Sub Broker`,
            });
          }
        });
      }
      break;

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
      if (formData.additionalInfo?.emergencyContactName && formData.additionalInfo?.emergencyContactMobile) {
        contacts.push({
          nameOfPerson: formData.additionalInfo.emergencyContactName,
          mobileNumber1: formData.additionalInfo.emergencyContactMobile,
          address: formData.additionalInfo.emergencyContactAddress || '',
          category: 'Emergency Contact',
          notes: `Source: Family Profile - Emergency Contact - Relation: ${formData.additionalInfo.emergencyContactRelation || ''}`,
        });
      }

      // Extract family member contact (Main - Personal)
      if (formData.name && (formData.mobile || formData.email)) {
        contacts.push({
          nameOfPerson: formData.name,
          mobileNumber1: formData.mobile || '',
          emailId: formData.email || '',
          category: 'Family',
          profession: formData.occupation || '',
          nameOfCompany: formData.companyName || '',
          notes: `Source: Family Profile - ${formData.relation || 'Family Member'}`,
        });
      }

      // Extract Work Phone as separate entry
      if (formData.name && formData.workPhone) {
        contacts.push({
          nameOfPerson: `${formData.name} - Work`,
          mobileNumber1: formData.workPhone,
          emailId: formData.workEmail || '',
          category: 'Family',
          profession: formData.occupation || 'Work',
          nameOfCompany: formData.companyName || '',
          notes: `Source: Family Profile - Work Phone for ${formData.name}`,
        });
      }

      // Extract Alternate Phone as separate entry
      if (formData.name && formData.additionalInfo?.alternatePhone) {
        contacts.push({
          nameOfPerson: `${formData.name} - Alternate`,
          mobileNumber1: formData.additionalInfo.alternatePhone,
          category: 'Family',
          notes: `Source: Family Profile - Alternate Phone for ${formData.name}`,
        });
      }

      // Extract family member contacts (Array - Backward Compatibility/Bulk Sync)
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

      // Extract document support contacts
      if (formData.documents && Array.isArray(formData.documents)) {
        formData.documents.forEach((doc) => {
          if (doc.issuingAuthority && (doc.customerCareNumber || doc.customerCareEmail)) {
            contacts.push({
              nameOfPerson: `${doc.issuingAuthority} Customer Care`,
              nameOfCompany: doc.issuingAuthority,
              mobileNumber1: doc.customerCareNumber || '',
              emailId: doc.customerCareEmail || '',
              category: 'Customer Support',
              serviceProviderOrProductSeller: 'Customer Service',
              notes: `Source: Family Profile - ${formData.name || 'Member'} - ${doc.documentType || 'Document'}`,
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

    case 'MembershipList':
      // Extract membership organization contact
      if (formData.organizationName && (formData.contactInfo?.phone || formData.contactInfo?.email)) {
        contacts.push({
          nameOfPerson: formData.organizationName,
          nameOfCompany: formData.organizationName,
          mobileNumber1: formData.contactInfo.phone || '',
          emailId: formData.contactInfo.email || '',
          website: formData.contactInfo.website || '',
          address: formData.address?.street || '',
          city: formData.address?.city || '',
          state: formData.address?.state || '',
          pinCode: formData.address?.pincode || '',
          category: 'Service Provider',
          serviceProviderOrProductSeller: formData.membershipType || 'Membership',
          notes: `Source: Membership List - ${formData.membershipType} - Member: ${formData.memberName || 'N/A'}\nMembership No: ${formData.membershipNumber || 'N/A'}`,
        });
      }
      break;

    case 'BasicDetails':
      // Extract Sub Brokers
      if (formData.subBrokers && Array.isArray(formData.subBrokers)) {
        formData.subBrokers.forEach(broker => {
          if (broker.nameOfCompany && broker.contactNumber) {
            contacts.push({
              nameOfPerson: broker.nameOfCompany,
              nameOfCompany: broker.nameOfCompany,
              mobileNumber1: broker.contactNumber,
              emailId: broker.emailId || '',
              category: 'Service Provider',
              serviceProviderOrProductSeller: 'Sub Broker',
              notes: `Source: Basic Details - Sub Broker`,
            });
          }
          if (broker.nameOfCompany && broker.customerCareNumber) {
            contacts.push({
              nameOfPerson: `${broker.nameOfCompany} Customer Care`,
              nameOfCompany: broker.nameOfCompany,
              mobileNumber1: broker.customerCareNumber,
              emailId: broker.customerCareEmailId || '',
              category: 'Customer Support',
              notes: `Source: Basic Details - Sub Broker Support`,
            });
          }
        });
      }

      // Extract Bank RM Contacts
      if (formData.banks && Array.isArray(formData.banks)) {
        formData.banks.forEach(bank => {
          if (bank.rmName && bank.rmMobile) {
            contacts.push({
              nameOfPerson: bank.rmName,
              nameOfCompany: bank.bankName,
              mobileNumber1: bank.rmMobile,
              emailId: bank.rmEmail || '',
              category: 'Relationship Manager',
              serviceProviderOrProductSeller: 'Bank RM',
              notes: `Source: Basic Details - Bank RM for ${bank.bankName}`,
            });
          }
          if (bank.accountHolderName && bank.registeredMobile) {
            contacts.push({
              nameOfPerson: bank.accountHolderName,
              nameOfCompany: bank.bankName,
              mobileNumber1: bank.registeredMobile,
              emailId: bank.registeredEmail || '',
              category: 'Bank Customer',
              notes: `Source: Basic Details - Registered Number for Bank: ${bank.bankName}`,
            });
          }
        });
      }

      // Extract Insurance RM Contacts
      if (formData.insurance && Array.isArray(formData.insurance)) {
        formData.insurance.forEach(ins => {
          if (ins.insuranceCompany && ins.customerCareNumber) {
            contacts.push({
              nameOfPerson: `${ins.insuranceCompany} Customer Care`,
              nameOfCompany: ins.insuranceCompany,
              mobileNumber1: ins.customerCareNumber,
              emailId: ins.customerCareEmail || '',
              category: 'Customer Support',
              notes: `Source: Basic Details - Insurance Support`,
            });
          }
          if (ins.rmName && ins.rmMobile) {
            contacts.push({
              nameOfPerson: ins.rmName,
              nameOfCompany: ins.insuranceCompany,
              mobileNumber1: ins.rmMobile,
              emailId: ins.rmEmail || '',
              category: 'Relationship Manager',
              serviceProviderOrProductSeller: 'Insurance RM',
              notes: `Source: Basic Details - Insurance RM for ${ins.insuranceCompany}`,
            });
          }
          if (ins.insurerName && ins.registeredMobile) {
            contacts.push({
              nameOfPerson: ins.insurerName,
              nameOfCompany: ins.insuranceCompany,
              mobileNumber1: ins.registeredMobile,
              category: 'Insurance Policy Holder',
              notes: `Source: Basic Details - Registered Number for Insurance: ${ins.insuranceCompany}`,
            });
          } else if (ins.insuranceCompany && ins.registeredMobile) {
            // Fallback if insurerName is missing but company and mobile exist
            contacts.push({
              nameOfPerson: `Insurer - ${ins.insuranceCompany}`,
              nameOfCompany: ins.insuranceCompany,
              mobileNumber1: ins.registeredMobile,
              category: 'Insurance Contact',
              notes: `Source: Basic Details - Registered Number for Insurance: ${ins.insuranceCompany} (Name missing)`,
            });
          }
        });
      }

      // Extract Mutual Fund RM Contacts
      if (formData.mutualFunds && Array.isArray(formData.mutualFunds)) {
        formData.mutualFunds.forEach(mf => {
          if (mf.fundHouse && mf.customerCareNumber) {
            contacts.push({
              nameOfPerson: `${mf.fundHouse} Customer Care`,
              nameOfCompany: mf.fundHouse,
              mobileNumber1: mf.customerCareNumber,
              emailId: mf.customerCareEmail || '',
              category: 'Customer Support',
              notes: `Source: Basic Details - MF Support`,
            });
          }
          if (mf.rmName && mf.rmMobile) {
            contacts.push({
              nameOfPerson: mf.rmName,
              nameOfCompany: mf.fundHouse,
              mobileNumber1: mf.rmMobile,
              emailId: mf.rmEmail || '',
              category: 'Relationship Manager',
              serviceProviderOrProductSeller: 'MF RM',
              notes: `Source: Basic Details - MF RM for ${mf.fundHouse}`,
            });
          }
          if (mf.investorName && mf.registeredMobile) {
            contacts.push({
              nameOfPerson: mf.investorName,
              nameOfCompany: mf.fundHouse,
              mobileNumber1: mf.registeredMobile,
              category: 'MF Investor',
              notes: `Source: Basic Details - Registered Number for Mutual Fund: ${mf.fundHouse}`,
            });
          }
        });
      }

      // Extract Share Registered Numbers
      if (formData.shares && Array.isArray(formData.shares)) {
        formData.shares.forEach(share => {
          if (share.investorName && share.registeredMobile) {
            contacts.push({
              nameOfPerson: share.investorName,
              nameOfCompany: share.dematCompany,
              mobileNumber1: share.registeredMobile,
              category: 'Share Investor',
              notes: `Source: Basic Details - Registered Number for Shares: ${share.dematCompany}`,
            });
          }
        });
      }

      // Extract Portfolio Contacts
      if (formData.mutualFundsPortfolio && Array.isArray(formData.mutualFundsPortfolio)) {
        formData.mutualFundsPortfolio.forEach(mfp => {
          if (mfp.investorName && mfp.folioNumber) {
            contacts.push({
              nameOfPerson: mfp.investorName,
              nameOfCompany: mfp.fundHouse || 'Mutual Fund',
              notes: `Source: Basic Details - MF Portfolio: ${mfp.fundName || ''} (Folio: ${mfp.folioNumber})`,
              category: 'Portfolio Contact'
            });
          }
        });
      }

      if (formData.sharesPortfolio && Array.isArray(formData.sharesPortfolio)) {
        formData.sharesPortfolio.forEach(sp => {
          if (sp.investorName && sp.scriptName) {
            contacts.push({
              nameOfPerson: sp.investorName,
              nameOfCompany: sp.dematCompany || 'Shares',
              notes: `Source: Basic Details - Share Portfolio: ${sp.scriptName}`,
              category: 'Portfolio Contact'
            });
          }
        });
      }

      if (formData.insurancePortfolio && Array.isArray(formData.insurancePortfolio)) {
        formData.insurancePortfolio.forEach(ip => {
          if (ip.insurerName && ip.policyNumber) {
            contacts.push({
              nameOfPerson: ip.insurerName,
              nameOfCompany: ip.insuranceCompany || 'Insurance',
              notes: `Source: Basic Details - Insurance Portfolio: ${ip.policyName} (Policy: ${ip.policyNumber})`,
              category: 'Portfolio Contact'
            });
          }
        });
      }

      // Extract Card Support
      if (formData.cards && Array.isArray(formData.cards)) {
        formData.cards.forEach(card => {
          if (card.bankName && card.customerCareNumber) {
            contacts.push({
              nameOfPerson: `${card.bankName} Card Support`,
              nameOfCompany: card.bankName,
              mobileNumber1: card.customerCareNumber,
              emailId: card.customerCareEmail || '',
              category: 'Customer Support',
              notes: `Source: Basic Details - Card Support`,
            });
          }
        });
      }

      // Extract Mobile Contact from Bills
      if (formData.mobileBills && Array.isArray(formData.mobileBills)) {
        formData.mobileBills.forEach(bill => {
          if (bill.mobileNumber && bill.usedBy) {
            contacts.push({
              nameOfPerson: bill.usedBy,
              mobileNumber1: bill.mobileNumber,
              mobileNumber2: bill.alternateNo || '',
              emailId: bill.emailId || '',
              category: 'Personal',
              notes: `Source: Basic Details - Mobile Bill User`,
            });
          }
        });
      }

      // Extract Emergency Contact
      if (formData.emergencyContact && formData.emergencyContact.name && formData.emergencyContact.mobile) {
        contacts.push({
          nameOfPerson: formData.emergencyContact.name,
          mobileNumber1: formData.emergencyContact.mobile,
          category: 'Emergency Contact',
          notes: `Source: Basic Details - Emergency Contact - Relation: ${formData.emergencyContact.relation || ''}`,
        });
      }

      // Extract Family Members
      if (formData.familyMembers && Array.isArray(formData.familyMembers)) {
        formData.familyMembers.forEach(member => {
          if (member.name && (member.mobile || member.email)) {
            contacts.push({
              nameOfPerson: member.name,
              mobileNumber1: member.mobile || '',
              emailId: member.email || '',
              category: 'Family',
              notes: `Source: Basic Details - Family Member - Relation: ${member.relation || ''}`,
            });
          }
        });
      }
      break;

    case 'OnlineAccessDetails':
      // Extract recovery contact
      if (formData.serviceName && (formData.recoveryPhone || formData.recoveryEmail)) {
        contacts.push({
          nameOfPerson: `${formData.serviceName} Recovery`,
          nameOfCompany: formData.serviceName,
          mobileNumber1: formData.recoveryPhone || '',
          emailId: formData.recoveryEmail || '',
          category: 'Digital Service',
          serviceProviderOrProductSeller: formData.category || 'Online Access',
          notes: `Source: Online Access Details - Recovery for ${formData.serviceName}`,
        });
      }
      break;

    case 'TelephoneConversation':
      // Extract call contact
      if (formData.contactName && formData.phoneNumber) {
        contacts.push({
          nameOfPerson: formData.contactName,
          mobileNumber1: formData.phoneNumber,
          category: 'Call Contact',
          notes: `Source: Telephone Conversation - ${formData.topic || 'Call'}`,
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
