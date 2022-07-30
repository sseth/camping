import nodemailer from 'nodemailer';

const sendEmail = async (parkID, name, sites) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  let info = await transporter.sendMail(_getEmail(parkID, name, sites));
  // console.log('Message sent: %s', info);
  if (info) console.log('sent');
};

const _getEmail = (parkID, name, sites) => {
  const groundsURL = 'https://www.recreation.gov/camping/campgrounds';
  const sitesURL = 'https://www.recreation.gov/camping/campsites';
  let text = `${name}: ${groundsURL}/${parkID}\n`;
  for (const site in sites) {
    text += `    Site: ${sitesURL}/${site}\n`;
    sites[site].forEach((ob) => {
      text += `        from ${ob.start} to ${ob.end}\n`;
    });
  }
  const mail = {
    from: `"Sasti Notification Service" <${process.env.GMAIL_USER}>`,
    to: process.env.USER_EMAIL,
    subject: `Campsite Available at ${name}`,
    text
  };
  return mail;
};

export default sendEmail;
