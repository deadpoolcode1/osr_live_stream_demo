// app.js

const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser'); // Add this
const WebSocket = require('ws'); // Add this

const port = 3000;

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));

// Middleware to parse URL-encoded and JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Add this
app.use(bodyParser.json()); // Add this

app.use('/', express.static(__dirname));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html')
});
app.get('/agents', function(req, res) {
    res.sendFile(__dirname + '/index-agents.html')
});

const server = http.createServer(app);

// Set up WebSocket server
const wss = new WebSocket.Server({ server }); // Add this

let clients = []; // Add this

// Handle WebSocket connections
wss.on('connection', function connection(ws) { // Add this
  clients.push(ws);
  console.log('Client connected. Total clients:', clients.length);

  ws.on('close', function() {
    clients = clients.filter(client => client !== ws);
    console.log('Client disconnected. Total clients:', clients.length);
  });
});

// Endpoint to process text via GET or POST
app.all('/process-text', function(req, res) { // Add this
  const text = req.query.text || req.body.text;
  if (!text) {
    return res.status(400).send('No text provided');
  }

  // Broadcast the text to all connected clients
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(text);
    }
  });
  console.log('Text broadcasted to clients:', text);
  res.send('Text processed');
});

server.listen(port, () => console.log(`Server started on port localhost:${port}\nhttp://localhost:${port}\nhttp://localhost:${port}/agents`));
