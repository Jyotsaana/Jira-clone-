import { createContext, useContext, useState } from 'react';
import { loginUser, registerUser } from '../api/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Load user from localStorage on first render
    return JSON.parse(localStorage.getItem('user') || 'null');
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await loginUser({ email, password });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      setUser(data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const { data } = await registerUser({ name, email, password, role });
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      setUser(data);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Register failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook — use this in any component to get auth state
export const useAuth = () => useContext(AuthContext);
