import { useState, type FormEvent } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { InlineNotice } from './Shared';
import { containsSensitiveReviewInformation, reviewService, type ConfirmedRecoveryReference, type SubmitReviewResult } from '../services/reviewService';

/**
 * Production-only opt-in review form. NOT mounted by the demo recovery flow.
 * Render only after the real backend provides confirmed recovery evidence AND
 * the review service has been connected. The future server must revalidate the
 * opaque confirmation token and explicit consent before publishing anything.
 */
export function ReviewInvitation({ confirmation, onDismiss }: { confirmation: ConfirmedRecoveryReference | null; onDismiss: () => void }) {
  const [composing, setComposing] = useState(false);
  const [publicName, setPublicName] = useState('');
  const [text, setText] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SubmitReviewResult | null>(null);

  // No successful recovery or public review service exists in this build.
  if (!confirmation?.confirmationToken || reviewService.connection !== 'connected') return null;

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!confirmation?.confirmationToken) { setError('Recovery confirmation is missing. Nothing was published.'); return; }
    if (!consent) { setError('Please explicitly agree to publish your review.'); return; }
    if (publicName.trim().length < 2 || text.trim().length < 30) { setError('Enter a public name and at least 30 characters about your experience.'); return; }
    if (containsSensitiveReviewInformation(`${publicName} ${text}`)) {
      setError('Remove email addresses, wallet addresses, recovery phrases, keys, and other sensitive details before submitting.');
      return;
    }
    setBusy(true);
    try {
      const published = await reviewService.submitForConfirmedRecovery({
        confirmation,
        publicName: publicName.trim(),
        text: text.trim(),
        consentToPublish: true,
      });
      setResult(published);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Your review could not be submitted. Nothing was published.'); }
    finally { setBusy(false); }
  }

  return <section className="review-invitation" aria-labelledby="review-invitation-heading">
    <button className="review-invitation-close" type="button" onClick={onDismiss} aria-label="Dismiss review invitation"><X size={18} /></button>
    {result ? <><span className="eyebrow">YOUR CHOICE, YOUR WORDS</span><h2 id="review-invitation-heading">{result.publication === 'published' ? 'Your review is public.' : 'Your review was submitted.'}</h2><p>{result.publication === 'published' ? 'Thank you for choosing to share your experience. Your review is now publicly visible.' : 'Your review is not public yet. It will appear only if the review service confirms publication.'}</p><button type="button" className="btn btn-outline" onClick={onDismiss}>Close</button></>
      : !composing ? <><span className="eyebrow">OPTIONAL / AFTER CONFIRMED RECOVERY</span><h2 id="review-invitation-heading">Your recovery was confirmed. Would you like to share your experience?</h2><p>Nothing is published automatically. Sharing is entirely up to you, and you decide what public name and words to use.</p><div className="review-invitation-actions"><button type="button" className="btn btn-primary" onClick={() => setComposing(true)}>Share your experience <ArrowRight size={17} /></button><button type="button" className="btn btn-outline" onClick={onDismiss}>Not now</button></div></>
      : <><span className="eyebrow">SHARE ONLY IF YOU CHOOSE</span><h2 id="review-invitation-heading">Share your experience.</h2><p>No account details are added automatically. Never include recovery phrases, keys, email addresses, or wallet information.</p>
        <form onSubmit={submit} className="review-invitation-form"><label htmlFor="review-public-name">Public display name</label><input id="review-public-name" type="text" value={publicName} onChange={(event) => setPublicName(event.target.value)} maxLength={50} placeholder="A name you choose to share" autoComplete="off" required />
          <label htmlFor="review-public-text">Your review</label><textarea id="review-public-text" value={text} onChange={(event) => setText(event.target.value)} minLength={30} maxLength={700} rows={4} placeholder="Share your experience without personal or recovery details" required />
          <label className="review-consent"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span><strong>This review will be publicly visible on Trustos.</strong> I choose to publish these words and confirm they contain no sensitive information.</span></label>
          {error && <InlineNotice type="error">{error}</InlineNotice>}
          <div className="review-invitation-actions"><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit review'} <ArrowRight size={17} /></button><button type="button" className="btn btn-outline" onClick={onDismiss}>Not now</button></div>
        </form>
      </>}
  </section>;
}
