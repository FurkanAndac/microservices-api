const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Clients = require('../models/Clients');


// controllers/microserviceController.js
const Microservice = require('../models/Microservice');

async function getMicroservices(req, res) {
  try {
    // Check if decodedToken is present in the request
    if (!req.decodedToken) {
      return res.status(401).json({ error: 'Authorization token not provided.' });
    }

    // Assuming the client ID is stored in the decoded token
    const clientId = req.decodedToken.clientId;

    // Use the client ID to fetch microservices
    const collections = await Microservice.find({ client: clientId });
    console.log(clientId)
    console.log(req.decodedToken)
    console.log('Collections:', collections);
    res.json(collections);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// app.post('/api/copy-microservices', async (req, res) => {
//   const authToken = req.headers.authorization.split('Bearer ')[1];
//   // Validate the authToken and check if the user has admin privileges
//   // Your authentication and authorization logic here...

//   const { teamMemberEmail } = req.body;

//   try {
//     // Find the admin client
//     const adminClient = await Clients.findOne({ email: /* admin's email */ });
//     if (!adminClient || adminClient.role !== 'admin') {
//       return res.status(403).json({ error: 'Unauthorized access.' });
//     }

//     // Find microservices owned by the admin client
//     const adminMicroservices = await Microservice.find({ client: adminClient._id });

//     // Find the team member client
//     const teamMemberClient = await Clients.findOne({ email: teamMemberEmail });
//     if (!teamMemberClient || teamMemberClient.role !== 'teamMember') {
//       return res.status(400).json({ error: 'Invalid team member.' });
//     }

//     // Create corresponding microservices for the team member client
//     const teamMemberMicroservices = adminMicroservices.map(adminMicroservice => ({
//       client: teamMemberClient._id,
//       name: adminMicroservice.name,
//       url: adminMicroservice.url,
//       production: adminMicroservice.production,
//     }));

//     // Insert team member microservices into the database
//     await Microservice.insertMany(teamMemberMicroservices);

//     res.json({ message: 'Microservices copied successfully.' });
//   } catch (error) {
//     console.error('Error copying microservices:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });
// Rest of your code...


async function addMicroservice(req, res) {
    try {
      // Check if decodedToken is present in the request
    if (!req.decodedToken) {
      return res.status(401).json({ error: 'Authorization token not provided.' });
    }

    // Assuming the client ID is stored in the decoded token
    const clientId = req.decodedToken.clientId;
    
    console.log("request: ", req.body)
    const { name, url, client=clientId, production } = req.body;

    console.log('Request body:', req.body); // Add this line for debugging

    if (!name || !url ) {
      return res.status(400).json({ error: 'Both name, url parameters are required.' });
    }

    const newMicroservice = new Microservice({ name, url, client, production });
    console.log('New Microservice:', newMicroservice); // Add this line for debugging

    await newMicroservice.save();
    console.log('Microservice saved successfully'); // Add this line for debugging

    const clients = await Clients.findOne({ _id: clientId });
    // const members = clients.members;
    console.log("clients:"+ clients)
    await Promise.all(clients.members.map(async (member) => {
      const memberClient = await Clients.findOne({ email: member.email });
      if (memberClient) {
        console.log("memberclient:"+ memberClient)
        await new Microservice({ name, url, client: memberClient._id, production }).save();
      }
    }));

    res.json({ name, url, client, production });
  } catch (error) {
    console.error('Error adding microservice:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
  

async function deleteMicroservice(req, res) {
  try {
    const authToken = req.headers.authorization;

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

    const microserviceId = req.params.id;
    const deletedMicroservice = await Microservice.findByIdAndDelete(microserviceId);

    const clientsAdmin = await Clients.findOne({ _id: clientId })
    clientsAdmin.members.forEach(async member => {
      const clientsMember = await Clients.findOne({ email: member.email})
      const memberMicroservice = await Microservice.findOne({client: clientsMember._id, url: deletedMicroservice.url})
      if (memberMicroservice) {
      const deleteMemberMicroservice = await Microservice.findByIdAndDelete(memberMicroservice._id)
      return deleteMemberMicroservice
    }
    });
    if (deletedMicroservice) {
      console.log("deleted: " + deletedMicroservice);
      res.json({ message: `Microservice "${deletedMicroservice.name}" deleted successfully.` });
    } else {
      res.status(404).json({ error: 'Microservice not found.' });
    }
  } catch (error) {
    console.error('Error deleting microservice:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function setMemberMicroservice(req, res) {
  try {
    // Retrieve the JWT token from the cookie
    const authToken = req.headers.authorization;

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
    const admin = await Clients.findOne({ _id: clientId })
    const microservices = await Microservice.find({ client: clientId})

    if (!user) {
      return res.status(404).json({ error: 'User not found with the provided email.' });
    }

    // Extract the name and role from the fetched user details
    const memberName = user.name;
    const memberRole = user.role;

    // Use Promise.all to asynchronously iterate over microservices and create new ones
    const creationPromises = microservices.map(async (microservice) => {
      const newMicroservice = await Microservice.create({
        name: microservice.name,
        url: microservice.url,
        production: microservice.production,
        client: user._id,
      });

      return newMicroservice;
    });

    // Wait for all microservices to be created
    const createdMicroservices = await Promise.all(creationPromises);

    console.log(createdMicroservices);

    if (!createdMicroservices || createdMicroservices.length === 0) {
      return res.status(404).json({ error: 'Failed to create microservices for the user.' });
    }

    res.json({ message: 'Member added successfully', updatedClient: createdMicroservices });
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports = {
  getMicroservices,
  addMicroservice,
  deleteMicroservice,
  setMemberMicroservice
};
