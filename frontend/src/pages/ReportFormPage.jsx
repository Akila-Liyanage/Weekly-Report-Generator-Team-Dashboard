import { ArrowLeft, CalendarDays, Save, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/client';
import LoadingScreen from '../components/LoadingScreen';
import PageHeader from '../components/PageHeader';
import { currentMonday, sundayFromMonday, toInputDate } from '../utils/formatters';

const emptyForm = {
  weekStart: currentMonday(),
  weekEnd: sundayFromMonday(currentMonday()),
  project: '',
  tasksCompleted: '',
  tasksPlanned: '',
  blockers: '',
  hoursWorked: '',
  notes: '',
};

export default function ReportFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [existingStatus, setExistingStatus] = useState('DRAFT');
  const [loading, setLoading] = useState(editing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPageData() {
      try {
        const [projectsResponse, reportsResponse] = await Promise.all([
          api.get('/projects'),
          editing ? api.get('/reports/my') : Promise.resolve({ data: { reports: [] } }),
        ]);
        setProjects(projectsResponse.data.projects);

        if (!editing && projectsResponse.data.projects.length) {
          setForm((current) => ({ ...current, project: projectsResponse.data.projects[0]._id }));
        }

        if (editing) {
          const report = reportsResponse.data.reports.find((item) => item._id === id);
          if (!report) {
            setError('Report was not found.');
            return;
          }
          setExistingStatus(report.status);
          setForm({
            weekStart: toInputDate(report.weekStart),
            weekEnd: toInputDate(report.weekEnd),
            project: report.project?._id || '',
            tasksCompleted: report.tasksCompleted,
            tasksPlanned: report.tasksPlanned,
            blockers: report.blockers || '',
            hoursWorked: report.hoursWorked ?? '',
            notes: report.notes || '',
          });
        }
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Could not load the report form.');
      } finally {
        setLoading(false);
      }
    }

    loadPageData();
  }, [editing, id]);

  const periodLabel = useMemo(() => {
    if (!form.weekStart || !form.weekEnd) return 'Choose a week';
    return `${form.weekStart} to ${form.weekEnd}`;
  }, [form.weekStart, form.weekEnd]);

  function changeField(event) {
    const { name, value } = event.target;
    setForm((current) => {
      const updated = { ...current, [name]: value };
      if (name === 'weekStart') updated.weekEnd = sundayFromMonday(value);
      return updated;
    });
  }

  async function saveReport(shouldSubmit) {
    setError('');
    setSubmitting(true);
    try {
      const response = editing
        ? await api.put(`/reports/${id}`, form)
        : await api.post('/reports', form);

      const reportId = response.data.report._id;
      if (shouldSubmit) await api.patch(`/reports/${reportId}/submit`);
      navigate('/reports', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save the report.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    saveReport(false);
  }

  if (loading) return <LoadingScreen compact />;

  return (
    <div>
      <PageHeader
        eyebrow={editing ? 'Update report' : 'New report'}
        title={editing ? 'Edit weekly report' : 'Create weekly report'}
        description="The fields and order are fixed so every team report remains consistent."
        actions={<Link className="button button-secondary" to="/reports"><ArrowLeft size={18} /> Back</Link>}
      />

      {error && <div className="alert alert-error">{error}</div>}

      <form className="report-form-layout" onSubmit={handleSubmit}>
        <section className="form-card">
          <div className="section-heading">
            <div className="section-icon"><CalendarDays size={19} /></div>
            <div><h2>Reporting period</h2><p>Select the week and project category.</p></div>
          </div>

          <div className="form-grid three-columns">
            <label className="form-field">
              <span>Week starts</span>
              <input name="weekStart" type="date" value={form.weekStart} onChange={changeField} required />
            </label>
            <label className="form-field">
              <span>Week ends</span>
              <input name="weekEnd" type="date" value={form.weekEnd} onChange={changeField} required />
            </label>
            <label className="form-field">
              <span>Project / category</span>
              <select name="project" value={form.project} onChange={changeField} required>
                <option value="">Select a project</option>
                {projects.filter((project) => project.isActive).map((project) => (
                  <option value={project._id} key={project._id}>{project.name}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section className="form-card">
          <div className="section-heading">
            <div className="section-number">1</div>
            <div><h2>Tasks completed</h2><p>Use one task per line. This also powers the dashboard task count.</p></div>
          </div>
          <label className="form-field">
            <span>What did you complete this week?</span>
            <textarea name="tasksCompleted" value={form.tasksCompleted} onChange={changeField} rows="6" placeholder="- Built the login page&#10;- Connected the authentication API&#10;- Added protected routes" required />
          </label>
        </section>

        <section className="form-card">
          <div className="section-heading">
            <div className="section-number">2</div>
            <div><h2>Plans for next week</h2><p>List the work you expect to continue or start.</p></div>
          </div>
          <label className="form-field">
            <span>What are you planning next?</span>
            <textarea name="tasksPlanned" value={form.tasksPlanned} onChange={changeField} rows="5" placeholder="- Complete dashboard filters&#10;- Add unit tests" required />
          </label>
        </section>

        <section className="form-card">
          <div className="section-heading">
            <div className="section-number">3</div>
            <div><h2>Problems, delays, and extra details</h2><p>A blocker is anything that stopped or slowed your work, such as missing access, a dependency, or an unresolved error.</p></div>
          </div>
          <div className="form-grid two-columns uneven">
            <label className="form-field">
              <span>What stopped or slowed your work? (optional)</span>
              <textarea name="blockers" value={form.blockers} onChange={changeField} rows="5" placeholder="- Waiting for API access from the client
- Database connection issue blocked testing" />
            </label>
            <div className="stacked-fields">
              <label className="form-field">
                <span>Hours worked (optional)</span>
                <input name="hoursWorked" type="number" min="0" max="168" step="0.5" value={form.hoursWorked} onChange={changeField} placeholder="40" />
              </label>
              <label className="form-field">
                <span>Notes or links (optional)</span>
                <textarea name="notes" value={form.notes} onChange={changeField} rows="3" placeholder="PR link, Figma link, or a short note" />
              </label>
            </div>
          </div>
        </section>

        <aside className="form-submit-bar">
          <div>
            <strong>{periodLabel}</strong>
            <span>{existingStatus === 'SUBMITTED' ? 'This report is already submitted. Saving will update it.' : 'Save as a draft or submit when ready.'}</span>
          </div>
          <div className="button-group">
            <button className="button button-secondary" type="submit" disabled={submitting}>
              <Save size={18} /> {submitting ? 'Saving...' : 'Save draft'}
            </button>
            <button className="button button-primary" type="button" disabled={submitting} onClick={() => saveReport(true)}>
              <Send size={18} /> Save & submit
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
