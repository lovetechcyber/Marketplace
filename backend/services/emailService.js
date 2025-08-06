const nodemailer = require('nodemailer');

exports.sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Marketplace Admin" <${process.env.ADMIN_EMAIL}>`,
    to,
    subject,
    html
  });
};
