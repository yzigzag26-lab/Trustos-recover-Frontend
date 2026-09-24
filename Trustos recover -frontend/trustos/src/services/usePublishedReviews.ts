import { useEffect, useState } from 'react';
import { onlySafePublishedReviews, reviewService, type PublishedReview } from './reviewService';

type FeedStatus = 'loading' | 'not-connected' | 'empty' | 'ready' | 'error';
type FeedState = { status: FeedStatus; reviews: PublishedReview[] };

/**
 * Future live adapters are refreshed on focus, publication events and a modest
 * interval. The current preview makes no review network requests or claims.
 */
export function usePublishedReviews() {
  const [state, setState] = useState<FeedState>({ status: 'loading', reviews: [] });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let mounted = true;
    async function refresh() {
      try {
        const result = await reviewService.listPublished();
        if (!mounted) return;
        if (result.connection !== 'connected') {
          setState({ status: 'not-connected', reviews: [] });
          return;
        }
        const reviews = onlySafePublishedReviews(result.reviews).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
        setState({ status: reviews.length ? 'ready' : 'empty', reviews });
      } catch {
        if (mounted) setState({ status: 'error', reviews: [] });
      }
    }
    void refresh();
    if (reviewService.connection !== 'connected') return () => { mounted = false; };
    const onVisible = () => { if (!document.hidden) void refresh(); };
    const interval = window.setInterval(() => { if (!document.hidden) void refresh(); }, 45_000);
    const unsubscribe = reviewService.subscribePublished?.(() => { void refresh(); });
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      mounted = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      unsubscribe?.();
    };
  }, [attempt]);
  return { ...state, retry: () => { setState({ status: 'loading', reviews: [] }); setAttempt((value) => value + 1); } };
}
