/**
 * Frontend service descriptions, not service execution or proof of availability.
 * The guided UI does not submit a case, process wallet material, or collect fees.
 * Keep business-model wording here so public and authenticated pages agree.
 */
type ServiceDescription = Readonly<{
  id: string;
  name: string;
  summary: string;
  guidance: string;
  checks: readonly [string, string, string];
}>;

export const freeServices = [
  {
    id: 'access-recovery',
    name: 'Access Recovery',
    summary: 'Explore legitimate ways to regain access to an account or wallet you already control.',
    guidance: 'Start with the provider and the type of access you lost. A legitimate path depends on official methods, not sharing your secrets.',
    checks: [
      'Identify the wallet or provider without entering credentials here.',
      'Review that provider’s official access-restoration instructions.',
      'Avoid anyone who asks for your recovery phrase or promises guaranteed results.',
    ],
  },
  {
    id: 'device-backup-recovery',
    name: 'Device / Backup Recovery',
    summary: 'Explore existing devices, backups, or recoverable data that might help restore access.',
    guidance: 'An existing device or backup may change your options. Protect what you have before altering or replacing any data.',
    checks: [
      'List the devices or backups you control without uploading their contents.',
      'Check official restoration instructions before resetting or overwriting anything.',
      'Keep backup files, recovery phrases, and passwords out of this walkthrough.',
    ],
  },
  {
    id: 'security-incident-recovery',
    name: 'Security Incident Recovery',
    summary: 'Review ways to secure remaining access, change credentials, and document an incident.',
    guidance: 'When an account or wallet may be compromised, containment and evidence matter before any recovery decision.',
    checks: [
      'Use a trusted device and official channels to secure accounts you still control.',
      'Change exposed credentials where appropriate and review provider advice on sessions.',
      'Record non-sensitive evidence for reporting without sharing keys or passwords.',
    ],
  },
  {
    id: 'transaction-investigation',
    name: 'Transaction Investigation',
    summary: 'Understand a transfer and learn how to check its actual blockchain status independently.',
    guidance: 'A transaction needs the correct network and public reference before its status can be checked. This walkthrough makes no blockchain request.',
    checks: [
      'Identify the correct network and a public transaction reference.',
      'Check its status using a trusted independent explorer or the existing Trustos verification site.',
      'Compare the public destination and status yourself; never provide credentials.',
    ],
  },
  {
    id: 'transfer-asset-assessment',
    name: 'Transfer / Asset Recovery Assessment',
    summary: 'Assess whether a mistaken or problematic transfer has a legitimate path forward.',
    guidance: 'Some transfers cannot be reversed. Establish the network, destination, and provider before considering a possible next step.',
    checks: [
      'Preserve a public transaction reference and non-sensitive context.',
      'See whether the receiving service has an official support route.',
      'Treat recovery promises critically; an assessment is not a recovered transfer.',
    ],
  },
  {
    id: 'scam-fraud-assistance',
    name: 'Scam / Fraud Assistance',
    summary: 'Preserve evidence, review reporting options, and set realistic expectations.',
    guidance: 'Following a scam, protect remaining access and document what happened. No one can guarantee that lost funds will be returned.',
    checks: [
      'Secure remaining accounts using official provider guidance.',
      'Preserve public transaction references and other non-sensitive evidence.',
      'Consider reporting to your provider and relevant authorities; beware of follow-up scams.',
    ],
  },
] as const satisfies readonly ServiceDescription[];

export const actualWalletRecovery = {
  id: 'actual-wallet-recovery',
  name: 'Actual Wallet Recovery',
  summary: 'A separate wallet recovery operation, not a charge for guidance, investigation, or assessment.',
  guidance: 'This frontend cannot perform wallet recovery. Review the questions that would shape a legitimate process without entering private information.',
  checks: [
    'Establish legitimate ownership through appropriate future channels, not by sharing secrets here.',
    'Understand what a real process would require without entering phrases, keys, or passwords.',
    'A 10% fee would apply only if Trustos actually performs a successful wallet recovery.',
  ],
  feeLabel: '10% only on successful recovery',
  feeExplanation: '10% fee only when Trustos successfully recovers the wallet.',
} as const satisfies ServiceDescription & Readonly<{ feeLabel: string; feeExplanation: string }>;

export type FreeService = (typeof freeServices)[number];
export type ServiceId = FreeService['id'] | typeof actualWalletRecovery.id;
export type ServiceDefinition = FreeService | typeof actualWalletRecovery;
export const allServices: readonly ServiceDefinition[] = [...freeServices, actualWalletRecovery];
export const transactionVerificationUrl = 'https://trustos.wasmer.app';

export function getService(id: string | null | undefined): ServiceDefinition | null {
  return allServices.find((service) => service.id === id) ?? null;
}
export function serviceWalkthroughPath(id: ServiceId): string {
  return `/app/recovery?service=${encodeURIComponent(id)}`;
}
export function serviceEntryPath(id: ServiceId, signedIn: boolean): string {
  const path = serviceWalkthroughPath(id);
  return signedIn ? path : `/signup?next=${encodeURIComponent(path)}`;
}
