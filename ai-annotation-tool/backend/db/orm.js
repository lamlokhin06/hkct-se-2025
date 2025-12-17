const proxy = require('better-sqlite3-proxy');
const db = require('./connection');

const tables = {
  images: {
    filename: 'text',
    original_name: 'text',
    mime_type: 'text',
    size: 'number',
    created_at: 'text'
  },
  labels: {
    name: 'text',
    description: 'text'
  },
  annotations: {
    image_id: 'number',
    label_id: 'number',
    created_at: 'text'
  },
  _migrations: {
    name: 'text',
    applied_at: 'text'
  }
};

const orm = proxy({ db, tables });

module.exports = orm;