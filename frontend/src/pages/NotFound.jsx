import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="container section-pad page-top center-card">
      <h1>Page not found</h1>
      <p className="muted">The page you are looking for does not exist.</p>
      <Link className="btn primary" to="/">Go Home</Link>
    </section>
  );
}
