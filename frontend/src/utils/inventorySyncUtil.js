import { investmentAPI } from './investmentAPI';

/**
 * Sync inventory purchases from Cash/Card/Bank transactions
 * When a transaction has inventory-related category, auto-create Inventory Record
 * 
 * @param {Object} transactionData - The transaction data
 * @param {String} source - Source type ('cash', 'card', 'bank')
 * @returns {Promise<Object>} Result of the sync operation
 */
export const syncInventoryFromTransaction = async (transactionData, source = 'transaction') => {
    try {
        // Check if transaction category is inventory
        const category = (transactionData.category || '').toLowerCase();

        if (category !== 'inventory') {
            console.log('Transaction category not inventory:', category);
            return { success: false, message: 'Not an inventory transaction', count: 0 };
        }

        // Get inventory sub-category
        const inventoryCategory = transactionData.inventoryCategory || 'Other';

        // Extract inventory details from transaction
        const inventoryEntry = {
            itemName: transactionData.merchant || transactionData.description || 'Item',
            companyName: transactionData.merchant || 'Unknown',
            modelNumber: '',
            serialNumber: '',
            purchaseDate: transactionData.date || new Date().toISOString().slice(0, 10),
            purchasePrice: transactionData.amount || 0,
            currency: transactionData.currency || 'INR',
            purchaseFrom: transactionData.merchant || 'Store',
            invoiceNumber: '',
            category: inventoryCategory,
            condition: 'New',
            location: 'Home',
            paymentMethod: source === 'cash' ? 'Cash' : source === 'card' ? 'Card' : 'Bank Transfer',
            notes: `Auto-synced from ${source} transaction\nCategory: ${inventoryCategory}\nDescription: ${transactionData.description || 'N/A'}`,
            status: 'Active'
        };

        // Create inventory record
        const payload = {
            category: 'static-inventory-record',
            type: 'Inventory',
            name: inventoryEntry.itemName,
            provider: inventoryEntry.companyName,
            amount: inventoryEntry.purchasePrice,
            startDate: inventoryEntry.purchaseDate,
            frequency: 'one-time',
            notes: JSON.stringify(inventoryEntry)
        };

        await investmentAPI.create(payload);

        console.log(`✅ Created inventory record for ${inventoryEntry.itemName} from ${source} transaction`);

        return {
            success: true,
            message: 'Inventory record created',
            count: 1,
            item: inventoryEntry.itemName
        };
    } catch (error) {
        console.error('Error syncing inventory from transaction:', error);
        return {
            success: false,
            message: error.message,
            count: 0
        };
    }
};

/**
 * Map transaction category to inventory category
 */
const mapTransactionCategoryToInventory = (category) => {
    const lowerCategory = category.toLowerCase();

    if (lowerCategory.includes('electronic') || lowerCategory.includes('gadget')) return 'Electronics';
    if (lowerCategory.includes('appliance')) return 'Appliances';
    if (lowerCategory.includes('furniture')) return 'Furniture';
    if (lowerCategory.includes('equipment')) return 'Equipment';
    if (lowerCategory.includes('vehicle') || lowerCategory.includes('auto')) return 'Vehicles';

    return 'Other';
};

export default {
    syncInventoryFromTransaction
};
