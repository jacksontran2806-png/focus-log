import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <img src="/logo.svg" alt="Focus Log" className="w-7 h-7" onError={e => e.currentTarget.style.display = 'none'} />
      <span className="font-extrabold text-base tracking-tight" style={{ color: 'var(--primary)' }}>
        Focus Log
      </span>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isPro = user?.plan === 'pro' || user?.role === 'admin';
  const isAdmin = user?.role === 'admin';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const linkBase = 'text-sm font-medium transition-colors';
  const activeStyle = { color: 'var(--primary)' };
  const inactiveStyle = { color: 'var(--text-muted)' };

  return (
    <nav
      className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
      style={{
        background: 'rgba(250,250,250,0.85)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-6">
        <NavLink to="/" className="flex-shrink-0">
          <Logo />
        </NavLink>

        <div className="flex items-center gap-1">
          {[
            { to: '/timer', label: 'Timer' },
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/settings', label: 'Settings' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${linkBase} px-3 py-1.5 rounded-lg transition-all ${isActive ? 'font-semibold' : 'hover:bg-opacity-50'}`
              }
              style={({ isActive }) => isActive
                ? { ...activeStyle, background: 'var(--primary-muted)' }
                : inactiveStyle
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            {isAdmin && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold"
                style={{ background: '#1e2d42', color: '#fafafa' }}
              >
                ADMIN
              </span>
            )}
            {isPro && !isAdmin && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                PRO
              </span>
            )}
            {!isPro && (
              <NavLink
                to="/pricing"
                className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all hover:opacity-80"
                style={{ background: 'var(--primary-muted)', color: 'var(--primary)' }}
              >
                ✦ Upgrade
              </NavLink>
            )}
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm transition-colors hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/pricing"
              className="text-sm font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              Pricing
            </NavLink>
            <NavLink
              to="/login"
              className="text-sm font-semibold px-4 py-1.5 rounded-lg transition-all hover:opacity-90"
              style={{ background: 'var(--primary)', color: '#fff' }}
            >
              Sign in
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
