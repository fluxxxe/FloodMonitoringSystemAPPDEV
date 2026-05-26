# Flood Monitoring System

A beginner-friendly React web app for monitoring water levels and flood alerts.

This project was built for IT students to practice:
- frontend UI development
- routing and navigation
- form handling
- basic accessibility
- production build and deployment

## What This App Does

After login, users can open pages for:
- Dashboard overview
- Monitoring water locations
- Incident report submission
- Notifications center
- Summary and configuration
- Admin and user management

## Main Features

1. Protected app access
- The whole app is protected.
- If not logged in, user is redirected to `/admin/login`.
- Logout is in the navbar menu.

2. Monitoring cards
- Click a card to expand details.
- Shows image, trend, location, and sensor details.

3. Incident Report form
- Uses controlled inputs with React state.
- Includes text, email, phone, select, radio, checkbox, date, time, textarea.

4. Notifications management
- Filter notifications by type.
- Show unread only.
- Mark as read/unread and clear all.

5. Deployment-ready routing
- `vercel.json` includes SPA rewrite so deep routes work on refresh.

## Tech Stack

- React 18
- TypeScript
- Vite 6
- React Router 7
- CSS

## Project Structure (Simplified)

```text
src/
  app/
    auth/
      AdminLogin.tsx
      AdminLogin.css
    components/
    data/
    pages/
      Admin.tsx
      Configuration.tsx
      Dashboard.tsx
      IncidentReport.tsx
      Monitoring.tsx
      Notifications.tsx
      Summary.tsx
      UserManagement.tsx
    App.tsx
  main.tsx
public/
  waters/
  location.png
vercel.json
```

## How To Run This Project (Step by Step)

### 1. Install prerequisites
- Node.js (recommended: version 18 or higher)
- npm (comes with Node.js)

### 2. Install dependencies
```bash
npm install
```

### 3. Start development server
```bash
npm run dev
```

### 4. Open in browser
Use the local URL shown in terminal (usually `http://localhost:5173`).

## Available Scripts

```bash
npm run dev      # run local development server
npm run build    # create production build in dist/
npm run preview  # preview the production build locally
npm run start    # alias for vite dev in this project
```

## Routes

- `/admin/login` -> login page (public)
- `/` -> dashboard (protected)
- `/monitoring` -> monitoring page (protected)
- `/incident-report` -> form page (protected)
- `/notifications` -> notifications page (protected)
- `/summary` -> summary page (protected)
- `/configuration` -> configuration page (protected)
- `/admin` -> admin page (protected)
- `/admin/users` -> user management (protected)

## Deployment (Vercel)

This repo is configured for Vercel:
- Build command: `npm run build`
- Output directory: `dist`
- SPA rewrite is configured in `vercel.json`

If Vercel is connected to this GitHub repository, every push to `main` will auto-deploy.

## Quick Manual Test Checklist

Before submission, verify:
1. `npm run build` succeeds
2. App opens and login works
3. Logout redirects to login page
4. Protected routes require login
5. Deployed app refresh on deep routes (example: `/monitoring`) does not 404
6. Browser console has no errors

## Notes for New IT Students

- Start reading `src/app/App.tsx` first. It controls routes and login protection.
- Use small commits while editing (one feature per commit).
- Test every feature after changes, not only at the end.
- If deployed app breaks on refresh, check `vercel.json` rewrite config first.
