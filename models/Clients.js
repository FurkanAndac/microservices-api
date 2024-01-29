const mongoose = require('mongoose');

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
    type: [String],
    required: true
  },
  authToken: {
    type: String,
  },
  tokenExpiration: {
    type: Date,
  },
});


const Clients = mongoose.model('Clients', clientsSchema);

module.exports = Clients;
