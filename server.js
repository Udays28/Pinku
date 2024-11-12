// server.js
const express = require('express');
const dotenv = require('dotenv');
const Amadeus = require('amadeus');
const cors = require('cors');
const app = express();

dotenv.config();
const PORT = process.env.PORT || 3000;

// Enable CORS for the frontend's origin
app.use(cors({
  origin: 'http://localhost:5173' // Adjust this if your frontend runs on a different port or URL
}));

// Middleware to parse JSON
app.use(express.json());

// Initialize Amadeus API client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

// Sample endpoint to search for flights
app.get('/api/flights', async (req, res) => {
  const { origin, destination, departureDate } = req.query;

  // Validate required parameters
  if (!origin || !destination || !departureDate) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Fetch flight data from Amadeus API
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults: 1, // Example setting, you can adjust this based on your needs
    });

    // Send back the response data
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching flight data:', error);
    res.status(500).json({ error: 'Error fetching flight data' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
