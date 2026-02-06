import { useState, useEffect } from 'react';
import { investmentAPI } from '../utils/investmentAPI';
import projectAPI from '../utils/projectAPI';
import api from '../utils/api';
import './PayingForDropdown.css';

const PayingForDropdown = ({ value, onChange, disabled }) => {
    const [selectedModule, setSelectedModule] = useState(value?.module || '');
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);

    const MODULE_CONFIG = {
        'loan-ledger': {
            label: 'Udhar Lena/Dena',
            fetchFunction: async () => {
                const response = await investmentAPI.getAll('loan-ledger');
                return (response.data.investments || []).map(loan => ({
                    id: loan._id,
                    name: `${loan.name} - ₹${loan.amount.toLocaleString('en-IN')}`,
                    amount: loan.amount
                }));
            }
        },
        'on-behalf': {
            label: 'On Behalf Payments',
            fetchFunction: async () => {
                const response = await investmentAPI.getAll('on-behalf');
                return (response.data.investments || []).map(entry => {
                    const notes = JSON.parse(entry.notes || '{}');
                    const balanceAmount = entry.amount - (notes.totalReceived || notes.receivedAmount || 0);
                    return {
                        id: entry._id,
                        name: `${entry.name} - ₹${entry.amount.toLocaleString('en-IN')} (Balance: ₹${balanceAmount.toLocaleString('en-IN')})`,
                        amount: entry.amount
                    };
                });
            }
        },
        'loan-amortization': {
            label: 'Loan Management',
            fetchFunction: async () => {
                const response = await investmentAPI.getLoans();
                return (response.data.loans || []).map(loan => ({
                    id: loan._id,
                    name: `${loan.name} - ₹${loan.amount.toLocaleString('en-IN')}`,
                    amount: loan.amount
                }));
            }
        },
        'project-expense': {
            label: 'Project Wise Income / Expense',
            fetchFunction: async () => {
                const response = await projectAPI.getProjects();
                return (response.projects || []).map(project => ({
                    id: project._id,
                    name: project.name,
                    amount: project.amount || 0
                }));
            }
        },
        'cheque-register': {
            label: 'Cheque Register',
            fetchFunction: async () => {
                const response = await api.get('/budget/cheque-register');
                return (response.data || []).map(cheque => ({
                    id: cheque._id,
                    name: `${cheque.chequePartyDetails || 'Cheque'} - ${cheque.chequeNumber} - ₹${(cheque.amount || 0).toLocaleString('en-IN')}`,
                    amount: cheque.amount || 0
                }));
            }
        },
        'daily-cash': {
            label: 'Daily Cash Register',
            fetchFunction: async () => {
                const response = await api.get('/budget/daily-cash');
                return (response.data || []).map(cash => ({
                    id: cash._id,
                    name: `${cash.description || 'Cash Entry'} - ₹${(cash.debit || cash.credit || 0).toLocaleString('en-IN')}`,
                    amount: cash.debit || cash.credit || 0
                }));
            }
        },
        'manage-finance': {
            label: 'Manage Finance',
            fetchFunction: async () => {
                const response = await api.get('/scheduled-expenses');
                return (response.data || []).map(expense => ({
                    id: expense._id,
                    name: `${expense.title} - ₹${(expense.amount || 0).toLocaleString('en-IN')}`,
                    amount: expense.amount || 0
                }));
            }
        },
        'targets': {
            label: 'Targets for Life',
            fetchFunction: async () => {
                const response = await investmentAPI.getAll('targets');
                return (response.data.investments || []).map(target => ({
                    id: target._id,
                    name: target.name,
                    amount: target.amount || 0
                }));
            }
        },
        'bill-dates': {
            label: 'Bill Dates',
            fetchFunction: async () => {
                const response = await investmentAPI.getAll('daily-bill-checklist');
                return (response.data.investments || []).map(bill => {
                    let notes = {};
                    try { notes = bill.notes ? JSON.parse(bill.notes) : {}; } catch { }
                    const billName = notes.billName || bill.provider || notes.billType || '';
                    const billType = notes.billType || 'Bill';
                    const amount = bill.amount || notes.amount || 0;
                    return {
                        id: bill._id,
                        name: `${billType} - ${billName} - ₹${amount.toLocaleString('en-IN')}`,
                        amount: amount
                    };
                });
            }
        },
        'nps-investments': {
            label: 'NPS / Post Office / PPF Investments',
            fetchFunction: async () => {
                const response = await investmentAPI.getAll('nps-ppf');
                return (response.data.investments || []).map(inv => ({
                    id: inv._id,
                    name: `${inv.name} - ${inv.type}`,
                    amount: inv.amount || 0
                }));
            }
        },
        'gold-investments': {
            label: 'Gold / SGB / Silver / Bonds Investments',
            fetchFunction: async () => {
                const response = await investmentAPI.getAll('gold-sgb');
                return (response.data.investments || []).map(inv => ({
                    id: inv._id,
                    name: `${inv.name} - ${inv.type}`,
                    amount: inv.amount || 0
                }));
            }
        },
        'rd-fd-deposits': {
            label: 'RD, FD & Other Deposits',
            fetchFunction: async () => {
                const response = await investmentAPI.getAll('bank-schemes');
                return (response.data.investments || []).map(inv => ({
                    id: inv._id,
                    name: `${inv.name} - ${inv.type}`,
                    amount: inv.amount || 0
                }));
            }
        },

    };

    useEffect(() => {
        if (selectedModule && MODULE_CONFIG[selectedModule]) {
            fetchEntries();
        } else {
            setEntries([]);
        }
    }, [selectedModule]);

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const config = MODULE_CONFIG[selectedModule];
            if (config && config.fetchFunction) {
                const data = await config.fetchFunction();
                setEntries(data);
            }
        } catch (error) {
            console.error('Error fetching entries:', error);
            setEntries([]);
        } finally {
            setLoading(false);
        }
    };

    const handleModuleChange = (e) => {
        const module = e.target.value;
        setSelectedModule(module);
        onChange({
            module,
            referenceId: '',
            referenceName: ''
        });
    };

    const handleEntryChange = (e) => {
        const referenceId = e.target.value;
        const entry = entries.find(e => e.id === referenceId);
        onChange({
            module: selectedModule,
            referenceId,
            referenceName: entry ? entry.name : '',
            amount: entry ? entry.amount : null // Pass amount to parent
        });
    };

    return (
        <div className="paying-for-dropdown">
            <div className="paying-for-field">
                <label>Paying For (Optional)</label>
                <select
                    value={selectedModule}
                    onChange={handleModuleChange}
                    disabled={disabled}
                    className="paying-for-module-select"
                >
                    <option value="">-- Select Module --</option>
                    {Object.entries(MODULE_CONFIG).map(([key, config]) => (
                        <option key={key} value={key}>
                            {config.label}
                        </option>
                    ))}
                </select>
            </div>

            {selectedModule && (
                <div className="paying-for-field">
                    <label>Select Entry</label>
                    {loading ? (
                        <div className="paying-for-loading">Loading entries...</div>
                    ) : (
                        <select
                            value={value?.referenceId || ''}
                            onChange={handleEntryChange}
                            disabled={disabled || entries.length === 0}
                            className="paying-for-entry-select"
                        >
                            <option value="">-- Select Entry --</option>
                            {entries.map(entry => (
                                <option key={entry.id} value={entry.id}>
                                    {entry.name}
                                </option>
                            ))}
                        </select>
                    )}
                    {!loading && entries.length === 0 && (
                        <p className="paying-for-no-entries">No entries found in this module</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default PayingForDropdown;
