import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">Focus Log</h1>
      <p className="text-lg text-gray-500 mb-8 max-w-md">
        Track your focused study sessions, understand your distractions, and build better habits.
      </p>
      <div className="flex gap-3">
        <Link
          to="/timer"
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
        >
          Start a session
        </Link>
        {!user && (
          <Link
            to="/login"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}
