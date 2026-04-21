import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-indigo-600 text-lg">Focus Log</span>
        <NavLink
          to="/timer"
          className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Timer
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
        >
          Settings
        </NavLink>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm text-gray-500">{user.name}</span>
            {user.plan === 'pro' && (
              <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-medium">PRO</span>
            )}
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">Logout</button>
          </>
        ) : (
          <NavLink to="/login" className="text-sm text-indigo-600 font-medium">Login</NavLink>
        )}
      </div>
    </nav>
  );
}
