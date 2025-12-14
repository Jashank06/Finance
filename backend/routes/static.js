const express = require('express');
const router = express.Router();
const { BasicDetailsController, CompanyRecordsController, MobileEmailDetailsController, PersonalRecordsController, OnlineAccessDetailsController, InventoryRecordController, ContactManagementController, DigitalAssetsController, CustomerSupportController, FamilyProfileController, LandRecordsController, MembershipListController, FamilyTasksController } = require('../controllers/staticController');
const auth = require('../middleware/auth');

// Middleware to protect all routes
router.use(auth);

// Basic Details routes
router.get('/basic-details', BasicDetailsController.getAll);
router.get('/basic-details/:id', BasicDetailsController.getOne);
router.post('/basic-details', BasicDetailsController.create);
router.put('/basic-details/:id', BasicDetailsController.update);
router.delete('/basic-details/:id', BasicDetailsController.delete);

// Company Records routes
router.get('/company-records', CompanyRecordsController.getAll);
router.get('/company-records/:id', CompanyRecordsController.getOne);
router.post('/company-records', CompanyRecordsController.create);
router.put('/company-records/:id', CompanyRecordsController.update);
router.delete('/company-records/:id', CompanyRecordsController.delete);

// Mobile & Email Details routes
router.get('/mobile-email-details', MobileEmailDetailsController.getAll);
router.get('/mobile-email-details/:id', MobileEmailDetailsController.getOne);
router.post('/mobile-email-details', MobileEmailDetailsController.create);
router.put('/mobile-email-details/:id', MobileEmailDetailsController.update);
router.delete('/mobile-email-details/:id', MobileEmailDetailsController.delete);

// Personal Records routes
router.get('/personal-records', PersonalRecordsController.getAll);
router.get('/personal-records/:id', PersonalRecordsController.getOne);
router.post('/personal-records', PersonalRecordsController.create);
router.put('/personal-records/:id', PersonalRecordsController.update);
router.delete('/personal-records/:id', PersonalRecordsController.delete);

// Online Access Details routes
router.get('/online-access-details', OnlineAccessDetailsController.getAll);
router.get('/online-access-details/:id', OnlineAccessDetailsController.getOne);
router.post('/online-access-details', OnlineAccessDetailsController.create);
router.put('/online-access-details/:id', OnlineAccessDetailsController.update);
router.delete('/online-access-details/:id', OnlineAccessDetailsController.delete);

// Inventory Record routes
router.get('/inventory-record', InventoryRecordController.getAll);
router.get('/inventory-record/:id', InventoryRecordController.getOne);
router.post('/inventory-record', InventoryRecordController.create);
router.put('/inventory-record/:id', InventoryRecordController.update);
router.delete('/inventory-record/:id', InventoryRecordController.delete);

// Contact Management routes
router.get('/contact-management', ContactManagementController.getAll);
router.get('/contact-management/:id', ContactManagementController.getOne);
router.post('/contact-management', ContactManagementController.create);
router.put('/contact-management/:id', ContactManagementController.update);
router.delete('/contact-management/:id', ContactManagementController.delete);

// Digital Assets routes
router.get('/digital-assets', DigitalAssetsController.getAll);
router.get('/digital-assets/:id', DigitalAssetsController.getOne);
router.post('/digital-assets', DigitalAssetsController.create);
router.put('/digital-assets/:id', DigitalAssetsController.update);
router.delete('/digital-assets/:id', DigitalAssetsController.delete);

// Customer Support routes
router.get('/customer-support', CustomerSupportController.getAll);
router.get('/customer-support/:id', CustomerSupportController.getOne);
router.post('/customer-support', CustomerSupportController.create);
router.put('/customer-support/:id', CustomerSupportController.update);
router.delete('/customer-support/:id', CustomerSupportController.delete);

// Family Profile routes
router.get('/family-profile', FamilyProfileController.getAll);
router.get('/family-profile/:id', FamilyProfileController.getOne);
router.post('/family-profile', FamilyProfileController.create);
router.put('/family-profile/:id', FamilyProfileController.update);
router.delete('/family-profile/:id', FamilyProfileController.delete);

// Land Records routes
router.get('/land-records', LandRecordsController.getAll);
router.get('/land-records/:id', LandRecordsController.getOne);
router.post('/land-records', LandRecordsController.create);
router.put('/land-records/:id', LandRecordsController.update);
router.delete('/land-records/:id', LandRecordsController.delete);

// Membership List routes
router.get('/membership-list', MembershipListController.getAll);
router.get('/membership-list/:id', MembershipListController.getOne);
router.post('/membership-list', MembershipListController.create);
router.put('/membership-list/:id', MembershipListController.update);
router.delete('/membership-list/:id', MembershipListController.delete);

// Family Tasks routes
router.get('/family-tasks', FamilyTasksController.getAll);
router.get('/family-tasks/:id', FamilyTasksController.getOne);
router.post('/family-tasks', FamilyTasksController.create);
router.put('/family-tasks/:id', FamilyTasksController.update);
router.delete('/family-tasks/:id', FamilyTasksController.delete);

// Placeholder routes for other static types (to be implemented)
const createPlaceholderRoutes = (routeName) => {
  router.get(`/${routeName}`, (req, res) => {
    res.status(501).json({ message: `${routeName} endpoints not yet implemented` });
  });
  
  router.get(`/${routeName}/:id`, (req, res) => {
    res.status(501).json({ message: `${routeName} endpoints not yet implemented` });
  });
  
  router.post(`/${routeName}`, (req, res) => {
    res.status(501).json({ message: `${routeName} endpoints not yet implemented` });
  });
  
  router.put(`/${routeName}/:id`, (req, res) => {
    res.status(501).json({ message: `${routeName} endpoints not yet implemented` });
  });
  
  router.delete(`/${routeName}/:id`, (req, res) => {
    res.status(501).json({ message: `${routeName} endpoints not yet implemented` });
  });
};

// Add placeholder routes for other static types
createPlaceholderRoutes('customer-support');
createPlaceholderRoutes('land-records');
createPlaceholderRoutes('membership-list');
createPlaceholderRoutes('online-access-details');
createPlaceholderRoutes('mobile-email-details');
createPlaceholderRoutes('personal-records');
createPlaceholderRoutes('digital-assets');
createPlaceholderRoutes('family-profile');
createPlaceholderRoutes('inventory-record');
createPlaceholderRoutes('contact-management');

module.exports = router;
