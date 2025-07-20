const nodemailer = require('nodemailer');

const sendEmailAlert = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"RPMS Alerts" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    });

    console.log('📧 Email alert sent to', to);
  } catch (err) {
    console.error('❌ Email sending failed:', err.message);
  }
};

module.exports = sendEmailAlert;
