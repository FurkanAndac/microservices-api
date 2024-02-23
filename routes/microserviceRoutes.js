// routes/microserviceRoutes.js
const express = require('express');
const router = express.Router();
const { getMicroservices, addMicroservice, deleteMicroservice, setMemberMicroservice } = require('../controllers/microserviceController');

// API endpoint to get collections associated with the client
router.get('/', getMicroservices);

// API endpoint to get collections associated with the client
router.get('/?production', getMicroservices);

// API endpoint for handling POST requests
router.post('/', addMicroservice);

// DELETE route for deleting a microservice by ID
router.delete('/:id', deleteMicroservice);

router.post('/setmember', setMemberMicroservice);

module.exports = router;
