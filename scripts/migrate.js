// scripts/migrate.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import migrate from 'migrate-mongoose';

dotenv.config();

const options = {
  connectionString: process.env.MIGRATE_dbConnectionUri,
  migrationsPath: './migrations', // Path to the migrations directory
  changelogCollectionName: 'changelog', // Collection name to store migration history
  mongooseOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,  // Add this option to address deprecation warnings
  },
};

async function runMigration() {
  try {
    await migrate.init(options);
    console.log('Migration initialization complete');
  } catch (error) {
    console.error('Migration initialization failed', error);
  } finally {
    await mongoose.disconnect();
  }
}

runMigration();
