import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SessionProvider } from './context/SessionContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Timer from './pages/Timer.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Settings from './pages/Settings.jsx';
import Pricing from './pages/Pricing.jsx';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AuthOnlyRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'guest') return <Navigate to="/timer" replace />;
  return children;
}

function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <SessionProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/upgrade" element={<Navigate to="/pricing" replace />} />
              <Route path="/timer" element={<ProtectedRoute><Layout><Timer /></Layout></ProtectedRoute>} />
              <Route path="/dashboard" element={<AuthOnlyRoute><Layout><Dashboard /></Layout></AuthOnlyRoute>} />
              <Route path="/settings" element={<AuthOnlyRoute><Layout><Settings /></Layout></AuthOnlyRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </SessionProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
}
