const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Job = require('./models/Job');

require('./reminderService');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint for self-ping
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    service: 'Follow-Up Pro Backend'
  });
});

// Serve uploaded resumes statically
// Serve uploaded files (profile photos, resumes) statically
require('./config/staticFiles')(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));