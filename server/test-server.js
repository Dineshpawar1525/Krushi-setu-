// external packages
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(bodyParser.urlencoded({
    extended: true
}));
webApp.use(bodyParser.json());

// Server Port
const PORT = 5000;

// Home route
webApp.get('/', (req, res) => {
    res.send(`Hello World.!`);
});

const WA = require('./helper-function/whatsapp-send-message');

// Route for WhatsApp
// Route for WhatsApp
webApp.post('/whatsapp', async (req, res) => {
    let message = req.body.Body ? req.body.Body.trim().toLowerCase() : '';
    let senderID = req.body.From;

    console.log("📩 Message received:", message);
    console.log("📱 From:", senderID);

    // Personalized reply logic
    let reply = `Hello! 👋 How can we help you today?`;

    if (message.includes('hello') || message.includes('hi')) {
        reply = `Hi there! 🌱 How can I assist you with your farming today?`;
    } else if (message.includes('crop')) {
        reply = `You can grow Wheat, Rice, or Maize this season 🌾`;
    } else if (message.includes('weather')) {
        reply = `Today’s forecast: ☀️ Sunny with chances of rain in the evening 🌦️`;
    } else if (message.includes('price')) {
        reply = `Current market prices: Wheat ₹2200/quintal, Rice ₹2400/quintal 🌾`;
    }

    // Send the personalized message back
    await WA.sendMessage(reply, senderID);

    // Optional: respond to Twilio immediately to avoid timeouts
    res.status(200).send('OK');
});


// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});