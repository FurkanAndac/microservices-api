const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clientsController');

// GET route for / (fetch all clients)
router.get('/', clientsController.getClients);

router.delete('/:clientId', clientsController.deleteMember);

router.post('/register', clientsController.register);

router.post('/login', clientsController.login);

router.post('/logout', clientsController.logout);

router.post('/:clientId', clientsController.addMember);




// Add more routes as needed

module.exports = router;
