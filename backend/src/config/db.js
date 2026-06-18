const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;
    await mongoose.connect(uri, {
      dbName: dbName
    });
  } catch (error) {
    process.exit(1);
  }
};

module.exports = connectDB;
