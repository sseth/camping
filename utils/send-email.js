import nodemailer from 'nodemailer';

const sendEmail = async (parkID, sites) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'humberto.stehr10@ethereal.email', // generated ethereal user
      pass: 'sftEeQY87rGnXyvCvB', // generated ethereal password
    },
  });
  
  // send mail with defined transport object
  let info = await transporter.sendMail(_getEmail(parkID, sites));

  console.log('Message sent: %s', info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};

const _getEmail = (parkID, sites) => {
  const siteIDs = Object.keys(sites);
  // https://www.recreation.gov/camping/campgrounds/:id
  // https://www.recreation.gov/camping/campsites/:id
  let html;
  const mail = {
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: 'bar@example.com, baz@example.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    html: html, // html body
  }
  return mail;
};

export default sendEmail;
