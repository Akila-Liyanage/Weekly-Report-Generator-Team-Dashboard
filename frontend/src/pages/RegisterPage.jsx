import { ArrowRight, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TEAM_MEMBER',
    jobTitle: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={user.role === 'MANAGER' ? '/dashboard' : '/reports'} replace />;

  function changeField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const createdUser = await register(form);
      navigate(createdUser.role === 'MANAGER' ? '/dashboard' : '/reports');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-showcase register-showcase">
        <div className="auth-brand"><span>W</span> WeeklyHub</div>
        <div className="auth-message">
          <span className="eyebrow light">Create your workspace account</span>
          <h1>One report format. Better weekly visibility.</h1>
          <p>The assignment allows role assignment during sign-up, so this demo supports both team member and manager accounts.</p>
          <div className="auth-visual-card">
            <Sparkles size={22} />
            <div>
              <strong>Clean and explainable</strong>
            </div>
          </div>
        </div>
        <small>Your password is protected with bcrypt hashing.</small>
      </section>

      <section className="auth-panel">
        <form className="auth-card auth-card-wide" onSubmit={handleSubmit}>
          <div>
            <span className="eyebrow">Get started</span>
            <h2>Create your account</h2>
            <p>All fields are easy to change later in the project.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-grid two-columns">
            <label className="form-field">
              <span>Full name</span>
              <input name="name" value={form.name} onChange={changeField} placeholder="Akila Liyanage" required />
            </label>
            <label className="form-field">
              <span>Job title</span>
              <input name="jobTitle" value={form.jobTitle} onChange={changeField} placeholder="Software Engineer Intern" />
            </label>
          </div>

          <label className="form-field">
            <span>Email address</span>
            <input name="email" type="email" value={form.email} onChange={changeField} placeholder="you@company.com" required />
          </label>

          <div className="form-grid two-columns">
            <label className="form-field">
              <span>Password</span>
              <input name="password" type="password" value={form.password} onChange={changeField} minLength="6" placeholder="At least 6 characters" required />
            </label>
            <label className="form-field">
              <span>Account role</span>
              <select name="role" value={form.role} onChange={changeField}>
                <option value="TEAM_MEMBER">Team Member</option>
                <option value="MANAGER">Manager / Admin</option>
              </select>
            </label>
          </div>

          <button className="button button-primary button-full" type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'}
            {!submitting && <ArrowRight size={18} />}
          </button>

          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </form>
      </section>
    </div>
  );
}
