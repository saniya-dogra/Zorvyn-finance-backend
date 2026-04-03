const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// load env variables
dotenv.config();

// connect to database
connectDB();

const app = express();

// middleware to parse json
app.use(express.json());

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/records", require("./routes/recordRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

// simple home route just to check if server is running
app.get("/", (req, res) => {
  res.json({ message: "Finance Dashboard API is running" });
});

// handle routes that don't exist
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
