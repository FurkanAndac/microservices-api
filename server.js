// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const router = express.Router();
// const axios = require('axios');
// const cron = require('node-cron');
// // const fetch = require('node-fetch');



// const app = express();
// const port = process.env.PORT || 5000;

// // Middleware to enable CORS
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
//   res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, X-Client-Id');

//   // Allow the browser to cache the CORS preflight response for 7 days
//   res.header('Access-Control-Max-Age', '604800');
//   next();
// });
// app.options('*', (req, res) => {
//   res.status(204).end();
// });

// app.use(bodyParser.json());
// app.use(express.json());

// // Replace these values with your actual client credentials and authorization code
// const clientId = '65ae9f8a0a21b787ee3c9745';
// const clientSecret = 'YOUR_CLIENT_SECRET';
// const authorizationCode = 'YOUR_AUTHORIZATION_CODE';
// const redirectUri = 'YOUR_REDIRECT_URI';
// const microserviceLive = true;

// // Connect to the microservices-tool MongoDB database
// mongoose.connect('mongodb+srv://FurkanAndac:jwhbkvm9321@agencies-shared-cluster.c5ugmev.mongodb.net/microservices-tool', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// const db = mongoose.connection;

// db.on('error', (error) => {
//   console.error('MongoDB connection error:', error);
// });

// db.once('open', () => {
//   console.log('Connected to MongoDB (microservices-tool)');
// });

// // Define a schema for the agency-website collection
// const agencyWebsiteSchema = new mongoose.Schema({
//   name: String,
//   url: String
// });

// const clientSchema = new mongoose.Schema({
//     name: String,
//     email: String,
//     // Additional client-related fields
//     });

// const Client = mongoose.model('Client', clientSchema);

// const microserviceSchema = new mongoose.Schema({
// client: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Client',
//     required: true,
// },
// name: String,
// url: String,
// production: {
//     type: Boolean,
//     default: false, // Set default value to false
// },
// // Additional collection-related fields
// });

// const Microservice = mongoose.model('Microservice', microserviceSchema);

// // Create a model based on the schema
// const AgencyWebsite = mongoose.model('AgencyWebsite', agencyWebsiteSchema, 'agency-website');

// // API endpoint for handling POST requests
// app.post('/api/agency-website', async (req, res) => {
//   // Extract parameters from the request body
//   const { name, url } = req.body;

//   // Validate if both parameters are present
//   if (!name || !url) {
//     return res.status(400).json({ error: 'Both name and url parameters are required.' });
//   }

//   try {
//     // Create a new document with the provided data
//     const newAgency = new AgencyWebsite({ name, url });

//     // Save the document to the database
//     await newAgency.save();

//     // Respond with a JSON object containing the parameters
//     res.json({ name, url });
//   } catch (error) {
//     console.error('Error adding microservice:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// /// Middleware to extract client identifier from headers
// app.use((req, res, next) => {
//     const clientId = req.header('X-Client-ID');
    
//     if (!clientId) {
//         return res.status(401).json({ error: 'Client identifier not provided.' });
//     }
  
//     try {
//         // Log the client ID before conversion
//         console.log('Received client ID:', clientId);
  
//         // Assuming the client ID is a number, use it directly
//         req.clientId = clientId;
//         next();
//     } catch (error) {
//         console.error('Error handling client identifier:', error);
//         res.status(400).json({ error: 'Invalid client identifier format.' });
//     }
// });
  
//   // API endpoint to get collections associated with the client
//   app.get('/api/microservices', async (req, res) => {
//     try {
//         const productionMode = req.query.production === 'true'; // Convert the query parameter to a boolean
//       // Assuming there is a model method to fetch collections based on the client identifier
//       const collections = await Microservice.find({ client: req.clientId });
//         console.log(collections)
//       res.json(collections);
//     } catch (error) {
//       console.error('Error fetching collections:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });

//   // API endpoint for handling POST requests
// app.post('/api/microservices', (req, res) => {
//     // Extract parameters from the request body
//     const { name, url, client, production } = req.body;
//     // Validate if both parameters are present
//     if (!name || !url || !client) {
//       return res.status(400).json({ error: 'Both name, url and client parameters are required.' });
//     }
//     // Handle the data as needed (e.g., save to the database)
//     // ...
//     try {
//         // Create a new document with the provided data
//         const newMicroservice = new Microservice({ name, url, client, production });
    
//         // Save the document to the database
//         newMicroservice.save();
    
//         // Respond with a JSON object containing the parameters
//         res.json({ name, url, client, production });
//       } catch (error) {
//         console.error('Error adding microservice:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//       }
  
//     // Respond with a JSON object containing the parameters

//   });

//   // DELETE route for deleting a microservice by ID
//   app.delete('/api/microservices/:id', (req, res) => {
//     const microserviceId = req.params.id;

//     // Find the microservice by ID and delete it
//     Microservice.findByIdAndDelete(microserviceId)
//         .then(deletedMicroservice => {
//             if (deletedMicroservice) {
//                 console.log("deleted: " + deletedMicroservice);
//                 res.json({ message: `Microservice "${deletedMicroservice.name}" deleted successfully.` });
//             } else {
//                 res.status(404).json({ error: 'Microservice not found.' });
//             }
//         })
//         .catch(error => {
//             console.error('Error deleting microservice:', error);
//             res.status(500).json({ error: 'Internal Server Error' });
//         });
// });

// const apiEndpoint = 'http://127.0.0.1:5000/api/microservices';

// app.get('/api/frontend-ping', async (req, res) => {
//   try {
//     const microservices = await Microservice.find({ client: req.clientId });
//     const microserviceLiveResults = await Promise.all(
//       microservices.map(async (microservice) => {
//         try {
//           console.log("works")
//           const furl = microservice.url
//           if (!microservice.url.startsWith('http://') && !microservice.url.startsWith('https://')) {
//             // If it doesn't start with either, add 'http://'
//             furl = 'http://' + microservice.url;
//           }

//           const response = await fetch(furl, { timeout: 100000 }, {
//             headers: {
//               'X-Client-Id': clientId,
//             },
//           });
//           const data = await response.text();
//           console.log("test6:"+response.status)
//           console.log('Response Text:', data);


//           if (!response.ok) {
//             // Log an error if the response status is not in the successful range
//             console.error(`HTTP error! Status: ${response.status}`);
//             return {
//               url: furl,
//               microserviceLive: false,
//             };
//           } else {

//           return {
//             url: furl,
//             microserviceLive: true,
//           };
//         }
//         } catch (error) {
//           console.error(`Error fetching data from ${microservice.url}:`, error);
//           console.error(`Error fetching data from ${microservice.url}:`, error.message);
//           console.log('HTTP Status Code:', error.response ? error.response.status : 'N/A');
//           return {
//             url: microservice.url,
//             microserviceLive: false,
//           };
//         }
//       })
//     );
//     // microserviceLiveResults.forEach(element => {
//     //   console.log("test8"+Object.entries(element))
//     // });
//     res.json({ microserviceLiveResults });
//   } catch (error) {
//     console.error('Error fetching microservice responses:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// app.post('/api/frontend-ping', (req, res) => {
//   try {
//     // Perform any logic you need for frontend ping
//     // You can access request data using req.body, req.headers, etc.
//     const body = req.body
//     // Example: Assume you want to send a simple success response
//     res.json({ body: body, status: 'success', message: 'Frontend ping received successfully.' });
//   } catch (error) {
//     console.error('Error handling frontend ping:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // Function to perform URL pinging
// async function pingUrls() {
//   try {
//     // Make a simple GET request to the API endpoint
//     const apiResponse = await fetch(apiEndpoint, {
//       headers: {
//         'X-Client-Id': clientId,
//       },
//     });

//     const xClientIdFromResponse = apiResponse.headers.get('X-Client-Id');
//     console.log('X-Client-Id from API Response:', xClientIdFromResponse);

//     // Check if the response status is okay
//     if (!apiResponse.ok) {
//       throw new Error(`Failed to fetch URLs from API: ${apiResponse.statusText}`);
//     }

//     // Loop through each URL and make a GET request
//     const data = await apiResponse.json();
//     const microserviceLiveResults = [];

//       for (const object of data) {
//         const { url, _id } = object;
//         console.log('Processing URL:', url);

//       // Check if the URL is valid
//       try {
//         const formattedUrl = url 
//         new URL(url.startsWith('http') ? url : `http://${url}`);
//         const urlApiResponse = await fetch(formattedUrl, {
//           headers: {
//             'X-Client-Id': clientId,
//           },
//         });

//         // Check if the response status is okay
//         if (!urlApiResponse.ok) {
//           throw new Error(`Failed to ping URL ${formattedUrl}: ${urlApiResponse.statusText}`);
//         }

//         // Check content type before attempting to parse as JSON
//         const contentType = urlApiResponse.headers.get('Content-Type');
//         let responseData;

//         if (contentType && contentType.includes('application/json')) {
//           responseData = await urlApiResponse.json();
//         } else {
//           responseData = await urlApiResponse.text();
//         }

//         const microserviceLive = responseData.trim().length > 0;
//         console.log(`Pinged URL ${formattedUrl}:`,microserviceLive, responseData);

//         // Add the microserviceLive status to the array
//         microserviceLiveResults.push({ url: formattedUrl, microserviceLive });
//       } catch (urlError) {
//         console.error(`Error with URL ${url}:`, urlError.message);
      
//         // Log additional information
//         console.log('urlError:', urlError);
//         console.log('urlError.name:', urlError.name);
//         console.log('urlError.constructor:', urlError.constructor);
      
//         // Add the microserviceLive status as false for the failed URL
//         microserviceLiveResults.push({ url, microserviceLive: false });
//       } 
//       console.log("test3"+Object.values(microserviceLiveResults[0]))
//     }

//     // Send the microserviceLive results to the frontend
//     await fetch('http://localhost:5000/api/frontend-ping', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-Client-Id': clientId,
//       },
//       body: JSON.stringify({ microserviceLiveResults }),
//     });
//     console.log("test1"+microserviceLiveResults)
//     console.log('API Response:', data);
//   } catch (error) {
//     console.error('Error during API call:', error.message);
//   }
// }

// // Schedule the job to run every 15 seconds
// // cron.schedule('*/15 * * * * *', () => {
// //     pingUrls();
// // });


// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });
// // Graceful shutdown
// process.on('SIGINT', () => {
//     console.log('Shutting down gracefully...');
//     server.close(() => {
//         console.log('Server closed.');
//         process.exit(0);
//     });
// });

// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes');
const { connectToDatabase } = require('./database');
const Microservice = require('./models/Microservice')

const app = express();
const port = process.env.PORT || 5000;
const clientId = '65ae9f8a0a21b787ee3c9745'; // Replace with your actual clientId

const allowedOrigins = [
  // 'https://agency-website.microservices.com',
  // 'https://eventplanners.microservices.com',
  // Add more origins as needed
  'http://localhost:8080',
  'https://early-baths-greet.loca.lt',
  'https://microservices-front-end-4469d14ad8b3.herokuapp.com/'
];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Check if the incoming origin is in the allowedOrigins array or if it's undefined (e.g., from a non-browser client)
    const isAllowed = allowedOrigins.includes(origin) || !origin;
    callback(null, isAllowed);
  },
  methods: ['GET', 'PUT', 'POST', 'OPTIONS', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Client-Id'],
  maxAge: 604800, // 7 days
}));
var timeout = require('connect-timeout')

// example of using this top-level; note the use of haltOnTimedout
// after every middleware; it will stop the request flow on a timeout
app.use(timeout('5s'))
app.use(haltOnTimedout)

// Add your routes here, etc.

function haltOnTimedout (req, res, next) {
  if (!req.timedout) next()
}
// Middleware to extract client identifier from headers
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

// Rest of your code...

// Connect to the microservices-tool MongoDB database
connectToDatabase();

// Define routes
app.use('/api', routes);

app.get('/api/frontend-ping', async (req, res) => {
  try {
    const microservices = await Microservice.find({ client: req.clientId });
    const microserviceLiveResults = await Promise.all(
      microservices.map(async (microservice) => {
        try {
          let furl = microservice.url;
          if (!microservice.url.startsWith('http://') && !microservice.url.startsWith('https://')) {
            // If it doesn't start with either, add 'http://'
            furl = 'http://' + microservice.url;
          }

          const response = await fetch(furl, { timeout: 5000 }, {
            headers: {
              'X-Client-Id': clientId,
            },
          });

          const data = await response.text();

          if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
            return {
              url: furl,
              microserviceLive: false,
            };
          } else {
            return {
              url: furl,
              microserviceLive: true,
            };
          }
        } catch (error) {
          console.error(`Error fetching data from ${microservice.url}:`, error);
          console.error('HTTP Status Code:', error.response ? error.response.status : 'N/A');
          return {
            url: microservice.url,
            microserviceLive: false,
          };
        }
      })
    );

    res.json({ microserviceLiveResults });
  } catch (error) {
    console.error('Error in frontend ping:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
