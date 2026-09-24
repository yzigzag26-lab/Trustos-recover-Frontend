import { useState } from 'react';
import { ArrowLeftFromLine, ArrowRight, Check, CircleHelp, Moon, Sun, Trash2, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Eyebrow, InlineNotice, PreviewTag } from '../components/Shared';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { clearDemoActivity, useDemoActivity } from '../services/demoActivity';

export function AccountPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const activity = useDemoActivity(user?.id || '');
  const [error, setError] = useState('');
  const [cleared, setCleared] = useState(false);
  async function signOut() {
    setError('');
    try { await logout(); navigate('/', { replace: true }); }
    catch { setError('Unable to log out from the local service. Please try again.'); }
  }
  function clear() { if (user) clearDemoActivity(user.id); setCleared(true); }
  return <div className="account-page"><div className="page-intro page-intro--short"><Eyebrow index="05 /">ACCOUNT</Eyebrow><div className="page-title-row"><div><h1>Your workspace, your settings.</h1><p>Manage the local preview experience and understand what is—and isn't—connected.</p></div><PreviewTag /></div></div>
    <div className="account-layout"><div className="account-main"><section className="account-card"><div className="account-card-head"><div className="account-card-icon"><UserRound size={21} strokeWidth={1.6} /></div><div><h2>Account details</h2><p>Your local development profile.</p></div></div><div className="account-row"><span>NAME</span><strong>{user?.name}</strong></div><div className="account-row"><span>EMAIL</span><strong>{user?.email}</strong></div><div className="account-row"><span>ACCOUNT TYPE</span><strong><span className="account-type-dot" /> Local preview</strong></div><div className="account-card-foot">This account is temporary and resets when the development server restarts. It is not a production identity.</div></section>
      <section className="account-card"><div className="account-card-head"><div className="account-card-icon"><Sun size={21} strokeWidth={1.6} /></div><div><h2>Appearance</h2><p>Choose the environment that's comfortable for you.</p></div></div><div className="theme-options" role="group" aria-label="Color theme"><button type="button" aria-pressed={theme === 'light'} className={theme === 'light' ? 'theme-option--active' : ''} onClick={() => setTheme('light')}><Sun size={20} /> Light <span>{theme === 'light' && <Check size={17} />}</span></button><button type="button" aria-pressed={theme === 'dark'} className={theme === 'dark' ? 'theme-option--active' : ''} onClick={() => setTheme('dark')}><Moon size={20} /> Dark <span>{theme === 'dark' && <Check size={17} />}</span></button></div><div className="account-card-foot">Your choice is stored in this browser. On a first visit, Trustos follows your system setting.</div></section>
      <section className="account-card"><div className="account-card-head"><div className="account-card-icon"><Trash2 size={20} strokeWidth={1.6} /></div><div><h2>Local activity</h2><p>Only high-level demo walkthrough events are saved in this browser.</p></div></div><div className="account-action-row"><span>{activity.length} demo event{activity.length === 1 ? '' : 's'} in this browser</span><button type="button" className="account-clear" onClick={clear} disabled={activity.length === 0}>Clear local history</button></div>{cleared && <InlineNotice type="success">Local demonstration activity cleared from this browser.</InlineNotice>}</section>
      {error && <InlineNotice type="error">{error}</InlineNotice>}<button type="button" className="btn btn-outline account-logout" onClick={signOut}>Log out of local session <ArrowLeftFromLine size={17} /></button></div>
    <aside className="account-aside"><div><CircleHelp size={21} strokeWidth={1.5} /><span>ABOUT THIS PREVIEW</span></div><h3>An interface built for review, not live recovery.</h3><p>Authentication is local to the development server. Google sign-in, email delivery, production AI, and blockchain recovery are not connected.</p><Link to="/security">Read the security approach <ArrowRight size={16} /></Link><Link to="/privacy">Review privacy information <ArrowRight size={16} /></Link></aside></div>
  </div>;
}
