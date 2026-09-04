import "dotenv/config";
import dns from "dns";
import mongoose from "mongoose";

// Fix Node.js SRV DNS lookup issue on Windows for MongoDB Atlas
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("No MONGODB_URI");
  await mongoose.connect(uri);

  const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }));
  const result = await User.updateMany(
    { role: "employee" },
    { $set: { role: "student" } }
  );

  console.log(`Successfully updated ${result.modifiedCount} users from role 'employee' to 'student'.`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
