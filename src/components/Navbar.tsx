import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/Button';
import { useDarkMode } from '../context/DarkModeContext';

const navClasses = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-emerald-50 dark:hover:bg-slate-800 ${
    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="text-2xl sm:hidden" onClick={() => setOpen((p) => !p)} aria-label="Menüyü aç">
            ☰
          </button>
          <Link to="/" className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            Tarla Takip
          </Link>
        </div>
        <nav className="hidden items-center gap-2 sm:flex">
          {user && (
            <>
              <NavLink to="/" className={navClasses} end>
                Gösterge
              </NavLink>
              <NavLink to="/fields" className={navClasses}>
                Tarlalar
              </NavLink>
              {(user.role === 'admin' || user.role === 'owner') && (
                <NavLink to="/admin" className={navClasses}>
                  Admin
                </NavLink>
              )}
            </>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={toggle} aria-label="Tema değiştir">
            {isDark ? '🌙' : '☀️'}
          </Button>
          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm text-slate-600 dark:text-slate-300">{user.name}</span>
              <Button variant="secondary" onClick={handleLogout}>
                Çıkış
              </Button>
            </div>
          ) : (
            <NavLink to="/login" className={navClasses}>
              Giriş
            </NavLink>
          )}
        </div>
      </div>
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950 sm:hidden">
          <div className="flex flex-col gap-2">
            <NavLink to="/" className={navClasses} end onClick={() => setOpen(false)}>
              Gösterge
            </NavLink>
            <NavLink to="/fields" className={navClasses} onClick={() => setOpen(false)}>
              Tarlalar
            </NavLink>
            {(user?.role === 'admin' || user?.role === 'owner') && (
              <NavLink to="/admin" className={navClasses} onClick={() => setOpen(false)}>
                Admin
              </NavLink>
            )}
            {user ? (
              <Button variant="secondary" onClick={handleLogout}>
                Çıkış
              </Button>
            ) : (
              <NavLink to="/login" className={navClasses} onClick={() => setOpen(false)}>
                Giriş
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
