const Job = require('../models/Job');

// POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    let resumePath = '';
    if (req.file) {
      resumePath = `/uploads/${req.file.filename}`;
    }
    const job = new Job({
      ...req.body,
      user: req.user.id,
      resume: resumePath
    });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ user: req.user.id });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.file) {
      updateData.resume = `/uploads/${req.file.filename}`;
    }
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateData,
      { new: true }
    );
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
