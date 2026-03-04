const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 200 },
  url:  { type: String, required: true, trim: true }
}, { timestamps: true });

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  storedName:   { type: String, required: true },
  mimetype:     { type: String, required: true },
  size:         { type: Number, required: true },
  path:         { type: String, required: true }   // relative URL path
}, { timestamps: true });

const topicSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject:   { type: String, required: true, trim: true, maxlength: 100 },
  topic:     { type: String, trim: true, maxlength: 100 },
  emoji:     { type: String, default: '📘' },
  color:     { type: String, enum: ['violet','pink','cyan','amber'], default: 'violet' },
  resources: [resourceSchema],
  files:     [fileSchema]
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema);
