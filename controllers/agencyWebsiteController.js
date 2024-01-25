// controllers/agencyWebsiteController.js
const { AgencyWebsite } = require('../models');

async function addAgencyWebsite(req, res) {
  try {
    const { name, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: 'Both name and url parameters are required.' });
    }

    const newAgency = new AgencyWebsite({ name, url });
    await newAgency.save();

    res.json({ name, url });
  } catch (error) {
    console.error('Error adding agency website:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  addAgencyWebsite,
};
