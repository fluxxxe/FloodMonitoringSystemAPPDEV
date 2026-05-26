import { Link } from "react-router";
import "../styles/pages/Configuration.css";

export function Configuration() {
  return (
    <section className="app__section">
      <h2 className="app__section-title">Configuration</h2>
      <p className="app__page-text">This screen allows changing system settings.</p>
      <nav className="app__page-actions" aria-label="Configuration navigation">
        <Link to="/summary" className="app__page-link">
          Back to Summary
        </Link>
      </nav>
    </section>
  );
}


