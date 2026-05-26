# Flood Monitoring Backend

Standalone API for the Flood Monitoring System. This backend is separated from the existing web and mobile apps so it can be developed and connected later without changing the current frontend.

## Stack

- Node.js
- Express
- JSON file persistence

## Project Structure

```text
backend/
  data/
    alerts.json
    reports.json
    users.json
    waters.json
  src/
    config/
    controllers/
    middlewares/
    routes/
    services/
    utils/
    app.js
    server.js
```

## Run

```bash
cd backend
npm install
npm run dev
```

Default server address:

```text
http://localhost:4000
```

## Endpoints

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/waters`
- `GET /api/waters/:id`
- `GET /api/alerts`
- `POST /api/alerts`
- `GET /api/reports`
- `POST /api/reports`
- `GET /api/users`
- `POST /api/users`

## Notes

- Data is stored in local JSON files inside `backend/data/`.
- The included auth flow is starter-level and intended for local development.
- Replace JSON persistence with a database later if the project grows.
