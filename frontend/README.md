# Flood Monitoring System – Frontend

> **Project Overview**
The **frontend** of the Flood Monitoring System is a modern, responsive web application built with **React**, **Vite**, and **Tailwind CSS**. It visualises real‑time water‑level data, alerts, and historical trends provided by the backend API.

---

## Tech Stack
- **React 18** – component‑driven UI
- **Vite** – fast dev server & bundler
- **Tailwind CSS** – utility‑first styling with dark‑mode support
- **Radix UI** – accessible primitives (accordion, dialog, tooltip, …)
- **Recharts** – declarative charts for water‑level visualisation
- **Sonner** – toast notifications
- **Emotion** – CSS‑in‑JS for fine‑grained styling
- **React Router** – client‑side routing
- **Vite plugins** – Tailwind, React Refresh, etc.

---

## Development Setup
1. **Install Node (≥ 20)**
2. **Install dependencies**
   ```bash
   npm install   # or `pnpm install` as defined in package.json
   ```
3. **Start the development server**
   ```bash
   npm run dev   # Vite dev server on http://localhost:5173
   ```
   The app will automatically proxy API calls to the backend (see `vite.config.ts`).

---

## Build & Deployment
### Build
```bash
npm run build   # generates an optimized bundle in `dist/`
```
The output is a static site ready for any static‑host (Vercel, Netlify, GitHub Pages, …).

### Deploy to Vercel (example)
1. Connect the repository to Vercel.
2. Set the **Build Command** to `npm run build` and the **Output Directory** to `dist`.
3. Add an environment variable `NEXT_PUBLIC_API_URL` pointing at your deployed backend.
4. Vercel will automatically build and preview on each push.

---

## Contributing
- Follow the existing code‑style (Prettier + ESLint).
- Create a feature branch, open a PR, and ensure `npm run lint && npm test` passes.
- Update the README if you add new pages or major UI components.

---

## License
This frontend is licensed under the MIT License – see the `LICENSE` file in the repository.
