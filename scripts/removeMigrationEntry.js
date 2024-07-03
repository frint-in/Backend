import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const uri = process.env.MIGRATE_dbConnectionUri;

async function removeMigrationEntry(migrationName) {
  try {
    await mongoose.connect(uri);

    const db = mongoose.connection.db;
    const changelogCollection = db.collection('changelog');
    try {


      const response = await changelogCollection.deleteOne({ name: migrationName });
      if (response) {
          console.log(`Migration entry for ${migrationName} removed successfully`);
      }else{
          console.log('remove failed');
      }
    } catch (error) {
      console.log("error while deleting>>>>>>>", error);
    }
  } catch (error) {
    console.error("Error removing migration entry:", error);
  } finally {
    await mongoose.disconnect();
  }
}

removeMigrationEntry("add-isVerified-user");
