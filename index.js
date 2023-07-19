const express = require('express');
const cors = require("cors");
const http = require('http');
const socketio = require('socket.io');
const { userConfig } = require("./routes/userConfig");
const { blogConfigRoute } = require("./routes/blogConfig");
const mysql = require('mysql');
const { generateClientId } = require('./utils/generateClientId');
const { connection, pool } = require('./config/db');
const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*", // Replace with the actual URL of your frontend application
    methods: ["GET", "POST", "PATCH", "PUT"],
    allowedHeaders: ["Content-Type"], 
    credentials: true,
  },
});
app.use(express.json());
// Create a MySQL connection

app.use(cors());
// Handle socket.io connections
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
 
  // Handle incoming client messages
  socket.on('clientMessage', (data) => {
    const { clientId, message } = data;

    // Save the client message to the database
    const sql = 'INSERT INTO messages (client_id, message) VALUES (?, ?)';
    const values = [clientId, message];
    pool.query(sql, values, (error, result) => {
      if (error) {
        console.error('Error saving client message:', error);
      } else {
        console.log('Client message saved to database:', result);

        // Emit the message to the admin using Socket.IO
        io.emit('adminMessage', { clientId, message });
        
      }
    });
  });

  app.use('/user',userConfig)
  app.use("/blog",blogConfigRoute)
  // Handle incoming admin messages
  socket.on('adminMessage', (data) => {
    const { clientId, message } = data;

    // Save the admin message to the database
    const sql = 'INSERT INTO messages (admin_id, client_id, message) VALUES (?, ?, ?)';
    const values = ['admin_id', clientId, message];
    pool.query(sql, values, (error, result) => {
      if (error) {
        console.error('Error saving admin message:', error);
      } else {
        console.log('Admin message saved to database:', result);

        // Emit the message to the client using Socket.IO
        io.to(clientId).emit('clientMessage', { adminId: 'admin_id', message });
      }
    });
  });
  // Handle disconnections
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Endpoint for client messages
// Endpoint for client messages
app.post('/clients/:clientId/messages', (req, res) => {
  const { clientId } = req.params;
  const { message } = req.body;

  // Save the client message to the database
  const sql = 'INSERT INTO client (client_id, timestamp, message) VALUES (?, CURRENT_TIMESTAMP(), ?)';
  const values = [clientId, message];
  pool.query(sql, values, (error, result) => {
    if (error) {
      console.error('Error saving client message:', error);
      res.status(500).json({ error: 'Failed to save client message' });
    } else {
      console.log('Client message saved to database:', result);

      // Emit the message to the admin using Socket.IO
      io.emit('clientMessage', { clientId, message });
      res.sendStatus(200);
    }
  });
});

// Endpoint for admin messages
app.post('/admins/:adminId/messages', (req, res) => {
  const { adminId } = req.params;
  const { clientId, message } = req.body;

  // Save the admin message to the database
  const sql = 'INSERT INTO admin (client_id, admin_id, timestamp, message) VALUES (?, ?, CURRENT_TIMESTAMP(), ?)';
  const values = [clientId, adminId, message];
  pool.query(sql, values, (error, result) => {
    if (error) {
      console.error('Error saving admin message:', error);
      res.status(500).json({ error: 'Failed to save admin message' });
    } else {
      console.log('Admin message saved to database:', result);
      // Emit the message to the client using Socket.IO
      io.emit('adminMessage', { adminId, message });
      res.sendStatus(200);
    }
  });
});


// Endpoint for retrieving messages for a client
app.get('/chats/:clientId/messages', (req, res) => {
  const { clientId } = req.params;

  // Retrieve the client messages from the client table
  const clientSql = 'SELECT * FROM client WHERE client_id = ?';
  pool.query(clientSql, [clientId], (error, clientResults) => {
    if (error) {
      console.error('Error retrieving client messages:', error);
      res.status(500).json({ error: 'Failed to retrieve client messages' });
    } else {
      console.log('Client messages retrieved from database:', clientResults);

      // Retrieve the admin messages associated with the client from the admin table
      const adminSql = 'SELECT * FROM admin WHERE client_id = ?';
      pool.query(adminSql, [clientId], (error, adminResults) => {
        if (error) {
          console.error('Error retrieving admin messages:', error);
          res.status(500).json({ error: 'Failed to retrieve admin messages' });
        } else {
          console.log('Admin messages retrieved from database:', adminResults);

          // Combine the client and admin messages into a single array
          const messages = [...clientResults, ...adminResults];

          // Sort the messages by timestamp in ascending order
          const sortedMessages = messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

          // Filter the messages based on the desired timestamp
          const filteredMessages = sortedMessages.filter((message) => {
            const timestamp = new Date(message.timestamp).getTime();
            return timestamp >= 0; // Replace 0 with your desired timestamp
          });
          res.json(filteredMessages);
        }
      });
    }
  });
});

// Start the server
const PORT = 8080;
server.listen(PORT, async(err) => {
  if (err) {
    console.log("inside server fuinction")
    console.log(err);
  } else {
    try {
      await connection(); // Connect to the database
      console.log(process.env.PORT||8080);
    } catch (error) {
      console.log("Error while connecting to the database:", error);
      server.close();
    }
  }
});


app.get("/",(req,res)=>{

  res.send("homepage")

})
app.post('/chat', (req, res) => {
  const { name, email } = req.body;
  const clientId = generateClientId(name, email);
  // Save the client ID to the database or perform any other necessary operations
  res.status(200).json({ clientId });
});

