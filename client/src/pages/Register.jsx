import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'developer' });
  const { register, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(form.name, form.email, form.password, form.role);
    if (result.success) {
      toast.success('Account created!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold">J</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Start tracking work today</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input
                name="name" type="text" required
                className="input" placeholder="John Doe"
                value={form.name} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email" type="email" required
                className="input" placeholder="you@example.com"
                value={form.email} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                name="password" type="password" required
                className="input" placeholder="••••••••"
                value={form.password} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select name="role" className="input" value={form.role} onChange={handleChange}>
                <option value="developer">Developer</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <button
              type="submit" disabled={loading}
              className="btn-primary w-full justify-center flex"
            >
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
