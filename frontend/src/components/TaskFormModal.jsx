import { useEffect, useState } from 'react';
import Modal from './Modal';
import { toInputDate } from '../utils/formatters';

function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return toInputDate(date);
}

const emptyTask = {
  title: '',
  description: '',
  assignee: '',
  project: '',
  dueDate: defaultDueDate(),
  priority: 'MEDIUM',
  status: 'TODO',
};

export default function TaskFormModal({ task, users, projects, saving, error, onClose, onSave }) {
  const [form, setForm] = useState(emptyTask);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        assignee: task.assignee?._id || '',
        project: task.project?._id || '',
        dueDate: toInputDate(task.dueDate),
        priority: task.priority || 'MEDIUM',
        status: task.status || 'TODO',
      });
      return;
    }

    setForm({
      ...emptyTask,
      assignee: users[0]?.id || '',
      project: projects.find((project) => project.isActive)?._id || '',
      dueDate: defaultDueDate(),
    });
  }, [task, users, projects]);

  function changeField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submit(event) {
    event.preventDefault();
    onSave(form);
  }

  return (
    <Modal
      title={task ? 'Edit assigned task' : 'Assign a new task'}
      subtitle="Keep assignments simple: one owner, one project, and one due date."
      onClose={onClose}
      size="medium"
    >
      {error && <div className="alert alert-error">{error}</div>}
      <form className="modal-form" onSubmit={submit}>
        <label className="form-field">
          <span>Task title</span>
          <input name="title" value={form.title} onChange={changeField} placeholder="Example: Complete manager dashboard filters" required />
        </label>

        <label className="form-field">
          <span>Description</span>
          <textarea name="description" value={form.description} onChange={changeField} rows="4" placeholder="Add a short explanation of the expected work." />
        </label>

        <div className="form-grid two-columns">
          <label className="form-field">
            <span>Assign to</span>
            <select name="assignee" value={form.assignee} onChange={changeField} required>
              <option value="">Select a member</option>
              {users.map((user) => <option value={user.id} key={user.id}>{user.name}</option>)}
            </select>
          </label>
          <label className="form-field">
            <span>Project</span>
            <select name="project" value={form.project} onChange={changeField} required>
              <option value="">Select a project</option>
              {projects.filter((project) => project.isActive).map((project) => (
                <option value={project._id} key={project._id}>{project.name}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Due date</span>
            <input name="dueDate" type="date" value={form.dueDate} onChange={changeField} required />
          </label>
          <label className="form-field">
            <span>Priority</span>
            <select name="priority" value={form.priority} onChange={changeField}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </label>
        </div>

        {task && (
          <label className="form-field">
            <span>Status</span>
            <select name="status" value={form.status} onChange={changeField}>
              <option value="TODO">To do</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="DONE">Done</option>
            </select>
          </label>
        )}

        <div className="modal-actions">
          <button className="button button-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="button button-primary" type="submit" disabled={saving}>
            {saving ? 'Saving...' : task ? 'Save changes' : 'Assign task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
