// database.js
const mongoose = require('mongoose');

function connectToDatabase() {
  mongoose.connect('mongodb+srv://FurkanAndac:jwhbkvm9321@agencies-shared-cluster.c5ugmev.mongodb.net/microservices-tool', {
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
