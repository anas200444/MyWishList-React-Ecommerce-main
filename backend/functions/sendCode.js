// /backend/functions/sendCode.js

const nodemailer = require("nodemailer");
const { json } = require('@netlify/functions');
require("dotenv").config();

let verificationCodes = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.handler = async (event, context) => {
  const { email } = JSON.parse(event.body);

  if (!email) return json({ error: "Email is required" }, { statusCode: 400 });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 300000; // 5 minutes expiry time

  verificationCodes.set(email, { code, expires });

  console.log(`Sending verification code to: ${email}`);
  console.log(`Verification code: ${code}`);

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "2FA Verification Code",
      html: `
        <h2>Your Verification Code</h2>
        <p>Code: <strong>${code}</strong></p>
        <p>Expires in 5 minutes</p>
      `,
    });
    return json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return json({ error: "Failed to send verification code", details: error.message }, { statusCode: 500 });
  }
};
