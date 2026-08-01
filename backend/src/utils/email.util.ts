import nodemailer from 'nodemailer';

export const sendEmail = async (options: { email: string; subject: string; message: string }) => {
  // We use ethereal or Mailtrap in development if no real SMTP is provided
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525', 10),
    auth: {
      user: process.env.SMTP_USER || 'fake_user',
      pass: process.env.SMTP_PASS || 'fake_pass',
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'AutoPart Store'} <${process.env.FROM_EMAIL || 'noreply@autopartstore.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: %s', info.messageId);
};

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
};
