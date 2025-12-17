const express = require('express');
const { listLabels, createLabel, updateLabel, deleteLabel } = require('../db/dal/labels');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(listLabels());
});

router.post('/', (req, res) => {
  const { name, description } = req.body || {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Label name required' });
  }
  try {
    const row = createLabel({ name: name.trim(), description: description || null });
    res.status(201).json(row);
  } catch (err) {
    res.status(400).json({ error: 'Label exists or invalid' });
  }
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, description } = req.body || {};
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid label id' });
  if (!name || typeof name !== 'string') return res.status(400).json({ error: 'Label name required' });
  try {
    const updated = updateLabel(id, { name: name.trim(), description: description || null });
    if (!updated) return res.status(404).json({ error: 'Label not found' });
    res.json(updated);
  } catch (err) {
    if (err.code === 'DUPLICATE') return res.status(400).json({ error: 'Duplicate label name' });
    res.status(500).json({ error: 'Update failed' });
  }
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid label id' });
  const ok = deleteLabel(id);
  if (!ok) return res.status(404).json({ error: 'Label not found' });
  res.status(204).end();
});

module.exports = router;
