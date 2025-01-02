// /backend/functions/verifyCode.js

const { json } = require('@netlify/functions');

// Use an in-memory object to store the verification codes
let verificationCodes = new Map();

exports.handler = async (event, context) => {
  const { email, code } = JSON.parse(event.body);

  if (!email || !code) {
    return json({ error: "Email and code are required" }, { statusCode: 400 });
  }

  const storedData = verificationCodes.get(email);

  if (!storedData) {
    return json({ error: "No code found for this email" }, { statusCode: 400 });
  }

  if (storedData.expires <= Date.now()) {
    verificationCodes.delete(email);
    return json({ error: "Verification code expired" }, { statusCode: 400 });
  }

  if (storedData.code !== code) {
    return json({ error: "Invalid verification code" }, { statusCode: 400 });
  }

  verificationCodes.delete(email);

  console.log(`Verification successful for email: ${email}`);

  return json({ success: true });
};
