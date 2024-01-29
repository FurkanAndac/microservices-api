// routes.js
const express = require('express');
const router = express.Router();
const agencyWebsiteRoutes = require('./routes/agencyWebsiteRoutes');
const microserviceRoutes = require('./routes/microserviceRoutes');
const clientsRoutes = require('./routes/clientsRoutes')
const cookieRoutes = require('./routes/cookieRoutes')


// Define main API routes
router.use('/cookies', cookieRoutes);
router.use('/agency-website', agencyWebsiteRoutes);
router.use('/microservices', microserviceRoutes);
router.use('/clients', clientsRoutes);


module.exports = router;
