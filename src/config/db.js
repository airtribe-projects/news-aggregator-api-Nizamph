const mongoose = require("mongoose");

const removeLegacyUserIndexes = async () => {
  const usersCollection = mongoose.connection.db.collection("users");

  for (const indexName of ["username_1", "name_1"]) {
    try {
      await usersCollection.dropIndex(indexName);
      console.log(`Dropped legacy index: users.${indexName}`);
    } catch (error) {
      if (error?.codeName !== "IndexNotFound") {
        throw error;
      }
    }
  }
};

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  await removeLegacyUserIndexes();
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
