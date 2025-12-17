const request = require('supertest');
const { expect } = require('chai');
const path = require('path');
const fs = require('fs');

const app = require('../server/app');
const { runMigrations } = require('../server/db/migrate');
const { seed } = require('../server/db/seed');

describe('Images API', function () {
  before(function () {
    runMigrations();
    seed();
  });

  it('GET /api/images returns list', async () => {
    const res = await request(app).get('/api/images');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('POST /api/images uploads image', async () => {
    const sample = path.join(__dirname, 'fixtures', 'sample.jpg');
    if (!fs.existsSync(sample)) {
      fs.mkdirSync(path.join(__dirname, 'fixtures'), { recursive: true });
      fs.writeFileSync(sample, Buffer.alloc(100)); // dummy file
    }
    const res = await request(app)
      .post('/api/images')
      .attach('image', sample);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('id');
  });

  it('PUT /api/images/:id updates original_name and validates', async () => {
    const sample = path.join(__dirname, 'fixtures', 'sample2.jpg');
    fs.writeFileSync(sample, Buffer.alloc(100));
    const res1 = await request(app).post('/api/images').attach('image', sample);
    const id = res1.body.id;
    const res2 = await request(app).put(`/api/images/${id}`).send({ original_name: 'renamed.jpg' });
    expect(res2.status).to.equal(200);
    expect(res2.body.original_name).to.equal('renamed.jpg');

    const resBad = await request(app).put(`/api/images/${id}`).send({});
    expect(resBad.status).to.equal(400);
  });

  it('DELETE /api/images/:id deletes image', async () => {
    const sample = path.join(__dirname, 'fixtures', 'sample3.jpg');
    fs.writeFileSync(sample, Buffer.alloc(100));
    const res1 = await request(app).post('/api/images').attach('image', sample);
    const id = res1.body.id;
    const res2 = await request(app).delete(`/api/images/${id}`);
    expect(res2.status).to.equal(204);
    const res3 = await request(app).delete(`/api/images/${id}`);
    expect(res3.status).to.equal(404);
  });
});
