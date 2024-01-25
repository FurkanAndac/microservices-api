const mongoose = require('mongoose');

const microserviceSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  name: String,
  url: String,
  production: {
    type: Boolean,
    default: false,
  },
  // Additional collection-related fields
  // Add your additional fields here
});

const Microservice = mongoose.model('Microservice', microserviceSchema);

module.exports = Microservice;
