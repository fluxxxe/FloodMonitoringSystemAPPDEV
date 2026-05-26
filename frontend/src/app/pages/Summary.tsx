import { Link } from "react-router";
import "../styles/pages/Summary.css";

export function Summary() {
  return (
    <section className="app__section">
      <h2 className="app__section-title">Summary View</h2>
      <p className="app__page-text">
        A high-level summary of system state can be shown here.
      </p>
      <nav className="app__page-actions" aria-label="Summary navigation">
        <Link to="/configuration" className="app__page-link">
          Go to Configuration
        </Link>
      </nav>
    </section>
  );
}


