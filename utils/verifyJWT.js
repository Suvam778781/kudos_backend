

const jwt=require("jsonwebtoken")
require('dotenv').config()

const verifyJwt = (token) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.secret_key, (err, decodedToken) => {
        if (err) {
          console.log(err);
          reject("Invalid token");
        } else {
          console.log(decodedToken, "decode");
          resolve(decodedToken);
        }
      });
    });
  };

module.exports={
    verifyJwt
}