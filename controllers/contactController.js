const { connection, pool } = require("../config/db");
const { sendEmail } = require("../utils/emailSender");

const handlePostEmail = async (req, res) => {
  const { email, name, message, service } = req.body;
  try {
    await sendEmail(name, email, message, service);
    res
      .status(200)
      .send({
        succes: "Email send succesfully. We will get back to you sortly",
      });
  } catch {
    res.status(500).send({ error: "Email sending failed. Please try again." });
  }
};

module.exports={handlePostEmail}
