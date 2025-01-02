const express = require("express");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
});

const verificationCodes = new Map();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function cleanExpiredCodes() {
  const now = Date.now();
  for (const [email, data] of verificationCodes.entries()) {
    if (data.expires <= now) {
      verificationCodes.delete(email);
    }
  }
}

app.post("/send-code", limiter, async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 300000;

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
    res.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send verification code", details: error.message });
  }
});

app.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required" });
  }

  const storedData = verificationCodes.get(email);

  if (!storedData) {
    return res.status(400).json({ error: "No code found for this email" });
  }

  if (storedData.expires <= Date.now()) {
    verificationCodes.delete(email);
    return res.status(400).json({ error: "Verification code expired" });
  }

  if (storedData.code !== code) {
    return res.status(400).json({ error: "Invalid verification code" });
  }

  verificationCodes.delete(email);

  // Log to console when the code is verified
  console.log(`Verification successful for email: ${email}`);

  res.json({ success: true });
});

setInterval(cleanExpiredCodes, 60000);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
