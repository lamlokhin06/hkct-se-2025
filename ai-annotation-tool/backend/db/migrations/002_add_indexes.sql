CREATE INDEX IF NOT EXISTS idx_annotations_image ON annotations(image_id);
CREATE INDEX IF NOT EXISTS idx_annotations_label ON annotations(label_id);
CREATE INDEX IF NOT EXISTS idx_labels_name ON labels(name);
CREATE INDEX IF NOT EXISTS idx_images_created ON images(created_at);