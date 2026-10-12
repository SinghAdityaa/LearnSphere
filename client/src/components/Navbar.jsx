import { BookOpen, Heart, LayoutDashboard, LogOut, Menu, ShieldCheck, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const handleLogout = async () => {
    await logout();
    close();
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link to="/" className="brand" onClick={close}>
          <span className="brand-mark"><BookOpen size={21} /></span>
          <span>LearnSphere</span>
        </Link>
        <button className="nav-toggle" onClick={() => setOpen(v => !v)} aria-label="Toggle navigation">
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          <NavLink to="/courses" onClick={close}>Courses</NavLink>
          <NavLink to="/paths" onClick={close}>Learning paths</NavLink>
          {user && <NavLink to="/dashboard" onClick={close}><LayoutDashboard size={17} /> Dashboard</NavLink>}
          {user && <NavLink to="/profile" onClick={close}><UserRound size={17} /> Profile</NavLink>}
          {user && <NavLink to="/favorites" onClick={close}><Heart size={17} /> Favorites</NavLink>}
          {user?.role === 'admin' && <><NavLink to="/admin" onClick={close}><ShieldCheck size={17} /> Admin</NavLink><NavLink to="/admin/students" onClick={close}>Students</NavLink></>}
          {user ? (
            <>
              <div className="user-chip">
                <span className="avatar-small">{user.name?.[0]?.toUpperCase()}</span>
                <span>{user.name}</span>
              </div>
              <button className="button ghost small" onClick={handleLogout}><LogOut size={16} /> Logout</button>
            </>
          ) : <Link className="button primary small" to="/login" onClick={close}>Sign in</Link>}
        </nav>
      </div>
    </header>
  );
}
