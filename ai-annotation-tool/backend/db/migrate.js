const fs = require('fs');
const path = require('path');
const db = require('./connection');

function ensureMigrationsTable() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function hasApplied(name) {
  const row = db.prepare(`SELECT 1 FROM _migrations WHERE name = ?`).get(name);
  return !!row;
}

function markApplied(name) {
  db.prepare(`INSERT INTO _migrations (name) VALUES (?)`).run(name);
}

function runMigrations() {
  db.exec('PRAGMA foreign_keys = ON;');
  ensureMigrationsTable();
  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const file of files) {
    if (hasApplied(file)) {
      console.log('Already applied:', file);
      continue;
    }
    const sql = fs.readFileSync(path.join(dir, file), 'utf-8');
    const tx = db.transaction(() => db.exec(sql));
    try {
      tx();
      markApplied(file);
      console.log('Applied migration:', file);
    } catch (err) {
      console.error('Migration failed:', file, err.message);
      process.exit(1);
    }
  }
}

if (require.main === module) runMigrations();

module.exports = { runMigrations };
