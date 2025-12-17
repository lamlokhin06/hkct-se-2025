const orm = require('../orm');

function listLabels() {
  return orm.labels.all();
}

function getLabel(id) {
  return orm.labels.get(id);
}

function createLabel({ name, description = null }) {
  return orm.labels.add({ name, description });
}

function updateLabel(id, { name, description = null }) {
  const l = orm.labels.get(id);
  if (!l) return null;
  l.name = name;
  l.description = description;
  try {
    orm.labels.update(id, l);
  } catch (err) {
    // likely uniqueness violation
    const e = new Error('Duplicate or invalid label name');
    e.code = 'DUPLICATE';
    throw e;
  }
  return orm.labels.get(id);
}

function deleteLabel(id) {
  const l = orm.labels.get(id);
  if (!l) return false;
  orm.labels.delete(id);
  return true;
}

module.exports = { listLabels, getLabel, createLabel, updateLabel, deleteLabel };
