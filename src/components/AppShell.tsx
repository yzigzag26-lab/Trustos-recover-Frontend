import { useEffect, useRef, useState } from 'react';
import { ArrowLeftFromLine, ArrowUpRight, ChevronRight, CircleHelp, LayoutGrid, Menu, ScanSearch, Sparkles, UserRound, Workflow, X } from 'lucide-react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Brand, PreviewTag, ThemeToggle } from './Shared';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { path: '/app', label: 'Overview', icon: LayoutGrid, end: true },
  { path: '/app/recovery', label: 'Recovery', icon: Workflow },
  { path: '/app/assistant', label: 'Trustos AI', icon: Sparkles },
  { path: '/app/verification', label: 'Verification', icon: ScanSearch },
  { path: '/app/account', label: 'Account', icon: UserRound },
];
export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [logoutError, setLogoutError] = useState('');
  const current = navigation.find((item) => item.path === location.pathname)?.label || 'Workspace';
  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);
  async function signOut() {
    setLogoutError('');
    try { await logout(); navigate('/', { replace: true }); }
    catch { setLogoutError('Could not end the local session. Please retry.'); }
  }
  return <div className="app-shell">
    {menuOpen && <button className="app-sidebar-backdrop" type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
    <aside id="app-navigation" className={`app-sidebar ${menuOpen ? 'app-sidebar--open' : ''}`} aria-label="Workspace navigation"><div className="app-sidebar-top"><Brand to="/app" /><button className="app-mobile-close" type="button" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X size={20} /></button></div>
      <div className="app-sidebar-nav"><span className="app-nav-label">YOUR WORKSPACE</span><nav>{navigation.map(({ path, label, icon: Icon, end }) => <NavLink key={path} to={path} end={end} className={({ isActive }) => `app-nav-link ${isActive ? 'app-nav-link--active' : ''}`}><Icon size={19} strokeWidth={1.7} aria-hidden="true" /><span>{label}</span>{label === 'Trustos AI' && <span className="app-nav-preview">LOCAL</span>}</NavLink>)}</nav></div>
      <div className="app-sidebar-bottom"><div className="app-help-box"><CircleHelp size={20} strokeWidth={1.6} aria-hidden="true" /><span>Need context before you begin?</span><Link to="/app/assistant">Ask the local guide <ArrowUpRight size={14} aria-hidden="true" /></Link></div><div className="app-sidebar-mode"><span className="status-small-dot" /> INTERFACE PREVIEW</div><div className="app-user"><div className="app-user-avatar">{user?.name.charAt(0).toUpperCase()}</div><div className="app-user-text"><strong>{user?.name}</strong><span>{user?.email}</span></div><button type="button" title="Log out" aria-label="Log out" onClick={signOut}><ArrowLeftFromLine size={18} /></button></div>{logoutError && <small className="app-logout-error" role="alert">{logoutError}</small>}</div>
    </aside>
    <div className="app-main-wrap"><header className="app-topbar"><div className="app-topbar-left"><button ref={menuButton} type="button" className="app-menu-btn" aria-controls="app-navigation" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><Menu size={22} /></button><Link to="/app" className="app-mobile-mark" aria-label="Trustos workspace"><img src="/brand/linuxboss-mark.webp" alt="" /></Link><div className="app-breadcrumb"><span>WORKSPACE</span><ChevronRight size={14} aria-hidden="true" /><strong>{current.toUpperCase()}</strong></div></div><div className="app-topbar-actions"><PreviewTag /><ThemeToggle small /><Link className="topbar-user" to="/app/account" aria-label="Account settings">{user?.name.charAt(0).toUpperCase()}</Link></div></header>
      <div className="app-page"><Outlet /></div><footer className="app-footer"><span>TRUSTOS / LINUXBOSS</span><span>Local preview · No live recovery, AI model, or blockchain connection.</span><Link to="/">Back to site <ArrowUpRight size={13} aria-hidden="true" /></Link></footer>
    </div>
  </div>;
}
