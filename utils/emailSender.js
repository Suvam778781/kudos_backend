// const sendEmail = async (email, message, name, service) => {
//     const transpoter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: "masaiyans@gmail.com",
//         pass: "entxlrxzocseekld",
//       },
//     });
  
//     const mailoption = {
//       from: "masaiyans@gmail.com",
//       to: email,
//       subject: `NO-REPLY`,
//       text: 
//       `
//       My name is ${name} and I'm writing to you today because I'm interested in your ${service} services.


//       ${message}
//       `
//     }; 
  
   
  
//    await transpoter.sendMail(mailoption, (err, info) => {
//       if (err) return console.log("error", err);
//       console.log("sent mail to company",info.response);
//       return{ "mail send": info.response};
//     });
//   };



function getFormattedDateTime() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const now = new Date();

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');

  const day = days[now.getDay()];
  const date = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  return `${formattedHours}:${formattedMinutes}${ampm}, ${day}, ${date}/${month}/${year}`;
}




  const nodemailer = require('nodemailer');

const sendEmail = async (recipients, name,message,clientemail) => {

  console.log(recipients,name,message,clientemail)


  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'masaiyans@gmail.com',
        pass: 'entxlrxzocseekld',
      },
    });

    const Date_time=getFormattedDateTime()

   
    

    const mailOptions = {
      from: 'masaiyans@gmail.com',
      subject: 'NO-REPLY',
      html: `
      <h1>Greetings</h1>
      <br/>
      Boss we have an incoming interest from <h2>${name}</h2>
      <br/>
      about developing
      <br/>
      so please look around and give them confirmation
      <br/>
      their message is ${message}
      <br/>
      from ${clientemail} at ${Date_time}
    `
    };

    for (const email of recipients) {
      mailOptions.to = email;
      const info = await transporter.sendMail(mailOptions);
      console.log(`Sent email to ${email}:`, info.response);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
};





  
  // module.exports = {
  //   sendEmail,
  // };