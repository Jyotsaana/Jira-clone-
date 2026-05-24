import api from './axios';
export const getIssues    = (projectId) => api.get(`/issues/project/${projectId}`);
export const createIssue  = (data)      => api.post('/issues', data);
export const updateIssue  = (id, data)  => api.put(`/issues/${id}`, data);
export const deleteIssue  = (id)        => api.delete(`/issues/${id}`);
