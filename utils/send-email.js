import nodemailer from 'nodemailer';

const sendEmail = async (parkID, sites) => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  let info = await transporter.sendMail(_getEmail(parkID, sites));
  console.log('Message sent: %s', info);
};

const _getEmail = (parkID, sites) => {
  const groundsURL = 'https://www.recreation.gov/camping/campgrounds';
  const sitesURL = 'https://www.recreation.gov/camping/campsites';
  let text = `Park: ${groundsURL}/${parkID}\n`;
  for (const site in sites) {
    text += `    Site: ${sitesURL}/${site}\n`;
    sites[site].forEach((ob) => {
      text += `        from ${ob.start} to ${ob.end}\n`;
    });
  }
  const mail = {
    from: `"Sasti Notification Service" <${process.env.GMAIL_USER}>`,
    to: process.env.USER_EMAIL,
    subject: 'Campsite Available',
    text: text,
  };
  return mail;
};

export default sendEmail;
