import { ArrowRight, ArrowUpRight, Check, ChevronRight, CircleHelp, Clock3, ExternalLink, Fingerprint, MessageCircleMore, ScanSearch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActualWalletCard, FreeServiceCard } from '../components/ServiceCards';
import { ArrowLink, Eyebrow } from '../components/Shared';
import { useAuth } from '../context/AuthContext';
import { activityIssueName, useDemoActivity } from '../services/demoActivity';
import { actualWalletRecovery, freeServices, serviceWalkthroughPath, transactionVerificationUrl } from '../services/serviceCatalog';

const tools = [
  { title: 'Trustos AI', number: '01', text: 'Explore prepared guidance about the process, without sharing secrets.', icon: MessageCircleMore, path: '/app/assistant', label: 'Ask a question' },
  { title: 'Verification checklist', number: '02', text: 'Review what to check before you trust any claimed outcome.', icon: ScanSearch, path: '/app/verification', label: 'Explore the checklist' },
];

export function DashboardPage() {
  const { user } = useAuth();
  const activity = useDemoActivity(user?.id || '');
  const firstName = user?.name.trim().split(/\s+/)[0] || 'there';
  return <div className="dashboard-page">
    <div className="page-intro"><Eyebrow index="01 /">YOUR WORKSPACE</Eyebrow><h1>Good to have you here, <span>{firstName}.</span></h1><p>Explore the help available, understand the difference between free support and actual wallet recovery, and choose a careful next step.</p></div>
    <div className="dashboard-feature"><div className="dashboard-feature-copy"><span className="feature-kicker"><span /> THE PLACE TO BEGIN</span><h2>Start with clarity.<br />Stay in control.</h2><p>Six support services cost nothing. Actual Wallet Recovery is separate, with a 10% fee only when Trustos successfully recovers the wallet.</p><div className="dashboard-feature-actions"><a href="#free-support" className="btn btn-primary">See free services <ArrowUpRight size={17} aria-hidden="true" /></a><Link className="feature-secondary-link" to="/app/assistant">Ask Trustos AI <ArrowRight size={16} aria-hidden="true" /></Link></div></div><div className="dashboard-feature-visual" aria-label="Illustrative Identify, Recover, Verify flow"><span className="feature-visual-label">YOUR GUIDED PATH <span>01 — 03</span></span><div className="feature-path-line" /><div className="feature-path-step feature-path-step--active"><span>01</span><div><strong>Identify</strong><small>Get oriented</small></div><ChevronRight size={17} /></div><div className="feature-path-step"><span>02</span><div><strong>Recover</strong><small>Understand the approach</small></div><ChevronRight size={17} /></div><div className="feature-path-step"><span>03</span><div><strong>Verify</strong><small>Review the boundaries</small></div><ChevronRight size={17} /></div><div className="feature-visual-foot">YOUR PATH / THREE STAGES</div></div></div>

    <section className="dashboard-services" id="free-support" aria-labelledby="dashboard-free-title"><div className="dashboard-section-header"><div><span className="eyebrow">FREE SUPPORT / 06</span><h2 id="dashboard-free-title">What can we help you explore?</h2></div><span>SIX SERVICES / NO COST</span></div><p className="dashboard-services-note">These services are provided at no cost. Choose an area to explore an example path; the walkthrough does not submit a request or perform recovery.</p><div className="service-card-grid">{freeServices.map((service, index) => <FreeServiceCard key={service.id} service={service} index={index} to={serviceWalkthroughPath(service.id)} />)}</div></section>
    <section className="dashboard-paid-service" aria-labelledby="actual-wallet-title"><ActualWalletCard to={serviceWalkthroughPath(actualWalletRecovery.id)} /></section>

    <section className="dashboard-tools" aria-labelledby="dashboard-tools-title"><div className="dashboard-section-header"><div><span className="eyebrow">TOOLS & GUIDANCE</span><h2 id="dashboard-tools-title">Continue with confidence.</h2></div><span>CHOOSE A NEXT STEP / 03</span></div>
      <div className="destination-grid">{tools.map(({ title, number, text, icon: Icon, path, label }) => <Link to={path} key={number} className="destination-card"><div className="destination-card-top"><span>{number} / 03</span><Icon size={22} strokeWidth={1.5} aria-hidden="true" /></div><h3>{title}</h3><p>{text}</p><span className="destination-card-link">{label}<ArrowUpRight size={17} aria-hidden="true" /></span></Link>)}
        <a href={transactionVerificationUrl} className="destination-card destination-card--external" target="_blank" rel="noopener noreferrer" aria-label="Verify Transaction on the existing Trustos site, opens in a new tab"><div className="destination-card-top"><span>03 / 03</span><ExternalLink size={22} strokeWidth={1.5} aria-hidden="true" /></div><h3>Verify Transaction</h3><p>Open the existing Trustos verification website in a new tab. It is separate from this workspace.</p><span className="destination-card-link">Open verification site <ExternalLink size={17} aria-hidden="true" /></span></a>
      </div>
    </section>

    <div className="dashboard-bottom-grid"><section className="workspace-panel activity-panel"><div className="workspace-panel-heading"><div><Clock3 size={19} strokeWidth={1.6} aria-hidden="true" /><h3>Your activity</h3></div><span>THIS BROWSER</span></div>{activity.length > 0 ? <div className="activity-list">{activity.slice(0, 3).map((item) => <div className="activity-item" key={item.id}><div className="activity-item-icon"><Check size={16} /></div><div><strong>{item.event === 'completed' ? 'Walkthrough completed' : 'Walkthrough started'}</strong><span>{activityIssueName(item.issue)} · {new Date(item.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span></div></div>)}</div> : <div className="empty-activity"><span className="empty-activity-icon"><Clock3 size={21} strokeWidth={1.5} /></span><strong>No activity yet.</strong><p>Your walkthrough activity on this device will appear here.</p></div>}</section>
      <section className="workspace-panel safety-panel"><div className="workspace-panel-heading"><div><Fingerprint size={20} strokeWidth={1.6} aria-hidden="true" /><h3>Before you begin</h3></div><span>GOOD TO KNOW</span></div><div className="safety-panel-content"><h3>Your recovery phrase<br />is never a starting point here.</h3><p>Never paste a seed phrase, private key, or wallet password here. Keep that information to yourself.</p><div className="safety-panel-links"><ArrowLink to="/app/verification">Understand verification</ArrowLink><Link to="/security">Security approach <ArrowUpRight size={16} aria-hidden="true" /></Link></div></div><div className="safety-panel-question"><CircleHelp size={16} /> Not sure where to start? <Link to="/app/assistant">Ask the guide</Link></div></section>
    </div>
  </div>;
}
