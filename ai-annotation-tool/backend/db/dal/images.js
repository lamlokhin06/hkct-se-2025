const orm = require('../orm');
const db = require('../connection');

function createImage(meta) {
  // meta: { filename, original_name, mime_type, size }
  return orm.images.add(meta);
}

function listImagesWithLabels() {
  const stmt = db.prepare(`
    SELECT i.*,
    COALESCE(json_group_array(
      CASE WHEN l.id IS NOT NULL THEN json_object('id', l.id, 'name', l.name) END
    ), '[]') AS labels
    FROM images i
    LEFT JOIN annotations a ON a.image_id = i.id
    LEFT JOIN labels l ON l.id = a.label_id
    GROUP BY i.id
    ORDER BY i.created_at DESC
  `);
  return stmt.all().map(r => ({ ...r, labels: JSON.parse(r.labels).filter(Boolean) }));
}

function getImage(id) {
  return orm.images.get(id);
}

function updateImage(id, fields) {
  const img = orm.images.get(id);
  if (!img) return null;
  Object.assign(img, fields);
  orm.images.update(id, img);
  return orm.images.get(id);
}

function deleteImage(id) {
  const exists = orm.images.get(id);
  if (!exists) return false;
  orm.images.delete(id);
  return true;
}

module.exports = { createImage, listImagesWithLabels, getImage, updateImage, deleteImage };
