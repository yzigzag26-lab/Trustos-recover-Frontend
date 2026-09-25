/**
 * Public review contract. This preview deliberately has NO review database,
 * NO recovery confirmation service and NO public review fixtures.
 *
 * A production adapter must enforce, on the server: real recovery confirmed,
 * explicit author consent, approval/publication and removal of sensitive data.
 * A client-supplied flag or token alone is never proof of a recovery.
 */
export type PublishedReview = Readonly<{
  id: string;
  status: 'published';
  recoveryConfirmed: true;
  publicName: string;
  text: string;
  publishedAt: string;
  rating?: number;
}>;

export type ReviewFeed = Readonly<{
  connection: 'not-connected' | 'connected';
  reviews: PublishedReview[];
}>;

/** Opaque, server-issued reference; the future server MUST validate it. */
export type ConfirmedRecoveryReference = Readonly<{ confirmationToken: string }>;
export type SubmitReviewRequest = Readonly<{
  confirmation: ConfirmedRecoveryReference;
  publicName: string;
  text: string;
  consentToPublish: true;
}>;
export type SubmitReviewResult = Readonly<{ publication: 'published' | 'pending' }>;

export interface ReviewService {
  readonly connection: ReviewFeed['connection'];
  listPublished(): Promise<ReviewFeed>;
  submitForConfirmedRecovery(request: SubmitReviewRequest): Promise<SubmitReviewResult>;
  /** A live adapter may push newly published reviews without waiting for polling. */
  subscribePublished?(notify: () => void): () => void;
}

export class ReviewServiceUnavailable extends Error {
  constructor() {
    super('Your review could not be submitted. Nothing was published.');
    this.name = 'ReviewServiceUnavailable';
  }
}

/** The ONLY adapter used in this build. It never manufactures reviews or success. */
export const reviewService: ReviewService = {
  connection: 'not-connected',
  async listPublished() { return { connection: 'not-connected', reviews: [] }; },
  async submitForConfirmedRecovery() { throw new ReviewServiceUnavailable(); },
};

const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const evmAddressOrKey = /\b0x[a-f\d]{40,64}\b|\b[a-f\d]{64}\b/i;
const bitcoinAddress = /\b(?:bc1|tb1)[a-z0-9]{15,}\b|\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b/i;
const secretLanguage = /\b(?:seed phrase|recovery phrase|private key|secret key|mnemonic|wallet password|xprv|yprv|zprv)\b/i;

/** A conservative defense-in-depth check; the backend must do the real review moderation. */
export function containsSensitiveReviewInformation(value: string) {
  return email.test(value) || evmAddressOrKey.test(value) || bitcoinAddress.test(value) || secretLanguage.test(value);
}

/** Never render unconfirmed, unpublished, malformed or visibly sensitive data. */
export function onlySafePublishedReviews(items: readonly PublishedReview[]): PublishedReview[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item || item.status !== 'published' || item.recoveryConfirmed !== true) return false;
    if (typeof item.id !== 'string' || !item.id.trim() || seen.has(item.id)) return false;
    if (typeof item.publicName !== 'string' || item.publicName.trim().length < 2 || item.publicName.length > 50) return false;
    if (typeof item.text !== 'string' || item.text.trim().length < 15 || item.text.length > 700) return false;
    if (typeof item.publishedAt !== 'string' || !Number.isFinite(Date.parse(item.publishedAt))) return false;
    if (containsSensitiveReviewInformation(`${item.publicName} ${item.text}`)) return false;
    if (item.rating !== undefined && (!Number.isInteger(item.rating) || item.rating < 1 || item.rating > 5)) return false;
    seen.add(item.id);
    return true;
  });
}
