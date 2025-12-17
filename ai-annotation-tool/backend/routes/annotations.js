const express = require('express');
const { addAnnotation, removeAnnotation } = require('../db/dal/annotations');

const router = express.Router();

router.post('/', (req, res) => {
  const { image_id, label_id } = req.body || {};
  const iid = Number(image_id);
  const lid = Number(label_id);
  if (!Number.isInteger(iid) || iid <= 0 || !Number.isInteger(lid) || lid <= 0) {
    return res.status(400).json({ error: 'image_id and label_id must be positive integers' });
  }
  try {
    const row = addAnnotation(iid, lid);
    res.status(201).json(row);
  } catch (err) {
    if (err.code === 'DUPLICATE') return res.status(409).json({ error: 'Annotation already exists' });
    res.status(400).json({ error: 'Invalid image_id or label_id' });
  }
});

router.delete('/', (req, res) => {
  const { image_id, label_id } = req.body || {};
  const iid = Number(image_id);
  const lid = Number(label_id);
  if (!Number.isInteger(iid) || iid <= 0 || !Number.isInteger(lid) || lid <= 0) {
    return res.status(400).json({ error: 'image_id and label_id must be positive integers' });
  }
  const ok = removeAnnotation(iid, lid);
  if (!ok) return res.status(404).json({ error: 'Annotation not found' });
  res.status(204).end();
});

module.exports = router;