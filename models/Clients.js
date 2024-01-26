const mongoose = require('mongoose');

const clientsSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  members: {
    type: [String],
    required: true
  }
});

const Clients = mongoose.model('Clients', clientsSchema);

module.exports = Clients;
