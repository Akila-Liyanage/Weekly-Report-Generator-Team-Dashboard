import {
  AlertTriangle,
  CalendarRange,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Search,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../api/client';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import MetricCard from '../components/MetricCard';
import PageHeader from '../components/PageHeader';
import ReportDetailsModal from '../components/ReportDetailsModal';
import StatusBadge from '../components/StatusBadge';
import { currentMonday, formatDate, sundayFromMonday } from '../utils/formatters';

const initialFilters = {
  weekStart: currentMonday(),
  q: '',
  userId: '',
  projectId: '',
  status: '',
};

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterForm, setFilterForm] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOptions() {
      try {
        const [usersResponse, projectsResponse] = await Promise.all([
          api.get('/users/team'),
          api.get('/projects'),
        ]);
        setUsers(usersResponse.data.users);
        setProjects(projectsResponse.data.projects);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Could not load dashboard filters.');
      }
    }
    loadOptions();
  }, []);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const params = {
          startDate: appliedFilters.weekStart,
          endDate: sundayFromMonday(appliedFilters.weekStart),
          ...(appliedFilters.q && { q: appliedFilters.q }),
          ...(appliedFilters.userId && { userId: appliedFilters.userId }),
          ...(appliedFilters.projectId && { projectId: appliedFilters.projectId }),
          ...(appliedFilters.status && { status: appliedFilters.status }),
        };

        const [dashboardResponse, reportsResponse] = await Promise.all([
          api.get('/dashboard', { params: { weekStart: appliedFilters.weekStart } }),
          api.get('/reports/team', { params }),
        ]);

        setDashboard(dashboardResponse.data);
        setReports(reportsResponse.data.reports);
        setError('');
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Could not load the manager dashboard.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [appliedFilters]);

  const submissionChart = useMemo(() => {
    if (!dashboard) return [];
    return [
      { name: 'Submitted', value: Math.max(0, dashboard.metrics.submitted - dashboard.metrics.late), fill: '#0F9F80' },
      { name: 'Pending', value: dashboard.metrics.pending, fill: '#D97706' },
      { name: 'Late', value: dashboard.metrics.late, fill: '#DC4C64' },
    ].filter((item) => item.value > 0);
  }, [dashboard]);

  function changeFilter(event) {
    const { name, value } = event.target;
    setFilterForm((current) => ({ ...current, [name]: value }));
  }

  function applySearch(event) {
    event.preventDefault();
    setAppliedFilters({ ...filterForm });
  }

  function resetSearch() {
    setFilterForm(initialFilters);
    setAppliedFilters(initialFilters);
  }

  if (loading && !dashboard) return <LoadingScreen compact />;

  return (
    <div>
      <PageHeader
        eyebrow="Manager workspace"
        title="Team dashboard"
        description="See who submitted a report, what each person completed, what is planned next, and which problems are blocking progress."
      />

      {error && <div className="alert alert-error">{error}</div>}

      <form className="filter-bar dashboard-filter-bar" onSubmit={applySearch}>
        <label className="compact-field search-field">
          <span>Search report content</span>
          <input name="q" value={filterForm.q} onChange={changeFilter} placeholder="Member, project, task, blocker..." />
        </label>
        <label className="compact-field">
          <span>Week starting</span>
          <input name="weekStart" type="date" value={filterForm.weekStart} onChange={changeFilter} />
        </label>
        <label className="compact-field">
          <span>Team member</span>
          <select name="userId" value={filterForm.userId} onChange={changeFilter}>
            <option value="">All members</option>
            {users.map((user) => <option value={user.id} key={user.id}>{user.name}</option>)}
          </select>
        </label>
        <label className="compact-field">
          <span>Project</span>
          <select name="projectId" value={filterForm.projectId} onChange={changeFilter}>
            <option value="">All projects</option>
            {projects.map((project) => <option value={project._id} key={project._id}>{project.name}</option>)}
          </select>
        </label>
        <label className="compact-field">
          <span>Report status</span>
          <select name="status" value={filterForm.status} onChange={changeFilter}>
            <option value="">Any status</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="DRAFT">Draft</option>
          </select>
        </label>
        <div className="filter-buttons">
          <button className="button button-primary" type="submit"><Search size={17} /> Search</button>
          <button className="button button-secondary" type="button" onClick={resetSearch}>Reset</button>
        </div>
      </form>

      {dashboard && (
        <>
          <div className="metrics-grid">
            <MetricCard label="Reports submitted" value={dashboard.metrics.submitted} helper={`Out of ${dashboard.metrics.teamMembers} active members`} icon={ClipboardCheck} tone="primary" />
            <MetricCard label="Submission rate" value={`${dashboard.metrics.complianceRate}%`} helper={`${dashboard.metrics.pending} member(s) still pending`} icon={CheckCircle2} tone="success" />
            <MetricCard label="Reported blockers" value={dashboard.metrics.openBlockers} helper="Problems or dependencies written in this week's reports" icon={AlertTriangle} tone="warning" />
            <MetricCard label="Active team" value={dashboard.metrics.teamMembers} helper={`${dashboard.metrics.late} late submission(s)`} icon={Users} tone="neutral" />
          </div>

          <div className="dashboard-grid two-chart-grid">
            <section className="dashboard-card chart-card">
              <div className="card-heading"><div><h2>Completed work trend</h2><p>Number of completed work items reported across recent weeks.</p></div></div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={dashboard.taskTrend} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E9F0" />
                    <XAxis dataKey="week" tickFormatter={(value) => value.slice(5)} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip labelFormatter={(value) => `Week of ${value}`} />
                    <Line type="monotone" dataKey="tasks" stroke="#5B5BD6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="dashboard-card chart-card">
              <div className="card-heading"><div><h2>Submission status</h2><p>Who submitted, who is pending, and who submitted late.</p></div></div>
              <div className="chart-container">
                {submissionChart.length === 0 ? <EmptyState title="No status data" description="There are no active team members to display." /> : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={submissionChart} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={4}>
                        {submissionChart.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>
          </div>

          <div className="dashboard-grid two-chart-grid lower-grid">
            <section className="dashboard-card chart-card">
              <div className="card-heading"><div><h2>Work by project</h2><p>Completed work items grouped by project for the selected week.</p></div></div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dashboard.workloadByProject} margin={{ top: 8, right: 12, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E9F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} angle={-10} textAnchor="end" height={55} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="tasks" fill="#5B5BD6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="dashboard-card">
              <div className="card-heading"><div><h2>Team submission status</h2><p>Each member's report status for the selected week.</p></div></div>
              <div className="status-list">
                {dashboard.memberStatuses.map((item) => (
                  <div className="status-row" key={item.user.id}>
                    <div className="member-identity">
                      <span className="avatar small">{item.user.name.charAt(0)}</span>
                      <div><strong>{item.user.name}</strong><span>{item.user.jobTitle}</span></div>
                    </div>
                    <div className="status-row-right">
                      {item.project && <span className="project-dot-label"><i style={{ background: item.project.color }} />{item.project.name}</span>}
                      <StatusBadge status={item.status} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="dashboard-card reports-table-card">
            <div className="card-heading">
              <div><h2>Weekly report results</h2><p>Click View report to read the full completed work, plans, blocker details, hours, and notes.</p></div>
              <span className="date-pill"><CalendarRange size={16} /> {formatDate(dashboard.period.weekStart)} – {formatDate(dashboard.period.weekEnd)}</span>
            </div>

            {reports.length === 0 ? (
              <EmptyState title="No matching reports" description="Try a different search word or reset the filters." />
            ) : (
              <div className="table-scroll">
                <table className="data-table">
                  <thead><tr><th>Team member</th><th>Project</th><th>Status</th><th>Completed items</th><th>Reported blockers</th><th>Hours</th><th>Details</th></tr></thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report._id} className="clickable-row" onClick={() => setSelectedReport(report)}>
                        <td><strong>{report.user?.name}</strong><span>{report.user?.jobTitle}</span></td>
                        <td><span className="project-chip" style={{ '--project-color': report.project?.color }}><i />{report.project?.name}</span></td>
                        <td><StatusBadge status={report.status} /></td>
                        <td>{report.taskCount}</td>
                        <td>{report.blockerCount}</td>
                        <td>{report.hoursWorked ?? '—'}</td>
                        <td><button className="button button-secondary button-small" type="button" onClick={(event) => { event.stopPropagation(); setSelectedReport(report); }}><Eye size={15} /> View report</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="dashboard-card activity-card">
            <div className="card-heading"><div><h2>Recent report activity</h2><p>Latest report changes during the selected week.</p></div></div>
            <div className="activity-feed">
              {dashboard.recentReports.map((report) => (
                <button className="activity-item activity-button" type="button" key={report._id} onClick={() => setSelectedReport(report)}>
                  <span className="activity-dot" />
                  <div>
                    <p><strong>{report.user?.name}</strong> {report.status === 'SUBMITTED' ? 'submitted' : 'updated a draft for'} <strong>{report.project?.name}</strong>.</p>
                    <span>{formatDate(report.updatedAt)} · {report.taskCount} completed item(s) · click to view</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {selectedReport && <ReportDetailsModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </div>
  );
}
