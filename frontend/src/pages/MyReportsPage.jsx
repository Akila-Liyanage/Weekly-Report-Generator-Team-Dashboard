import { CalendarDays, Clock3, Edit3, Eye, Plus, Send, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import ReportDetailsModal from '../components/ReportDetailsModal';
import { formatDate } from '../utils/formatters';


export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [workingId, setWorkingId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  async function loadReports() {
    setLoading(true);
    try {
      const { data } = await api.get('/reports/my');
      setReports(data.reports);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load your reports.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function submitReport(reportId) {
    if (!window.confirm('Submit this weekly report? You can still edit it later.')) return;
    setWorkingId(reportId);
    try {
      await api.patch(`/reports/${reportId}/submit`);
      setNotice('Report submitted successfully.');
      await loadReports();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit the report.');
    } finally {
      setWorkingId(null);
    }
  }

  async function deleteReport(reportId) {
    if (!window.confirm('Delete this draft report?')) return;
    setWorkingId(reportId);
    try {
      await api.delete(`/reports/${reportId}`);
      setNotice('Draft report deleted.');
      setReports((current) => current.filter((report) => report._id !== reportId));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete the report.');
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Personal workspace"
        title="My weekly reports"
        description="Create one consistent update for each week and keep a clear history of your work."
        actions={(
          <Link className="button button-primary" to="/reports/new">
            <Plus size={18} /> New report
          </Link>
        )}
      />

      {notice && <div className="alert alert-success dismissible">{notice}<button onClick={() => setNotice('')}>×</button></div>}
      {error && <div className="alert alert-error dismissible">{error}<button onClick={() => setError('')}>×</button></div>}

      {loading ? <LoadingScreen compact /> : reports.length === 0 ? (
        <EmptyState
          title="No weekly reports yet"
          description="Start with your current week. The fixed report structure keeps every update easy to compare."
          action={<Link className="button button-primary" to="/reports/new"><Plus size={18} /> Create first report</Link>}
        />
      ) : (
        <div className="report-list">
          {reports.map((report) => (
            <article className="report-card" key={report._id}>
              <div className="report-card-top">
                <div>
                  <div className="report-week">
                    <CalendarDays size={18} />
                    <h2>{formatDate(report.weekStart)} - {formatDate(report.weekEnd)}</h2>
                  </div>
                  <div className="report-meta">
                    <span className="project-chip" style={{ '--project-color': report.project?.color }}>
                      <i /> {report.project?.name}
                    </span>
                    <span><Clock3 size={15} /> {report.hoursWorked ?? '—'} hours</span>
                  </div>
                </div>
                <StatusBadge status={report.status} />
              </div>

              <div className="report-preview-grid">
                <div>
                  <span>Completed</span>
                  <p>{report.tasksCompleted}</p>
                </div>
                <div>
                  <span>Next week</span>
                  <p>{report.tasksPlanned}</p>
                </div>
                <div>
                  <span>Blockers</span>
                  <p>{report.blockers || 'No blockers reported.'}</p>
                </div>
              </div>

              <div className="report-card-footer">
                <span>Updated {formatDate(report.updatedAt)}</span>
                <div className="button-group">
                  <button className="button button-secondary button-small" type="button" onClick={() => setSelectedReport(report)}>
                    <Eye size={16} /> View details
                  </button>
                  <Link className="button button-secondary button-small" to={`/reports/${report._id}/edit`}>
                    <Edit3 size={16} /> Edit
                  </Link>
                  {report.status === 'DRAFT' && (
                    <>
                      <button className="button button-ghost button-small danger-text" type="button" disabled={workingId === report._id} onClick={() => deleteReport(report._id)}>
                        <Trash2 size={16} /> Delete
                      </button>
                      <button className="button button-primary button-small" type="button" disabled={workingId === report._id} onClick={() => submitReport(report._id)}>
                        <Send size={16} /> Submit
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {selectedReport && <ReportDetailsModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </div>
  );
}
