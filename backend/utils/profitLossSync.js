const ProfitLoss = require('../models/ProfitLoss');
const TradingDetails = require('../models/TradingDetails');

/**
 * Auto-generate P&L records by matching purchases and sales
 * This can be called after creating/updating trading details
 */
const autoGeneratePL = async (userId) => {
    try {
        // Get all purchase and sale transactions
        const purchases = await TradingDetails.find({
            userId: userId,
            typeOfTransaction: 'Purchase'
        });

        const sales = await TradingDetails.find({
            userId: userId,
            typeOfTransaction: 'Sell'
        });

        console.log(`Auto-sync: Found ${purchases.length} purchases and ${sales.length} sales for user ${userId}`);

        const generatedRecords = [];

        // Helper function for case-insensitive comparison
        const normalizeString = (str) => {
            return str ? str.toString().trim().toLowerCase() : '';
        };

        // Match purchases with sales
        for (const sale of sales) {
            const matchingPurchases = purchases.filter(p => {
                const scriptMatch = normalizeString(p.nameOfScript) === normalizeString(sale.nameOfScript);
                const investorMatch = normalizeString(p.nameOfInvestor) === normalizeString(sale.nameOfInvestor);
                const tradingIdMatch = normalizeString(p.tradingId) === normalizeString(sale.tradingId);

                let dateMatch = true;
                if (p.dateOfPurchase && sale.dateOfSale) {
                    dateMatch = new Date(p.dateOfPurchase) <= new Date(sale.dateOfSale);
                }

                return scriptMatch && investorMatch && tradingIdMatch && dateMatch;
            });

            if (matchingPurchases.length > 0) {
                const matchingPurchase = matchingPurchases.find(p =>
                    !generatedRecords.some(r => r.purchaseRecordId && r.purchaseRecordId.equals(p._id))
                ) || matchingPurchases[0];

                // Check if P&L record already exists
                const existingRecord = await ProfitLoss.findOne({
                    userId: userId,
                    purchaseRecordId: matchingPurchase._id,
                    salesRecordId: sale._id
                });

                // If doesn't exist, create it
                if (!existingRecord) {
                    const purchaseCharges = (matchingPurchase.charges1 || 0) +
                        (matchingPurchase.charges2 || 0) +
                        (matchingPurchase.charges3 || 0) +
                        (matchingPurchase.charges4 || 0) +
                        (matchingPurchase.charges5 || 0);

                    const salesCharges = (sale.charges1 || 0) +
                        (sale.charges2 || 0) +
                        (sale.charges3 || 0) +
                        (sale.charges4 || 0) +
                        (sale.charges5 || 0);

                    const plRecord = new ProfitLoss({
                        userId: userId,
                        purchaseRecordId: matchingPurchase._id,
                        salesRecordId: sale._id,
                        modeOfTransaction: matchingPurchase.modeOfTransaction,
                        dematCompany: matchingPurchase.dematCompany,
                        modeOfHolding: matchingPurchase.modeOfHolding,
                        nameOfInvestor: matchingPurchase.nameOfInvestor,
                        tradingId: matchingPurchase.tradingId,
                        nameOfScript: matchingPurchase.nameOfScript,
                        dateOfPurchase: matchingPurchase.dateOfPurchase,
                        purchaseQuantity: matchingPurchase.quantity,
                        purchasePrice: matchingPurchase.purchasePrice,
                        purchaseCharges: purchaseCharges,
                        dateOfSales: sale.dateOfSale,
                        salesQuantity: sale.quantity,
                        salesPrice: sale.salePrice,
                        salesCharges: salesCharges
                    });

                    await plRecord.save();
                    generatedRecords.push(plRecord);
                    console.log(`Auto-created P&L for ${matchingPurchase.nameOfScript}`);
                } else {
                    // If exists, update it with latest data
                    const purchaseCharges = (matchingPurchase.charges1 || 0) +
                        (matchingPurchase.charges2 || 0) +
                        (matchingPurchase.charges3 || 0) +
                        (matchingPurchase.charges4 || 0) +
                        (matchingPurchase.charges5 || 0);

                    const salesCharges = (sale.charges1 || 0) +
                        (sale.charges2 || 0) +
                        (sale.charges3 || 0) +
                        (sale.charges4 || 0) +
                        (sale.charges5 || 0);

                    existingRecord.modeOfTransaction = matchingPurchase.modeOfTransaction;
                    existingRecord.dematCompany = matchingPurchase.dematCompany;
                    existingRecord.modeOfHolding = matchingPurchase.modeOfHolding;
                    existingRecord.nameOfInvestor = matchingPurchase.nameOfInvestor;
                    existingRecord.tradingId = matchingPurchase.tradingId;
                    existingRecord.nameOfScript = matchingPurchase.nameOfScript;
                    existingRecord.dateOfPurchase = matchingPurchase.dateOfPurchase;
                    existingRecord.purchaseQuantity = matchingPurchase.quantity;
                    existingRecord.purchasePrice = matchingPurchase.purchasePrice;
                    existingRecord.purchaseCharges = purchaseCharges;
                    existingRecord.dateOfSales = sale.dateOfSale;
                    existingRecord.salesQuantity = sale.quantity;
                    existingRecord.salesPrice = sale.salePrice;
                    existingRecord.salesCharges = salesCharges;

                    await existingRecord.save();
                    console.log(`Auto-updated P&L for ${matchingPurchase.nameOfScript}`);
                }
            }
        }

        console.log(`Auto-sync completed: ${generatedRecords.length} new P&L records created`);
        return { created: generatedRecords.length };
    } catch (error) {
        console.error('Error in auto-generate P&L:', error);
        throw error;
    }
};

module.exports = { autoGeneratePL };
