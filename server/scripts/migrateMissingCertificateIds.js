const mongoose = require('mongoose');
const { randomBytes } = require('crypto');
const CertificateApproval = require('../models/CertificateApproval'); // Adjust path as needed

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') }); // Load .env file

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your_database_name'; // REPLACE 'your_database_name' with your actual database name if not using MONGODB_URI

async function migrateMissingCertificateIds() {
  console.log('Starting migration for missing certificate IDs...');

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully.');

    // Find all approved certificates that are missing a certificateId
    const query = {
      approvedAt: { $ne: null, $exists: true }, // Must be approved
      certificateId: { $in: [null, '', undefined], $exists: true }, // certificateId is null, empty string, or undefined
    };

    const missingCertificates = await CertificateApproval.find(query);
    console.log(`Found ${missingCertificates.length} approved certificates with missing IDs.`);

    for (const certificate of missingCertificates) {
      // Generate a new unique certificate ID
      const newCertificateId = randomBytes(8).toString('hex').toUpperCase();

      // Update the certificate record
      certificate.certificateId = newCertificateId;
      await certificate.save();
      console.log(`Updated certificate ID for record ${certificate._id}: ${newCertificateId}`);
    }

    console.log('Migration completed successfully.');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

migrateMissingCertificateIds();
