import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import DarkModeToggle from './DarkModeToggle';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-800/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-lg font-semibold">
            Tarla Takip
          </Link>
          {user && (
            <nav className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <Link to="/">Dashboard</Link>
              <Link to="/fields">Tarlalar</Link>
              <Link to="/fields/new">Yeni Tarla</Link>
            </nav>
          )}
        </div>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm">
                <div className="font-semibold">{user.name}</div>
                <div className="text-gray-500">{user.role === 'employer' ? 'İşveren' : 'İşçi'}</div>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-md bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
              >
                Çıkış
              </button>
            </div>
          ) : (
            <Link to="/login" className="rounded-md bg-indigo-600 px-3 py-1 text-sm text-white">
              Giriş
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
