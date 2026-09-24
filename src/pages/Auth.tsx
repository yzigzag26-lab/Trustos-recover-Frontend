import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Eye, EyeOff, Info, LockKeyhole, X } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Brand, InlineNotice, ThemeToggle } from '../components/Shared';
import { useAuth } from '../context/AuthContext';
import { AuthError, type CodeResult } from '../services/authService';

function safeNext(next: string | null) { return next?.startsWith('/app') && !next.startsWith('//') ? next : '/app'; }
type PendingCode = { email: string; devCode: string; resendAt: number };
function savePending(result: CodeResult) {
  try { sessionStorage.setItem('trustos-pending-verification', JSON.stringify({ email: result.email, devCode: result.devCode, resendAt: Date.now() + result.resendAfterSeconds * 1000 } satisfies PendingCode)); } catch { /* No storage required for the session itself. */ }
}
function loadPending(): PendingCode | null {
  try { return JSON.parse(sessionStorage.getItem('trustos-pending-verification') || 'null') as PendingCode | null; } catch { return null; }
}
function saveReset(email: string, devCode: string | null) {
  try { sessionStorage.setItem('trustos-pending-reset', JSON.stringify({ email, devCode })); } catch { /* Optional convenience only. */ }
}
function loadReset(): { email: string; devCode: string | null } | null {
  try { return JSON.parse(sessionStorage.getItem('trustos-pending-reset') || 'null') as { email: string; devCode: string | null } | null; } catch { return null; }
}

function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="auth-layout">
    <aside className="auth-aside"><div className="auth-aside-inner"><Brand />
      <div className="auth-aside-center"><span className="auth-aside-eyebrow"><span /> THE TRUSTOS WORKSPACE</span><h2>Clarity is a form<br />of <em>control.</em></h2><p>Understand the issue. Make deliberate choices. Know what needs to be verified.</p>
        <div className="auth-aside-flow"><div><span>01</span> Understand</div><div><span>02</span> Recover</div><div><span>03</span> Verify</div></div>
      </div>
      <div className="auth-aside-bottom"><span>TRUSTOS BY LINUXBOSS</span><span>INTERFACE PREVIEW / 01</span></div>
    </div><div className="auth-aside-art" aria-hidden="true"><div className="auth-art-ring auth-art-ring--one" /><div className="auth-art-ring auth-art-ring--two" /><div className="auth-art-ring auth-art-ring--three" /><span className="auth-art-node auth-art-node--one" /><span className="auth-art-node auth-art-node--two" /></div></aside>
    <main className="auth-main"><div className="auth-topbar"><div className="auth-topbar-left"><Brand /><Link to="/" className="auth-back"><ArrowLeft size={17} aria-hidden="true" /> Back to site</Link></div><ThemeToggle /></div><div className="auth-main-body">{children}</div><div className="auth-main-foot"><span>LOCAL DEVELOPMENT PREVIEW</span><span>Never enter a real recovery phrase or private key.</span></div></main>
  </div>;
}
function Field({ label, id, value, onChange, type = 'text', placeholder, autoComplete, required = true, help, maxLength }: { label: string; id: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string; autoComplete?: string; required?: boolean; help?: string; maxLength?: number }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  return <div className="form-field"><label htmlFor={id}>{label}</label><div className="input-shell"><input id={id} type={isPassword && visible ? 'text' : type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} autoComplete={autoComplete} required={required} maxLength={maxLength} />{isPassword && <button type="button" className="password-visibility" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button>}</div>{help && <span className="field-help">{help}</span>}</div>;
}
function GoogleOption() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); return; }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') || []);
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); trigger.current?.focus(); };
  }, [open]);
  return <><div className="auth-divider"><span>OR</span></div><button ref={trigger} className="btn google-button" type="button" onClick={() => setOpen(true)}><span className="google-g" aria-hidden="true">G</span>Continue with Google</button>
    {open && <div className="modal-backdrop" onClick={() => setOpen(false)}><div className="modal-card" ref={dialog} role="dialog" aria-modal="true" aria-labelledby="google-dialog-title" onClick={(e) => e.stopPropagation()}><button ref={closeButton} type="button" className="modal-close" aria-label="Close dialog" onClick={() => setOpen(false)}><X size={20} /></button><div className="modal-icon"><Info size={23} /></div><span className="eyebrow">FUTURE INTEGRATION</span><h3 id="google-dialog-title">Google sign-in isn't connected yet.</h3><p>This is an interface preview. No Google authentication or account linking has taken place. Use the local email flow to explore the workspace.</p><button type="button" className="btn btn-primary" onClick={() => setOpen(false)}>Use email instead <ArrowRight size={17} /></button></div></div>}
  </>;
}

export function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (user) navigate(next, { replace: true }); }, [user, next, navigate]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setBusy(true);
    try { await login(email, password); navigate(next, { replace: true }); }
    catch (err) {
      if (err instanceof AuthError && err.code === 'EMAIL_UNVERIFIED') {
        try { sessionStorage.setItem('trustos-pending-verification', JSON.stringify({ email: err.email || email.trim().toLowerCase(), devCode: err.devCode || '', resendAt: 0 } satisfies PendingCode)); } catch { /* okay */ }
        navigate(`/verify?email=${encodeURIComponent(email.trim())}&next=${encodeURIComponent(next)}`);
      } else setError(err instanceof Error ? err.message : 'Unable to log in. Please try again.');
    } finally { setBusy(false); }
  }
  return <AuthLayout><div className="auth-form-wrap"><div className="auth-form-heading"><span className="eyebrow">WELCOME BACK / 01</span><h1>Log in to Trustos.</h1><p>Pick up where you left off in your workspace.</p></div>
    {error && <InlineNotice type="error">{error}</InlineNotice>}
    <form onSubmit={submit} className="auth-form"><Field id="login-email" label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" /><Field id="login-password" label="Password" type="password" value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" /><div className="form-extras"><span /><Link to="/forgot-password">Forgot password?</Link></div><button type="submit" className="btn btn-primary btn-submit" disabled={busy}>{busy ? 'Logging in…' : 'Log in'} <ArrowRight size={18} aria-hidden="true" /></button></form>
    <GoogleOption /><p className="auth-switch">New to Trustos? <Link to={`/signup?next=${encodeURIComponent(next)}`}>Create an account <ArrowUpRight size={15} aria-hidden="true" /></Link></p><div className="auth-note"><LockKeyhole size={15} aria-hidden="true" /> Local preview account. No production authentication is connected.</div>
  </div></AuthLayout>;
}

export function SignupPage() {
  const { signup, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (user) navigate(next, { replace: true }); }, [user, next, navigate]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (password.length < 8) { setError('Use at least 8 characters for your password.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (!terms) { setError('Please accept the preview Terms & Conditions.'); return; }
    setBusy(true);
    try { const result = await signup(name, email, password, terms); savePending(result); navigate(`/verify?email=${encodeURIComponent(result.email)}&next=${encodeURIComponent(next)}`); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to create an account. Please try again.'); }
    finally { setBusy(false); }
  }
  return <AuthLayout><div className="auth-form-wrap auth-form-wrap--signup"><div className="auth-form-heading"><span className="eyebrow">GET STARTED / 01</span><h1>Create your account.</h1><p>A private workspace for a more considered recovery experience.</p></div>
    {error && <InlineNotice type="error">{error}</InlineNotice>}
    <form onSubmit={submit} className="auth-form"><Field id="signup-name" label="Your name" value={name} onChange={setName} placeholder="How should we address you?" autoComplete="name" maxLength={80} /><Field id="signup-email" label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" /><Field id="signup-password" label="Password" type="password" value={password} onChange={setPassword} placeholder="Create a password" autoComplete="new-password" help="Use at least 8 characters. For this demo, don't use a real account password." /><Field id="signup-confirm" label="Confirm password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat your password" autoComplete="new-password" />
      <label className="terms-check"><input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} /><span>I have read and agree to the preview <Link to="/terms" target="_blank" rel="noopener noreferrer">Terms & Conditions</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer">Privacy information</Link>.</span></label>
      <button type="submit" className="btn btn-primary btn-submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'} <ArrowRight size={18} aria-hidden="true" /></button></form>
    <GoogleOption /><p className="auth-switch">Already have an account? <Link to={`/login?next=${encodeURIComponent(next)}`}>Log in <ArrowUpRight size={15} aria-hidden="true" /></Link></p><div className="auth-note"><Info size={15} aria-hidden="true" /> This local account is temporary and resets when the development server restarts.</div>
  </div></AuthLayout>;
}

export function VerifyPage() {
  const { verify, resend, user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const pending = loadPending();
  const email = params.get('email') || pending?.email || '';
  const matchingPending = pending?.email.toLowerCase() === email.toLowerCase() ? pending : null;
  const [demoCode, setDemoCode] = useState(matchingPending?.devCode || '');
  const [resendAt, setResendAt] = useState(matchingPending?.resendAt || 0);
  const [seconds, setSeconds] = useState(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (user) navigate(next, { replace: true }); }, [user, next, navigate]);
  useEffect(() => {
    const tick = () => setSeconds(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    tick(); const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [resendAt]);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!/^\d{6}$/.test(code)) { setError('Enter the six-digit local verification code.'); return; }
    setBusy(true);
    try { await verify(email, code); try { sessionStorage.removeItem('trustos-pending-verification'); } catch { /* okay */ } navigate(next, { replace: true }); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to verify that code.'); }
    finally { setBusy(false); }
  }
  async function requestNewCode() {
    setError(''); setBusy(true);
    try { const result = await resend(email); savePending(result); setDemoCode(result.devCode); setResendAt(Date.now() + result.resendAfterSeconds * 1000); setCode(''); }
    catch (err) {
      if (err instanceof AuthError && err.retryAfterSeconds) setResendAt(Date.now() + err.retryAfterSeconds * 1000);
      setError(err instanceof Error ? err.message : 'Unable to request another code.');
    } finally { setBusy(false); }
  }
  return <AuthLayout><div className="auth-form-wrap"><div className="auth-form-heading"><span className="eyebrow">ACCOUNT SETUP / 02</span><div className="auth-step-counter">STEP 02 OF 02</div><h1>Verify your email.</h1><p>Enter the code for <strong>{email || 'your email address'}</strong> to access the workspace.</p></div>
    <InlineNotice type="info"><strong>Local verification preview.</strong> No email was sent. Use the development code shown below. In a future release, a real email service will provide it.</InlineNotice>
    {demoCode ? <div className="dev-code-card"><span>YOUR LOCAL DEMO CODE</span><strong aria-label={`Local demo code ${demoCode.split('').join(' ')}`}>{demoCode}</strong><small>Valid for 10 minutes. Not delivered to your inbox.</small></div> : <InlineNotice type="warning">There is no code stored in this tab. If you registered here, log in to return to verification; otherwise create a local account.</InlineNotice>}
    {error && <InlineNotice type="error">{error}</InlineNotice>}
    <form className="auth-form verify-form" onSubmit={submit}><div className="form-field"><label htmlFor="verify-code">Six-digit code</label><div className="input-shell"><input id="verify-code" className="verification-input" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="000000" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} required /></div></div><button className="btn btn-primary btn-submit" type="submit" disabled={busy || !email}>{busy ? 'Verifying…' : 'Verify and continue'}<ArrowRight size={18} aria-hidden="true" /></button></form>
    <div className="verify-actions"><button type="button" onClick={requestNewCode} disabled={busy || seconds > 0 || !email}>Resend code {seconds > 0 ? `in ${seconds}s` : ''}</button><Link to="/signup">Change email</Link></div>
    <p className="auth-switch"><Link to="/login"><ArrowLeft size={15} aria-hidden="true" /> Back to log in</Link></p>
  </div></AuthLayout>;
}

export function ForgotPage() {
  const { requestPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const result = await requestPasswordReset(email);
      if (!result.devCode) { setError('No matching local preview account was found. Check the email or create a new local account. No email was sent.'); return; }
      saveReset(result.email, result.devCode);
      navigate(`/reset-password?email=${encodeURIComponent(result.email)}`);
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to prepare a local reset code.'); }
    finally { setBusy(false); }
  }
  return <AuthLayout><div className="auth-form-wrap"><div className="auth-form-heading"><span className="eyebrow">ACCOUNT ACCESS</span><h1>Reset your password.</h1><p>We'll prepare a code locally so you can test the reset experience. No email will be sent.</p></div>
    {error && <InlineNotice type="error">{error}</InlineNotice>}
    <form className="auth-form" onSubmit={submit}><Field id="forgot-email" label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" /><button className="btn btn-primary btn-submit" type="submit" disabled={busy}>{busy ? 'Preparing code…' : 'Continue'} <ArrowRight size={18} /></button></form><p className="auth-switch"><Link to="/login"><ArrowLeft size={15} /> Back to log in</Link></p>
  </div></AuthLayout>;
}
export function ResetPage() {
  const { resetPassword } = useAuth();
  const [params] = useSearchParams();
  const saved = loadReset();
  const email = params.get('email') || saved?.email || '';
  const demoCode = saved?.email === email ? saved.devCode : null;
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (password.length < 8) { setError('Use at least 8 characters for your new password.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try { await resetPassword(email, code, password); setDone(true); try { sessionStorage.removeItem('trustos-pending-reset'); } catch { /* okay */ } }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to reset your password.'); }
    finally { setBusy(false); }
  }
  if (done) return <AuthLayout><div className="auth-form-wrap"><div className="auth-success-icon"><Check size={26} /></div><span className="eyebrow">LOCAL PASSWORD RESET</span><h1>Password updated.</h1><p>Your local preview password has been updated. Log in to continue. Any earlier local sessions were closed.</p><Link className="btn btn-primary btn-submit" to="/login">Go to log in <ArrowRight size={18} /></Link></div></AuthLayout>;
  return <AuthLayout><div className="auth-form-wrap"><div className="auth-form-heading"><span className="eyebrow">ACCOUNT ACCESS / RESET</span><h1>Choose a new password.</h1><p>Complete the local reset flow for <strong>{email || 'your account'}</strong>.</p></div>
    <InlineNotice type="info">This is a local preview. No email was sent; the demo code is displayed here if you requested one in this tab.</InlineNotice>
    {demoCode && <div className="dev-code-card"><span>YOUR LOCAL RESET CODE</span><strong>{demoCode}</strong><small>Valid for 10 minutes. Not delivered by email.</small></div>}
    {error && <InlineNotice type="error">{error}</InlineNotice>}
    <form className="auth-form" onSubmit={submit}><Field id="reset-code" label="Six-digit local code" value={code} onChange={(s) => setCode(s.replace(/\D/g, '').slice(0, 6))} placeholder="000000" autoComplete="one-time-code" maxLength={6} /><Field id="reset-password" label="New password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" autoComplete="new-password" /><Field id="reset-confirm" label="Confirm new password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat the new password" autoComplete="new-password" /><button className="btn btn-primary btn-submit" type="submit" disabled={busy || !email}>{busy ? 'Updating password…' : 'Update password'}<ArrowRight size={18} /></button></form>
    <p className="auth-switch"><Link to="/forgot-password"><ArrowLeft size={15} /> Request a new code</Link></p>
  </div></AuthLayout>;
}
