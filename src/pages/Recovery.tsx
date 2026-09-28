import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, CheckCircle2, ChevronRight, CircleHelp, Monitor, SearchCheck } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { ServiceGlyph } from '../components/ServiceCards';
import { Eyebrow, InlineNotice } from '../components/Shared';
import { useAuth } from '../context/AuthContext';
import { recordDemoActivity } from '../services/demoActivity';
import { actualWalletRecovery, freeServices, getService, type ServiceDefinition, type ServiceId } from '../services/serviceCatalog';

type Known = 'public' | 'provider' | 'unsure';
const knownOptions: { id: Known; label: string }[] = [
  { id: 'public', label: 'A public address or transaction ID' },
  { id: 'provider', label: 'The wallet or service name' },
  { id: 'unsure', label: "I'm not sure yet" },
];
const stepNames = ['Identify', 'Recover', 'Verify'];

function ServiceChoice({ service, selected, onSelect }: { service: ServiceDefinition; selected: boolean; onSelect: () => void }) {
  const paid = service.id === actualWalletRecovery.id;
  return <label className={`issue-choice service-choice ${paid ? 'service-choice--paid' : ''} ${selected ? 'issue-choice--selected' : ''}`}>
    <input type="radio" name="service" value={service.id} checked={selected} onChange={onSelect} />
    <span className="issue-icon"><ServiceGlyph id={service.id} /></span>
    <span className="issue-text"><strong>{service.name}</strong><small>{service.summary}</small>{paid ? <span className="recovery-price-tag">{actualWalletRecovery.feeLabel}</span> : <span className="service-badge service-badge--free">FREE</span>}</span>
    <span className="radio-indicator" aria-hidden="true" />
  </label>;
}

export function RecoveryPage() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [step, setStep] = useState(0);
  const [issue, setIssue] = useState<ServiceId | null>(() => getService(params.get('service'))?.id ?? null);
  const [known, setKnown] = useState<Known | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');
  const service = getService(issue);
  const paid = issue === actualWalletRecovery.id;

  function nextStep() {
    setError('');
    if (!issue) { setError('Choose the service you want to explore.'); return; }
    if (!known) { setError('Select what non-sensitive information you already have.'); return; }
    if (!acknowledged) { setError('Please confirm that you understand the scope of this walkthrough.'); return; }
    recordDemoActivity(user?.id || '', issue, 'started'); setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function continueToReview() {
    if (!issue) { setError('Return to the first step to choose a service.'); return; }
    setError(''); setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function finish() {
    if (!reviewed) { setError('Please acknowledge what this walkthrough did and did not do.'); return; }
    if (issue) recordDemoActivity(user?.id || '', issue, 'completed');
    setCompleted(true); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function restart() { setStep(0); setIssue(null); setKnown(null); setAcknowledged(false); setReviewed(false); setCompleted(false); setError(''); }

  return <div className="recovery-page">
    <div className="page-intro page-intro--short"><Eyebrow index="02 /">GUIDED RECOVERY</Eyebrow><h1>A better place to begin.</h1><p>Choose an area of support, explore a suggested path, and review what you would need to check before taking action.</p></div>
    <div className="recovery-scope"><Monitor size={18} aria-hidden="true" /><p><strong>Frontend walkthrough.</strong> This page does not submit a support request, access a wallet, verify a transaction, recover assets, or collect payment.</p></div>
    <div className="recovery-steps" aria-label="Recovery walkthrough stages">{stepNames.map((name, i) => <div key={name} className={`recovery-step ${i === step ? 'recovery-step--current' : ''} ${i < step || completed ? 'recovery-step--past' : ''}`} aria-current={i === step && !completed ? 'step' : undefined}><div className="recovery-step-number">{i < step || completed ? <Check size={17} aria-hidden="true" /> : `0${i + 1}`}</div><span>{name}</span>{i < 2 && <span className="recovery-step-connector" />}</div>)}</div>

    {completed ? <div className="recovery-complete"><div className="complete-glyph"><Check size={29} strokeWidth={1.6} /></div><Eyebrow>WALKTHROUGH COMPLETE</Eyebrow><h2>You've reviewed the path.<br /><span>No recovery was performed.</span></h2><p>You reviewed a suggested path for {service?.name || 'a service'}. No accounts, funds, transactions, or blockchain data were accessed.</p>{paid && <p className="completion-fee-note">No fee was incurred here. The 10% fee applies only if Trustos actually performs a successful wallet recovery.</p>}<div className="complete-recap"><span><CheckCircle2 size={18} /> Service selected: {service?.name}</span><span><CheckCircle2 size={18} /> Suggested steps reviewed</span><span><CircleHelp size={18} /> No result to independently verify</span></div><div className="recovery-complete-actions"><button type="button" className="btn btn-primary" onClick={restart}>Start a new walkthrough <ArrowRight size={17} /></button><Link to="/app/verification" className="btn btn-outline">About verification <ArrowUpRight size={17} /></Link></div></div> : <div className="recovery-layout"><div className="recovery-main">
      {step === 0 && <div className="recovery-card"><div className="recovery-card-header"><div><Eyebrow>STEP 01 / IDENTIFY</Eyebrow><h2>What would you like to explore?</h2><p>Choose a service area. No private information is needed to review the path.</p></div><span className="recovery-card-counter">01 / 03</span></div>
        <fieldset className="choice-group"><legend>Choose a service <span>REQUIRED</span></legend>
          <div className="recovery-choice-heading"><span>FREE SUPPORT</span><small>These six services have no fee.</small></div>
          <div className="issue-choices">{freeServices.map((item) => <ServiceChoice key={item.id} service={item} selected={issue === item.id} onSelect={() => { setIssue(item.id); setError(''); }} />)}</div>
          <div className="recovery-choice-heading recovery-choice-heading--paid"><span>ONLY PAID SERVICE</span><small>Separate from Free Support</small></div>
          <ServiceChoice service={actualWalletRecovery} selected={paid} onSelect={() => { setIssue(actualWalletRecovery.id); setError(''); }} />
        </fieldset>
        <fieldset className="choice-group"><legend>What non-sensitive information do you have? <span>REQUIRED</span></legend><div className="known-choices">{knownOptions.map((item) => <label className={`known-choice ${known === item.id ? 'known-choice--selected' : ''}`} key={item.id}><input type="radio" name="known" checked={known === item.id} onChange={() => { setKnown(item.id); setError(''); }} /><span className="radio-indicator" />{item.label}</label>)}</div><small className="choice-help">Do not enter the information here. This only helps frame the next step.</small></fieldset>
        <label className="recovery-confirm"><input type="checkbox" checked={acknowledged} onChange={(event) => { setAcknowledged(event.target.checked); setError(''); }} /><span>I understand this is a frontend walkthrough: no case is submitted, no account is accessed, no funds are recovered, and no transaction is verified.</span></label>
        {error && <InlineNotice type="error">{error}</InlineNotice>}
        <div className="recovery-card-footer"><span>YOU CAN CHANGE YOUR SELECTIONS LATER</span><button type="button" onClick={nextStep} className="btn btn-primary">Continue to explore <ArrowRight size={17} aria-hidden="true" /></button></div>
      </div>}
      {step === 1 && <div className="recovery-card"><div className="recovery-card-header"><div><Eyebrow>STEP 02 / RECOVER</Eyebrow><h2>Understand the approach.</h2><p>These questions and checks are guidance, not a recovery operation.</p></div><span className="recovery-card-counter">02 / 03</span></div>
        <div className="recovery-summary"><div><span>YOU SELECTED</span><strong>{service?.name}</strong><small className={paid ? 'recovery-summary-fee' : 'recovery-summary-free'}>{paid ? actualWalletRecovery.feeLabel : 'FREE SUPPORT / NO COST'}</small></div><ChevronRight size={19} /><div><span>YOU HAVE</span><strong>{knownOptions.find((item) => item.id === known)?.label}</strong></div></div>
        <div className="recovery-plan"><div className="recovery-plan-heading"><Monitor size={20} strokeWidth={1.6} /><span>A SUGGESTED PATH</span></div><p>{service?.guidance}</p><ol>{service?.checks.map((text, i) => <li key={text}><span>0{i + 1}</span>{text}</li>)}</ol></div>
        {paid && <div className="recovery-fee-note"><strong>{actualWalletRecovery.feeExplanation}</strong><span>Free Support remains free. This walkthrough cannot perform wallet recovery or take payment.</span></div>}
        {error && <InlineNotice type="error">{error}</InlineNotice>}
        <div className="recovery-card-footer"><button type="button" className="recovery-back" onClick={() => { setStep(0); setError(''); }}><ArrowLeft size={16} /> Edit selections</button><button type="button" className="btn btn-primary" onClick={continueToReview}>Continue to review <ArrowRight size={17} /></button></div>
      </div>}
      {step === 2 && <div className="recovery-card"><div className="recovery-card-header"><div><Eyebrow>STEP 03 / VERIFY</Eyebrow><h2>Review what happened.</h2><p>Distinguish the guidance you reviewed from actions that were actually taken.</p></div><span className="recovery-card-counter">03 / 03</span></div>
        <div className="recovery-result-label"><span className="status-small-dot" /> WALKTHROUGH SUMMARY</div>
        <div className="verify-facts"><div><span>01</span><div><strong>Service area selected</strong><p>{service?.name} — no case, credentials, or wallet data were submitted.</p></div><CheckCircle2 size={19} /></div><div><span>02</span><div><strong>Guidance shown</strong><p>You reviewed a suggested path. No support action or recovery operation was performed.</p></div><CheckCircle2 size={19} /></div><div><span>03</span><div><strong>Independent verification</strong><p>Not performed. There is no recovery result, address, or transaction here to validate.</p></div><CircleHelp size={19} /></div></div>
        <label className="recovery-confirm"><input type="checkbox" checked={reviewed} onChange={(event) => { setReviewed(event.target.checked); setError(''); }} /><span>I understand this walkthrough did not produce or verify a recovery result.</span></label>
        {error && <InlineNotice type="error">{error}</InlineNotice>}
        <div className="recovery-card-footer"><button type="button" className="recovery-back" onClick={() => { setStep(1); setError(''); }}><ArrowLeft size={16} /> Back to approach</button><button type="button" className="btn btn-primary" onClick={finish}>Complete walkthrough <Check size={18} /></button></div>
      </div>}
    </div><aside className="recovery-aside"><div className="recovery-help-card"><span className="aside-icon"><SearchCheck size={23} strokeWidth={1.5} /></span><h3>A good recovery process starts with good boundaries.</h3><p>No one needs your private key or recovery phrase to help you understand your options.</p><div className="recovery-help-separator" /><span>WHAT YOU CAN DO HERE</span><ul><li><Check size={15} /> Classify an issue</li><li><Check size={15} /> Explore possible next steps</li><li><Check size={15} /> Learn what to verify</li></ul><div className="recovery-help-separator" /><span>WHAT THIS WALKTHROUGH DOES NOT DO</span><ul className="recovery-does-not"><li>Recover wallet access or funds</li><li>Check blockchain data</li><li>Process your credentials</li></ul></div><div className="recovery-ai-card"><span>NEED AN EXPLANATION?</span><p>Trustos AI can help explain each step.</p><Link to="/app/assistant">Ask Trustos AI <ArrowUpRight size={16} /></Link></div></aside></div>}
  </div>;
}
