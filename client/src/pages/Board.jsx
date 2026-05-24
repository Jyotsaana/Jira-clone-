import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getProject } from '../api/projects';
import { getIssues, createIssue, updateIssue, deleteIssue } from '../api/issues';
import Navbar from '../components/common/Navbar';
import Modal from '../components/common/Modal';
import Spinner from '../components/common/Spinner';
import { priorityColor, typeColor, getInitials, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: 'todo',       label: 'To Do',       color: 'bg-gray-100' },
  { id: 'inprogress', label: 'In Progress',  color: 'bg-blue-100' },
  { id: 'inreview',   label: 'In Review',    color: 'bg-yellow-100' },
  { id: 'done',       label: 'Done',         color: 'bg-green-100' },
];

const Board = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [issues, setIssues]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [form, setForm] = useState({
    title: '', description: '', type: 'task',
    priority: 'medium', dueDate: '', storyPoints: 0
  });

  const fetchData = useCallback(async () => {
    try {
      const [projRes, issueRes] = await Promise.all([getProject(id), getIssues(id)]);
      setProject(projRes.data);
      setIssues(issueRes.data);
    } catch { toast.error('Failed to load board'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Group issues by status for columns
  const byStatus = (status) => issues.filter(i => i.status === status);

  // Drag and drop handler — updates issue status
  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newStatus = destination.droppableId;
    // Optimistic update — update UI instantly, then sync with backend
    setIssues(prev => prev.map(i =>
      i._id === draggableId ? { ...i, status: newStatus } : i
    ));
    try {
      await updateIssue(draggableId, { status: newStatus });
    } catch {
      toast.error('Failed to update status');
      fetchData(); // revert on error
    }
  };

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    try {
      await createIssue({ ...form, projectId: id });
      toast.success('Issue created!');
      setModalOpen(false);
      setForm({ title: '', description: '', type: 'task', priority: 'medium', dueDate: '', storyPoints: 0 });
      fetchData();
    } catch { toast.error('Failed to create issue'); }
  };

  const handleDeleteIssue = async (issueId) => {
    if (!confirm('Delete this issue?')) return;
    try {
      await deleteIssue(issueId);
      setIssues(prev => prev.filter(i => i._id !== issueId));
      setSelectedIssue(null);
      toast.success('Issue deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <><Navbar /><Spinner /></>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="px-6 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 text-sm">
              ← Projects
            </button>
            <span className="text-gray-300">/</span>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{project?.name}</h1>
              <p className="text-xs text-gray-400">{project?.key} · {issues.length} issues</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/project/${id}/sprints`)} className="btn-secondary">
              Sprints
            </button>
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              + Create issue
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-4 gap-4">
            {COLUMNS.map(col => (
              <div key={col.id} className="flex flex-col">
                {/* Column header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.color}`} />
                    <span className="text-sm font-medium text-gray-700">{col.label}</span>
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {byStatus(col.id).length}
                  </span>
                </div>

                {/* Droppable column */}
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-32 rounded-xl p-2 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-primary-50 border border-primary-200' : 'bg-gray-100/50'
                      }`}
                    >
                      {byStatus(col.id).map((issue, index) => (
                        <Draggable key={issue._id} draggableId={issue._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedIssue(issue)}
                              className={`bg-white rounded-lg p-3 mb-2 border cursor-pointer transition-all ${
                                snapshot.isDragging
                                  ? 'border-primary-300 shadow-lg rotate-1'
                                  : 'border-gray-100 hover:border-primary-200 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-2">
                                <span className={typeColor(issue.type)}>{issue.type}</span>
                                <span className={priorityColor(issue.priority)}>{issue.priority}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-800 mb-2 line-clamp-2">
                                {issue.title}
                              </p>
                              <div className="flex items-center justify-between">
                                {issue.dueDate && (
                                  <span className="text-xs text-gray-400">{formatDate(issue.dueDate)}</span>
                                )}
                                {issue.assignee && (
                                  <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs ml-auto">
                                    {getInitials(issue.assignee?.name)}
                                  </div>
                                )}
                              </div>
                              {issue.storyPoints > 0 && (
                                <div className="mt-1.5">
                                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                    {issue.storyPoints} pts
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Create Issue Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create issue">
        <form onSubmit={handleCreateIssue} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input className="input" required placeholder="Issue title"
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input resize-none" rows={3} placeholder="Describe the issue..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="task">Task</option>
                <option value="bug">Bug</option>
                <option value="story">Story</option>
                <option value="epic">Epic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due date</label>
              <input type="date" className="input"
                value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Story points</label>
              <input type="number" className="input" min={0} max={100}
                value={form.storyPoints} onChange={e => setForm({ ...form, storyPoints: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Create issue</button>
          </div>
        </form>
      </Modal>

      {/* Issue Detail Side Panel */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedIssue(null)} />
          <div className="relative bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl p-6 z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <span className={typeColor(selectedIssue.type)}>{selectedIssue.type}</span>
                <span className={priorityColor(selectedIssue.priority)}>{selectedIssue.priority}</span>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{selectedIssue.title}</h2>
            <p className="text-sm text-gray-500 mb-6">{selectedIssue.description || 'No description'}</p>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="font-medium capitalize">{selectedIssue.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Assignee</span>
                <span className="font-medium">{selectedIssue.assignee?.name || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reporter</span>
                <span className="font-medium">{selectedIssue.reporter?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Due date</span>
                <span className="font-medium">{formatDate(selectedIssue.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Story points</span>
                <span className="font-medium">{selectedIssue.storyPoints || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created</span>
                <span className="font-medium">{formatDate(selectedIssue.createdAt)}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => handleDeleteIssue(selectedIssue._id)}
                className="text-sm text-red-500 hover:text-red-700 transition-colors"
              >
                Delete issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;
