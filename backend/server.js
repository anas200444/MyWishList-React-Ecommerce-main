const express = require("express");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
require("dotenv").config();

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
});

// Initialize Firebase Admin SDK
const admin = require("firebase-admin");
initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  })
});

const db = getFirestore();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/send-code", limiter, async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 300000;

  // Save the code and expiration time to Firebase Firestore
  const codeRef = db.collection("verificationCodes").doc(email);
  await codeRef.set({
    code,
    expires: Timestamp.fromMillis(expires),
  });

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

  // Fetch the verification code and expiration time from Firestore
  const codeRef = db.collection("verificationCodes").doc(email);
  const doc = await codeRef.get();

  if (!doc.exists) {
    return res.status(400).json({ error: "No code found for this email" });
  }

  const storedData = doc.data();
  
  if (storedData.expires.toMillis() <= Date.now()) {
    await codeRef.delete(); // Delete expired code
    return res.status(400).json({ error: "Verification code expired" });
  }

  if (storedData.code !== code) {
    return res.status(400).json({ error: "Invalid verification code" });
  }

  await codeRef.delete(); // Delete the code after successful verification

  // Log to console when the code is verified
  console.log(`Verification successful for email: ${email}`);

  res.json({ success: true });
});

setInterval(async () => {
  // Clean expired verification codes every minute
  const snapshot = await db.collection("verificationCodes").get();
  snapshot.forEach(async (doc) => {
    const data = doc.data();
    if (data.expires.toMillis() <= Date.now()) {
      await doc.ref.delete();
    }
  });
}, 60000);

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
