// routes/agencyWebsiteRoutes.js
const express = require('express');
const router = express.Router();
const { addAgencyWebsite } = require('../controllers/agencyWebsiteController');

// API endpoint for handling POST requests
router.post('/', addAgencyWebsite);

module.exports = router;
