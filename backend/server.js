require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require('cors');

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());

// Connect to MongoDB using the connection string from the .env file
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Simple route for testing the API
app.get("/", (req, res) => {
  res.send("API Running...");
});

// Import user and event routes
const userRoutes = require("./routes/UserRoutes");
const eventRoutes = require("./routes/EventRoutes");
const affiliateRoutes = require("./routes/AffiliateRoutes");
const attendanceRoutes = require("./routes/AttendeeRoutes");

// Mount the routes under their respective paths
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/affiliates", affiliateRoutes);
app.use("/api/attendances", attendanceRoutes);

// Start the server on the specified PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
