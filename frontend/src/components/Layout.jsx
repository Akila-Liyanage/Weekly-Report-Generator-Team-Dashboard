import { BarChart3, ClipboardList, FolderKanban, ListTodo, LogOut, Menu, UsersRound, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, isManager, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = isManager
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
        { to: '/team', label: 'Team', icon: UsersRound },
        { to: '/tasks', label: 'Tasks', icon: ListTodo },
        { to: '/projects', label: 'Projects', icon: FolderKanban },
      ]
    : [
        { to: '/reports', label: 'My Reports', icon: ClipboardList },
        { to: '/tasks', label: 'My Tasks', icon: ListTodo },
      ];

  return (
    <div className="app-shell">
      <header className="navbar">
        <div className="navbar-inner">
          <NavLink className="brand" to={isManager ? '/dashboard' : '/reports'} onClick={() => setMenuOpen(false)}>
            <span className="brand-mark">W</span>
            <span>
              <strong>WeeklyHub</strong>
              <small>Team reporting</small>
            </span>
          </NavLink>

          <button
            className="icon-button mobile-menu-button"
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <nav className={`nav-content ${menuOpen ? 'open' : ''}`}>
            <div className="nav-links">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </div>

            <div className="profile-area">
              <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="profile-copy">
                <strong>{user?.name}</strong>
                <span>{isManager ? 'Manager' : user?.jobTitle}</span>
              </div>
              <button className="icon-button" type="button" title="Log out" onClick={logout}>
                <LogOut size={18} />
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}
