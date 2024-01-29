

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
  
      res.json({ name, url, client, production });
    } catch (error) {
      console.error('Error adding microservice:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  

async function deleteMicroservice(req, res) {
  try {
    const microserviceId = req.params.id;
    const deletedMicroservice = await Microservice.findByIdAndDelete(microserviceId);

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

module.exports = {
  getMicroservices,
  addMicroservice,
  deleteMicroservice,
};
