const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  }
});

const clientsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  members: {
    type: [memberSchema],
    required: true
  },
  role: {
    type: String,
    required: true
  },
  authToken: {
    type: String,
  },
  tokenExpiration: {
    type: Date,
  },
  hasPurchasedPackage: {
    type: Boolean,
    default: false,
  },
  trialExpiresAt: {
    type: Date, // This field stores the trial expiration date
  },
});


const Clients = mongoose.model('Clients', clientsSchema);

module.exports = Clients;
