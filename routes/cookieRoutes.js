const express = require('express');
const router = express.Router();
const cookieController = require("../controllers/cookieController")


router.post('/set-cookie', cookieController.setCookie);





// Add more routes as needed

module.exports = router;
