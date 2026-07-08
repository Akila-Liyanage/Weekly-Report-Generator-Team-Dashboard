import { Archive, Edit3, FolderKanban, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client';
import EmptyState from '../components/EmptyState';
import LoadingScreen from '../components/LoadingScreen';
import PageHeader from '../components/PageHeader';

const initialForm = {
  name: '',
  description: '',
  color: '#5B5BD6',
  isActive: true,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadProjects() {
    setLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects);
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load projects.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function openCreateForm() {
    setEditingId(null);
    setForm(initialForm);
    setFormOpen(true);
  }

  function openEditForm(project) {
    setEditingId(project._id);
    setForm({
      name: project.name,
      description: project.description || '',
      color: project.color,
      isActive: project.isActive,
    });
    setFormOpen(true);
  }

  async function saveProject(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/projects/${editingId}`, form);
        setNotice('Project updated.');
      } else {
        await api.post('/projects', form);
        setNotice('Project created.');
      }
      setFormOpen(false);
      setForm(initialForm);
      setEditingId(null);
      await loadProjects();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save the project.');
    } finally {
      setSubmitting(false);
    }
  }

  async function removeProject(project) {
    if (!window.confirm(`Delete or archive “${project.name}”?`)) return;
    try {
      const { data } = await api.delete(`/projects/${project._id}`);
      setNotice(data.message);
      await loadProjects();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not remove the project.');
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Manager settings"
        title="Projects and categories"
        description="Create the fixed project tags that team members attach to their weekly reports."
        actions={<button className="button button-primary" type="button" onClick={openCreateForm}><Plus size={18} /> Add project</button>}
      />

      {notice && <div className="alert alert-success dismissible">{notice}<button onClick={() => setNotice('')}>×</button></div>}
      {error && <div className="alert alert-error dismissible">{error}<button onClick={() => setError('')}>×</button></div>}

      {formOpen && (
        <section className="project-form-panel">
          <div className="card-heading">
            <div><h2>{editingId ? 'Edit project' : 'Create project'}</h2><p>Use a short name, description and identifying color.</p></div>
            <button className="icon-button" type="button" onClick={() => setFormOpen(false)}><X size={19} /></button>
          </div>
          <form onSubmit={saveProject}>
            <div className="form-grid project-form-grid">
              <label className="form-field"><span>Project name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Client Portal" required /></label>
              <label className="form-field color-field"><span>Project color</span><input type="color" value={form.color} onChange={(event) => setForm({ ...form, color: event.target.value })} /></label>
              <label className="form-field project-description"><span>Description</span><input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Short explanation of this project" /></label>
              <label className="checkbox-field"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /><span>Project is active</span></label>
            </div>
            <div className="form-actions"><button className="button button-primary" type="submit" disabled={submitting}><Save size={18} /> {submitting ? 'Saving...' : 'Save project'}</button></div>
          </form>
        </section>
      )}

      {loading ? <LoadingScreen compact /> : projects.length === 0 ? (
        <EmptyState title="No projects created" description="Add the first project or category for weekly reports." action={<button className="button button-primary" type="button" onClick={openCreateForm}><Plus size={18} /> Add project</button>} />
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <article className={`project-card ${!project.isActive ? 'archived' : ''}`} key={project._id}>
              <div className="project-icon" style={{ '--project-color': project.color }}><FolderKanban size={21} /></div>
              <div className="project-card-content">
                <div><h2>{project.name}</h2>{!project.isActive && <span className="archive-label"><Archive size={14} /> Archived</span>}</div>
                <p>{project.description || 'No project description.'}</p>
              </div>
              <div className="project-card-actions">
                <button className="button button-secondary button-small" type="button" onClick={() => openEditForm(project)}><Edit3 size={15} /> Edit</button>
                <button className="icon-button danger-text" type="button" title="Delete or archive" onClick={() => removeProject(project)}><Trash2 size={17} /></button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
