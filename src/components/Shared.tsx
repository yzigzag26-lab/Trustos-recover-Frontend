import { ArrowRight, Moon, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export function Brand({ to = '/', compact = false }: { to?: string; compact?: boolean }) {
  return <Link className={`brand ${compact ? 'brand--compact' : ''}`} to={to} aria-label="Trustos by LinuxBoss, home">
    <span className="brand-mark"><img src="/brand/linuxboss-mark.webp" alt="" /></span>
    <span className="brand-word"><strong>trustos<span className="brand-period">.</span></strong><span className="brand-sub">BY LINUXBOSS</span></span>
  </Link>;
}
export function ThemeToggle({ small = false }: { small?: boolean }) {
  const { theme, toggleTheme } = useTheme();
  return <button className={`theme-toggle ${small ? 'theme-toggle--small' : ''}`} type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
    {theme === 'light' ? <Moon size={18} strokeWidth={1.8} aria-hidden="true" /> : <Sun size={18} strokeWidth={1.8} aria-hidden="true" />}
  </button>;
}
export function Eyebrow({ index, children }: { index?: string; children: React.ReactNode }) {
  return <span className="eyebrow">{index && <span className="eyebrow-index">{index}</span>}{children}</span>;
}
export function ArrowLink({ to, children, className = '' }: { to: string; children: React.ReactNode; className?: string }) {
  return <Link to={to} className={`text-link ${className}`}>{children}<ArrowRight size={17} aria-hidden="true" /></Link>;
}
export function InlineNotice({ type = 'info', children }: { type?: 'info' | 'error' | 'success' | 'warning'; children: React.ReactNode }) {
  return <div className={`inline-notice inline-notice--${type}`} role={type === 'error' ? 'alert' : 'status'}>{children}</div>;
}
