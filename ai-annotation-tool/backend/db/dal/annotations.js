const orm = require('../orm');

function addAnnotation(image_id, label_id) {
  const dup = orm.annotations.all().find(a => a.image_id === image_id && a.label_id === label_id);
  if (dup) {
    const e = new Error('Annotation already exists for this image and label');
    e.code = 'DUPLICATE';
    throw e;
  }
  return orm.annotations.add({ image_id, label_id });
}

function removeAnnotation(image_id, label_id) {
  const row = orm.annotations.all().find(a => a.image_id === image_id && a.label_id === label_id);
  if (!row) return false;
  orm.annotations.delete(row.id);
  return true;
}

module.exports = { addAnnotation, removeAnnotation };
