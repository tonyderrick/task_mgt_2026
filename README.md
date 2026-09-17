# Task Manager

A full-stack task management application built for the kLab Tech Upskill Program coding challenge.

Create, edit, delete and complete tasks. Search them, filter them by status and priority, and sort them. Everything is stored in MySQL and served through a REST API.

**Live demo:** _add your deployment link here_

---


token: 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

## Technologies

| Layer | Choice | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast dev server, no framework overhead for a single-screen app |
| Backend | Node.js + Express 4 | Small, explicit REST layer that is easy to read and explain |
| Database | MySQL 8 (`mysql2` driver) | Relational, and the task model is a single well-defined table |
| Styling | Plain CSS with custom properties | No utility framework to learn or ship |

---

## Requirements

- Node.js 18 or newer
- MySQL 8 (or MariaDB 10.4+) running locally

---

## Getting started

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit DB_USER / DB_PASSWORD
```

Set up the database (creates the database if it does not exist, then the `tasks` table):


Start the API:

```bash
npm run dev               # nodemon, http://localhost:4000


Check it is alive: `curl http://localhost:4000/api/health`

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:4000/api
npm run dev               # http://localhost:5173
```

---

## Database setup


```sql
CREATE DATABASE task_mgt CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE task_mgt;
-- then paste the contents of backend/src/db/schema.sql
```

## API

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/tasks` | List tasks (supports filtering, search, sorting) |
| `GET` | `/tasks/:id` | Get one task |
| `POST` | `/tasks` | Create a task |
| `PUT` | `/tasks/:id` | Update a task (any subset of fields) |
| `DELETE` | `/tasks/:id` | Delete a task |
| `GET` | `/health` | Service check |

### Query parameters on `GET /tasks`

| Parameter | Values | Effect |
|---|---|---|
| `status` | `pending`, `completed` | Filter by status |
| `priority` | `low`, `medium`, `high` | Filter by priority |
| `search` | any text | Matches title or description |
| `sort` | `newest` (default), `oldest`, `priority` | Ordering |

Example: `GET /api/tasks?status=pending&priority=high&search=report&sort=priority`

### Create a task

```bash
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Submit the challenge","description":"Push and fill the form","priority":"high"}'
```

```json
{
  "data": {
    "id": 6,
    "title": "Submit the challenge",
    "description": "Push and fill the form",
    "status": "pending",
    "priority": "high",
    "createdAt": "2026-09-17T09:12:44.000Z",
    "updatedAt": "2026-09-17T09:12:44.000Z"
  }
}
```

### Mark a task completed

```bash
curl -X PUT http://localhost:4000/api/tasks/6 \
  -H "Content-Type: application/json" \
  -d '{"status":"completed"}'
```

### Validation errors

A bad payload returns `400` with the offending fields named:

```json
{
  "message": "Some fields need fixing.",
  "errors": { "title": "Title is required." }
}
```

Other responses: `404` for a missing task or unknown route, `204` on delete,
`503` when MySQL is unreachable.

---

## Features included

- [x] View, create, edit and delete tasks
- [x] Toggle between pending and completed
- [x] Filter by status and by priority
- [x] Search across title and description (debounced, server-side)
- [x] Form validation on both client and server
- [x] Sorting by date or priority
- [x] Responsive layout, keyboard focus states, reduced-motion support
- [x] Loading, empty and error states
- [x] API documentation (above)

## Project structure

```
task-manager/
├── backend/
│   └── src/
│       ├── app.js                  Express app, CORS, JSON, route mounting
│       ├── server.js               Entry point
│       ├── controllers/            Query building and SQL
│       ├── middleware/             Validation and error handling
│       ├── routes/                 Endpoint definitions
│       └── db/                     Pool, schema.sql, init and seed scripts
└── frontend/
    └── src/
        ├── App.jsx                 State, filters, CRUD orchestration
        ├── api/tasks.js            Fetch wrapper and typed errors
        ├── components/             Rail, rows, dialogs, icons
        └── styles.css              Design tokens and styles
```
