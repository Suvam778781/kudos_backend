const { sendEmail } = require("../utils/emailSender");

const handlePostEmail = async (req, res) => {
  const recipients = [
    "manish63singh@gmail.com",
    "suvamswagatamp@gmail.com",
    "adarsh474747@gmail.com",
  ];
  const { name, clientemail, message } = req.body;

 


  try {
    await sendEmail(recipients, name, message,clientemail);
    res.status(200).send({
      succes: "Email send succesfully.",
    });
  } catch {
    res.status(500).send({ error: "Email sending failed. Please try again." });
  }
};

module.exports = { handlePostEmail };
