import { AlertTriangle, ClipboardCheck, ListTodo, Mail } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function TeamMemberCard({ member, onView }) {
  return (
    <article className="team-member-card">
      <div className="team-member-header">
        <div className="member-identity">
          <span className="avatar">{member.name.charAt(0)}</span>
          <div>
            <strong>{member.name}</strong>
            <span>{member.jobTitle}</span>
          </div>
        </div>
        <StatusBadge status={member.submissionStatus} />
      </div>

      <a className="member-email" href={`mailto:${member.email}`}><Mail size={14} /> {member.email}</a>

      <div className="member-stat-grid">
        <div><ClipboardCheck size={17} /><strong>{member.totalReports}</strong><span>Total reports</span></div>
        <div><ListTodo size={17} /><strong>{member.activeTaskCount}</strong><span>Active tasks</span></div>
        <div><AlertTriangle size={17} /><strong>{member.currentReport?.blockerCount || 0}</strong><span>This week's blockers</span></div>
      </div>

      <button className="button button-secondary button-full" type="button" onClick={() => onView(member)}>
        View individual activity
      </button>
    </article>
  );
}
