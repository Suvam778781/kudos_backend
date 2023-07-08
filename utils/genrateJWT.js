const jwt = require("jsonwebtoken");
require("dotenv").config()
const genrateJwtToken = (payload,secret_key) => {
  return jwt.sign(payload,secret_key);
};

module.exports={
    genrateJwtToken
}
