import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Eyebrow } from '../components/Shared';
import { SiteFooter, SiteHeader } from './Landing';
import { actualWalletRecovery, freeServices } from '../services/serviceCatalog';

type InfoType = 'security' | 'privacy' | 'terms';
const content: Record<InfoType, { index: string; title: string; subtitle: string; items: { heading: string; text: string }[] }> = {
  security: {
    index: 'SECURITY / 01', title: 'Security, without the theatre.',
    subtitle: 'Trustos is being designed around careful boundaries, explicit user decisions, and independently reviewable outcomes.',
    items: [
      { heading: 'No secrets requested', text: 'Never enter a recovery phrase, private key, or wallet password here. The guided walkthrough asks only which service area you want to explore and what non-sensitive context you have.' },
      { heading: 'Account access', text: 'Authentication is not connected yet. The account screens cannot create accounts, sign in, confirm an email address, or reset a password. Email confirmation and password-reset links are not sent from this version.' },
      { heading: 'Guidance is not recovery', text: 'The guided walkthrough does not access wallets, move funds, compute recovery results, or verify blockchain activity. Finishing the steps is not asset recovery.' },
      { heading: 'Verification should be independent', text: 'If you receive a recovery claim, inspect the evidence and check relevant public details with a trusted independent source. A walkthrough is not proof of a result.' },
    ],
  },
  privacy: {
    index: 'PRIVACY / 02', title: 'Know the boundary.',
    subtitle: 'The design intent is to keep sensitive recovery computation on your device where the architecture permits. Know what this interface stores before you continue.',
    items: [
      { heading: 'What stays in this browser', text: 'Your theme choice and non-sensitive walkthrough activity are stored in this browser. Guide messages and walkthrough selections remain in page memory and clear on refresh; they are not sent to an AI or recovery service.' },
      { heading: 'Account information', text: 'The former development account service has been removed. There is no connected authentication provider. Information typed into the account forms stays in page memory; no account, password record, or session is created here.' },
      { heading: 'Email links', text: 'The future account-confirmation and password-reset flows will use email links. This version does not send those links. Google sign-in and email authentication are both unavailable until an authentication provider is connected.' },
      { heading: 'Sensitive information', text: 'Do not enter recovery phrases, private keys, passwords, or other secrets into the recovery or guide interfaces. Do not treat a guided conversation as a secure credential vault.' },
    ],
  },
  terms: {
    index: 'TERMS / 03', title: 'Terms & Conditions.',
    subtitle: 'These terms describe use of the current guided interface. It does not provide financial services or promise recovery of assets.',
    items: [
      { heading: 'Using this experience', text: 'The account screens are present, but authentication is not connected, so they cannot grant access to the protected walkthrough or guide yet. The walkthrough does not recover assets, carry out transactions, or verify blockchain activity.' },
      { heading: 'Your responsibility', text: 'Only share non-sensitive context. Do not submit seed phrases, private keys, real wallet credentials, or passwords you use elsewhere. Do not treat the walkthrough as proof that anything was recovered.' },
      { heading: 'Account and session', text: 'No authentication provider is connected, and these forms do not create accounts or sessions. Do not use them to store or share wallet information.' },
      { heading: 'Services and fees', text: `The ${freeServices.length} Free Support services cost nothing. Actual Wallet Recovery is separate: ${actualWalletRecovery.feeExplanation} This interface performs no wallet recovery, submits no support request, and collects no payment. Features and terms may change before a broader release.` },
    ],
  },
};
export function InfoPage({ type }: { type: InfoType }) {
  const page = content[type];
  return <div className="marketing-page info-page"><SiteHeader /><main><div className="container info-container"><Link to="/" className="info-back"><ArrowLeft size={17} /> Back to home</Link><div className="info-hero"><Eyebrow>{page.index}</Eyebrow><h1>{page.title}</h1><p>{page.subtitle}</p></div>
    <div className="info-columns"><aside className="info-sidebar"><span>ON THIS PAGE</span>{page.items.map((item, i) => <a href={`#info-${i}`} key={item.heading}><span>{String(i + 1).padStart(2, '0')}</span>{item.heading}</a>)}</aside><div className="info-articles">{page.items.map((item, i) => <section id={`info-${i}`} key={item.heading}><span>{String(i + 1).padStart(2, '0')} / 04</span><h2>{item.heading}</h2><p>{item.text}</p></section>)}<div className="info-final"><strong>Have a question about the process?</strong><p>The account screen explains that access will be available when authentication is connected.</p><Link to="/signup?next=%2Fapp%2Frecovery">View account screen <ArrowUpRight size={17} /></Link></div></div></div>
  </div></main><SiteFooter /></div>;
}
