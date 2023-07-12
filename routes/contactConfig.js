const express = require("express");
const { handlePostEmail } = require("../controllers/contactController");
const contactConfigRoute = express.Router();

contactConfigRoute.post("/sendemail", handlePostEmail);

module.exports = { contactConfigRoute };
