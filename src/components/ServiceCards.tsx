import { ArrowUpRight, CircleHelp, HardDrive, KeyRound, ScanSearch, ShieldAlert, WalletCards, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { actualWalletRecovery, type FreeService, type ServiceId } from '../services/serviceCatalog';

const serviceIcons: Record<ServiceId, LucideIcon> = {
  'access-recovery': KeyRound,
  'device-backup-recovery': HardDrive,
  'security-incident-recovery': ShieldAlert,
  'transaction-investigation': ScanSearch,
  'transfer-asset-assessment': WalletCards,
  'scam-fraud-assistance': CircleHelp,
  'actual-wallet-recovery': WalletCards,
};

export function ServiceGlyph({ id, size = 22 }: { id: ServiceId; size?: number }) {
  const Icon = serviceIcons[id];
  return <Icon size={size} strokeWidth={1.65} aria-hidden="true" />;
}

export function FreeServiceCard({ service, to, index }: { service: FreeService; to: string; index: number }) {
  return <Link className="service-card" to={to} aria-label={`Explore ${service.name} walkthrough, free`}>
    <div className="service-card-top"><span className="service-card-icon"><ServiceGlyph id={service.id} /></span><span className="service-badge service-badge--free">FREE</span></div>
    <span className="service-card-number">{String(index + 1).padStart(2, '0')} / 06</span>
    <h3>{service.name}</h3><p>{service.summary}</p>
    <span className="service-card-action">Explore walkthrough <ArrowUpRight size={16} aria-hidden="true" /></span>
  </Link>;
}

export function ActualWalletCard({ to }: { to: string }) {
  return <article className="actual-wallet-card" aria-labelledby="actual-wallet-title">
    <div className="actual-wallet-copy"><div className="actual-wallet-eyebrow"><span className="actual-wallet-icon"><ServiceGlyph id={actualWalletRecovery.id} size={20} /></span><span>ONLY PAID SERVICE</span></div>
      <h3 id="actual-wallet-title">{actualWalletRecovery.name}</h3><p>{actualWalletRecovery.summary} The six Free Support services have no fee.</p>
      <Link to={to}>Explore the walkthrough <ArrowUpRight size={16} aria-hidden="true" /></Link>
    </div>
    <div className="actual-wallet-fee"><span>SUCCESS-BASED / NOT UPFRONT</span><strong>10%</strong><p>{actualWalletRecovery.feeExplanation}</p><small>Opening this walkthrough does not start recovery or collect payment.</small></div>
  </article>;
}
