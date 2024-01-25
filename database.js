// database.js
require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');
const fixieData = process.env.FIXIE_SOCKS_HOST.split(new RegExp('[/(:\\/@/]+'));


function connectToDatabase() {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    proxyUsername: fixieData[0],
    proxyPassword: fixieData[1],
    proxyHost: fixieData[2],
    proxyPort: fixieData[3]
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
