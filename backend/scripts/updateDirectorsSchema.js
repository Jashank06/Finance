const mongoose = require('mongoose');
require('dotenv').config();

// Import the CompanyRecords model
const { CompanyRecords } = require('../controllers/staticController');

async function updateDirectorsSchema() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-app');
    console.log('Connected to MongoDB');

    // Find all company records
    const companies = await CompanyRecords.find({});
    console.log(`Found ${companies.length} company records`);

    let updatedCount = 0;
    
    // Update each company's directors array
    for (const company of companies) {
      let needsUpdate = false;
      
      // Check if directors need new fields
      if (company.directors && company.directors.length > 0) {
        company.directors.forEach((director, index) => {
          // Add new fields if they don't exist
          if (!director.mcaMobileNumber) {
            company.directors[index].mcaMobileNumber = '';
            needsUpdate = true;
          }
          if (!director.mcaEmailId) {
            company.directors[index].mcaEmailId = '';
            needsUpdate = true;
          }
          if (!director.gstMobileNumber) {
            company.directors[index].gstMobileNumber = '';
            needsUpdate = true;
          }
          if (!director.gstEmailId) {
            company.directors[index].gstEmailId = '';
            needsUpdate = true;
          }
          if (!director.bankMobileNumber) {
            company.directors[index].bankMobileNumber = '';
            needsUpdate = true;
          }
          if (!director.bankEmailId) {
            company.directors[index].bankEmailId = '';
            needsUpdate = true;
          }
          if (!director.additional) {
            company.directors[index].additional = '';
            needsUpdate = true;
          }
        });

        // Save the updated company record
        if (needsUpdate) {
          await company.save();
          updatedCount++;
          console.log(`Updated directors for company: ${company.companyName || 'Unknown'}`);
        }
      }
    }

    console.log(`\nMigration completed! Updated ${updatedCount} company records.`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run the migration
updateDirectorsSchema();
