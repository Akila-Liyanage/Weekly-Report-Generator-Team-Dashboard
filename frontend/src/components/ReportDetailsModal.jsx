import { AlertTriangle, CalendarDays, CheckCircle2, Clock3, ExternalLink, ListChecks, Target } from 'lucide-react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { formatDate, textItems } from '../utils/formatters';

function TextList({ text, emptyText }) {
  const items = textItems(text);
  if (!items.length) return <p className="empty-copy">{emptyText}</p>;
  return (
    <ul className="detail-list">
      {items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
    </ul>
  );
}

export default function ReportDetailsModal({ report, onClose }) {
  if (!report) return null;

  return (
    <Modal
      title="Weekly report details"
      subtitle="A complete view of the team member's weekly progress."
      onClose={onClose}
      size="large"
    >
      <div className="report-detail-summary">
        <div className="member-identity">
          <span className="avatar">{report.user?.name?.charAt(0) || 'R'}</span>
          <div>
            <strong>{report.user?.name || 'My report'}</strong>
            <span>{report.user?.jobTitle || report.user?.email || 'Team member'}</span>
          </div>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <div className="report-facts">
        <div><CalendarDays size={17} /><span>Week</span><strong>{formatDate(report.weekStart)} – {formatDate(report.weekEnd)}</strong></div>
        <div><Target size={17} /><span>Project</span><strong>{report.project?.name || 'Not assigned'}</strong></div>
        <div><Clock3 size={17} /><span>Hours worked</span><strong>{report.hoursWorked ?? 'Not provided'}</strong></div>
        <div><CheckCircle2 size={17} /><span>Submitted</span><strong>{report.submittedAt ? formatDate(report.submittedAt) : 'Not submitted yet'}</strong></div>
      </div>

      <div className="report-detail-grid">
        <section className="detail-section">
          <div className="detail-section-heading"><ListChecks size={18} /><div><h3>Work completed</h3><p>Tasks finished during this reporting week.</p></div></div>
          <TextList text={report.tasksCompleted} emptyText="No completed work was entered." />
        </section>

        <section className="detail-section">
          <div className="detail-section-heading"><Target size={18} /><div><h3>Plan for next week</h3><p>Work the member expects to start or continue.</p></div></div>
          <TextList text={report.tasksPlanned} emptyText="No future work was entered." />
        </section>

        <section className="detail-section blocker-section">
          <div className="detail-section-heading"><AlertTriangle size={18} /><div><h3>Blockers / challenges</h3><p>Problems, dependencies, or delays that slowed the work.</p></div></div>
          <TextList text={report.blockers} emptyText="No blockers were reported for this week." />
        </section>

        <section className="detail-section">
          <div className="detail-section-heading"><ExternalLink size={18} /><div><h3>Notes and links</h3><p>Extra context, pull requests, documents, or design links.</p></div></div>
          <p className={report.notes ? 'notes-copy' : 'empty-copy'}>{report.notes || 'No additional notes or links were provided.'}</p>
        </section>
      </div>
    </Modal>
  );
}
