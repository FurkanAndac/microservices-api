const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const router = express.Router();

const app = express();
const port = process.env.PORT || 5000;

// Middleware to enable CORS
app.use(cors());
app.use(bodyParser.json());

// Connect to the microservices-tool MongoDB database
mongoose.connect('mongodb+srv://FurkanAndac:jwhbkvm9321@agencies-shared-cluster.c5ugmev.mongodb.net/microservices-tool', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB (microservices-tool)');
});

// Define a schema for the agency-website collection
const agencyWebsiteSchema = new mongoose.Schema({
  name: String,
  url: String
});

const clientSchema = new mongoose.Schema({
    name: String,
    email: String,
    // Additional client-related fields
    });

const Client = mongoose.model('Client', clientSchema);

const microserviceSchema = new mongoose.Schema({
client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
},
name: String,
url: String,
production: {
    type: Boolean,
    default: false, // Set default value to false
},
// Additional collection-related fields
});

const Microservice = mongoose.model('Microservice', microserviceSchema);

// Create a new Client
// const newClient = new Client({
//     name: 'ClientName',
//     email: 'client@example.com',
//     // Additional client-related fields
//   });
  
//   const savedClient = newClient.save();
  
//   // Create a new Collection associated with the client
//   const newCollection = new Collection({
//     client: savedClient._id, // Use the client's ObjectId
//     name: 'ClientCollectionName',
//     // Additional collection-related fields
//   });
  
//   const savedCollection = newCollection.save();

// Create a model based on the schema
const AgencyWebsite = mongoose.model('AgencyWebsite', agencyWebsiteSchema, 'agency-website');

// API endpoint for handling POST requests
app.post('/api/agency-website', async (req, res) => {
  // Extract parameters from the request body
  const { name, url } = req.body;

  // Validate if both parameters are present
  if (!name || !url) {
    return res.status(400).json({ error: 'Both name and url parameters are required.' });
  }

  try {
    // Create a new document with the provided data
    const newAgency = new AgencyWebsite({ name, url });

    // Save the document to the database
    await newAgency.save();

    // Respond with a JSON object containing the parameters
    res.json({ name, url });
  } catch (error) {
    console.error('Error adding microservice:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/// Middleware to extract client identifier from headers
app.use((req, res, next) => {
    const clientId = req.header('X-Client-ID');
    
    if (!clientId) {
        return res.status(401).json({ error: 'Client identifier not provided.' });
    }
  
    try {
        // Log the client ID before conversion
        console.log('Received client ID:', clientId);
  
        // Assuming the client ID is a number, use it directly
        req.clientId = clientId;
        next();
    } catch (error) {
        console.error('Error handling client identifier:', error);
        res.status(400).json({ error: 'Invalid client identifier format.' });
    }
});
  
  // API endpoint to get collections associated with the client
  app.get('/api/microservices', async (req, res) => {
    try {
        const productionMode = req.query.production === 'true'; // Convert the query parameter to a boolean
      // Assuming there is a model method to fetch collections based on the client identifier
      const collections = await Microservice.find({ client: req.clientId });
        console.log(collections)
      res.json(collections);
    } catch (error) {
      console.error('Error fetching collections:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // API endpoint for handling POST requests
app.post('/api/microservices', (req, res) => {
    // Extract parameters from the request body
    const { name, url, client } = req.body;
    // Validate if both parameters are present
    if (!name || !url || !client) {
      return res.status(400).json({ error: 'Both name, url and client parameters are required.' });
    }
  
    // Handle the data as needed (e.g., save to the database)
    // ...
    try {
        // Create a new document with the provided data
        const newMicroservice = new Microservice({ name, url, client });
    
        // Save the document to the database
        newMicroservice.save();
    
        // Respond with a JSON object containing the parameters
        res.json({ name, url, client });
      } catch (error) {
        console.error('Error adding microservice:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
  
    // Respond with a JSON object containing the parameters

  });

  // DELETE route for deleting a microservice by ID
  app.delete('/api/microservices/:id', (req, res) => {
    const microserviceId = req.params.id;

    // Find the microservice by ID and delete it
    Microservice.findByIdAndDelete(microserviceId)
        .then(deletedMicroservice => {
            if (deletedMicroservice) {
                console.log("deleted: " + deletedMicroservice);
                res.json({ message: `Microservice "${deletedMicroservice.name}" deleted successfully.` });
            } else {
                res.status(404).json({ error: 'Microservice not found.' });
            }
        })
        .catch(error => {
            console.error('Error deleting microservice:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// router.post('/create-collection', async (req, res) => {
//     try {
//       // Assuming you are extracting clientId from headers
//       const clientId = req.header('X-Client-ID');
//       const collectionName = req.body.collectionName;
  
//       // Check if clientId is provided
//       if (!clientId) {
//         return res.status(401).json({ error: 'Client identifier not provided.' });
//       }
  
//       // Create a new Collection
//       const newCollection = new Collection({
//         client: clientId,
//         name: collectionName,
//         // Other fields in your Collection model
//       });
  
//       // Save the new collection to the database
//       const savedCollection = await newCollection.save();
  
//       res.status(201).json(savedCollection);
//     } catch (error) {
//       console.error('Error creating collection:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });
  
//   module.exports = router;