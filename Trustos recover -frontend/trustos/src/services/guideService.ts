/** Deterministic, local, scripted guidance. This does not call a model or external API. */
export type GuideReply = { heading: string; body: string; points: string[]; action?: string };
const responses: Record<string, GuideReply> = {
  secrets: {
    heading: 'Your recovery phrase stays with you.',
    body: 'Never share a seed phrase, private key, or wallet password in chat, forms, email, or with anyone offering to help. Do not enter them here.',
    points: ['Keep recovery material offline and private.', 'Use only official documentation for your wallet or provider.', 'Treat requests for your phrase as a warning sign.'],
    action: 'The guided walkthrough only asks about your issue category.',
  },
  verify: {
    heading: 'Verification should be independent.',
    body: 'Before relying on any claimed result, make sure you can check the important details independently. A walkthrough is not proof of a recovery or transaction.',
    points: ['Review exactly which information was used.', 'Check any public address or transaction information with a trusted independent source.', 'Do not treat a screenshot or an unverified claim as proof.'],
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
    body: 'Different access problems require different next steps. The walkthrough can help you classify the issue, but it cannot restore wallet access or retrieve funds.',
    points: ['Identify which wallet or provider was involved without entering credentials.', 'Check the provider’s official recovery instructions.', 'Be careful of anyone promising guaranteed recovery.'],
    action: 'Open the guided Recovery page to explore the process.',
  },
  transaction: {
    heading: 'Separate a transaction question from an access issue.',
    body: 'For an unclear transaction, check publicly available information through an independent source. I cannot inspect a transaction for you.',
    points: ['Confirm the network and transaction details using a reputable explorer.', 'Check the exact public address and status rather than relying on screenshots.', 'Avoid entering private keys or passwords into a verification site.'],
    action: 'The Verification page outlines what to review.',
  },
  process: {
    heading: 'The path is Identify → Recover → Verify.',
    body: 'First understand the issue, then explore an approach, and finally consider what evidence you would need to validate a real outcome. This walkthrough does not execute a recovery.',
    points: ['Identify the problem with non-sensitive context.', 'Explore the proposed path before anything happens.', 'Check any claimed result with independent sources.'],
    action: 'Explore the Recovery walkthrough to see the flow.',
  },
  default: {
    heading: 'Let’s make the next step clearer.',
    body: 'I offer prepared guidance about the recovery stages, privacy, and what to check before trusting a result. I cannot examine an account or carry out recovery.',
    points: ['Ask about the recovery process.', 'Ask what to verify.', 'Ask how to avoid sharing sensitive information.'],
    action: 'For a guided starting point, try the Recovery walkthrough.',
  },
};
export function getGuideReply(question: string): GuideReply {
  const text = question.toLowerCase();
  if (/phrase|private key|seed|mnemonic|password|secret|scam/.test(text)) return responses.secrets;
  if (/verif|check|prove|confirm|explorer|result/.test(text)) return responses.verify;
  if (/privac|device|local|data|secure/.test(text)) return responses.privacy;
  if (/lost|access|wallet|locked|recover account/.test(text)) return responses.access;
  if (/transaction|transfer|hash|network|pending/.test(text)) return responses.transaction;
  if (/process|work|step|start|recover|guidance/.test(text)) return responses.process;
  return responses.default;
}
export function looksLikeSecret(value: string): boolean {
  const text = value.trim();
  if (/\b(?:0x)?[a-f0-9]{64}\b/i.test(text) || /\b(?:xprv|yprv|zprv)[a-zA-Z0-9]+\b/.test(text)) return true;
  const words = text.split(/\s+/);
  // Short, uninterrupted strings of 12/18/24 simple words resemble a recovery phrase.
  return [12, 18, 24].includes(words.length) && words.every((word) => /^[a-z]{2,12}$/.test(word));
}
