const labels = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  PENDING: 'Pending',
  LATE: 'Late',
};

export default function StatusBadge({ status }) {
  return <span className={`status-badge status-${status?.toLowerCase()}`}>{labels[status] || status}</span>;
}
