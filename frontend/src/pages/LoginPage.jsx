import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === 'MANAGER' ? '/dashboard' : '/reports'} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedInUser = await login(form);
      navigate(loggedInUser.role === 'MANAGER' ? '/dashboard' : '/reports');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-showcase">
        <div className="auth-brand"><span>W</span> WeeklyHub</div>
        <div className="auth-message">
          <span className="eyebrow light">Weekly reporting, simplified</span>
          <h1>Keep your team aligned without another long meeting.</h1>
          <p>Create clear weekly updates, surface blockers, and understand team progress from one calm dashboard.</p>
          <div className="auth-benefits">
            <span><CheckCircle2 size={18} /> Fixed, consistent report format</span>
            <span><CheckCircle2 size={18} /> Role-based member and manager views</span>
            <span><CheckCircle2 size={18} /> Simple visual insights</span>
          </div>
        </div>
        <small>Built as a MERN internship technical assignment.</small>
      </section>

      <section className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div>
            <span className="eyebrow">Welcome back</span>
            <h2>Sign in to your workspace</h2>
            <p>Enter your account details to continue.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <label className="form-field">
            <span>Email address</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@company.com"
              required
            />
          </label>

          <label className="form-field">
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Enter your password"
              required
            />
          </label>

          <button className="button button-primary button-full" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
            {!submitting && <ArrowRight size={18} />}
          </button>

          <p className="auth-switch">New to WeeklyHub? <Link to="/register">Create an account</Link></p>

          <div className="demo-credentials">
            <strong>Demo accounts</strong>
            <span>Manager: manager@weeklyhub.dev / Manager123!</span>
            <span>Member: akila@weeklyhub.dev / Member123!</span>
          </div>
        </form>
      </section>
    </div>
  );
}
