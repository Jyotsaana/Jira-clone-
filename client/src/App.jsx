


import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import Board      from './pages/Board';
import Sprints    from './pages/Sprints';
import AllSprints from './pages/Allsprints';
import MyTasks    from './pages/MyTasks';
import Footer     from './components/common/footer';

const App = () => (
  <AuthProvider>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/sprints"  element={<ProtectedRoute><AllSprints /></ProtectedRoute>} />
        <Route path="/my-tasks" element={<ProtectedRoute><MyTasks /></ProtectedRoute>} />

        <Route path="/project/:id"         element={<ProtectedRoute><Board /></ProtectedRoute>} />
        <Route path="/project/:id/sprints" element={<ProtectedRoute><Sprints /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </AuthProvider>
);

export default App;