const { pool } = require("../config/db");

const handleUserSavingToDb = (req, res) => {
  try {
    const { id, given_name, family_name, email } = req.body;

    const userInsertQ =
      "insert into user WHERE (`id`, `given_name`, `family_name`,`email`) VALUES (?, ?, ?, ?)";

    pool.query([id, given_name, family_name, email], (err, result) => {
      if (err) return res.status(301).send({ inserterror: "error while inserting the user",err });
      res.send(200).send({"insertsucc":"user inserted success"})
    });
  } catch (error) {
    return res.status(500).send({ error: `Cannot process request: ${error}` });
  }
};

export{handleUserSavingToDb}