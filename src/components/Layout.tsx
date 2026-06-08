import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
  userEmail: string;
}

export function Layout({ children, onLogout, userEmail }: LayoutProps) {
  const { pathname } = useLocation();

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar__header">
          <span className="sidebar__logo">Uni Tracker</span>
        </div>
        <nav className="sidebar__nav">
          <Link
            to="/"
            className={`sidebar__link ${pathname === '/' ? 'sidebar__link--active' : ''}`}
          >
            Dashboard
          </Link>
        </nav>
        <div className="sidebar__footer">
          <span className="sidebar__email">{userEmail}</span>
          <button className="btn btn--ghost" onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
