const db = require('./connection');

const labels = [
  { name: 'cat', description: 'Domestic animal' },
  { name: 'dog', description: 'Domestic animal' },
  { name: 'outdoor', description: 'Taken outside' },
  { name: 'indoor', description: 'Taken inside' },
  { name: 'vehicle', description: 'Cars, bikes, etc.' }
];

function seed() {
  const insertLabel = db.prepare(
    `INSERT OR IGNORE INTO labels (name, description) VALUES (?, ?)`
  );
  const tx = db.transaction(() => {
    labels.forEach(l => insertLabel.run(l.name, l.description));
  });
  try {
    tx();
    console.log('Seeded labels.');
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

if (require.main === module) seed();

module.exports = { seed };
