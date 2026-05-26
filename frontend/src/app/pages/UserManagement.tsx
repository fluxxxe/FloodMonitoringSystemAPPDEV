import { Link } from "react-router";
import "../styles/pages/UserManagement.css";

export function UserManagement() {
  return (
    <section className="app__section">
      <h2 className="app__section-title">User Management</h2>
      <p className="app__page-text">
        Here an admin can add, remove, or modify users in the system.
      </p>
      <nav className="app__page-actions" aria-label="User management navigation">
        <Link to="/admin" className="app__page-link">
          Back to Admin
        </Link>
      </nav>
    </section>
  );
}


