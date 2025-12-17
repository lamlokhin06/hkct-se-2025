# AI Dataset Annotation (Enhanced)

A Bootstrap-enhanced web app to upload images, create/manage labels, and annotate images with labels. Built with Express, SQLite, better-sqlite3-proxy ORM, migrations, seeding, and Mocha tests to demonstrate TDD.

## Setup

- Node.js LTS
- npm i
- npm run migrate
- npm run seed
- npm start
- Open http://localhost:3000

## Scripts

- migrate: run SQL migrations
- seed: populate initial labels
- start: run server
- test: run Mocha tests

## Tech

- Frontend: Bootstrap 5, vanilla JS
- Backend: Express
- DB: SQLite (better-sqlite3 + better-sqlite3-proxy)
- DAL: server/db/dal/*
- Migrations: server/db/migrations/*.sql via server/db/migrate.js
- Tests: Mocha + supertest + chai

## TDD Workflow

- Write failing tests in /test
- Implement minimal DAL/route changes to pass
- Refactor for clarity
- Commit messages should reflect `test`, `feat`, `refactor`


