const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Job = require('./models/Job');
const User = require('./models/User');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


cron.schedule('0 8 * * *', async () => {
  try {
    const start = new Date();
    start.setHours(0,0,0,0);
    const end = new Date();
    end.setHours(23,59,59,999);

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
    }
  } catch (err) {
    console.error('Error in reminder cron job:', err);
  }
});
