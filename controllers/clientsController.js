const Clients = require('../models/Clients');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Client registration logic
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    console.log(email)
    // Check if the email is already registered
    const existingClient = await Clients.findOne({ email });
    if (existingClient) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new client
    const newClient = new Clients({
      name,
      email,
      members: [],
      role,
      password: hashedPassword, // Assuming you have a 'password' field in your schema
      trialExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    });

    // Save the client to the database
    const savedClient = await newClient.save();

    res.status(201).json({
      name: savedClient.name,
      email: savedClient.email,
      clientId: savedClient._id,
  });
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Client login logic

async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Find the client with the provided email
    const client = await Clients.findOne({ email });

    // Check if the client exists
    if (!client) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (client.trialExpiresAt && client.trialExpiresAt <= new Date()) {
      await client.updateOne({ _id: client._id }, { $set: { authToken: null, tokenExpiration: null } });

      return res.status(403).json({ message: 'Trial period has ended.' });
    }

    // Compare the provided password with the hashed password in the database
    const passwordMatch = await bcrypt.compare(password, client.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    // Accessing the _id property
    const clientId = client._id;

    // Now you can use clientId in your further logic
    console.log('Client ID:', clientId);

    const tokenPayload = {
      email: email,
      clientId: client._id.toString(),  // Assuming _id is the client ID
      role: client.role,
    };
    // If authentication is successful, generate a JWT token with clientId in payload
    const token = jwt.sign(tokenPayload, process.env.SECRET_KEY, { expiresIn: '1d' });

    const decodedToken = jwt.decode(token, { complete: true });
    console.log("decodedToken:"+decodedToken);
    // Update the client's authToken, clientId, and token expiration in the database
    const expirationDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000); // 1 days from now
    await Clients.updateOne(
      { email: email },
      { $set: { authToken: token, clientId: client._id, tokenExpiration: expirationDate } }
    );

    res.json({ token, expiresIn: 1 * 24 * 60 * 60 }); // expiresIn in seconds (1 days)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function logout(req, res) {
  const clientId = req.decodedToken.clientId;

  await deleteTokensForClient(clientId);
  res.status(200).json({succes: true})
}
const deleteTokensForClient = async (clientId) => {
  try {
    // Assuming you have a 'clients' collection/model in your database
    const client = await Clients.findById(clientId);

    if (!client) {
      console.error('Client not found.');
      return;
    }

    // Clear or invalidate the tokens stored in your client document
    client.authToken = null;
    client.tokenExpiration = null;

    // Save the updated client document
    await client.save();
    console.log('Tokens deleted for client:', clientId);
  } catch (error) {
    console.error('Error deleting tokens:', error);
  }
};

// Controller function for handling the GET request to fetch all clients
async function getClients(req, res) {
  try {
    // Retrieve the JWT token from the cookie
    const authToken = req.cookies.jwtToken;

    if (!authToken) {
      return res.status(401).json({ error: 'Authorization token not provided.' });
    }

    // Remove 'Bearer ' prefix if present
    const token = authToken.replace('Bearer ', '');

    // Decode the JWT token to extract the clientId
    const decodedPayload = jwt.decode(token);

    if (!decodedPayload || !decodedPayload.clientId) {
      return res.status(400).json({ error: 'Invalid token payload' });
    }

    const clientId = decodedPayload.clientId;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    // Use the clientId to fetch clients from the database
    const clients = await Clients.find({ _id: clientId });
    console.log("clients:"+clients);
    
    res.json(clients.map(client => ({
      members: client.members,
      name: client.name,
      // role: client.role
    })));
    } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
// Controller function for handling the DELETE request to delete a member by email
async function deleteMember(req, res) {
  try {
    // Retrieve the JWT token from the cookie
    const authToken = req.cookies.jwtToken;

    if (!authToken) {
      return res.status(401).json({ error: 'Authorization token not provided.' });
    }

    // Remove 'Bearer ' prefix if present
    const token = authToken.replace('Bearer ', '');

    // Decode the JWT token to extract the clientId
    const decodedPayload = jwt.decode(token);

    if (!decodedPayload || !decodedPayload.clientId) {
      return res.status(400).json({ error: 'Invalid token payload' });
    }

    const clientId = decodedPayload.clientId;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    // Retrieve other parameters from the request
    const { memberEmail } = req.query;

    console.log(clientId);
    console.log(memberEmail);

    if (!clientId || !memberEmail) {
      return res.status(400).json({ error: 'clientId and memberEmail parameters are required' });
    }

    // Use the clientId to update the clients collection
    const result = await Clients.findOneAndUpdate(
      { _id: clientId },
      { $pull: { members: memberEmail } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Member deleted successfully', updatedClient: result });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function addMember(req, res) {
  try {
    // Retrieve the JWT token from the cookie
    const authToken = req.cookies.jwtToken;

    if (!authToken) {
      return res.status(401).json({ error: 'Authorization token not provided.' });
    }

    // Remove 'Bearer ' prefix if present
    const token = authToken.replace('Bearer ', '');

    // Decode the JWT token to extract the clientId
    const decodedPayload = jwt.decode(token);

    if (!decodedPayload || !decodedPayload.clientId) {
      return res.status(400).json({ error: 'Invalid token payload' });
    }

    const clientId = decodedPayload.clientId;

    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ error: 'Invalid client ID' });
    }

    // Retrieve other parameters from the request
    const { memberEmail } = req.query;

    console.log(clientId);
    console.log(memberEmail);

    if (!clientId || !memberEmail) {
      return res.status(400).json({ error: 'clientId and memberEmail parameters are required' });
    }

    // Fetch the user details from the user database using the provided memberEmail
    const user = await Clients.findOne({ email: memberEmail });

    if (!user) {
      return res.status(404).json({ error: 'User not found with the provided email.' });
    }

    // Extract the name and role from the fetched user details
    const memberName = user.name;
    const memberRole = user.role;

    // Use the clientId to update the clients collection
    const result = await Clients.findOneAndUpdate(
      { _id: clientId },
      { $addToSet: { members: { email: memberEmail, name: memberName, role: memberRole } } },
      { new: true }
    );

    console.log(result);

    if (!result) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Member added successfully', updatedClient: result });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
// Export the controller functions
module.exports = {
  login, register, logout, getClients, deleteMember, addMember
  // Add more controller functions as needed
};
