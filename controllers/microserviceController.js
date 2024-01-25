

// controllers/microserviceController.js
const Microservice = require('../models/Microservice');

async function getMicroservices(req, res) {
    console.log('Microservice model:', Microservice);
    console.log('Client ID:', req.clientId);
  
    try {
    //   const productionMode = req.query.production === 'true';
      const collections = await Microservice.find({ client: req.clientId });
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
    const { name, url, client, production } = req.body;

    if (!name || !url || !client) {
      return res.status(400).json({ error: 'Both name, url, and client parameters are required.' });
    }

    const newMicroservice = new Microservice({ name, url, client, production });
    console.log("test1"+newMicroservice)
    await newMicroservice.save();
    console.log("test2"+newMicroservice)
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
