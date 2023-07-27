const jwt = require("jsonwebtoken");

const isUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(301).send({ invalid: "token not present" });
  try {
    jwt.verify(token, process.env.secret_key, (err, decoded) => {
      if (err) return res.status(301).send({ decode: "cannot decode token" });

      //console.log( decoded, " in isUser decoded m.w");
      if (decoded.id) {
        
        req.body.users_id= decoded.id;
         next();
      } else {
        return res.status(301).send({ err: "something missing" });
      }
    });
  } catch (error) {
    console.log(error, "error in isUser");
    return res.status(500).send({ within: "error in mw" });
  }
};

module.exports = {
  isUser,
};
