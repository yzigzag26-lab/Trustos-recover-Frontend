import { useState } from 'react';
import { ArrowLeftFromLine, ArrowRight, Check, CircleHelp, Moon, Sun, Trash2, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Eyebrow, InlineNotice } from '../components/Shared';
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
    catch { setError('Could not log out. Please try again.'); }
  }
  function clear() { if (user) clearDemoActivity(user.id); setCleared(true); }
  return <div className="account-page"><div className="page-intro page-intro--short"><Eyebrow index="05 /">ACCOUNT</Eyebrow><div className="page-title-row"><div><h1>Your workspace, your settings.</h1><p>Manage your profile, appearance, and activity in one place.</p></div></div></div>
    <div className="account-layout"><div className="account-main"><section className="account-card"><div className="account-card-head"><div className="account-card-icon"><UserRound size={21} strokeWidth={1.6} /></div><div><h2>Account details</h2><p>The details associated with this account.</p></div></div><div className="account-row"><span>NAME</span><strong>{user?.name}</strong></div><div className="account-row"><span>EMAIL</span><strong>{user?.email}</strong></div></section>
      <section className="account-card"><div className="account-card-head"><div className="account-card-icon"><Sun size={21} strokeWidth={1.6} /></div><div><h2>Appearance</h2><p>Choose the environment that's comfortable for you.</p></div></div><div className="theme-options" role="group" aria-label="Color theme"><button type="button" aria-pressed={theme === 'light'} className={theme === 'light' ? 'theme-option--active' : ''} onClick={() => setTheme('light')}><Sun size={20} /> Light <span>{theme === 'light' && <Check size={17} />}</span></button><button type="button" aria-pressed={theme === 'dark'} className={theme === 'dark' ? 'theme-option--active' : ''} onClick={() => setTheme('dark')}><Moon size={20} /> Dark <span>{theme === 'dark' && <Check size={17} />}</span></button></div><div className="account-card-foot">Your choice is stored in this browser. On a first visit, Trustos follows your system setting.</div></section>
      <section className="account-card"><div className="account-card-head"><div className="account-card-icon"><Trash2 size={20} strokeWidth={1.6} /></div><div><h2>Your activity</h2><p>Walkthrough activity saved on this device.</p></div></div><div className="account-action-row"><span>{activity.length} walkthrough event{activity.length === 1 ? '' : 's'} on this device</span><button type="button" className="account-clear" onClick={clear} disabled={activity.length === 0}>Clear activity</button></div>{cleared && <InlineNotice type="success">Activity cleared from this device.</InlineNotice>}</section>
      {error && <InlineNotice type="error">{error}</InlineNotice>}<button type="button" className="btn btn-outline account-logout" onClick={signOut}>Log out <ArrowLeftFromLine size={17} /></button></div>
    <aside className="account-aside"><div><CircleHelp size={21} strokeWidth={1.5} /><span>GOOD TO KNOW</span></div><h3>Keep sensitive details private.</h3><p>Never share a recovery phrase, private key, or wallet password in a chat or support request. Review the privacy and security information whenever you need it.</p><Link to="/security">Read the security approach <ArrowRight size={16} /></Link><Link to="/privacy">Review privacy information <ArrowRight size={16} /></Link></aside></div>
  </div>;
}
