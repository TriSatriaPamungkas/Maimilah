// scripts/hashPasswords.ts
// JALANKAN SEKALI untuk hash password yang sudah ada di database

import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "";

async function hashExistingPasswords() {
  if (!MONGODB_URI) {
    throw new Error("Please add your Mongo URI to .env");
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db();

  try {
    console.log("🔍 Mencari users dengan password belum di-hash...");

    const users = await db.collection("users").find({}).toArray();

    let hashedCount = 0;

    for (const user of users) {
      // Check jika password belum di-hash (bcrypt hash length = 60)
      if (user.password && user.password.length !== 60) {
        console.log(
          `📝 Hashing password untuk: ${user.username} (${user.email})`
        );

        const hashedPassword = await bcrypt.hash(user.password, 10);

        await db.collection("users").updateOne(
          { _id: user._id },
          {
            $set: {
              password: hashedPassword,
              updatedAt: new Date(),
            },
          }
        );

        hashedCount++;
        console.log(`✅ Success: ${user.username} - ${user.email}`);
      } else {
        console.log(
          `⏭️  Skip (already hashed): ${user.username} - ${user.email}`
        );
      }
    }

    console.log(`\n✅ Selesai! ${hashedCount} password berhasil di-hash`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

// Run script
hashExistingPasswords()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
