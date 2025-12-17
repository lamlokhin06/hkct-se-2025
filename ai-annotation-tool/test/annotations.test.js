const request = require('supertest');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

const app = require('../server/app');
const { runMigrations } = require('../server/db/migrate');
const { seed } = require('../server/db/seed');

async function createImage() {
  const sample = path.join(__dirname, 'fixtures', 'anno.jpg');
  fs.writeFileSync(sample, Buffer.alloc(100));
  const res = await request(app).post('/api/images').attach('image', sample);
  return res.body.id;
}

async function getFirstLabelId() {
  const res = await request(app).get('/api/labels');
  return res.body[0].id;
}

describe('Annotations API', function () {
  before(function () {
    runMigrations();
    seed();
  });

  it('POST /api/annotations links label to image', async () => {
    const iid = await createImage();
    const lid = await getFirstLabelId();
    const res = await request(app).post('/api/annotations').send({ image_id: iid, label_id: lid });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('id');
  });

  it('POST /api/annotations prevents duplicate pair', async () => {
    const iid = await createImage();
    const lid = await getFirstLabelId();
    await request(app).post('/api/annotations').send({ image_id: iid, label_id: lid });
    const dup = await request(app).post('/api/annotations').send({ image_id: iid, label_id: lid });
    expect(dup.status).to.equal(409);
  });

  it('DELETE /api/annotations unlinks pair', async () => {
    const iid = await createImage();
    const lid = await getFirstLabelId();
    await request(app).post('/api/annotations').send({ image_id: iid, label_id: lid });
    const del = await request(app).delete('/api/annotations').send({ image_id: iid, label_id: lid });
    expect(del.status).to.equal(204);
    const del2 = await request(app).delete('/api/annotations').send({ image_id: iid, label_id: lid });
    expect(del2.status).to.equal(404);
  });
});
