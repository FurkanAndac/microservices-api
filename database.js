// database.js
require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');

function connectToDatabase() {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  db.once('open', () => {
    console.log('Connected to MongoDB (microservices-tool)');
  });
}

module.exports = {
  connectToDatabase,
};
