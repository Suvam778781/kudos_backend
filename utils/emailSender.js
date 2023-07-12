const sendEmail = async (email, message, name, service) => {
    const transpoter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "manish63singh@gmail.com",
        pass: "xqwccotzogxvlqdo",
      },
    });
  
    const mailoption = {
      from: "manish63singh@gmail.com",
      to: email,
      subject: `Interested in ${service} service`,
      text: 
      `
      My name is ${name} and I'm writing to you today because I'm interested in your ${service} services.


      ${message}
      `
    }; 
  
   
  
   await transpoter.sendMail(mailoption, (err, info) => {
      if (err) return console.log("error", err);
      console.log("sent mail to company",info.response);
      return{ "mail send": info.response};
    });
  };
  
  module.exports = {
    sendEmail,
  };