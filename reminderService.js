const cron = require('node-cron');
const nodemailer = require('nodemailer');
const axios = require('axios');
const Job = require('./models/Job');
const User = require('./models/User');

const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email reminder function
async function sendFollowUpReminders() {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const jobs = await Job.find({ followUpDate: { $gte: start, $lte: end } }).populate('user');
    
    for (const job of jobs) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: job.user.email,
          subject: 'Job Application Follow-Up Reminder',
          html: `<p>Hi ${job.user.name},<br>
            Reminder to follow up on your application for <b>${job.company}</b> (${job.role}) on ${job.followUpDate.toDateString()}.
            </p>`
        });
        console.log(`Reminder sent to ${job.user.email} for job ${job.company} (${job.role})`);
      } catch (mailErr) {
        console.error('Error sending reminder email:', mailErr);
      }
    }
    
    if (jobs.length === 0) {
      console.log('No follow-up reminders to send for today.');
    } else {
      console.log(`Sent ${jobs.length} follow-up reminders.`);
    }
  } catch (err) {
    console.error('Error in reminder cron job:', err);
  }
}

// Self-ping function
async function selfPing() {S
  try {
    const APP_URL = process.env.APP_URL || process.env.DEPLOYED_URL || 'https://followuppro-backend.onrender.com/';
    const response = await axios.get(`${APP_URL}/health`, { 
      timeout: 30000,
      headers: { 'User-Agent': 'Self-Ping-Service' }
    });
    console.log(`✅ Self-ping successful: ${response.status} at ${new Date().toISOString()}`);
  } catch (error) {
    console.error(`❌ Self-ping failed: ${error.message} at ${new Date().toISOString()}`);
  }
}

// Email reminders at 6 AM
cron.schedule('0 6 * * *', async () => {
  console.log('Running 6 AM email reminder check...');
  await sendFollowUpReminders();
});

// Email reminders at 8 PM
cron.schedule('0 20 * * *', async () => {
  console.log('Running 8 PM email reminder check...');
  await sendFollowUpReminders();
});

// Self-ping every 5 minutes to keep app alive
cron.schedule('*/5 * * * *', async () => {
  await selfPing();
});

console.log('Cron jobs initialized:');
console.log('- Email reminders: 6:00 AM and 8:00 PM daily');
console.log('- Self-ping: Every 5 minutes');