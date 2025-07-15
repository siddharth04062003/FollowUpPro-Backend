const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  title: { type: String },
  linkedin: { type: String },
  profilePhoto: { type: String }, // path to uploaded photo
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema); 