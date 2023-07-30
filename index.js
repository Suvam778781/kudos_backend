const express = require("express");
const mysql = require("mysql");
const app = express();
app.use(express.json());
require("dotenv").config();
const cors = require("cors");
const { connection } = require("./config/db");
const { userConfig } = require("./routes/userConfig");
const { PostRouter } = require("./routes/postConfig");
const { blogConfigRoute } = require("./routes/blogConfig");
const { contactConfigRoute } = require("./routes/contactConfig");

app.use(express.json());
app.use(cors());

// Middleware for CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get("/", (req, res) => {
  res.status(200).send({ result: "Home page" });
});


app.use('/user',userConfig)
app.use('/insert',PostRouter)
app.use("/blog",blogConfigRoute)
app.use('/mail',contactConfigRoute)

// Create server and socket.io instance
const server = app.listen(process.env.PORT||8000, async (err) => {
  if (err) {
    console.log("inside server function")
    console.log(err);
  } else {
    try {
      await connection(); // Connect to the database
      console.log(process.env.PORT||8000);
    } catch (error) {
      console.log("Error while connecting to the database:", error);
      server.close();
    }
  }
});