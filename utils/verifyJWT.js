

const jwt=require("jsonwebtoken")
require('dotenv').config()

const verifyJwt=(token)=>{
    jwt.verify(token, process.env.secret_key, (err, decodedToken) => {
        if (err) {
            console.log(err)
          return { error: "Invalid token", err }
        }
        else{
            console.log(decodedToken,"decode")
            return decodedToken
        }
  
      });
}

module.exports={
    verifyJwt
}