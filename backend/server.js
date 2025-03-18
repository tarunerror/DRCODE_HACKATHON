const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const vader = require("vader-sentiment");
const sendEmail = require("./utils/sendEmail");
const admin = require("./firebaseConfig"); // Firebase Admin SDK
require("dotenv").config();

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// Define Email Schema
const emailSchema = new mongoose.Schema({
  emailText: String,
  email: String,
  sentimentScore: Number,
  customMessage: String,
  createdAt: { type: Date, default: Date.now },
});
const Email = mongoose.model("Email", emailSchema);

// Middleware to Verify Firebase Authentication
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Bearer header
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user details to request
    next();
  } catch (error) {
    console.error("Firebase Auth Error:", error);
    return res.status(401).json({ error: "Invalid Token" });
  }
};

// Analyze Sentiment & Store in Database (Protected Route)
app.post("/analyze", verifyToken, async (req, res) => {
  try {
    const { emailText, email, customMessage } = req.body;
    if (!emailText || !email) {
      return res.status(400).json({ error: "Email text and email address are required" });
    }

    // Analyze sentiment using VADER
    const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(emailText);
    const sentimentScore = Math.round((intensity.compound + 1) * 50); // Convert to 0-100 scale

    // Store in database
    const newEmail = new Email({ emailText, email, sentimentScore, customMessage });
    await newEmail.save();

    // Send email if score > 70
    if (sentimentScore > 70) {
      const message = customMessage || "Thank you for your positive feedback! We appreciate your support.";
      await sendEmail(email, "Thank You for Your Feedback!", message);
    }

    res.json({ score: sentimentScore });
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get All Analyzed Emails (Protected Route)
app.get("/emails", verifyToken, async (req, res) => {
  try {
    const emails = await Email.find().sort({ createdAt: -1 });
    res.json(emails);
  } catch (error) {
    console.error("Error fetching emails:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
