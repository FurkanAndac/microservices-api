// models/AgencyWebsite.js
const mongoose = require('mongoose');

const agencyWebsiteSchema = new mongoose.Schema({
  name: String,
  url: String,
});

const AgencyWebsite = mongoose.model('AgencyWebsite', agencyWebsiteSchema, 'agency-website');

module.exports = AgencyWebsite;
