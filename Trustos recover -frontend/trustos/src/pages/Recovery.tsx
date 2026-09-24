import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronRight, CircleHelp, Clock3, KeyRound, Monitor, SearchCheck, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Eyebrow, InlineNotice } from '../components/Shared';
import { useAuth } from '../context/AuthContext';
import { recordDemoActivity, type Issue } from '../services/demoActivity';

type Known = 'public' | 'provider' | 'unsure';
const issues: { id: Issue; icon: typeof KeyRound; name: string; sub: string }[] = [
  { id: 'access', icon: KeyRound, name: 'Wallet access', sub: "I can't access a wallet or service." },
  { id: 'transaction', icon: WalletCards, name: 'Transaction question', sub: 'I need to understand a transfer.' },
  { id: 'other', icon: CircleHelp, name: 'Something else', sub: "I'm still figuring out the issue." },
];
const knownOptions: { id: Known; label: string }[] = [
  { id: 'public', label: 'A public address or transaction ID' },
  { id: 'provider', label: 'The wallet or service name' },
  { id: 'unsure', label: "I'm not sure yet" },
];
const pathCopy: Record<Issue, { intro: string; checks: string[] }> = {
  access: { intro: 'First establish which wallet or service was involved. A real recovery approach depends on its official access methods.', checks: ['Find the official support or documentation for your wallet or provider.', 'Identify the type of access problem without disclosing credentials.', 'Avoid services that promise guaranteed recovery or ask for your phrase.'] },
  transaction: { intro: 'An unclear transfer calls for independent checks of public information, not access to your private credentials.', checks: ['Identify the correct network and any public transaction reference.', 'Check public data through a reputable independent explorer.', 'Confirm the exact destination address and status yourself.'] },
  other: { intro: 'A little clarity about the issue is the safest first step. Do not rush into a tool or service before understanding the problem.', checks: ['Write down what you know without including passwords or recovery phrases.', 'Identify the original wallet or service involved.', 'Use official provider documentation to narrow down your next step.'] },
};
export function RecoveryPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [known, setKnown] = useState<Known | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);
  function nextStep() {
    setError('');
    if (!issue) { setError('Choose the issue that best describes your situation.'); return; }
    if (!known) { setError('Select what non-sensitive information you already have.'); return; }
    if (!acknowledged) { setError('Please confirm that you understand the scope of this walkthrough.'); return; }
    recordDemoActivity(user?.id || '', issue, 'started'); setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function previewReview() {
    if (!issue) { setError('Return to the first step to choose an issue.'); return; }
    setError(''); setProcessing(true);
    timer.current = window.setTimeout(() => { setProcessing(false); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }, 1100);
  }
  function finish() {
    if (!reviewed) { setError('Please acknowledge what this walkthrough did and did not do.'); return; }
    if (issue) recordDemoActivity(user?.id || '', issue, 'completed');
    setCompleted(true); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function restart() { setStep(0); setIssue(null); setKnown(null); setAcknowledged(false); setReviewed(false); setCompleted(false); setError(''); }
  const stepNames = ['Identify', 'Recover', 'Verify'];
  return <div className="recovery-page"><div className="page-intro page-intro--short"><Eyebrow index="02 /">GUIDED RECOVERY</Eyebrow><div className="page-title-row"><div><h1>A better place to begin.</h1><p>Identify the issue, explore a possible path, and review what you should check before taking action.</p></div></div></div>
    
    <div className="recovery-steps" aria-label="Recovery walkthrough stages">{stepNames.map((name, i) => <div key={name} className={`recovery-step ${i === step ? 'recovery-step--current' : ''} ${i < step || completed ? 'recovery-step--past' : ''}`} aria-current={i === step && !completed ? 'step' : undefined}><div className="recovery-step-number">{i < step || completed ? <Check size={17} aria-hidden="true" /> : `0${i + 1}`}</div><span>{name}</span>{i < 2 && <span className="recovery-step-connector" />}</div>)}</div>
    {completed ? <div className="recovery-complete"><div className="complete-glyph"><Check size={29} strokeWidth={1.6} /></div><Eyebrow>WALKTHROUGH COMPLETE</Eyebrow><h2>You've reviewed the path.<br /><span>No recovery was performed.</span></h2><p>You reviewed a suggested path for a {issues.find((item) => item.id === issue)?.name.toLowerCase() || 'recovery'} issue. No accounts, funds, or blockchain data were accessed.</p><div className="complete-recap"><span><CheckCircle2 size={18} /> Issue category selected</span><span><CheckCircle2 size={18} /> Suggested steps reviewed</span><span><CircleHelp size={18} /> No result to independently verify</span></div><div className="recovery-complete-actions"><button type="button" className="btn btn-primary" onClick={restart}>Start a new walkthrough <ArrowRight size={17} /></button><Link to="/app/verification" className="btn btn-outline">About verification <ArrowUpRight size={17} /></Link></div></div> : <div className="recovery-layout"><div className="recovery-main">
      {step === 0 && <div className="recovery-card"><div className="recovery-card-header"><div><Eyebrow>STEP 01 / IDENTIFY</Eyebrow><h2>What are you trying to resolve?</h2><p>Start with the type of issue. You won't need to enter any sensitive details.</p></div><span className="recovery-card-counter">01 / 03</span></div>
        <fieldset className="choice-group"><legend>Choose the closest match <span>REQUIRED</span></legend><div className="issue-choices">{issues.map(({ id, icon: Icon, name, sub }) => <label key={id} className={`issue-choice ${issue === id ? 'issue-choice--selected' : ''}`}><input type="radio" name="issue" value={id} checked={issue === id} onChange={() => { setIssue(id); setError(''); }} /><span className="issue-icon"><Icon size={22} strokeWidth={1.6} aria-hidden="true" /></span><span className="issue-text"><strong>{name}</strong><small>{sub}</small></span><span className="radio-indicator" /></label>)}</div></fieldset>
        <fieldset className="choice-group"><legend>What non-sensitive information do you have? <span>REQUIRED</span></legend><div className="known-choices">{knownOptions.map((item) => <label className={`known-choice ${known === item.id ? 'known-choice--selected' : ''}`} key={item.id}><input type="radio" name="known" checked={known === item.id} onChange={() => { setKnown(item.id); setError(''); }} /><span className="radio-indicator" />{item.label}</label>)}</div><small className="choice-help">Do not enter the information here. This is only to help frame the next step.</small></fieldset>
        <label className="recovery-confirm"><input type="checkbox" checked={acknowledged} onChange={(e) => { setAcknowledged(e.target.checked); setError(''); }} /><span>I understand this walkthrough offers guidance only; it will not access an account, recover funds, or verify a transaction.</span></label>
        {error && <InlineNotice type="error">{error}</InlineNotice>}
        <div className="recovery-card-footer"><span>YOU CAN CHANGE YOUR SELECTIONS LATER</span><button type="button" onClick={nextStep} className="btn btn-primary">Continue to explore <ArrowRight size={17} aria-hidden="true" /></button></div>
      </div>}
      {step === 1 && <div className="recovery-card"><div className="recovery-card-header"><div><Eyebrow>STEP 02 / RECOVER</Eyebrow><h2>Understand the approach.</h2><p>Before doing anything consequential, see the questions and checks that would shape a real path.</p></div><span className="recovery-card-counter">02 / 03</span></div>
        <div className="recovery-summary"><div><span>YOU IDENTIFIED</span><strong>{issues.find((item) => item.id === issue)?.name}</strong></div><ChevronRight size={19} /><div><span>YOU HAVE</span><strong>{knownOptions.find((item) => item.id === known)?.label}</strong></div></div>
        <div className="recovery-plan"><div className="recovery-plan-heading"><Monitor size={20} strokeWidth={1.6} /><span>A SUGGESTED PATH</span></div><p>{issue ? pathCopy[issue].intro : ''}</p><ol>{issue && pathCopy[issue].checks.map((text, i) => <li key={text}><span>0{i + 1}</span>{text}</li>)}</ol></div>
        
        {error && <InlineNotice type="error">{error}</InlineNotice>}
        <div className="recovery-card-footer"><button type="button" className="recovery-back" onClick={() => { setStep(0); setError(''); }}><ArrowLeft size={16} /> Edit selections</button><button type="button" className="btn btn-primary" disabled={processing} onClick={previewReview}>{processing ? <><span className="btn-spinner" />Preparing example…</> : <>Continue to review <ArrowRight size={17} /></>}</button></div>
        {processing && <div className="processing-note" role="status"><Clock3 size={15} /> Preparing your review checklist…</div>}
      </div>}
      {step === 2 && <div className="recovery-card"><div className="recovery-card-header"><div><Eyebrow>STEP 03 / VERIFY</Eyebrow><h2>Review what happened.</h2><p>Distinguish the guidance you reviewed from actions that were actually taken.</p></div><span className="recovery-card-counter">03 / 03</span></div>
        <div className="recovery-result-label"><span className="status-small-dot" /> WALKTHROUGH SUMMARY</div>
        <div className="verify-facts"><div><span>01</span><div><strong>Issue category selected</strong><p>{issues.find((item) => item.id === issue)?.name} — no credentials or personal recovery data were collected.</p></div><CheckCircle2 size={19} /></div><div><span>02</span><div><strong>Guidance shown</strong><p>You reviewed a suggested path. No recovery action was taken.</p></div><CheckCircle2 size={19} /></div><div><span>03</span><div><strong>Independent verification</strong><p>Not performed. There is no recovery result, address, or transaction here to validate.</p></div><CircleHelp size={19} /></div></div>
        <label className="recovery-confirm"><input type="checkbox" checked={reviewed} onChange={(e) => { setReviewed(e.target.checked); setError(''); }} /><span>I understand this walkthrough did not produce or verify a recovery result.</span></label>
        {error && <InlineNotice type="error">{error}</InlineNotice>}
        <div className="recovery-card-footer"><button type="button" className="recovery-back" onClick={() => { setStep(1); setError(''); }}><ArrowLeft size={16} /> Back to approach</button><button type="button" className="btn btn-primary" onClick={finish}>Complete walkthrough <Check size={18} /></button></div>
      </div>}
    </div><aside className="recovery-aside"><div className="recovery-help-card"><span className="aside-icon"><SearchCheck size={23} strokeWidth={1.5} /></span><h3>A good recovery process starts with good boundaries.</h3><p>No one needs your private key or recovery phrase to help you understand your options.</p><div className="recovery-help-separator" /><span>WHAT YOU CAN DO HERE</span><ul><li><Check size={15} /> Helps classify an issue</li><li><Check size={15} /> Explains possible next steps</li><li><Check size={15} /> Shows what to verify</li></ul><div className="recovery-help-separator" /><span>WHAT THIS WALKTHROUGH DOES NOT DO</span><ul className="recovery-does-not"><li>Recover wallet access or funds</li><li>Check blockchain data</li><li>Process your credentials</li></ul></div><div className="recovery-ai-card"><span>NEED AN EXPLANATION?</span><p>Trustos AI can help explain each step.</p><Link to="/app/assistant">Ask Trustos AI <ArrowUpRight size={16} /></Link></div></aside></div>}
  </div>;
}
