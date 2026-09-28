import { useEffect, useRef, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronRight, CircleHelp, Fingerprint, LockKeyhole, Menu, ScanSearch, ShieldAlert, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TrustosCore } from '../components/TrustosCore';
import { CommunitySection } from '../components/CommunitySection';
import { ActualWalletCard, FreeServiceCard } from '../components/ServiceCards';
import { actualWalletRecovery, freeServices, serviceEntryPath } from '../services/serviceCatalog';
import { ArrowLink, Brand, Eyebrow, ThemeToggle } from '../components/Shared';
import { useAuth } from '../context/AuthContext';

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const { user } = useAuth();
  return <header className="site-header"><div className="site-header-inner container">
    <Brand />
    <nav id="site-main-nav" className={`site-nav ${open ? 'site-nav--open' : ''}`} aria-label="Main navigation">
      <a href="/#how-it-works" onClick={() => setOpen(false)}>How it works</a>
      <a href="/#services" onClick={() => setOpen(false)}>Services</a>
      <a href="/#security" onClick={() => setOpen(false)}>Security</a>
      <div className="site-nav-actions">
        <ThemeToggle />
        <Link className="nav-login" to={user ? '/app' : '/login'} onClick={() => setOpen(false)}>{user ? 'Workspace' : 'Log in'}</Link>
        <a className="btn btn-primary btn-nav" href="/#services" onClick={() => setOpen(false)}>Explore services <ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
    </nav>
    <div className="mobile-header-actions"><ThemeToggle small /><button ref={menuButton} type="button" className="icon-button mobile-menu-button" aria-controls="site-main-nav" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button></div>
  </div></header>;
}
export function SiteFooter() {
  return <footer className="site-footer"><div className="container">
    <div className="footer-top"><div><Brand /><p>Guidance, recovery, and verification,<br />designed with control in mind.</p></div>
      <div className="footer-link-groups"><div><span>EXPLORE</span><a href="/#how-it-works">How it works</a><a href="/#services">Services</a><a href="/#community">Community</a><Link to="/signup?next=%2Fapp%2Frecovery">Explore the walkthrough</Link><Link to="/login">Log in</Link></div>
      <div><span>INFORMATION</span><Link to="/security">Security</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Trustos by LinuxBoss</span><span>RECOVERY • GUIDANCE • VERIFICATION</span></div>
  </div></footer>;
}

const principles = [
  { number: '01', icon: Fingerprint, title: 'Private by design.', text: 'Sensitive recovery computation is designed to remain on your device where the architecture permits.' },
  { number: '02', icon: LockKeyhole, title: 'Boundaries matter.', text: 'Every step should be deliberate, with clear limits on what the system can and cannot do.' },
  { number: '03', icon: ScanSearch, title: 'Built to be checked.', text: 'Relevant outcomes should be reviewable through independent sources—not taken on faith.' },
];
const steps = [
  { number: '01', title: 'Identify', small: 'Start with the right question', text: 'Describe the issue without sharing credentials or recovery phrases. Get a clear view of what needs attention.' },
  { number: '02', title: 'Recover', small: 'Take an intentional path', text: 'Understand the available approach before any sensitive process or action is considered.' },
  { number: '03', title: 'Verify', small: 'Make the result make sense', text: 'Review what happened and independently confirm anything that matters before proceeding.' },
];

export function LandingPage() {
  const { user } = useAuth();
  const recoveryLink = user ? '/app/recovery' : '/signup?next=%2Fapp%2Frecovery';
  return <div className="marketing-page"><SiteHeader /><main>
    <section className="hero-section"><div className="container">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hero-eyebrow"><span className="hero-eyebrow-line" />A MORE DELIBERATE PATH FORWARD</div>
          <h1>Recovery starts<br />with <span>clarity.</span></h1>
          <p className="hero-description">Understand the issue. Explore what comes next. Know what to verify. Trustos brings guidance and control to a process that deserves both.</p>
          <div className="hero-actions"><a className="btn btn-primary btn-lg" href="#services">Explore services <ArrowUpRight size={19} aria-hidden="true" /></a><a className="btn btn-outline btn-lg" href="#how-it-works">See how it works <ArrowRight size={18} aria-hidden="true" /></a></div>
          <div className="hero-caption"><span className="hero-caption-icon"><Check size={15} aria-hidden="true" /></span><span>Six free support services. A separate success-only wallet recovery fee.</span></div>
        </div>
        <TrustosCore />
      </div>
      <div className="hero-footnote"><span>TRUSTOS / BY LINUXBOSS</span><span>01 — A CLEARER RECOVERY EXPERIENCE</span><a href="#principles" aria-label="Scroll to Trustos principles">EXPLORE THE APPROACH <ArrowDownRight size={15} aria-hidden="true" /></a></div>
    </div></section>

    <section className="principles-section section-space" id="principles"><div className="container">
      <div className="section-head"><div><Eyebrow index="01 /">OUR PRINCIPLES</Eyebrow><h2>Trust is built<br />into the details.</h2></div><p>Recovery is personal. The experience around it should be clear about what it does, what it protects, and what you can verify.</p></div>
      <div className="principle-grid">{principles.map(({ number, icon: Icon, title, text }) => <article className="principle-card" key={number}><div className="principle-card-top"><span>{number} / 03</span><Icon size={25} strokeWidth={1.5} aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p></article>)}</div>
    </div></section>

    <section className="how-section section-space" id="how-it-works"><div className="container">
      <div className="section-head"><div><Eyebrow index="02 /">THE PROCESS</Eyebrow><h2>One step at<br />a time.</h2></div><p>Instead of dropping you into a technical workflow, Trustos starts by helping you understand where you are—and what follows.</p></div>
      <div className="how-flow-head"><span>FROM UNCERTAINTY</span><div className="how-flow-rule" /><span>TO AN INFORMED NEXT STEP</span></div>
      <div className="how-grid">{steps.map((step, index) => <div className="how-card" key={step.number}>
        <div className="how-card-top"><span className="how-card-number">{step.number}</span>{index < 2 ? <ArrowRight className="how-arrow" size={20} strokeWidth={1.4} aria-hidden="true" /> : <span className="how-final-mark"><Check size={17} aria-hidden="true" /></span>}</div>
        <span className="how-card-mini">{step.small}</span><h3>{step.title}<span>.</span></h3><p>{step.text}</p>
      </div>)}</div>
      <div className="how-bottom"><span>YOU STAY IN CONTROL AT EACH STAGE</span><ArrowLink to={recoveryLink}>Explore the guided experience</ArrowLink></div>
    </div></section>

    <section className="services-section section-space" id="services" aria-labelledby="services-title"><div className="container">
      <div className="section-head services-head"><div><Eyebrow index="03 /">THE SERVICES</Eyebrow><h2 id="services-title">The right help.<br /><span>A clear boundary.</span></h2></div><p>Six support services are free. Actual Wallet Recovery is separate, with a fee only when Trustos successfully recovers the wallet.</p></div>
      <div className="services-group-head"><div><span className="service-group-kicker"><span /> FREE SUPPORT / 06</span><h3>Help that stays free.</h3></div><p>These services are provided at no cost.</p></div>
      <div className="service-card-grid">{freeServices.map((service, i) => <FreeServiceCard key={service.id} service={service} index={i} to={serviceEntryPath(service.id, !!user)} />)}</div>
      <ActualWalletCard to={serviceEntryPath(actualWalletRecovery.id, !!user)} />
      <p className="services-boundary">The linked walkthrough explains each path; it does not submit a request or perform a recovery.</p>
    </div></section>

    <section className="privacy-section section-space" id="security"><div className="container"><div className="privacy-panel">
      <div className="privacy-content"><Eyebrow index="04 /">PRIVACY & SECURITY</Eyebrow><h2>Keep sensitive work<br /><span>close to home.</span></h2><p>Sensitive recovery computation is designed to stay on your device where the architecture permits. When a service is needed, that boundary should be visible—not hidden behind a promise.</p>
        <Link to="/security" className="privacy-learn">Explore our security approach <ArrowUpRight size={17} aria-hidden="true" /></Link>
        <span className="privacy-footnote">DESIGN INTENT · ARCHITECTURE DEPENDENT</span>
      </div>
      <div className="privacy-diagram" aria-label="Conceptual data boundary: your device handles sensitive steps, only necessary information reaches services">
        <div className="diagram-head"><span>INFORMATION BOUNDARY</span><span>CONCEPTUAL VIEW / 01</span></div>
        <div className="diagram-device"><span className="diagram-device-icon"><span /><span /><span /></span><div><small>YOUR DEVICE</small><strong>Sensitive steps, kept close.</strong></div><span className="diagram-device-corner">01</span></div>
        <div className="diagram-connector"><i /><span>ONLY REQUIRED INFORMATION</span><i /></div>
        <div className="diagram-service"><div className="diagram-service-symbol"><span /><span /><span /></div><div><small>TRUSTOS SERVICES</small><strong>Clear, limited boundaries.</strong></div><span className="diagram-device-corner">02</span></div>
        <div className="diagram-caption"><span className="diagram-caption-dot" />Information boundaries depend on the recovery method.</div>
      </div>
    </div></div></section>

    <section className="verification-section section-space" id="verification"><div className="container"><div className="verification-grid">
      <div className="verification-visual"><div className="verification-visual-top"><span>REVIEW FRAMEWORK</span><span>QUESTIONS WORTH ASKING</span></div>
        <div className="review-card"><div className="review-card-kicker"><div className="review-card-glyph"><ScanSearch size={23} strokeWidth={1.4} aria-hidden="true" /></div><span>REVIEW BEFORE YOU RELY ON IT</span></div>
          <div className="review-card-row"><span>01</span><strong>Understand the input</strong><CircleHelp size={18} strokeWidth={1.5} aria-hidden="true" /></div>
          <div className="review-card-row"><span>02</span><strong>Review the proposed steps</strong><CircleHelp size={18} strokeWidth={1.5} aria-hidden="true" /></div>
          <div className="review-card-row"><span>03</span><strong>Check against independent sources</strong><CircleHelp size={18} strokeWidth={1.5} aria-hidden="true" /></div>
          <div className="review-card-bottom"><span>INDEPENDENT CHECKS MATTER</span><span>TRANSPARENCY BY DESIGN <ArrowUpRight size={13} aria-hidden="true" /></span></div>
        </div>
        <div className="verification-visual-foot"><span>INPUT</span><ChevronRight size={16} /><span>PROCESS</span><ChevronRight size={16} /><span>INDEPENDENT CHECK</span></div>
      </div>
      <div className="verification-content"><Eyebrow index="05 /">VERIFICATION</Eyebrow><h2>Don't just trust<br />the outcome.<br /><span>Understand it.</span></h2><p>Real confidence comes from being able to examine the process and check what matters using sources you trust. Trustos is designed to make that review part of the journey—not an afterthought.</p><div className="verification-principle"><ShieldAlert size={20} strokeWidth={1.5} aria-hidden="true" /><span>Before you rely on any recovery claim, make sure you can check the important details yourself.</span></div><ArrowLink to="/security">Read about verification</ArrowLink></div>
    </div></div></section>

    <CommunitySection />

    <section className="landing-cta-section"><div className="container"><div className="landing-cta"><div className="landing-cta-pattern" aria-hidden="true"><div /><div /><div /></div><div><Eyebrow index="07 /">YOUR NEXT STEP</Eyebrow><h2>Start with the right<br />question.</h2><p>Explore a guided path before taking action. This walkthrough does not recover a wallet.</p></div><Link to={recoveryLink} className="btn btn-primary btn-lg">Explore the walkthrough <ArrowUpRight size={19} aria-hidden="true" /></Link></div></div></section>
  </main><SiteFooter /></div>;
}
