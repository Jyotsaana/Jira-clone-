import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject } from '../api/projects';
import { getIssues } from '../api/issues';
import { getSprints, createSprint, updateSprint } from '../api/sprints';
import Navbar from '../components/common/Navbar';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import { formatDate, priorityColor, typeColor } from '../utils/helpers';
import toast from 'react-hot-toast';

const Sprints = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project,  setProject]  = useState(null);
  const [sprints,  setSprints]  = useState([]);
  const [issues,   setIssues]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', goal: '', startDate: '', endDate: '' });

  const fetchData = useCallback(async () => {
    try {
      const [projRes, sprintRes, issueRes] = await Promise.all([
        getProject(id), getSprints(id), getIssues(id)
      ]);
      setProject(projRes.data);
      setSprints(sprintRes.data);
      setIssues(issueRes.data);
    } catch { toast.error('Failed to load sprints'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreateSprint = async (e) => {
    e.preventDefault();
    try {
      await createSprint({ ...form, projectId: id });
      toast.success('Sprint created!');
      setModalOpen(false);
      setForm({ name: '', goal: '', startDate: '', endDate: '' });
      fetchData();
    } catch { toast.error('Failed to create sprint'); }
  };

  const handleStatusChange = async (sprintId, newStatus) => {
    try {
      await updateSprint(sprintId, { status: newStatus });
      toast.success(`Sprint ${newStatus}!`);
      fetchData();
    } catch { toast.error('Failed to update sprint'); }
  };

  // Backlog = issues not assigned to any sprint
  const backlog = issues.filter(i => !i.sprint);
  const sprintIssues = (sprintId) => issues.filter(i => i.sprint === sprintId);

  const statusBadge = {
    planned:   'bg-gray-100 text-gray-600',
    active:    'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
  };

  if (loading) return <><Navbar /><Spinner /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/project/${id}`)} className="text-gray-400 hover:text-gray-600 text-sm">
              ← Board
            </button>
            <span className="text-gray-300">/</span>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{project?.name} — Sprints</h1>
              <p className="text-xs text-gray-400">{sprints.length} sprints · {backlog.length} in backlog</p>
            </div>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary">+ New Sprint</button>
        </div>

        {/* Sprints list */}
        <div className="space-y-4 mb-8">
          {sprints.length === 0 && (
            <div className="card text-center py-10">
              <p className="text-gray-400 text-sm">No sprints yet. Create your first sprint!</p>
            </div>
          )}
          {sprints.map(sprint => (
            <div key={sprint._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{sprint.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[sprint.status]}`}>
                      {sprint.status}
                    </span>
                  </div>
                  {sprint.goal && <p className="text-sm text-gray-500">{sprint.goal}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {sprint.status === 'planned' && (
                    <button onClick={() => handleStatusChange(sprint._id, 'active')} className="btn-primary text-xs py-1">
                      Start Sprint
                    </button>
                  )}
                  {sprint.status === 'active' && (
                    <button onClick={() => handleStatusChange(sprint._id, 'completed')} className="btn-secondary text-xs py-1">
                      Complete
                    </button>
                  )}
                </div>
              </div>
              {/* Issues in this sprint */}
              <div className="space-y-1.5 mt-3">
                {sprintIssues(sprint._id).length === 0 ? (
                  <p className="text-xs text-gray-400 py-2">No issues in this sprint</p>
                ) : sprintIssues(sprint._id).map(issue => (
                  <div key={issue._id} className="flex items-center gap-2 text-sm py-1.5 px-3 bg-gray-50 rounded-lg">
                    <span className={typeColor(issue.type)}>{issue.type}</span>
                    <span className="flex-1 text-gray-700">{issue.title}</span>
                    <span className={priorityColor(issue.priority)}>{issue.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Backlog */}
        <div className="card">
          <h2 className="font-medium text-gray-900 mb-4">
            Backlog <span className="text-gray-400 font-normal text-sm">({backlog.length} issues)</span>
          </h2>
          {backlog.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">All issues are in sprints 🎉</p>
          ) : (
            <div className="space-y-1.5">
              {backlog.map(issue => (
                <div key={issue._id} className="flex items-center gap-2 text-sm py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className={typeColor(issue.type)}>{issue.type}</span>
                  <span className="flex-1 text-gray-700">{issue.title}</span>
                  <span className={priorityColor(issue.priority)}>{issue.priority}</span>
                  <span className="text-xs text-gray-400">{issue.storyPoints > 0 ? `${issue.storyPoints}pts` : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Sprint Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create sprint">
        <form onSubmit={handleCreateSprint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sprint name</label>
            <input className="input" required placeholder="Sprint 1"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sprint goal</label>
            <input className="input" placeholder="What will you achieve this sprint?"
              value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
              <input type="date" className="input"
                value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
              <input type="date" className="input"
                value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Create sprint</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sprints;
