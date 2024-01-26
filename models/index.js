// models/index.js
const mongoose = require('mongoose');
const AgencyWebsite = require('./AgencyWebsite');
const Microservice = require('./Microservice');
const Clients = require('./Clients')

module.exports = {
  AgencyWebsite,
  Microservice,
  Clients,
};
