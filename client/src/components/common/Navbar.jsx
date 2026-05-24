import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center">
          <span className="text-white text-xs font-bold">J</span>
        </div>
        <span className="font-semibold text-gray-900 text-sm">JiraClone</span>
      </Link>

      <div className="flex items-center gap-3">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          Projects
        </Link>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-xs font-medium">
            {getInitials(user?.name)}
          </div>
          <span className="text-sm text-gray-700">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors ml-1"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
