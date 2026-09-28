import { actualWalletRecovery, freeServices } from './serviceCatalog';

/** Prepared, deterministic guidance. No model, blockchain query, or external API is called here. */
export type GuideReply = { heading: string; body: string; points: string[]; action?: string };

const responses: Record<string, GuideReply> = {
  secrets: {
    heading: 'Your recovery phrase stays with you.',
    body: 'Never share a seed phrase, BIP39 passphrase, private key, or wallet password in chat, forms, email, or with anyone offering to help. Do not enter them here.',
    points: ['Keep recovery material offline and private.', 'Use only official documentation for your wallet or provider.', 'Treat requests for your phrase as a warning sign.'],
    action: 'The guided walkthrough only asks about a service area and non-sensitive context.',
  },
  services: {
    heading: 'Six areas of support stay free.',
    body: `${freeServices.map((service) => service.name).join(', ')} are provided at no cost. Actual Wallet Recovery is separate; it is not required to explore free support.`,
    points: ['Choose the area that fits your situation.', 'The frontend walkthrough explains possible paths; it does not submit a case.', 'You are never asked to share a wallet secret here.'],
    action: 'Compare the service areas on your dashboard.',
  },
  pricing: {
    heading: 'Only Actual Wallet Recovery has a fee.',
    body: `${actualWalletRecovery.feeExplanation} The six Free Support services are not charged 10%.`,
    points: ['Assessment, investigation, incident help, access and backup guidance, and scam assistance are free.', 'Opening this walkthrough does not perform a wallet recovery or collect payment.', 'A fee cannot be due for a walkthrough that produced no recovered wallet.'],
    action: 'Review the separate Actual Wallet Recovery card on your dashboard.',
  },
  fraud: {
    heading: 'Preserve evidence and protect what remains.',
    body: 'Scam / Fraud Assistance is a free service area. This guide can explain reporting steps, but it cannot retrieve funds or investigate an account for you.',
    points: ['Secure any accounts you still control through official channels.', 'Keep non-sensitive records and public transaction references.', 'Consider reporting to the provider and relevant authorities; beware of follow-up scams.'],
    action: 'Explore the Scam / Fraud Assistance walkthrough.',
  },
  incident: {
    heading: 'Secure the access you still control.',
    body: 'Security Incident Recovery is free. A suspected compromise calls for careful containment and documentation, not a request for your wallet secrets.',
    points: ['Follow official provider guidance from a trusted device.', 'Change exposed credentials and review active sessions where possible.', 'Record the incident without disclosing private keys.'],
    action: 'Explore the Security Incident Recovery walkthrough.',
  },
  backup: {
    heading: 'An existing device or backup may matter.',
    body: 'Device / Backup Recovery is free. Before resetting a device or overwriting a backup, review the official restoration guidance for your wallet or provider.',
    points: ['Identify which devices and backups you control without uploading them.', 'Do not enter recovery phrases, keys, or BIP39 passphrases here.', 'Check the provider’s official recovery instructions.'],
    action: 'Explore the Device / Backup Recovery walkthrough.',
  },
  transfer: {
    heading: 'Assess a transfer before trusting a recovery claim.',
    body: 'Transfer / Asset Recovery Assessment is free. Some transfers cannot be reversed; this guide cannot determine the outcome of a specific transfer.',
    points: ['Identify the network and public transaction reference.', 'Check official provider support routes where relevant.', 'Avoid anyone promising guaranteed recovery.'],
    action: 'Explore the Transfer / Asset Recovery Assessment walkthrough.',
  },
  verify: {
    heading: 'Verification should be independent.',
    body: 'Before relying on any claimed result, make sure you can check the important details independently. A walkthrough is not proof of a recovery or transaction.',
    points: ['Review exactly which information was used.', 'Check public addresses or transaction information with a trusted independent source.', 'Do not treat a screenshot or an unverified claim as proof.'],
    action: 'Visit the Verification page for a review checklist.',
  },
  privacy: {
    heading: 'Privacy is about clear boundaries.',
    body: 'The design intent is to keep sensitive recovery computation on your device where the architecture permits. The guided experience does not perform that computation.',
    points: ['Know what remains on your device.', 'Understand when a service is required.', 'Keep recovery phrases and private keys private.'],
    action: 'You can read the privacy and security information on the public site.',
  },
  access: {
    heading: 'Start by defining what access you lost.',
    body: 'Access Recovery is free. The walkthrough can help classify the issue, but it cannot restore wallet access or retrieve funds.',
    points: ['Identify the wallet or provider without entering credentials.', 'Check the provider’s official restoration instructions.', 'Be careful of anyone promising guaranteed recovery.'],
    action: 'Open the Access Recovery walkthrough to explore the process.',
  },
  transaction: {
    heading: 'Check a transaction using independent public information.',
    body: 'Transaction Investigation is free. This guide cannot inspect a transaction for you; Verify Transaction on the dashboard opens the existing Trustos site separately.',
    points: ['Confirm the network and public transaction reference.', 'Compare the exact destination and status using a trusted source.', 'Never enter a private key or password into a verification site.'],
    action: 'The Verification page outlines what to review.',
  },
  process: {
    heading: 'The path is Identify → Recover → Verify.',
    body: 'First understand the issue, then explore an approach, and finally consider what evidence a real outcome would need. This walkthrough does not execute a recovery.',
    points: ['Choose a service area and non-sensitive context.', 'Explore a proposed path before acting.', 'Check any claimed result with independent sources.'],
    action: 'Explore the guided Recovery walkthrough to see the flow.',
  },
  default: {
    heading: 'Let’s make the next step clearer.',
    body: 'I offer prepared guidance about the free services, the success-only wallet recovery fee, privacy, and what to check before trusting a result. I cannot examine an account or carry out recovery.',
    points: ['Ask which services are free.', 'Ask when a 10% fee could apply.', 'Ask how to avoid sharing sensitive information.'],
    action: 'For a guided starting point, explore the Recovery walkthrough.',
  },
};

export function getGuideReply(question: string): GuideReply {
  const text = question.toLowerCase();
  if (/phrase|private key|seed|mnemonic|password|secret|bip39/.test(text)) return responses.secrets;
  if (/10%|fee|charge|cost|paid|price|payment/.test(text)) return responses.pricing;
  if (/free|services|support|offer|available/.test(text)) return responses.services;
  if (/scam|fraud/.test(text)) return responses.fraud;
  if (/compromis|hack|incident|stolen/.test(text)) return responses.incident;
  if (/what stays|privac|data handling/.test(text)) return responses.privacy;
  if (/backup|device|lost phone/.test(text)) return responses.backup;
  if (/mistaken|wrong address|asset recovery|transfer/.test(text)) return responses.transfer;
  if (/transaction|network|hash|pending/.test(text)) return responses.transaction;
  if (/verif|check|prove|confirm|explorer|result/.test(text)) return responses.verify;
  if (/local|on-device|data|secure/.test(text)) return responses.privacy;
  if (/lost|access|wallet|locked/.test(text)) return responses.access;
  if (/process|work|step|start|recover|guidance/.test(text)) return responses.process;
  return responses.default;
}

/** Swap this adapter for an approved same-origin AI backend later; do not call a model in the browser. */
export interface GuideService { reply(question: string): Promise<GuideReply> }
export const guideService: GuideService = {
  async reply(question) { return getGuideReply(question); },
};

export function looksLikeSecret(value: string): boolean {
  const text = value.trim();
  if (/\b(?:0x)?[a-f0-9]{64}\b/i.test(text) || /\b(?:xprv|yprv|zprv)[a-zA-Z0-9]+\b/.test(text)) return true;
  if (/\b(?:seed phrase|recovery phrase|private key|wallet password|bip39 passphrase)\s*[:=]\s*\S+/i.test(text)) return true;
  const words = text.split(/\s+/);
  // Short, uninterrupted strings of 12/18/24 simple words resemble a recovery phrase.
  return [12, 18, 24].includes(words.length) && words.every((word) => /^[a-z]{2,12}$/.test(word));
}
