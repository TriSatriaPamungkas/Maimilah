// scripts/migration-add-phone.js
// Run this once to add phone field to existing registrations

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoose = require("mongoose");

async function migratePhoneField() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    const db = mongoose.connection.db;
    const registrations = db.collection("registrations");

    // Find all registrations without phone field
    const result = await registrations.updateMany(
      { phone: { $exists: false } },
      { $set: { phone: "-" } }
    );

    console.log(
      `✅ Updated ${result.modifiedCount} registrations with default phone "-"`
    );

    // List registrations that still need manual update
    const needsUpdate = await registrations.find({ phone: "-" }).toArray();
    console.log(
      `⚠️ ${needsUpdate.length} registrations have phone "-" (need manual update)`
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Migration error:", error);
  }
}

migratePhoneField();

// To run: node scripts/migration-add-phone.js
