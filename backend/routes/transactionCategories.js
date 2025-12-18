const express = require('express');
const router = express.Router();
const { categoryHierarchy, getBroaderCategories, getMainCategories, getSubCategories } = require('../config/categoryData');

/**
 * @route   GET /api/transaction-categories
 * @desc    Get complete transaction category hierarchy
 * @access  Public (no auth required as this is static reference data)
 */
router.get('/', (req, res) => {
    try {
        res.json({
            success: true,
            data: categoryHierarchy
        });
    } catch (error) {
        console.error('Error fetching transaction categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching transaction category data'
        });
    }
});

/**
 * @route   GET /api/transaction-categories/broader
 * @desc    Get all broader categories
 * @access  Public
 */
router.get('/broader', (req, res) => {
    try {
        const broaderCategories = getBroaderCategories();
        res.json({
            success: true,
            data: broaderCategories
        });
    } catch (error) {
        console.error('Error fetching broader categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching broader categories'
        });
    }
});

/**
 * @route   GET /api/transaction-categories/main/:broaderCategory
 * @desc    Get main categories for a specific broader category
 * @access  Public
 */
router.get('/main/:broaderCategory', (req, res) => {
    try {
        const { broaderCategory } = req.params;
        const mainCategories = getMainCategories(decodeURIComponent(broaderCategory));
        res.json({
            success: true,
            data: mainCategories
        });
    } catch (error) {
        console.error('Error fetching main categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching main categories'
        });
    }
});

/**
 * @route   GET /api/transaction-categories/sub/:broaderCategory/:mainCategory
 * @desc    Get sub categories for a specific main category
 * @access  Public
 */
router.get('/sub/:broaderCategory/:mainCategory', (req, res) => {
    try {
        const { broaderCategory, mainCategory } = req.params;
        const subCategories = getSubCategories(
            decodeURIComponent(broaderCategory),
            decodeURIComponent(mainCategory)
        );
        res.json({
            success: true,
            data: subCategories
        });
    } catch (error) {
        console.error('Error fetching sub categories:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching sub categories'
        });
    }
});

module.exports = router;
