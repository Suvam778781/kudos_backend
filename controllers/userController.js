const { pool } = require("../config/db");
const { genrateJwtToken } = require("../utils/genrateJWT");
const { verifyJwt } = require("../utils/verifyJWT");

const handleUserSavingToDb = (req, res) => {
  try {
    const { id, given_name, family_name, email } = req.body;

    const checkQ = "SELECT * FROM user WHERE email = ?";
    pool.query(checkQ, [email], (err, result) => {
      if (err) {
        return res
          .status(301)
          .send({ finderror: "error while finding user in db" });
      }
      if(result.length>0){
   return res.status(200).send({"succ_already":genrateJwtToken({email:email,id:id},process.env.secret_key)})
      }
      else{
        const userInsertQ =
        "INSERT INTO user (user_id, given_name, family_name, email) VALUES (?, ?, ?, ?)";
  
      pool.query(
        userInsertQ,
        [id, given_name, family_name, email],
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .send({ error: "Error while inserting the user", err });
          }
          res.status(200).send({ success: "User inserted successfully",token_new:genrateJwtToken({email:email,id:id},process.env.secret_key)});
        }
      );
      }
    });

   
  } catch (error) {
    return res.status(500).send({ error: `Cannot process request: ${error}` });
  }
};


const check=(req,res)=>{
    const token=req.headers.authorization;

    console.log(token)

    const verify=verifyJwt(token)
    console.log(verify,"verifu")
    res.send({"'tokem":verifyJwt(token)})
}

module.exports = {
  handleUserSavingToDb,check
};
