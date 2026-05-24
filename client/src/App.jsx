import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Board     from './pages/Board';
import Sprints   from './pages/Sprints';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/project/:id" element={
          <ProtectedRoute><Board /></ProtectedRoute>
        } />
        <Route path="/project/:id/sprints" element={
          <ProtectedRoute><Sprints /></ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
