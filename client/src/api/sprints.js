import api from './axios';
export const getSprints    = (projectId) => api.get(`/sprints/project/${projectId}`);
export const createSprint  = (data)      => api.post('/sprints', data);
export const updateSprint  = (id, data)  => api.put(`/sprints/${id}`, data);
