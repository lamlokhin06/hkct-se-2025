const request = require('supertest');
const { expect } = require('chai');
const app = require('../server/app');
const { runMigrations } = require('../server/db/migrate');
const { seed } = require('../server/db/seed');

describe('Labels API', function () {
  before(function () {
    runMigrations();
    seed();
  });

  it('GET /api/labels returns list', async () => {
    const res = await request(app).get('/api/labels');
    expect(res.status).to.equal(200);
    expect(res.body).to.be.an('array');
  });

  it('POST /api/labels creates label', async () => {
    const res = await request(app).post('/api/labels').send({ name: 'tree', description: 'Plants' });
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('id');
  });

  it('PUT /api/labels/:id renames label and prevents duplicates', async () => {
    const a = await request(app).post('/api/labels').send({ name: 'a', description: '' });
    const b = await request(app).post('/api/labels').send({ name: 'b', description: '' });
    const dup = await request(app).put(`/api/labels/${b.body.id}`).send({ name: 'a', description: '' });
    expect(dup.status).to.equal(400);
    const ok = await request(app).put(`/api/labels/${a.body.id}`).send({ name: 'a-renamed', description: 'x' });
    expect(ok.status).to.equal(200);
    expect(ok.body.name).to.equal('a-renamed');
  });

  it('DELETE /api/labels/:id removes label', async () => {
    const c = await request(app).post('/api/labels').send({ name: 'tempdel', description: '' });
    const del = await request(app).delete(`/api/labels/${c.body.id}`);
    expect(del.status).to.equal(204);
    const del2 = await request(app).delete(`/api/labels/${c.body.id}`);
    expect(del2.status).to.equal(404);
  });
});
