import { Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import PageHeader from '../components/PageHeader';
import TaskCard from '../components/TaskCard';
import TaskFormModal from '../components/TaskFormModal';
import { useAuth } from '../context/AuthContext';

const initialFilters = { q: '', userId: '', projectId: '', status: '' };

export default function TasksPage() {
  const { isManager } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterForm, setFilterForm] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [editingTask, setEditingTask] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState(null);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    async function loadOptions() {
      try {
        const requests = [api.get('/projects')];
        if (isManager) requests.push(api.get('/users/team'));
        const responses = await Promise.all(requests);
        setProjects(responses[0].data.projects);
        if (isManager) setUsers(responses[1].data.users);
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Could not load task options.');
      }
    }
    loadOptions();
  }, [isManager]);

  useEffect(() => {
    async function loadTasks() {
      setLoading(true);
      try {
        const params = Object.fromEntries(
          Object.entries(appliedFilters).filter(([, value]) => value)
        );
        const { data } = await api.get('/tasks', { params });
        setTasks(data.tasks);
        setError('');
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Could not load assigned tasks.');
      } finally {
        setLoading(false);
      }
    }
    loadTasks();
  }, [appliedFilters]);

  function applySearch(event) {
    event.preventDefault();
    setAppliedFilters({ ...filterForm });
  }

  function resetSearch() {
    setFilterForm(initialFilters);
    setAppliedFilters(initialFilters);
  }

  function openCreate() {
    setEditingTask(null);
    setFormError('');
    setFormOpen(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setFormError('');
    setFormOpen(true);
  }

  async function saveTask(payload) {
    setSaving(true);
    setFormError('');
    try {
      const { data } = editingTask
        ? await api.put(`/tasks/${editingTask._id}`, payload)
        : await api.post('/tasks', payload);

      setTasks((current) => editingTask
        ? current.map((task) => (task._id === data.task._id ? data.task : task))
        : [data.task, ...current]);
      setFormOpen(false);
      setEditingTask(null);
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Could not save the task.');
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(task, status) {
    setWorkingId(task._id);
    try {
      const { data } = await api.patch(`/tasks/${task._id}/status`, { status });
      setTasks((current) => current.map((item) => (item._id === task._id ? data.task : item)));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update the task status.');
    } finally {
      setWorkingId(null);
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setWorkingId(task._id);
    try {
      await api.delete(`/tasks/${task._id}`);
      setTasks((current) => current.filter((item) => item._id !== task._id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete the task.');
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow={isManager ? 'Manager workspace' : 'Personal workspace'}
        title={isManager ? 'Task assignments' : 'My assigned tasks'}
        description={isManager
          ? 'Assign focused work to a specific team member and track its progress without turning WeeklyHub into a complex project management tool.'
          : 'See work assigned by your manager and keep the status up to date.'}
        actions={isManager ? (
          <button className="button button-primary" type="button" onClick={openCreate}>
            <Plus size={18} /> Assign task
          </button>
        ) : null}
      />

      {error && <div className="alert alert-error">{error}</div>}

      <form className={`filter-bar task-filter-bar ${isManager ? '' : 'member-task-filters'}`} onSubmit={applySearch}>
        <label className="compact-field search-field">
          <span>Search tasks</span>
          <input
            value={filterForm.q}
            onChange={(event) => setFilterForm({ ...filterForm, q: event.target.value })}
            placeholder="Task, member, or project"
          />
        </label>
        {isManager && (
          <label className="compact-field">
            <span>Team member</span>
            <select value={filterForm.userId} onChange={(event) => setFilterForm({ ...filterForm, userId: event.target.value })}>
              <option value="">All members</option>
              {users.map((user) => <option value={user.id} key={user.id}>{user.name}</option>)}
            </select>
          </label>
        )}
        <label className="compact-field">
          <span>Project</span>
          <select value={filterForm.projectId} onChange={(event) => setFilterForm({ ...filterForm, projectId: event.target.value })}>
            <option value="">All projects</option>
            {projects.map((project) => <option value={project._id} key={project._id}>{project.name}</option>)}
          </select>
        </label>
        <label className="compact-field">
          <span>Status</span>
          <select value={filterForm.status} onChange={(event) => setFilterForm({ ...filterForm, status: event.target.value })}>
            <option value="">Any status</option>
            <option value="TODO">To do</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="DONE">Done</option>
          </select>
        </label>
        <div className="filter-buttons">
          <button className="button button-primary" type="submit"><Search size={17} /> Search</button>
          <button className="button button-secondary" type="button" onClick={resetSearch}>Reset</button>
        </div>
      </form>

      {loading ? <LoadingScreen compact /> : tasks.length === 0 ? (
        <EmptyState
          title="No assigned tasks found"
          description={isManager ? 'Assign a small, clear task to a team member or change the search filters.' : 'Your manager has not assigned any matching tasks yet.'}
          action={isManager ? <button className="button button-primary" type="button" onClick={openCreate}><Plus size={18} /> Assign first task</button> : null}
        />
      ) : (
        <div className="task-grid">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              canManage={isManager}
              onEdit={openEdit}
              onDelete={deleteTask}
              onStatusChange={updateStatus}
              updating={workingId === task._id}
            />
          ))}
        </div>
      )}

      {formOpen && (
        <TaskFormModal
          task={editingTask}
          users={users}
          projects={projects}
          saving={saving}
          error={formError}
          onClose={() => setFormOpen(false)}
          onSave={saveTask}
        />
      )}
    </div>
  );
}
