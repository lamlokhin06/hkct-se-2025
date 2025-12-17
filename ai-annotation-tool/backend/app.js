const express = require('express');
const cors = require('cors');
const path = require('path');
const { runMigrations } = require('./db/migrate');
const { seed } = require('./db/seed');

const images = require('./routes/images');
const labels = require('./routes/labels');
const annotations = require('./routes/annotations');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/images', images);
app.use('/api/labels', labels);
app.use('/api/annotations', annotations);

// Export app for testing
module.exports = app;

// Start server if CLI
if (require.main === module) {
  try {
    runMigrations();
    seed();
  } catch (err) {
    console.error('Startup error:', err.message);
    process.exit(1);
  }
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
}
