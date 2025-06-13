require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const usersRoutes = require("./routes/users");
const templatesRoutes = require("./routes/templates");
const weddingInvitationRoutes = require('./routes/weddingInvitationRoutes');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const { recommendWeddingSaying } = require('./controllers/aiController');

const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 3001;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: [`http://localhost:${SERVER_PORT}`, `http://localhost:${FRONTEND_PORT}`],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Routes
app.use("/api/dashboard", dashboardRoutes); 
app.use("/api/users", usersRoutes);
app.use("/api/templates", templatesRoutes);
app.use('/api/wedding-invitations', weddingInvitationRoutes);
app.use('/api/auth', authRoutes);
app.post('/api/recommend-wedding-saying', recommendWeddingSaying);

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start server
app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});