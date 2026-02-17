import PropTypes from "prop-types";
import "../App.css";

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="app-shell">
      <div className="auth-layout">
        <section className="hero-panel">
          <div className="hero-content">
            <p className="hero-badge">ClassOps</p>
            <h2>All your classes. One simple platform.</h2>
            <p>
              ClassOps helps you manage enrollments, assignments, submissions,
              grading, and groups from a single, secure dashboard. Stay
              organized, reduce manual work, and keep teachers and students
              aligned with real-time updates.
            </p>
          </div>
        </section>

        <section className="form-panel">
          <div className="form-header">
            <p className="eyebrow">Welcome to ClassOps</p>
            <h1>{title}</h1>
            {subtitle && <p className="subtitle">{subtitle}</p>}
          </div>

          <div className="form-card">{children}</div>

          {footer && <div className="form-footer">{footer}</div>}
        </section>
      </div>
    </div>
  );
}

AuthLayout.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

export default AuthLayout;
