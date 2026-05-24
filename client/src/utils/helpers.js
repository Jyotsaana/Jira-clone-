export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

export const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

export const priorityColor = (priority) => ({
  low:      'badge-low',
  medium:   'badge-medium',
  high:     'badge-high',
  critical: 'badge-critical',
}[priority] || 'badge-low');

export const typeColor = (type) => ({
  bug:   'badge-bug',
  task:  'badge-task',
  story: 'badge-story',
  epic:  'badge-epic',
}[type] || 'badge-task');

export const statusLabel = {
  todo:       'To Do',
  inprogress: 'In Progress',
  inreview:   'In Review',
  done:       'Done',
};
