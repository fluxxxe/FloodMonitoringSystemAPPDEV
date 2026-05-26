# README2 - Beginner Code Guide (Function and Syntax Definitions)

This guide explains the main code parts used in this project in simple terms.
It is written for new IT students.

## 1. Basic Code Syntax Definitions

### `import`
Example:
```ts
import { useState } from "react";
```
Definition:
- `import` is used to bring code from another file or library into the current file.
- You import hooks, components, utilities, and CSS this way.

### `export`
Example:
```ts
export function Dashboard() { ... }
```
Definition:
- `export` makes a function/component available so other files can use it.

### `function`
Example:
```ts
function handleLogout() { ... }
```
Definition:
- A `function` is a reusable block of code.
- In React, components are also functions.

### `const`
Example:
```ts
const [isSignedIn, setIsSignedIn] = useState(false);
```
Definition:
- `const` creates a variable that cannot be reassigned to a new reference.
- Often used for state, arrays, objects, and helper functions.

### `useState`
Example:
```ts
const [menuOpen, setMenuOpen] = useState(false);
```
Definition:
- React hook for storing and updating data in a component.
- `menuOpen` is the current value.
- `setMenuOpen(...)` updates the value.

### `useMemo`
Example:
```ts
const filteredItems = useMemo(() => { ... }, [items, filterType, showUnreadOnly]);
```
Definition:
- Optimizes performance by recalculating only when dependencies change.

### `useNavigate`
Example:
```ts
const navigate = useNavigate();
navigate("/admin/login");
```
Definition:
- Used to move user to another route (page) programmatically.

### `useLocation`
Example:
```ts
const location = useLocation();
```
Definition:
- Gives current route information (path and route state).

### Event handlers (`onClick`, `onChange`, `onSubmit`)
Examples:
```tsx
onClick={handleLogout}
onChange={(event) => setEmail(event.target.value)}
onSubmit={handleSubmit}
```
Definition:
- Functions that run when user interacts with UI.

### `.map(...)`
Example:
```tsx
alerts.map((alert) => <AlertCard key={alert.id} {...alert} />)
```
Definition:
- Loops through an array and returns UI for each item.
- Always provide a stable `key`.

### JSX
Example:
```tsx
return <section>...</section>;
```
Definition:
- JSX looks like HTML inside JavaScript/TypeScript.
- React uses it to describe UI.

### Fragments `<>...</>`
Definition:
- Lets you return multiple elements without creating an extra wrapper `div`.

### Props
Example:
```ts
interface NavBarProps { onLogout: () => void; }
```
Definition:
- Props are inputs passed from parent component to child component.

### `interface` (TypeScript)
Definition:
- Describes expected structure/type of data.
- Helps prevent coding mistakes.

---

## 2. Routing Definitions (How pages work)

In this project, routing is inside `src/app/App.tsx`.

### `BrowserRouter`
- Enables client-side routing in React app.

### `Routes` and `Route`
- `Routes` is a container for route definitions.
- Each `Route` maps URL path to a component.

### `Navigate`
- Redirects user to another route.
- Used for auth protection and fallback routes.

### `Outlet`
- Placeholder where nested route content is rendered.

---

## 3. Project File and Function Definitions

Below are the main files and what each function does.

## `src/main.tsx`

### `ReactDOM.createRoot(...).render(...)`
- Entry point of app.
- Renders `App` component into `<div id="root">` in `index.html`.

## `src/app/App.tsx`

### `AppLayout({ onLogout })`
- Main protected app shell.
- Shows top header, title, and navbar.
- Uses `<Outlet />` to show current page inside the layout.

### `ProtectedLayout({ isSignedIn, onLogout })`
- Route guard for all protected pages.
- If not signed in, redirects to `/admin/login`.
- If signed in, shows `AppLayout`.

### `App()`
- Root component of your app.
- Stores login state: `isSignedIn`.
- Defines all routes:
  - public: `/admin/login`
  - protected: `/`, `/admin`, `/monitoring`, etc.

## `src/app/auth/AdminLogin.tsx`

### `AdminLogin({ onLogin })`
- Login page component.
- Reads previous route from `location.state.from`.
- On submit, calls `onLogin()` and navigates to target route.

### `handleLogin()`
- Marks user as logged in via parent callback.
- Redirects to destination page.

### `handleSubmit(event)`
- Prevents default browser form submit.
- Calls `handleLogin()` for controlled login flow.

## `src/app/components/NavBar.tsx`

### `NavBar({ onLogout })`
- Top-right hamburger menu with navigation links.

### `handleLogout()`
- Calls parent logout function.
- Closes menu.
- Redirects to `/admin/login` and resets redirect state.

## `src/app/pages/Dashboard.tsx`

### `Dashboard()`
- Shows summary cards, featured water levels, active alerts.
- Uses `showAlerts` state for show/hide behavior.

## `src/app/pages/Monitoring.tsx`

### `Monitoring()`
- Shows all monitored waters.
- Tracks selected card with `selectedId`.
- Clicking a card expands inline details.

## `src/app/pages/IncidentReport.tsx`

### `IncidentReport()`
- Full controlled form page.
- Stores every form field in state.
- Shows submitted preview section after form submission.

### `handleSubmit(event)`
- Prevents page refresh on submit.
- Sets `submitted = true` to show preview.

## `src/app/pages/Notifications.tsx`

### `Notifications()`
- Notification center page with filters and read/unread controls.

### `toggleRead(id)`
- Toggles one notification read state.

### `markAllAsRead()`
- Sets all notifications to read.

### `clearAll()`
- Removes all notifications.

### `filteredItems` (`useMemo`)
- Computes filtered notifications based on selected filters.

## `src/app/pages/Admin.tsx`

### `Admin()`
- Admin overview page.
- Has link to user management page.

## `src/app/pages/UserManagement.tsx`

### `UserManagement()`
- Simple user management placeholder page.
- Includes link back to admin page.

## `src/app/pages/Configuration.tsx`

### `Configuration()`
- Configuration placeholder page.

## `src/app/pages/Summary.tsx`

### `Summary()`
- Summary placeholder page.

## `src/app/components/StatsCard.tsx`

### `StatsCard({ label, value, icon })`
- Reusable card that displays one statistic.

## `src/app/components/WaterLevelCard.tsx`

### `WaterLevelCard(...)`
- Reusable card for a monitored water location.
- Displays status, level, max level, and visual indicator.

## `src/app/components/AlertCard.tsx`

### `AlertCard({ title, message, type })`
- Reusable alert message card.
- Styles card by type (`warning`, `danger`, etc.).

## `src/app/components/ui/button.tsx`

### `Button(...)`
- Shared button component.
- Supports variants and sizes.

## `src/app/components/ui/card.tsx`

### `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`
- Shared layout components for card-style UI blocks.

## `src/app/components/ui/utils.ts`

### `cn(...inputs)`
- Utility to merge class names safely.

## `src/app/components/ui/use-mobile.ts`

### `useIsMobile()`
- Custom hook to detect if screen is mobile-sized.

---

## 4. CSS and Styling Definitions

### `.css` files
- Each page/component has its own CSS file.
- Example: `Dashboard.tsx` uses `Dashboard.css`.

### Class names
Example:
```tsx
<section className="app__section">
```
- `className` connects JSX elements to CSS styles.

---

## 5. Data Definitions

## `src/app/data/monitoredWaters.ts`
- Contains array of monitored locations.
- Each object has fields like:
  - `id`
  - `locationName`
  - `status`
  - `currentLevel`
  - `maxLevel`
  - and extra metadata

This array is used by Dashboard, Monitoring, and Incident Report pages.

---

## 6. Deployment and Build Definitions

## `package.json`
- Contains scripts and dependencies.
- Main scripts:
  - `npm run dev` -> run local development server
  - `npm run build` -> create production build
  - `npm run preview` -> preview production build locally

## `vercel.json`
- Tells Vercel how to deploy this app.
- Includes SPA rewrite so page refresh on routes works.

---

## 7. Quick Beginner Workflow

1. Run `npm install`
2. Run `npm run dev`
3. Open app in browser
4. Log in using `/admin/login`
5. Explore pages
6. Make small changes in one file at a time
7. Run `npm run build` before pushing

---

If you want, I can also generate a second section called:
`Function-by-Function Table` with exact file path and one-line definition per function for easier reporting in class.
