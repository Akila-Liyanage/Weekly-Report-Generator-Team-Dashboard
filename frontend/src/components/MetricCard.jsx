export default function MetricCard({ label, value, helper, icon: Icon, tone = 'primary' }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon tone-${tone}`}>
        <Icon size={20} />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {helper && <span>{helper}</span>}
      </div>
    </article>
  );
}
