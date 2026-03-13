const ProfitLoss = require('../models/ProfitLoss');
const TradingDetails = require('../models/TradingDetails');

/**
 * Auto-generate P&L records by matching purchases and sales
 * This can be called after creating/updating trading details
 */
const autoGeneratePL = async (userId) => {
    try {
        // 1. Reset all purchases' remainingQuantity to their original quantity and delete old P&L records
        // This ensures we have a clean slate for recalculation
        const purchases = await TradingDetails.find({
            userId: userId,
            typeOfTransaction: 'Purchase'
        }).sort({ dateOfPurchase: 1, createdAt: 1 }); // FIFO order

        for (const p of purchases) {
            p.remainingQuantity = p.quantity;
            await p.save();
        }

        // Delete existing P&L records to prevent duplicates and ensure fresh sync
        await ProfitLoss.deleteMany({ userId: userId });

        const sales = await TradingDetails.find({
            userId: userId,
            typeOfTransaction: 'Sell'
        }).sort({ dateOfSale: 1, createdAt: 1 });

        console.log(`Auto-sync: Found ${purchases.length} purchases and ${sales.length} sales for user ${userId}`);

        let generatedCount = 0;
        const normalize = (str) => str ? str.toString().trim().toLowerCase() : '';

        // 2. Process each sale using FIFO matching across purchases
        for (const sale of sales) {
            let remainingToSell = sale.quantity;

            // Find matching purchases for this specific scrip/investor/ID
            // only those that were bought before or on the sale date
            const possiblePurchases = purchases.filter(p => 
                normalize(p.nameOfScript) === normalize(sale.nameOfScript) &&
                normalize(p.nameOfInvestor) === normalize(sale.nameOfInvestor) &&
                normalize(p.tradingId) === normalize(sale.tradingId) &&
                p.remainingQuantity > 0 &&
                (!p.dateOfPurchase || !sale.dateOfSale || new Date(p.dateOfPurchase) <= new Date(sale.dateOfSale))
            );

            for (const purchase of possiblePurchases) {
                if (remainingToSell <= 0) break;

                const sellFromThisLot = Math.min(purchase.remainingQuantity, remainingToSell);
                
                // Calculate proportional charges for this portion of the purchase
                const purchaseRatio = sellFromThisLot / purchase.quantity;
                const purchaseCharges = (
                    (purchase.charges1 || 0) + (purchase.charges2 || 0) +
                    (purchase.charges3 || 0) + (purchase.charges4 || 0) +
                    (purchase.charges5 || 0)
                ) * purchaseRatio;

                // Proportional charges for this portion of the sale
                const saleRatio = sellFromThisLot / sale.quantity;
                const saleCharges = (
                    (sale.charges1 || 0) + (sale.charges2 || 0) +
                    (sale.charges3 || 0) + (sale.charges4 || 0) +
                    (sale.charges5 || 0)
                ) * saleRatio;

                const plRecord = new ProfitLoss({
                    userId: userId,
                    purchaseRecordId: purchase._id,
                    salesRecordId: sale._id,
                    modeOfTransaction: purchase.modeOfTransaction,
                    dematCompany: purchase.dematCompany,
                    modeOfHolding: purchase.modeOfHolding,
                    nameOfInvestor: purchase.nameOfInvestor,
                    tradingId: purchase.tradingId,
                    nameOfScript: purchase.nameOfScript,
                    dateOfPurchase: purchase.dateOfPurchase,
                    purchaseQuantity: sellFromThisLot,
                    purchasePrice: purchase.purchasePrice,
                    purchaseCharges: purchaseCharges,
                    dateOfSales: sale.dateOfSale,
                    salesQuantity: sellFromThisLot,
                    salesPrice: sale.salePrice,
                    salesCharges: saleCharges,
                    status: purchase.remainingQuantity === sellFromThisLot ? 'Closed' : 'Partial'
                });

                await plRecord.save();
                
                // Update purchase remaining quantity
                purchase.remainingQuantity -= sellFromThisLot;
                await purchase.save();
                
                remainingToSell -= sellFromThisLot;
                generatedCount++;
            }
        }

        console.log(`Auto-sync completed: ${generatedCount} P&L segments created`);
        return { created: generatedCount };
    } catch (error) {
        console.error('Error in auto-generate P&L:', error);
        throw error;
    }
};

module.exports = { autoGeneratePL };
