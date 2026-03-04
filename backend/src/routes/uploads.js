const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Topic = require('../models/Topic');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

// Only allow PDFs and common doc types
const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Word, PowerPoint, Excel, and text files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB per file
});

// POST /api/uploads/:topicId — upload one or many files
router.post('/:topicId', upload.array('files', 20), async (req, res) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.topicId, user: req.userId });
    if (!topic) {
      // cleanup if topic not found
      req.files?.forEach(f => fs.unlinkSync(f.path));
      return res.status(404).json({ error: 'Topic not found' });
    }

    const newFiles = req.files.map(f => ({
      originalName: f.originalname,
      storedName: f.filename,
      mimetype: f.mimetype,
      size: f.size,
      path: `/uploads/${f.filename}`
    }));

    topic.files.push(...newFiles);
    await topic.save();

    res.status(201).json({ topic });
  } catch (err) {
    req.files?.forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large (max 20MB)' });
    return res.status(400).json({ error: err.message });
  }
  if (err) return res.status(400).json({ error: err.message });
  next();
});

module.exports = router;
