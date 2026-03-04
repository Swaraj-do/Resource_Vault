const express = require('express');
const Topic = require('../models/Topic');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// GET all topics
router.get('/', async (req, res) => {
  const topics = await Topic.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json({ topics });
});

// POST create topic
router.post('/', async (req, res) => {
  try {
    const { subject, topic, emoji, color } = req.body;
    if (!subject || !topic) return res.status(400).json({ error: 'Subject and topic required' });
    const t = await Topic.create({ user: req.userId, subject, topic: topic || subject, emoji, color });
    res.status(201).json({ topic: t });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT update topic
router.put('/:id', async (req, res) => {
  const t = await Topic.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { subject: req.body.subject, topic: req.body.topic, emoji: req.body.emoji, color: req.body.color },
    { new: true, runValidators: true }
  );
  if (!t) return res.status(404).json({ error: 'Topic not found' });
  res.json({ topic: t });
});

// DELETE topic (also removes uploaded files)
router.delete('/:id', async (req, res) => {
  const t = await Topic.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!t) return res.status(404).json({ error: 'Topic not found' });
  // Delete associated files from disk
  t.files.forEach(f => {
    const fullPath = path.join(__dirname, '../../uploads', f.storedName);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  });
  res.json({ message: 'Deleted' });
});

// POST add resource (link)
router.post('/:id/resources', async (req, res) => {
  const { name, url } = req.body;
  if (!name || !url) return res.status(400).json({ error: 'Name and URL required' });
  const t = await Topic.findOne({ _id: req.params.id, user: req.userId });
  if (!t) return res.status(404).json({ error: 'Topic not found' });
  let finalUrl = url;
  if (!/^https?:\/\//i.test(finalUrl)) finalUrl = 'https://' + finalUrl;
  t.resources.push({ name, url: finalUrl });
  await t.save();
  res.status(201).json({ topic: t });
});

// DELETE resource
router.delete('/:id/resources/:rid', async (req, res) => {
  const t = await Topic.findOne({ _id: req.params.id, user: req.userId });
  if (!t) return res.status(404).json({ error: 'Topic not found' });
  t.resources = t.resources.filter(r => r._id.toString() !== req.params.rid);
  await t.save();
  res.json({ topic: t });
});

// DELETE file from topic
router.delete('/:id/files/:fid', async (req, res) => {
  const t = await Topic.findOne({ _id: req.params.id, user: req.userId });
  if (!t) return res.status(404).json({ error: 'Topic not found' });
  const file = t.files.find(f => f._id.toString() === req.params.fid);
  if (file) {
    const fullPath = path.join(__dirname, '../../uploads', file.storedName);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  }
  t.files = t.files.filter(f => f._id.toString() !== req.params.fid);
  await t.save();
  res.json({ topic: t });
});

module.exports = router;
