import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import "../styles/components/NavBar.css";

interface NavBarProps {
  onLogout: () => void;
}

export function NavBar({ onLogout }: NavBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const handleLogout = () => {
    onLogout();
    setMenuOpen(false);
    navigate("/admin/login", { replace: true, state: { from: "/" } });
  };

  return (
    <nav className="app__nav-board" aria-label="Primary">
      <button
        type="button"
        className="app__nav-board-toggle"
        onClick={() => setMenuOpen((open) => !open)}
        aria-label="Open navigation menu"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation-panel"
      >
        <span className="app__hamburger">
          <span />
          <span />
          <span />
        </span>
      </button>

      {menuOpen && (
        <button
          type="button"
          className="app__nav-board-backdrop"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation menu"
        />
      )}

      <section
        id="primary-navigation-panel"
        className={`app__nav-board-panel ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <div className="app__nav-board-panel-head">
          <h2 className="app__nav-board-title">Navigation</h2>
          <button
            type="button"
            className="app__nav-board-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            ×
          </button>
        </div>

        <ul className="app__nav-board-links">
          <li>
            <Link to="/" className={location.pathname === "/" ? "active" : ""}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/admin" className={location.pathname.startsWith("/admin") ? "active" : ""}>
              Admin
            </Link>
          </li>
          <li>
            <Link to="/monitoring" className={location.pathname === "/monitoring" ? "active" : ""}>
              Monitoring
            </Link>
          </li>
          <li>
            <Link to="/incident-report" className={location.pathname === "/incident-report" ? "active" : ""}>
              Incident Report
            </Link>
          </li>
          <li>
            <Link to="/notifications" className={location.pathname === "/notifications" ? "active" : ""}>
              Notifications
            </Link>
          </li>
          <li>
            <Link to="/summary" className={location.pathname === "/summary" ? "active" : ""}>
              Summary
            </Link>
          </li>
          <li>
            <button type="button" className="app__nav-board-logout" onClick={handleLogout}>
              Log Out
            </button>
          </li>
        </ul>
      </section>
    </nav>
  );
}
