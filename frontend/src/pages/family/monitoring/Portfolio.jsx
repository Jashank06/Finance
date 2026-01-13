import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiX, FiTrendingUp, FiHome } from 'react-icons/fi';
import { staticAPI } from '../../../utils/staticAPI';
// Import CSS from static folder to reuse styles
import '../static/Static.css';
import { trackFeatureUsage } from '../../../utils/featureTracking';
import { syncContactsFromForm } from '../../../utils/contactSyncUtil';
import { syncCustomerSupportFromForm } from '../../../utils/customerSupportSyncUtil';
import { syncBillScheduleFromForm } from '../../../utils/billScheduleSyncUtil';

const Portfolio = () => {
    const [editMode, setEditMode] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [loading, setLoading] = useState(false);
    const [familyMembers, setFamilyMembers] = useState([]);

    // Initialize formData with consistent structure matching BasicDetails
    const [formData, setFormData] = useState({
        // We maintain all fields to ensure no data loss during updates, 
        // even though we only display portfolio fields here.
        mutualFundsPortfolio: [],
        sharesPortfolio: [],
        insurancePortfolio: [],
        subBrokers: [] // Needed for dropdowns
    });

    // State for new entries
    const [newMutualFundPortfolio, setNewMutualFundPortfolio] = useState({
        srNo: '',
        fundHouse: '',
        investorName: '',
        fundName: '',
        goalPurpose: '',
        folioNumber: '',
        dateOfPurchase: '',
        purchaseNAV: '',
        numberOfUnits: '',
        purchaseValue: '',
        currentNAV: '',
        currentValuation: '',
        difference: '',
        percentDifference: '',
        subBrokerName: ''
    });

    const [newSharePortfolio, setNewSharePortfolio] = useState({
        srNo: '',
        dematCompany: '',
        investorName: '',
        scriptName: '',
        goalPurpose: '',
        dateOfPurchase: '',
        purchaseNAV: '',
        numberOfUnits: '',
        purchaseValue: '',
        currentNAV: '',
        currentValuation: '',
        difference: '',
        percentDifference: '',
        subBrokerName: ''
    });

    const [newInsurancePortfolio, setNewInsurancePortfolio] = useState({
        srNo: '',
        insuranceCompany: '',
        insurerName: '',
        policyType: '',
        goalPurpose: '',
        policyName: '',
        policyNumber: '',
        policyStartDate: '',
        premiumMode: '',
        premiumAmount: '',
        lastPremiumPayingDate: '',
        maturityDate: '',
        sumAssured: '',
        nominee: '',
        subBrokerName: ''
    });

    useEffect(() => {
        trackFeatureUsage('/family/monitoring/portfolio', 'view');
        fetchBasicDetails();
        fetchFamilyMembers();
    }, []);

    const fetchFamilyMembers = async () => {
        try {
            const response = await staticAPI.getFamilyProfile();
            if (response.data && response.data.length > 0) {
                setFamilyMembers(response.data[0].members || []);
            }
        } catch (error) {
            console.error('Error fetching family members:', error);
        }
    };

    const fetchBasicDetails = async () => {
        try {
            setLoading(true);
            const response = await staticAPI.getBasicDetails();
            if (response.data && response.data.length > 0) {
                const data = response.data[0];
                setFormData(prev => ({
                    ...prev,
                    ...data, // Load all data to preserve it on save
                    mutualFundsPortfolio: data.mutualFundsPortfolio || [],
                    sharesPortfolio: data.sharesPortfolio || [],
                    insurancePortfolio: data.insurancePortfolio || [],
                    subBrokers: data.subBrokers || []
                }));
            }
        } catch (error) {
            console.error('Error fetching basic details:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSectionEdit = (sectionName) => {
        if (editingSection === sectionName) {
            setEditingSection(null);
        } else {
            setEditingSection(sectionName);
        }
    };

    const isSectionEditing = (sectionName) => {
        return editMode || editingSection === sectionName;
    };

    // --- Mutual Funds Portfolio Methods ---
    const addMutualFundPortfolio = async () => {
        if (newMutualFundPortfolio.fundHouse && newMutualFundPortfolio.fundName) {
            const updatedData = {
                ...formData,
                mutualFundsPortfolio: [...formData.mutualFundsPortfolio, { ...newMutualFundPortfolio }]
            };

            try {
                setLoading(true);
                await staticAPI.updateBasicDetails(formData._id, updatedData);
                setFormData(updatedData);
                setNewMutualFundPortfolio({
                    srNo: '',
                    fundHouse: '',
                    investorName: '',
                    fundName: '',
                    goalPurpose: '',
                    folioNumber: '',
                    dateOfPurchase: '',
                    purchaseNAV: '',
                    numberOfUnits: '',
                    purchaseValue: '',
                    currentNAV: '',
                    currentValuation: '',
                    difference: '',
                    percentDifference: '',
                    subBrokerName: ''
                });
                setEditingSection(null);

                // Sync with other modules
                try {
                    await syncContactsFromForm(updatedData, 'BasicDetails');
                    await syncCustomerSupportFromForm(updatedData, 'BasicDetails');
                    await syncBillScheduleFromForm(updatedData, 'BasicDetails');
                } catch (syncError) {
                    console.error('Error syncing portfolio data:', syncError);
                }

                alert('Mutual fund portfolio added successfully!');
            } catch (error) {
                console.error('Error adding mutual fund portfolio:', error);
                alert('Failed to add mutual fund portfolio');
            } finally {
                setLoading(false);
            }
        }
    };

    const removeMutualFundPortfolio = async (index) => {
        const updatedData = {
            ...formData,
            mutualFundsPortfolio: formData.mutualFundsPortfolio.filter((_, i) => i !== index)
        };

        try {
            setLoading(true);
            await staticAPI.updateBasicDetails(formData._id, updatedData);
            setFormData(updatedData);

            // Sync with other modules
            try {
                await syncContactsFromForm(updatedData, 'BasicDetails');
                await syncCustomerSupportFromForm(updatedData, 'BasicDetails');
                await syncBillScheduleFromForm(updatedData, 'BasicDetails');
            } catch (syncError) {
                console.error('Error syncing portfolio data:', syncError);
            }
        } catch (error) {
            console.error('Error removing mutual fund portfolio:', error);
            alert('Failed to remove mutual fund portfolio');
        } finally {
            setLoading(false);
        }
    };

    const editMutualFundPortfolio = (index) => {
        setEditingSection('mutualFundsPortfolio');
        const item = formData.mutualFundsPortfolio[index];
        setNewMutualFundPortfolio(item);
        setFormData(prev => ({
            ...prev,
            mutualFundsPortfolio: prev.mutualFundsPortfolio.filter((_, i) => i !== index)
        }));
    };

    // --- Shares Portfolio Methods ---
    const addSharePortfolio = async () => {
        if (newSharePortfolio.dematCompany && newSharePortfolio.scriptName) {
            const updatedData = {
                ...formData,
                sharesPortfolio: [...formData.sharesPortfolio, { ...newSharePortfolio }]
            };

            try {
                setLoading(true);
                await staticAPI.updateBasicDetails(formData._id, updatedData);
                setFormData(updatedData);
                setNewSharePortfolio({
                    srNo: '',
                    dematCompany: '',
                    investorName: '',
                    scriptName: '',
                    goalPurpose: '',
                    dateOfPurchase: '',
                    purchaseNAV: '',
                    numberOfUnits: '',
                    purchaseValue: '',
                    currentNAV: '',
                    currentValuation: '',
                    difference: '',
                    percentDifference: '',
                    subBrokerName: ''
                });
                setEditingSection(null);

                // Sync with other modules
                try {
                    await syncContactsFromForm(updatedData, 'BasicDetails');
                    await syncCustomerSupportFromForm(updatedData, 'BasicDetails');
                    await syncBillScheduleFromForm(updatedData, 'BasicDetails');
                } catch (syncError) {
                    console.error('Error syncing portfolio data:', syncError);
                }

                alert('Share portfolio added successfully!');
            } catch (error) {
                console.error('Error adding share portfolio:', error);
                alert('Failed to add share portfolio');
            } finally {
                setLoading(false);
            }
        }
    };

    const removeSharePortfolio = async (index) => {
        const updatedData = {
            ...formData,
            sharesPortfolio: formData.sharesPortfolio.filter((_, i) => i !== index)
        };

        try {
            setLoading(true);
            await staticAPI.updateBasicDetails(formData._id, updatedData);
            setFormData(updatedData);

            // Sync with other modules
            try {
                await syncContactsFromForm(updatedData, 'BasicDetails');
                await syncCustomerSupportFromForm(updatedData, 'BasicDetails');
                await syncBillScheduleFromForm(updatedData, 'BasicDetails');
            } catch (syncError) {
                console.error('Error syncing portfolio data:', syncError);
            }
        } catch (error) {
            console.error('Error removing share portfolio:', error);
            alert('Failed to remove share portfolio');
        } finally {
            setLoading(false);
        }
    };

    const editSharePortfolio = (index) => {
        setEditingSection('sharesPortfolio');
        const item = formData.sharesPortfolio[index];
        setNewSharePortfolio(item);
        setFormData(prev => ({
            ...prev,
            sharesPortfolio: prev.sharesPortfolio.filter((_, i) => i !== index)
        }));
    };

    // --- Insurance Portfolio Methods ---
    const addInsurancePortfolio = async () => {
        if (newInsurancePortfolio.insuranceCompany && newInsurancePortfolio.policyName) {
            const updatedData = {
                ...formData,
                insurancePortfolio: [...formData.insurancePortfolio, { ...newInsurancePortfolio }]
            };

            try {
                setLoading(true);
                await staticAPI.updateBasicDetails(formData._id, updatedData);
                setFormData(updatedData);
                setNewInsurancePortfolio({
                    srNo: '',
                    insuranceCompany: '',
                    insurerName: '',
                    policyType: '',
                    goalPurpose: '',
                    policyName: '',
                    policyNumber: '',
                    policyStartDate: '',
                    premiumMode: '',
                    premiumAmount: '',
                    lastPremiumPayingDate: '',
                    maturityDate: '',
                    sumAssured: '',
                    nominee: '',
                    subBrokerName: ''
                });
                setEditingSection(null);

                // Sync with other modules
                try {
                    await syncContactsFromForm(updatedData, 'BasicDetails');
                    await syncCustomerSupportFromForm(updatedData, 'BasicDetails');
                    await syncBillScheduleFromForm(updatedData, 'BasicDetails');
                } catch (syncError) {
                    console.error('Error syncing portfolio data:', syncError);
                }

                alert('Insurance portfolio added successfully!');
            } catch (error) {
                console.error('Error adding insurance portfolio:', error);
                alert('Failed to add insurance portfolio');
            } finally {
                setLoading(false);
            }
        }
    };

    const removeInsurancePortfolio = async (index) => {
        const updatedData = {
            ...formData,
            insurancePortfolio: formData.insurancePortfolio.filter((_, i) => i !== index)
        };

        try {
            setLoading(true);
            await staticAPI.updateBasicDetails(formData._id, updatedData);
            setFormData(updatedData);

            // Sync with other modules
            try {
                await syncContactsFromForm(updatedData, 'BasicDetails');
                await syncCustomerSupportFromForm(updatedData, 'BasicDetails');
                await syncBillScheduleFromForm(updatedData, 'BasicDetails');
            } catch (syncError) {
                console.error('Error syncing portfolio data:', syncError);
            }
        } catch (error) {
            console.error('Error removing insurance portfolio:', error);
            alert('Failed to remove insurance portfolio');
        } finally {
            setLoading(false);
        }
    };

    const editInsurancePortfolio = (index) => {
        setEditingSection('insurancePortfolio');
        const item = formData.insurancePortfolio[index];
        setNewInsurancePortfolio(item);
        setFormData(prev => ({
            ...prev,
            insurancePortfolio: prev.insurancePortfolio.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="static-container">
            <h1>Portfolio Details</h1>
            {loading && <div className="loading">Loading...</div>}

            <div className="static-form">
                {/* Portfolio Details - Mutual Funds */}
                <div className="static-section">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiTrendingUp className="section-icon" />
                            <h3>Portfolio Details - Mutual Funds</h3>
                        </div>
                        <div className="section-actions">
                            <button className="btn-section-edit" onClick={() => toggleSectionEdit('mutualFundsPortfolio')} title="Add new entry">
                                <FiPlus /> New
                            </button>
                        </div>
                    </div>
                    <div className="section-content">
                        <div className="records-table">
                            {formData.mutualFundsPortfolio && formData.mutualFundsPortfolio.length > 0 ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>Fund Name</th>
                                            <th>Fund House</th>
                                            <th>Sub Broker Name</th>
                                            <th>Folio Number</th>
                                            <th>Purchase Date</th>
                                            <th>NAV</th>
                                            <th>Units</th>
                                            <th>Purchase Value</th>
                                            <th>Current Value</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.mutualFundsPortfolio.map((fund, index) => (
                                            <tr key={index}>
                                                <td>{fund.srNo || '-'}</td>
                                                <td>{fund.fundName || '-'}</td>
                                                <td>{fund.fundHouse || '-'}</td>
                                                <td>{fund.subBrokerName || '-'}</td>
                                                <td>{fund.folioNumber || '-'}</td>
                                                <td>{fund.dateOfPurchase || '-'}</td>
                                                <td>{fund.purchaseNAV || '-'}</td>
                                                <td>{fund.numberOfUnits || '-'}</td>
                                                <td>{fund.purchaseValue || '-'}</td>
                                                <td>{fund.currentValuation || '-'}</td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button
                                                            className="btn-edit"
                                                            onClick={() => editMutualFundPortfolio(index)}
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                        <button
                                                            className="btn-remove"
                                                            onClick={() => removeMutualFundPortfolio(index)}
                                                            title="Delete"
                                                        >
                                                            <FiX />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="no-data" style={{ padding: '20px', textAlign: 'center' }}>No mutual fund portfolios added yet.</p>
                            )}
                        </div>

                        {isSectionEditing('mutualFundsPortfolio') && (
                            <div className="add-family-member">
                                <h5>Add Mutual Fund Portfolio</h5>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Sr. No.</label>
                                        <input
                                            type="text"
                                            value={newMutualFundPortfolio.srNo}
                                            onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, srNo: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Fund House *</label>
                                        <input
                                            type="text"
                                            value={newMutualFundPortfolio.fundHouse}
                                            onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, fundHouse: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Name of Investor</label>
                                        <select
                                            value={newMutualFundPortfolio.investorName}
                                            onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, investorName: e.target.value })}
                                        >
                                            <option value="">Select family member...</option>
                                            {familyMembers && familyMembers.map((member, index) => (
                                                <option key={index} value={member.name}>{member.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Sub Broker Name</label>
                                        <select
                                            value={newMutualFundPortfolio.subBrokerName}
                                            onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, subBrokerName: e.target.value })}
                                        >
                                            <option value="">Select Sub Broker</option>
                                            {formData.subBrokers && formData.subBrokers.map((sb, index) => (
                                                <option key={index} value={sb.nameOfCompany}>{sb.nameOfCompany}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Name of Fund *</label>
                                        <input
                                            type="text"
                                            value={newMutualFundPortfolio.fundName}
                                            onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, fundName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Goal / Purpose</label>
                                        <input
                                            type="text"
                                            value={newMutualFundPortfolio.goalPurpose}
                                            onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, goalPurpose: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Folio Number</label>
                                        <input
                                            type="text"
                                            value={newMutualFundPortfolio.folioNumber}
                                            onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, folioNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Date of Purchase</label>
                                        <input
                                            type="date"
                                            value={newMutualFundPortfolio.dateOfPurchase}
                                            onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, dateOfPurchase: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Purchase NAV</label>
                                        <input
                                            type="number"
                                            value={newMutualFundPortfolio.purchaseNAV}
                                            onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, purchaseNAV: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Number of Units</label>
                                        <input
                                            type="number"
                                            value={newMutualFundPortfolio.numberOfUnits}
                                            onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, numberOfUnits: e.target.value })}
                                            step="0.001"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Purchase Value</label>
                                        <input
                                            type="number"
                                            value={newMutualFundPortfolio.purchaseValue}
                                            onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, purchaseValue: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Current NAV</label>
                                        <input
                                            type="number"
                                            value={newMutualFundPortfolio.currentNAV}
                                            onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, currentNAV: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Current Valuation</label>
                                        <input
                                            type="number"
                                            value={newMutualFundPortfolio.currentValuation}
                                            onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, currentValuation: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Difference</label>
                                        <input
                                            type="number"
                                            value={newMutualFundPortfolio.difference}
                                            onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, difference: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>% Difference</label>
                                        <input
                                            type="number"
                                            value={newMutualFundPortfolio.percentDifference}
                                            onChange={(e) => setNewMutualFundPortfolio({ ...newMutualFundPortfolio, percentDifference: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <button className="btn-primary" onClick={addMutualFundPortfolio}>
                                    <FiPlus /> Add Mutual Fund Portfolio
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Portfolio Details - Shares */}
                <div className="static-section">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiTrendingUp className="section-icon" />
                            <h3>Portfolio Details - Shares</h3>
                        </div>
                        <div className="section-actions">
                            <button className="btn-section-edit" onClick={() => toggleSectionEdit('sharesPortfolio')} title="Add new entry">
                                <FiPlus /> New
                            </button>
                        </div>
                    </div>
                    <div className="section-content">
                        <div className="records-table">
                            {formData.sharesPortfolio && formData.sharesPortfolio.length > 0 ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>Script Name</th>
                                            <th>Demat Company</th>
                                            <th>Sub Broker Name</th>
                                            <th>Date of Purchase</th>
                                            <th>Purchase NAV</th>
                                            <th>Purchase Value</th>
                                            <th>Units</th>
                                            <th>Current Value</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.sharesPortfolio.map((share, index) => (
                                            <tr key={index}>
                                                <td>{share.srNo || '-'}</td>
                                                <td>{share.scriptName || '-'}</td>
                                                <td>{share.dematCompany || '-'}</td>
                                                <td>{share.subBrokerName || '-'}</td>
                                                <td>{share.dateOfPurchase || '-'}</td>
                                                <td>{share.purchaseNAV || '-'}</td>
                                                <td>{share.purchaseValue || '-'}</td>
                                                <td>{share.numberOfUnits || '-'}</td>
                                                <td>{share.currentValuation || '-'}</td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button
                                                            className="btn-edit"
                                                            onClick={() => editSharePortfolio(index)}
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                        <button
                                                            className="btn-remove"
                                                            onClick={() => removeSharePortfolio(index)}
                                                            title="Delete"
                                                        >
                                                            <FiX />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="no-data" style={{ padding: '20px', textAlign: 'center' }}>No share portfolio added yet.</p>
                            )}
                        </div>

                        {isSectionEditing('sharesPortfolio') && (
                            <div className="add-family-member">
                                <h5>Add Share Portfolio</h5>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Sr. No.</label>
                                        <input
                                            type="text"
                                            value={newSharePortfolio.srNo}
                                            onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, srNo: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Demat Company *</label>
                                        <input
                                            type="text"
                                            value={newSharePortfolio.dematCompany}
                                            onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, dematCompany: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Name of Investor</label>
                                        <select
                                            value={newSharePortfolio.investorName}
                                            onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, investorName: e.target.value })}
                                        >
                                            <option value="">Select family member...</option>
                                            {familyMembers && familyMembers.map((member, index) => (
                                                <option key={index} value={member.name}>{member.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Sub Broker Name</label>
                                        <select
                                            value={newSharePortfolio.subBrokerName}
                                            onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, subBrokerName: e.target.value })}
                                        >
                                            <option value="">Select Sub Broker</option>
                                            {formData.subBrokers && formData.subBrokers.map((sb, index) => (
                                                <option key={index} value={sb.nameOfCompany}>{sb.nameOfCompany}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Name of Script *</label>
                                        <input
                                            type="text"
                                            value={newSharePortfolio.scriptName}
                                            onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, scriptName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Goal / Purpose</label>
                                        <input
                                            type="text"
                                            value={newSharePortfolio.goalPurpose}
                                            onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, goalPurpose: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Date of Purchase</label>
                                        <input
                                            type="date"
                                            value={newSharePortfolio.dateOfPurchase}
                                            onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, dateOfPurchase: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Purchase NAV</label>
                                        <input
                                            type="number"
                                            value={newSharePortfolio.purchaseNAV}
                                            onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, purchaseNAV: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Number of Units</label>
                                        <input
                                            type="number"
                                            value={newSharePortfolio.numberOfUnits}
                                            onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, numberOfUnits: e.target.value })}
                                            step="1"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Purchase Value</label>
                                        <input
                                            type="number"
                                            value={newSharePortfolio.purchaseValue}
                                            onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, purchaseValue: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Current NAV</label>
                                        <input
                                            type="number"
                                            value={newSharePortfolio.currentNAV}
                                            onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, currentNAV: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Current Valuation</label>
                                        <input
                                            type="number"
                                            value={newSharePortfolio.currentValuation}
                                            onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, currentValuation: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Difference</label>
                                        <input
                                            type="number"
                                            value={newSharePortfolio.difference}
                                            onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, difference: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>% Difference</label>
                                        <input
                                            type="number"
                                            value={newSharePortfolio.percentDifference}
                                            onChange={(e) => setNewSharePortfolio({ ...newSharePortfolio, percentDifference: e.target.value })}
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                                <button className="btn-primary" onClick={addSharePortfolio}>
                                    <FiPlus /> Add Share Portfolio
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Portfolio Details - Insurance */}
                <div className="static-section">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiHome className="section-icon" />
                            <h3>Portfolio Details - Insurance</h3>
                        </div>
                        <div className="section-actions">
                            <button className="btn-section-edit" onClick={() => toggleSectionEdit('insurancePortfolio')} title="Add new entry">
                                <FiPlus /> New
                            </button>
                        </div>
                    </div>
                    <div className="section-content">
                        <div className="records-table">
                            {formData.insurancePortfolio && formData.insurancePortfolio.length > 0 ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Sr. No.</th>
                                            <th>Insurance Company</th>
                                            <th>Sub Broker Name</th>
                                            <th>Insurer Name</th>
                                            <th>Type of Policy</th>
                                            <th>Goal/Purpose</th>
                                            <th>Policy Number</th>
                                            <th>Policy Start Date</th>
                                            <th>Premium Mode</th>
                                            <th>Premium Amount</th>
                                            <th>Last Premium Date</th>
                                            <th>Maturity Date</th>
                                            <th>Sum Assured</th>
                                            <th>Nominee</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {formData.insurancePortfolio.map((policy, index) => (
                                            <tr key={index}>
                                                <td>{policy.srNo || '-'}</td>
                                                <td>{policy.insuranceCompany || '-'}</td>
                                                <td>{policy.subBrokerName || '-'}</td>
                                                <td>{policy.insurerName || '-'}</td>
                                                <td>{policy.policyType || '-'}</td>
                                                <td>{policy.goalPurpose || '-'}</td>
                                                <td>{policy.policyNumber || '-'}</td>
                                                <td>{policy.policyStartDate || '-'}</td>
                                                <td>{policy.premiumMode || '-'}</td>
                                                <td>{policy.premiumAmount || '-'}</td>
                                                <td>{policy.lastPremiumPayingDate || '-'}</td>
                                                <td>{policy.maturityDate || '-'}</td>
                                                <td>{policy.sumAssured || '-'}</td>
                                                <td>{policy.nominee || '-'}</td>
                                                <td>
                                                    <div className="table-actions">
                                                        <button
                                                            className="btn-edit"
                                                            onClick={() => editInsurancePortfolio(index)}
                                                            title="Edit"
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                        <button
                                                            className="btn-remove"
                                                            onClick={() => removeInsurancePortfolio(index)}
                                                            title="Delete"
                                                        >
                                                            <FiX />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="no-data" style={{ padding: '20px', textAlign: 'center' }}>No insurance portfolio added yet.</p>
                            )}
                        </div>

                        {isSectionEditing('insurancePortfolio') && (
                            <div className="add-family-member">
                                <h5>Add Insurance Portfolio</h5>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Sr. No.</label>
                                        <input
                                            type="text"
                                            value={newInsurancePortfolio.srNo}
                                            onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, srNo: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Insurance Company *</label>
                                        <input
                                            type="text"
                                            value={newInsurancePortfolio.insuranceCompany}
                                            onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, insuranceCompany: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Sub Broker Name</label>
                                        <select
                                            value={newInsurancePortfolio.subBrokerName}
                                            onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, subBrokerName: e.target.value })}
                                        >
                                            <option value="">Select Sub Broker</option>
                                            {formData.subBrokers && formData.subBrokers.map((sb, index) => (
                                                <option key={index} value={sb.nameOfCompany}>{sb.nameOfCompany}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Name of Insurer</label>
                                        <input
                                            type="text"
                                            value={newInsurancePortfolio.insurerName}
                                            onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, insurerName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Type of Policy</label>
                                        <select
                                            value={newInsurancePortfolio.policyType}
                                            onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, policyType: e.target.value })}
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Life">Life</option>
                                            <option value="Health">Health</option>
                                            <option value="Motor">Motor</option>
                                            <option value="Travel">Travel</option>
                                            <option value="Property">Property</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Goal / Purpose</label>
                                        <input
                                            type="text"
                                            value={newInsurancePortfolio.goalPurpose}
                                            onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, goalPurpose: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Name of Policy *</label>
                                        <input
                                            type="text"
                                            value={newInsurancePortfolio.policyName}
                                            onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, policyName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Policy Number</label>
                                        <input
                                            type="text"
                                            value={newInsurancePortfolio.policyNumber}
                                            onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, policyNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Policy Start Date</label>
                                        <input
                                            type="date"
                                            value={newInsurancePortfolio.policyStartDate}
                                            onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, policyStartDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Premium Mode</label>
                                        <select
                                            value={newInsurancePortfolio.premiumMode}
                                            onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, premiumMode: e.target.value })}
                                        >
                                            <option value="">Select Mode</option>
                                            <option value="Monthly">Monthly</option>
                                            <option value="Quarterly">Quarterly</option>
                                            <option value="Half-Yearly">Half-Yearly</option>
                                            <option value="Yearly">Yearly</option>
                                            <option value="Single Premium">Single Premium</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Premium Amount</label>
                                        <input
                                            type="number"
                                            value={newInsurancePortfolio.premiumAmount}
                                            onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, premiumAmount: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Premium Date</label>
                                        <input
                                            type="date"
                                            value={newInsurancePortfolio.lastPremiumPayingDate}
                                            onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, lastPremiumPayingDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Maturity Date</label>
                                        <input
                                            type="date"
                                            value={newInsurancePortfolio.maturityDate}
                                            onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, maturityDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Sum Assured</label>
                                        <input
                                            type="number"
                                            value={newInsurancePortfolio.sumAssured}
                                            onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, sumAssured: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Nominee</label>
                                        <input
                                            type="text"
                                            value={newInsurancePortfolio.nominee}
                                            onChange={(e) => setNewInsurancePortfolio({ ...newInsurancePortfolio, nominee: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button className="btn-primary" onClick={addInsurancePortfolio}>
                                    <FiPlus /> Add Insurance Portfolio
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
