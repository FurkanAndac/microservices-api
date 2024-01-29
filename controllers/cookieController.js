const jwt = require('jsonwebtoken');
require('dotenv').config();

// Secret key for signing the JWT token
const secretKey = process.env.SECRET_KEY;

// Route for generating and setting the JWT token in a cookie
async function setCookie(req, res) {
  try {
    // Assume you have a user object with the necessary information
    const user = {
      email: req.email,
      clientId: req.clientId
    };

    // Generate the payload for the JWT token
    const payload = {
      email: user.email,
      clientId: user.clientId
    };

    // Generate the JWT token
    const token = jwt.sign(payload, secretKey, { expiresIn: '30d' });

    // Set the token in a cookie
    res.cookie('jwtToken', token, { httpOnly: true,
    // secure: true,
 });

    // Send a response
    res.send('JWT token set in cookie!');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


module.exports = {
    setCookie
}

