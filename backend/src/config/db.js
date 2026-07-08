const mongoose = require('mongoose');

async function connectDatabase() {
  const mongoUri = (process.env.MONGODB_URI || process.env.MONGO_URI || '').trim();

  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing from the backend .env file.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = connectDatabase;
