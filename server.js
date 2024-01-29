// app.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes');
const { connectToDatabase } = require('./database');
const Microservice = require('./models/Microservice')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;
const clientId = '65ae9f8a0a21b787ee3c9745'; // Replace with your actual clientId

const allowedOrigins = [
  // 'https://agency-website.microservices.com',
  // 'https://eventplanners.microservices.com',
  // Add more origins as needed
  'http://localhost:8080',
  // 'https://early-baths-greet.loca.lt',
  'https://microservices-front-end-4469d14ad8b3.herokuapp.com',
  process.env.PRODUCTION_URL
];


// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Check if the incoming origin is in the allowedOrigins array or if it's undefined (e.g., from a non-browser client)
    const isAllowed = allowedOrigins.includes(origin) || !origin;
    callback(null, isAllowed);
  },
  methods: ['GET', 'PUT', 'POST', 'OPTIONS', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-Client-Id', 'Authorization'],
  maxAge: 604800, // 7 days
  credentials: true,
}));

//Handles post requests
app.use(bodyParser.json());
app.use(cookieParser());



// Middleware to extract client identifier from headers
app.use((req, res, next) => {
  const authToken = req.cookies.jwtToken;
  console.log('authtoken: ',authToken)

  // Skip authorization check for registration
  if (req.path === '/api/clients/register' || req.path === '/api/clients/login' || req.path === '/api/cookies/set-cookie') {
    return next();
  }

  if (!authToken) {
    return res.status(401).json({ error: 'Authorization token not provided.' });
  }

  
const tokenWithBearer = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJ0b2tlbiI6ImV5SmhiR2NpT2lKSVV6STFOaUlzSW5SNWNDSTZJa3BYVkNKOS5leUpsYldGcGJDSTZJbXB2YUc1NWMwQmxlR0Z0Y0d4bExtTnZiU0lzSW1saGRDSTZNVGN3TmpRME5EazFPQ3dpWlhod0lqb3hOekE1TURNMk9UVTRmUS5well6NXVydkdocEVOX1F3UERfbTdNODhKYUUxUjF3RG02dzUwODhfSWpRIn0.dsdNSwAXFGxdg_1VxnSS2wsNU7XkyLm-QDo8Q-52aVA';

// Remove 'Bearer ' prefix
const token = authToken.replace('Bearer ', '');
console.log(token)
const decodedPayload = jwt.decode(token, { complete: true });

console.log(decodedPayload);
  try {
    // Verify and decode the token
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

    // Attach the decoded token payload to the request for further processing
    req.decodedToken = decodedToken;

    console.log("decodedToken:", decodedToken)
    req.clientId = decodedToken.clientId
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
});

// Rest of your code...

// Connect to the microservices-tool MongoDB database
connectToDatabase();

// Define routes
app.use('/api', routes);

app.get('/api/frontend-ping', findMicroservices, pingMicroservices, handlePingResults);


async function findMicroservices(req, res, next) {
  try {
    console.log("clientId: ", req.clientId)
    const microservices = await Microservice.find({ client: req.clientId });
    req.microservices = microservices;
    console.log("req.microservices:", req.microservices)
    return next();
  } catch (error) {
    console.error('Error fetching microservices:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function pingMicroservices(req, res, next) {
  try {
    console.log("step1")
    const microserviceLiveResults = await Promise.all(
      req.microservices.map(async (microservice) => {
        try {
          let furl = microservice.url;
          if (!microservice.url.startsWith('http://') && !microservice.url.startsWith('https://')) {
            furl = 'http://' + microservice.url;
          }
          // furl = furl.replace(/^https?:\/\//, '');

          console.log("cleaned URL:", furl)
          const response = await fetch(furl, { timeout: 10000 }, {
            headers: {
              'X-Client-Id': clientId,
            },
          });
          // const data = await response.text();

          if (!response.ok && response.status == 400) {
            console.error(`HTTP error! Status: ${response.status}`);
            console.log("step3",furl)
            return {
              url: furl,
              microserviceLive: false,
            };
          } 
          if (!response.ok && response.status == 401) {
            console.error(`HTTP error! Status: ${response.status}`);
            console.log("step3",furl)
            return {
              url: furl,
              microserviceLive: true,
            };
          } else {
            console.log("step4", furl)
            return {
              url: furl,
              microserviceLive: true,
            };
          }
        } catch (error) {
          if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
            // Handle hostname resolution or timeout errors gracefully
            console.error(`Error fetching data from ${microservice.url}:`, error);
            return {
              url: microservice.url,
              microserviceLive: false,
            };
          } else {
            // Handle other errors
            console.error(`Unexpected error fetching data from ${microservice.url}:`, error);
            return {
              url: microservice.url,
              microserviceLive: false,
            };
          }
        }
      })
    );

    req.microserviceLiveResults = microserviceLiveResults;
    return next();
  } catch (error) {
    console.error('Error fetching microservice responses:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

function handlePingResults(req, res) {
  res.json({ microserviceLiveResults: req.microserviceLiveResults });
}

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
