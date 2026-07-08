import { AlertTriangle, ClipboardCheck, Eye, ListTodo, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import ReportDetailsModal from '../components/ReportDetailsModal';
import StatusBadge from '../components/StatusBadge';
import TeamMemberCard from '../components/TeamMemberCard';
import { currentMonday, formatDate } from '../utils/formatters';

export default function TeamMembersPage() {
  const [members, setMembers] = useState([]);
  const [weekStart, setWeekStart] = useState(currentMonday());
  const [query, setQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberDetails, setMemberDetails] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMembers() {
      setLoading(true);
      try {
        const { data } = await api.get('/users/team/overview', { params: { weekStart } });
        setMembers(data.members);
        setError('');
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Could not load team members.');
      } finally {
        setLoading(false);
      }
    }
    loadMembers();
  }, [weekStart]);

  const filteredMembers = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return members;
    return members.filter((member) => [member.name, member.email, member.jobTitle]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(search));
  }, [members, query]);

  async function viewMember(member) {
    setSelectedMember(member);
    setMemberDetails(null);
    setDetailsLoading(true);
    try {
      const { data } = await api.get(`/users/team/${member.id}`);
      setMemberDetails(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load the team member details.');
      setSelectedMember(null);
    } finally {
      setDetailsLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Manager workspace"
        title="Team members"
        description="View every team member separately, including their report history, reported blockers, and assigned tasks."
      />

      {error && <div className="alert alert-error">{error}</div>}

      <section className="team-toolbar">
        <label className="compact-field search-field">
          <span>Search team members</span>
          <div className="input-with-icon"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, or job title" /></div>
        </label>
        <label className="compact-field">
          <span>Submission week</span>
          <input type="date" value={weekStart} onChange={(event) => setWeekStart(event.target.value)} />
        </label>
      </section>

      {loading ? <LoadingScreen compact /> : filteredMembers.length === 0 ? (
        <EmptyState title="No team members found" description="Try a different name, email address, or job title." />
      ) : (
        <div className="team-member-grid">
          {filteredMembers.map((member) => <TeamMemberCard member={member} onView={viewMember} key={member.id} />)}
        </div>
      )}

      {selectedMember && (
        <Modal
          title={selectedMember.name}
          subtitle={`${selectedMember.jobTitle} · ${selectedMember.email}`}
          onClose={() => setSelectedMember(null)}
          size="large"
        >
          {detailsLoading || !memberDetails ? <LoadingScreen compact /> : (
            <div className="member-detail-content">
              <div className="member-detail-stats">
                <div><ClipboardCheck size={18} /><strong>{memberDetails.stats.submittedReports}</strong><span>Submitted reports</span></div>
                <div><ListTodo size={18} /><strong>{memberDetails.stats.activeTasks}</strong><span>Active assigned tasks</span></div>
                <div><AlertTriangle size={18} /><strong>{memberDetails.stats.blockersReported}</strong><span>Blockers reported</span></div>
              </div>

              <section className="member-detail-section">
                <div className="card-heading"><div><h2>Recent weekly reports</h2><p>Click View to read completed work, next plans, and blocker details.</p></div></div>
                {memberDetails.reports.length === 0 ? <p className="empty-copy">No reports have been created.</p> : (
                  <div className="compact-list">
                    {memberDetails.reports.map((report) => (
                      <div className="compact-list-row" key={report._id}>
                        <div>
                          <strong>{formatDate(report.weekStart)} – {formatDate(report.weekEnd)}</strong>
                          <span>{report.project?.name} · {report.taskCount} completed item(s) · {report.blockerCount} blocker(s)</span>
                        </div>
                        <div className="button-group">
                          <StatusBadge status={report.status} />
                          <button className="button button-secondary button-small" type="button" onClick={() => { setSelectedMember(null); setSelectedReport({ ...report, user: memberDetails.user }); }}>
                            <Eye size={15} /> View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="member-detail-section">
                <div className="card-heading"><div><h2>Assigned tasks</h2><p>Current and completed work assigned by the manager.</p></div></div>
                {memberDetails.tasks.length === 0 ? <p className="empty-copy">No tasks have been assigned.</p> : (
                  <div className="compact-list">
                    {memberDetails.tasks.map((task) => (
                      <div className="compact-list-row" key={task._id}>
                        <div>
                          <strong>{task.title}</strong>
                          <span>{task.project?.name} · Due {formatDate(task.dueDate)}</span>
                        </div>
                        <span className={`task-status-dot task-status-${task.status.toLowerCase()}`}>{task.status.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </Modal>
      )}

      {selectedReport && <ReportDetailsModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </div>
  );
}
