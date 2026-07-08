import { CalendarDays, Edit3, Trash2, UserRound } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const statusLabels = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

const priorityLabels = {
  LOW: 'Low priority',
  MEDIUM: 'Medium priority',
  HIGH: 'High priority',
};

export default function TaskCard({ task, canManage, onEdit, onDelete, onStatusChange, updating }) {
  return (
    <article className="task-card">
      <div className="task-card-top">
        <div>
          <div className="task-tags">
            <span className={`priority-badge priority-${task.priority?.toLowerCase()}`}>
              {priorityLabels[task.priority] || task.priority}
            </span>
            <span className="project-chip" style={{ '--project-color': task.project?.color }}>
              <i /> {task.project?.name}
            </span>
          </div>
          <h2>{task.title}</h2>
          <p>{task.description || 'No extra description was added.'}</p>
        </div>
        {canManage && (
          <div className="task-actions">
            <button className="icon-button" type="button" title="Edit task" onClick={() => onEdit(task)}>
              <Edit3 size={17} />
            </button>
            <button className="icon-button danger-text" type="button" title="Delete task" onClick={() => onDelete(task)}>
              <Trash2 size={17} />
            </button>
          </div>
        )}
      </div>

      <div className="task-meta-row">
        {task.assignee && (
          <span><UserRound size={15} /> {task.assignee.name}</span>
        )}
        <span><CalendarDays size={15} /> Due {formatDate(task.dueDate)}</span>
      </div>

      <div className="task-status-row">
        <label>
          <span>Status</span>
          <select
            value={task.status}
            disabled={updating}
            onChange={(event) => onStatusChange(task, event.target.value)}
          >
            {Object.entries(statusLabels).map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>
        </label>
        <span className={`task-status-dot task-status-${task.status?.toLowerCase()}`}>
          {statusLabels[task.status]}
        </span>
      </div>
    </article>
  );
}
