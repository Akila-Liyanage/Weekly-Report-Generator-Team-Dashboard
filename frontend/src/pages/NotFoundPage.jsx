import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function NotFoundPage() {
  const { user } = useAuth();
  const home = user?.role === 'MANAGER' ? '/dashboard' : user ? '/reports' : '/login';

  return (
    <div className="not-found">
      <span>404</span>
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link className="button button-primary" to={home}>Return to WeeklyHub</Link>
    </div>
  );
}
