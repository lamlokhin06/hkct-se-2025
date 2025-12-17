const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { createImage, listImagesWithLabels, getImage, updateImage, deleteImage } = require('../db/dal/images');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  }
});
const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const ok = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(file.mimetype);
    cb(ok ? null : new Error('Invalid file type'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

const router = express.Router();

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { filename, originalname, mimetype, size } = req.file;
  const row = createImage({
    filename,
    original_name: originalname,
    mime_type: mimetype,
    size
  });
  res.status(201).json({ id: row.id, filename: row.filename, original_name: row.original_name });
});

router.get('/', (req, res) => {
  res.json(listImagesWithLabels());
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { original_name } = req.body || {};
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid image id' });
  if (!original_name || typeof original_name !== 'string') {
    return res.status(400).json({ error: 'original_name required' });
  }
  const updated = updateImage(id, { original_name });
  if (!updated) return res.status(404).json({ error: 'Image not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid image id' });
  const img = getImage(id);
  if (!img) return res.status(404).json({ error: 'Image not found' });
  const ok = deleteImage(id);
  if (!ok) return res.status(500).json({ error: 'Delete failed' });
  // Attempt to delete file; ignore errors
  try {
    const p = path.join(uploadDir, img.filename);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  } catch (_) {}
  res.status(204).end();
});

module.exports = router;
