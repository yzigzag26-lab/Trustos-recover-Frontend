import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowRight, ArrowUpRight, Code2, ExternalLink, Github, Mail, MessageSquareText, Pause, Play, RotateCw, Send, Star } from 'lucide-react';
import { Eyebrow } from './Shared';
import { usePublishedReviews } from '../services/usePublishedReviews';
import type { PublishedReview } from '../services/reviewService';

const repository = 'https://github.com/yzigzag26-lab/Trustos-recover-Frontend';
const issueTracker = `${repository}/issues`;
const telegram = 'https://t.me/TrustOSLLC';

function ReviewCard({ review }: { review: PublishedReview }) {
  const date = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(review.publishedAt));
  return <article className="published-review">
    <div className="published-review-top"><span>COMMUNITY REVIEW</span><time dateTime={review.publishedAt}>{date}</time></div>
    <p>{review.text.trim()}</p>
    <div className="published-review-bottom"><span className="published-review-avatar" aria-hidden="true">{review.publicName.trim().charAt(0).toUpperCase()}</span><strong>{review.publicName.trim()}</strong>{review.rating !== undefined && <span className="published-rating" aria-label={`Rating: ${review.rating} out of 5`}><Star size={13} fill="currentColor" aria-hidden="true" />{review.rating}/5</span>}</div>
  </article>;
}

type MotionEngine = {
  offset: number; step: number; total: number; cardWidth: number;
  active: boolean; hovering: boolean; focusing: boolean; manuallyPaused: boolean;
  holdUntil: number; drag: { x: number; offset: number; pointerId: number } | null;
};
const newEngine = (): MotionEngine => ({ offset: 0, step: 0, total: 0, cardWidth: 0, active: false, hovering: false, focusing: false, manuallyPaused: false, holdUntil: 0, drag: null });

/** One DOM card per genuine review. Recycling positions never duplicates content. */
function ReviewMarquee({ reviews }: { reviews: PublishedReview[] }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const engine = useRef<MotionEngine>(newEngine());
  const [canAnimate, setCanAnimate] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const container = viewport.current;
    const line = track.current;
    if (!container || !line) return;
    const cards = Array.from(line.querySelectorAll<HTMLElement>('.published-review'));
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame: number | null = null;
    let lastTime = 0;
    function render() {
      const current = engine.current;
      if (!current.active) return;
      for (const [index, card] of cards.entries()) {
        let left = index * current.step - current.offset;
        if (left + current.cardWidth <= 0) left += current.total;
        card.style.transform = `translate3d(${left - index * current.step}px, 0, 0)`;
      }
    }
    function nextFrame(now: number) {
      frame = null;
      const current = engine.current;
      if (!current.active) return;
      if (lastTime && !current.hovering && !current.focusing && !current.manuallyPaused && !current.drag && now >= current.holdUntil && !document.hidden) {
        current.offset = (current.offset + Math.min((now - lastTime) / 1000, 0.064) * 23) % current.total;
      }
      lastTime = now;
      render();
      frame = window.requestAnimationFrame(nextFrame);
    }
    function measure() {
      if (!container || !line || !cards.length) return;
      const current = engine.current;
      const gap = Number.parseFloat(window.getComputedStyle(line).gap) || 0;
      current.cardWidth = cards[0].offsetWidth;
      current.step = current.cardWidth + gap;
      current.total = current.step * cards.length;
      current.active = !motion.matches && cards.length >= 4 && current.total > container.clientWidth + 8;
      current.offset = current.active ? ((current.offset % current.total) + current.total) % current.total : 0;
      setCanAnimate(current.active);
      if (current.active) {
        render();
        if (frame === null) frame = window.requestAnimationFrame(nextFrame);
      } else {
        for (const card of cards) card.style.transform = '';
        if (frame !== null) { window.cancelAnimationFrame(frame); frame = null; }
        lastTime = 0;
      }
    }
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(cards[0]);
    motion.addEventListener('change', measure);
    measure();
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', measure);
      if (frame !== null) window.cancelAnimationFrame(frame);
      for (const card of cards) card.style.transform = '';
      engine.current.active = false;
    };
  }, [reviews]);

  function pointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const current = engine.current;
    if (!current.active || (event.pointerType === 'mouse' && event.button !== 0)) return;
    current.drag = { x: event.clientX, offset: current.offset, pointerId: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const current = engine.current;
    if (!current.drag || !current.total) return;
    current.offset = ((current.drag.offset + current.drag.x - event.clientX) % current.total + current.total) % current.total;
  }
  function pointerEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const current = engine.current;
    if (!current.drag) return;
    current.drag = null;
    current.holdUntil = performance.now() + 2300;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function keyboardMove(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const current = engine.current;
    if (current.active && current.total) {
      current.offset = ((current.offset + direction * 120) % current.total + current.total) % current.total;
      current.holdUntil = performance.now() + 2400;
    } else viewport.current?.scrollBy({ left: direction * 280, behavior: 'smooth' });
  }
  return <div className="published-reviews">
    <div className="published-reviews-tools"><span>VOLUNTARILY PUBLISHED <span className="reviews-tools-separator">/</span> {reviews.length} {reviews.length === 1 ? 'REVIEW' : 'REVIEWS'}</span><div><span className="reviews-hint-desktop">Hover to pause · Drag or use arrow keys</span><span className="reviews-hint-mobile">Swipe or use arrow keys</span>{canAnimate && <button type="button" className="reviews-pause" aria-label={paused ? 'Resume review movement' : 'Pause review movement'} aria-pressed={paused} onClick={() => { engine.current.manuallyPaused = !paused; setPaused(!paused); }}>{paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}{paused ? 'Resume' : 'Pause'}</button>}</div></div>
    <div ref={viewport} className={`review-marquee ${canAnimate ? 'review-marquee--animated' : 'review-marquee--static'}`} role="region" aria-label="Published Trustos community reviews" aria-live="off" tabIndex={0} onPointerEnter={(event) => { if (event.pointerType === 'mouse') engine.current.hovering = true; }} onPointerLeave={(event) => { if (event.pointerType === 'mouse') engine.current.hovering = false; }} onFocusCapture={() => { engine.current.focusing = true; }} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) engine.current.focusing = false; }} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onKeyDown={keyboardMove}>
      <div ref={track} className="review-marquee-track">{reviews.map((review) => <ReviewCard key={review.id} review={review} />)}</div>
    </div>
  </div>;
}

function ReviewsPanel() {
  const { status, reviews, retry } = usePublishedReviews();
  return <div className="community-reviews-panel" aria-labelledby="community-reviews-title">
    <div className="community-reviews-top"><div><span className="reviews-heading-dot" /><h3 id="community-reviews-title">Community reviews</h3></div><span>REAL REVIEWS ONLY</span></div>
    {status === 'ready' ? <ReviewMarquee reviews={reviews} /> : status === 'loading' ? <div className="review-feed-message" role="status">Checking for published community reviews…</div> : status === 'error' ? <div className="review-feed-message review-feed-error" role="alert"><div className="review-empty-icon"><MessageSquareText size={25} strokeWidth={1.5} /></div><h4>Reviews could not be loaded.</h4><p>Please try again in a moment.</p><button type="button" className="review-retry" onClick={retry}>Try again <RotateCw size={16} /></button></div> : <div className="community-review-empty"><div className="review-empty-copy"><div className="review-empty-icon"><MessageSquareText size={26} strokeWidth={1.4} aria-hidden="true" /></div><h4>No community reviews yet.</h4><p>Only experiences people choose to share after a confirmed recovery will appear here.</p><span className="review-empty-meta">SHARING IS ALWAYS A CHOICE.</span></div><div className="review-publication-flow"><span>HOW A REVIEW COULD APPEAR</span><div><i>01</i> A real recovery is confirmed</div><div><i>02</i> The person consents and submits</div><div><i>03</i> Trustos reviews the submission</div><div><i>04</i> An approved review appears here</div><small>Nothing is posted on someone’s behalf.</small></div></div>}
    <div className="community-reviews-foot"><span>REAL OUTCOMES FIRST. PUBLICATION BY CHOICE.</span><span>KEEP SENSITIVE DETAILS PRIVATE</span></div>
  </div>;
}

export function CommunitySection() {
  return <section className="community-section" id="community" aria-labelledby="community-title"><div className="container">
    <div className="section-head community-head"><div><Eyebrow index="06 /">COMMUNITY & OPEN WORK</Eyebrow><h2 id="community-title">Real experiences.<br /><span>Shared openly.</span></h2></div><p>Genuine feedback should come from real experiences, never made-up success stories. Sharing an experience is always a choice.</p></div>
    <ReviewsPanel />
    <div className="community-links-grid">
      <article className="opensource-card"><div className="community-card-top"><span className="community-card-icon community-card-icon--dark"><Code2 size={22} strokeWidth={1.6} aria-hidden="true" /></span><span>01 / OPEN SOURCE</span></div><div className="community-card-content"><h3>Open code.<br /><span>Independent eyes.</span></h3><p>Trustos keeps its frontend open for inspection. Review the implementation, understand the interface, report issues, and suggest improvements. Open source invites scrutiny; it isn't a security certification.</p></div><div className="opensource-actions"><a className="btn btn-primary" href={repository} target="_blank" rel="noopener noreferrer">View source code <ExternalLink size={17} aria-hidden="true" /></a><a href={issueTracker} target="_blank" rel="noopener noreferrer">Report an issue <ArrowUpRight size={16} aria-hidden="true" /></a></div><div className="opensource-foot"><Github size={14} aria-hidden="true" /><span>GITHUB / TRUSTOS RECOVER FRONTEND</span></div></article>
      <article className="developer-contact-card"><div className="community-card-top"><span className="community-card-icon"><Send size={20} strokeWidth={1.6} aria-hidden="true" /></span><span>02 / HUMAN CONTACT</span></div><div className="community-card-content"><h3>Talk to the<br /><span>developer.</span></h3><p>Questions about the interface, a bug you spotted, or a suggestion worth sharing? Reach us through these public channels.</p></div><div className="developer-contact-actions"><a href="mailto:yzigzag26@gmail.com" className="contact-action"><span className="contact-action-icon"><Mail size={19} strokeWidth={1.6} aria-hidden="true" /></span><span><small>EMAIL US</small><strong>yzigzag26@gmail.com</strong></span><ArrowUpRight size={18} aria-hidden="true" /></a><a href={telegram} target="_blank" rel="noopener noreferrer" className="contact-action"><span className="contact-action-icon"><Send size={19} strokeWidth={1.6} aria-hidden="true" /></span><span><small>TELEGRAM</small><strong>TrustOSLLC</strong></span><ArrowUpRight size={18} aria-hidden="true" /></a></div><div className="developer-contact-foot"><ArrowRight size={14} aria-hidden="true" /> REAL PEOPLE. CLEAR CHANNELS.</div></article>
    </div>
  </div></section>;
}
