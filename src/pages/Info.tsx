import { ArrowLeft, ArrowUpRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Eyebrow } from '../components/Shared';
import { SiteFooter, SiteHeader } from './Landing';

type InfoType = 'security' | 'privacy' | 'terms';
const content: Record<InfoType, { index: string; title: string; subtitle: string; items: { heading: string; text: string }[] }> = {
  security: {
    index: 'SECURITY / 01', title: 'Security, without the theatre.',
    subtitle: 'Trustos is being designed around careful boundaries, explicit user decisions, and independently reviewable outcomes. This interface preview is not a production security system.',
    items: [
      { heading: 'No secrets requested', text: 'Never enter a recovery phrase, private key, or wallet password here. The current guided walkthrough only asks for a high-level issue category and what non-sensitive context you have.' },
      { heading: 'Local preview authentication', text: 'Accounts and verification codes are handled by a temporary in-memory development API. No production identity provider is connected; accounts disappear when the server restarts.' },
      { heading: 'Recovery is not running', text: 'This release does not access wallets, perform blockchain recovery computation, query a blockchain, or move funds. Walkthrough completion is not asset recovery.' },
      { heading: 'Verification should be independent', text: 'When real recovery functionality is built, relevant results should be checkable against trusted independent sources. No real verification has been performed in this preview.' },
    ],
  },
  privacy: {
    index: 'PRIVACY / 02', title: 'Know the boundary.',
    subtitle: 'The long-term design intent is to keep sensitive recovery computation on the user’s device where the architecture permits. The current preview is a demonstration of the interface and its boundaries.',
    items: [
      { heading: 'What stays in this browser', text: 'The selected theme and non-sensitive demo activity labels are stored in this browser. Assistant messages and recovery form selections are kept in page memory and are not sent to an AI or recovery service.' },
      { heading: 'What the local API handles', text: 'The local development API holds preview account names, email addresses, salted password hashes, verification codes, and session tokens in server memory. It resets on restart. Do not use real account passwords.' },
      { heading: 'No external delivery', text: 'No emails are sent. Verification and password reset codes appear on screen solely to exercise the UI. No Google sign-in, blockchain connection, or analytics backend is connected.' },
      { heading: 'Sensitive information', text: 'Do not enter passwords outside authentication forms, recovery phrases, private keys, or other secrets into the recovery or assistant interfaces. No preview should be treated as a secure credential vault.' },
    ],
  },
  terms: {
    index: 'TERMS / 03', title: 'Preview Terms & Conditions.',
    subtitle: 'These terms describe use of the Trustos interface preview. They are not a production financial-services agreement or a promise of recovery capability.',
    items: [
      { heading: 'An interface demonstration', text: 'By creating a local account, you understand that this preview is for reviewing the user experience. It does not recover assets, provide a production AI service, send emails, perform financial transactions, or verify blockchain activity.' },
      { heading: 'Your responsibility', text: 'Use only non-sensitive demonstration information. Do not submit seed phrases, private keys, real wallet credentials, or passwords you use elsewhere. Do not rely on the preview for decisions involving funds.' },
      { heading: 'Temporary account and session', text: 'The local development API holds account data only while the server is running. Restarting it clears accounts and sessions. It is not designed or audited for production security.' },
      { heading: 'Changes before release', text: 'Functionality, information handling, and production terms may change before a real release. Production integrations require separate review and approval.' },
    ],
  },
};
export function InfoPage({ type }: { type: InfoType }) {
  const page = content[type];
  return <div className="marketing-page info-page"><SiteHeader /><main><div className="container info-container"><Link to="/" className="info-back"><ArrowLeft size={17} /> Back to home</Link><div className="info-hero"><Eyebrow>{page.index}</Eyebrow><h1>{page.title}</h1><p>{page.subtitle}</p></div>
    <div className="info-columns"><aside className="info-sidebar"><span>ON THIS PAGE</span>{page.items.map((item, i) => <a href={`#info-${i}`} key={item.heading}><span>{String(i + 1).padStart(2, '0')}</span>{item.heading}</a>)}<div className="info-side-note"><Info size={17} /><span>Local development preview. No live recovery or production auth.</span></div></aside><div className="info-articles">{page.items.map((item, i) => <section id={`info-${i}`} key={item.heading}><span>{String(i + 1).padStart(2, '0')} / 04</span><h2>{item.heading}</h2><p>{item.text}</p></section>)}<div className="info-final"><strong>Have a question about the process?</strong><p>Explore the guided workspace and learn how the experience is intended to work.</p><Link to="/signup?next=%2Fapp%2Frecovery">Explore the preview <ArrowUpRight size={17} /></Link></div></div></div>
  </div></main><SiteFooter /></div>;
}
