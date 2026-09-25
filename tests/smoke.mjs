/** Smoke test for the public UI and disconnected auth seam. No forged user or auth bypass. */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const expectedFree = [
  'Access Recovery', 'Device / Backup Recovery', 'Security Incident Recovery',
  'Transaction Investigation', 'Transfer / Asset Recovery Assessment', 'Scam / Fraud Assistance',
];
const feeExplanation = '10% fee only when Trustos successfully recovers the wallet.';
const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');

async function checkNoStatusClutter(page, label) {
  const text = await page.locator('body').innerText();
  assert(!/interface preview|local development|review service \/ not connected|no live (recovery|verification)|scripted response|future integration|backend not connected|demo only/i.test(text), `${label}: obsolete developer-status copy surfaced in the UI`);
}
async function checkAccessibility(page, label) {
  await page.addScriptTag({ path: axePath });
  const results = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }));
  assert.equal(results.violations.length, 0, `${label}: ${results.violations.map((item) => `${item.id}: ${item.nodes.map((node) => node.target.join(' ')).join(', ')}`).join('; ')}`);
}
async function checkServiceModel(page) {
  const cards = page.locator('#services .service-card');
  await cards.first().waitFor();
  assert.equal(await cards.count(), 6, 'Exactly six free public services');
  for (const [index, name] of expectedFree.entries()) {
    const card = cards.nth(index);
    assert.equal(await card.locator('h3').innerText(), name);
    assert.equal(await card.locator('.service-badge').innerText(), 'FREE');
    assert(!/10%|\bpaid\b|\bfee\b/i.test(await card.innerText()), `Fee copy leaked into ${name}`);
  }
  const paid = page.locator('#services .actual-wallet-card');
  assert.equal(await paid.count(), 1);
  assert.equal(await paid.locator('h3').innerText(), 'Actual Wallet Recovery');
  assert.equal(await paid.locator('.actual-wallet-fee strong').innerText(), '10%');
  assert((await paid.innerText()).includes(feeExplanation));
  assert((await paid.innerText()).includes('Opening this walkthrough does not start recovery or collect payment.'));
}

const server = await createServer({ server: { host: '127.0.0.1', port: 5183 } });
let browser;
try {
  await server.listen();
  const address = server.httpServer.address();
  if (!address || typeof address === 'string') throw new Error('Could not find local port');
  const base = `http://127.0.0.1:${address.port}`;

  // Test existing product contracts without manufacturing an authenticated user.
  const catalog = await server.ssrLoadModule('/src/services/serviceCatalog.ts');
  const guide = await server.ssrLoadModule('/src/services/guideService.ts');
  const review = await server.ssrLoadModule('/src/services/reviewService.ts');
  const auth = await server.ssrLoadModule('/src/services/authService.ts');
  assert.deepEqual(catalog.freeServices.map((service) => service.name), expectedFree);
  assert.equal(catalog.actualWalletRecovery.feeExplanation, feeExplanation);
  assert.equal(catalog.transactionVerificationUrl, 'https://trustos.wasmer.app');
  assert.equal(catalog.getService('scam-fraud-assistance')?.name, 'Scam / Fraud Assistance');
  assert.equal(catalog.serviceWalkthroughPath('actual-wallet-recovery'), '/app/recovery?service=actual-wallet-recovery');
  assert.equal(guide.getGuideReply('When does the 10% fee apply?').heading, 'Only Actual Wallet Recovery has a fee.');
  assert(guide.getGuideReply('Which services are free?').body.includes('Scam / Fraud Assistance'));
  assert(guide.looksLikeSecret('0x' + 'f'.repeat(64)));
  assert.equal((await guide.guideService.reply('How can I verify a result?')).heading, 'Verification should be independent.');
  assert.equal(review.reviewService.connection, 'not-connected');
  assert.deepEqual((await review.reviewService.listPublished()).reviews, []);
  for (const [operation, args] of [
    ['session', []], ['signup', ['Test', 'nobody@example.invalid', 'unused', true]],
    ['login', ['nobody@example.invalid', 'unused']], ['verify', ['nobody@example.invalid', '123456']],
    ['resend', ['nobody@example.invalid']], ['requestPasswordReset', ['nobody@example.invalid']],
    ['resetPassword', ['nobody@example.invalid', '123456', 'unused']], ['logout', []],
  ]) {
    await assert.rejects(auth.authService[operation](...args), (error) => error.code === 'AUTH_NOT_CONFIGURED');
  }
  const dashboardSource = await readFile(new URL('../src/pages/Dashboard.tsx', import.meta.url), 'utf8');
  const recoverySource = await readFile(new URL('../src/pages/Recovery.tsx', import.meta.url), 'utf8');
  assert(dashboardSource.includes('href={transactionVerificationUrl}') && dashboardSource.includes('opens in a new tab'));
  assert(recoverySource.includes('Frontend walkthrough.') && recoverySource.includes('This page does not submit a support request'));
  assert(!recoverySource.includes('ReviewInvitation'));
  console.log('✓ free/paid catalog, scripted guide, empty review contract, external-link and walkthrough source boundaries; auth operations explicitly unavailable');

  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 }, colorScheme: 'light' });
  const page = await context.newPage();
  const errors = [];
  const apiRequests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.pathname.startsWith('/api/')) apiRequests.push(request.url());
    if (url.hostname === 'trustos.wasmer.app') errors.push('Unexpected request to the external verification site');
  });

  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Recovery starts/ }).waitFor();
  await checkServiceModel(page);
  assert.equal(await page.locator('.hero-actions a').first().getAttribute('href'), '#services');
  const entryPath = await page.locator('#services .service-card').first().getAttribute('href');
  assert.equal(entryPath, '/signup?next=%2Fapp%2Frecovery%3Fservice%3Daccess-recovery');
  await page.getByRole('heading', { name: 'No community reviews yet.' }).waitFor();
  assert.equal(await page.locator('.published-review').count(), 0);
  assert.equal(await page.getByRole('link', { name: /View source code/ }).getAttribute('href'), 'https://github.com/yzigzag26-lab/Trustos-recover-Frontend');
  assert.equal(await page.getByRole('link', { name: /Report an issue/ }).getAttribute('href'), 'https://github.com/yzigzag26-lab/Trustos-recover-Frontend/issues');
  assert.equal(await page.getByRole('link', { name: /yzigzag26@gmail.com/ }).getAttribute('href'), 'mailto:yzigzag26@gmail.com');
  assert.equal(await page.getByRole('link', { name: /TrustOSLLC/ }).getAttribute('href'), 'https://t.me/TrustOSLLC');
  const hierarchy = await page.evaluate(() => ['how-it-works', 'services', 'security', 'verification', 'community', 'landing-cta-section'].map((id) => id === 'landing-cta-section' ? document.querySelector('.landing-cta-section')?.getBoundingClientRect().top + scrollY : document.getElementById(id)?.getBoundingClientRect().top + scrollY));
  assert(hierarchy.every((position, index) => index === 0 || hierarchy[index - 1] < position));
  await checkNoStatusClutter(page, 'landing');
  await page.locator('.hero-actions a[href="#services"]').click();
  await page.waitForFunction(() => {
    const top = document.querySelector('#services')?.getBoundingClientRect().top;
    return location.hash === '#services' && top !== undefined && top >= 82 && top < 120;
  });
  console.log('✓ public catalog, fee separation, empty genuine-only reviews, landing hierarchy and anchors preserved');

  const systemContext = await browser.newContext({ colorScheme: 'dark' });
  const systemPage = await systemContext.newPage();
  await systemPage.goto(base);
  assert.equal(await systemPage.locator('html').getAttribute('data-theme'), 'dark');
  await systemPage.emulateMedia({ colorScheme: 'light' });
  await systemPage.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  await systemContext.close();
  await page.getByRole('button', { name: /02 Recover/ }).click();
  assert.equal(await page.getByRole('button', { name: /02 Recover/ }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await checkAccessibility(page, 'landing dark');
  console.log('✓ Core interaction, system preference, persistent dark theme, and landing WCAG AA audit');

  await page.goto(base + '/app/recovery?service=transaction-investigation');
  await page.waitForURL('**/login?next=**');
  assert((await page.url()).includes('service%3Dtransaction-investigation'), 'Protected redirect must preserve the selected service.');
  await page.getByText(/Authentication is not connected yet. Account creation/).waitFor();
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  await page.getByRole('heading', { name: 'Google sign-in is unavailable.' }).waitFor();
  await page.getByText(/Email authentication is also unavailable/).waitFor();
  await page.getByRole('button', { name: 'Back to form' }).click();
  await checkAccessibility(page, 'login dark');
  console.log('✓ protected-route redirect and truthful Google/email-unavailable messaging');

  await page.goto(base + entryPath);
  await page.getByRole('heading', { name: 'Create your account.' }).waitFor();
  assert(new URL(page.url()).searchParams.get('next') === '/app/recovery?service=access-recovery');
  await page.getByLabel('Your name').fill('Not An Account');
  await page.getByLabel('Email address').fill('nobody@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill('NotARealPassword123!');
  await page.getByLabel('Confirm password').fill('NotARealPassword123!');
  await page.getByRole('button', { name: /Create account/ }).click();
  await page.getByText('Please accept the Terms & Conditions.').waitFor();
  await page.getByRole('checkbox', { name: /I have read and agree/ }).check();
  await page.getByRole('button', { name: /Create account/ }).click();
  await page.locator('.inline-notice--error').getByText('Authentication is not connected yet. No request was sent.').waitFor();
  assert((await page.url()).includes('/signup?'));
  assert.equal(await page.locator('.dev-code-card').count(), 0);
  assert.deepEqual(await page.evaluate(() => Object.keys(sessionStorage)), []);
  assert.deepEqual(await context.cookies(base), []);
  console.log('✓ signup retains consent UI but cannot create an account, session, or on-screen code');

  await page.goto(base + '/login?next=%2Fapp%2Frecovery%3Fservice%3Daccess-recovery');
  await page.getByLabel('Email address').fill('nobody@example.invalid');
  await page.getByLabel('Password', { exact: true }).fill('NotARealPassword123!');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await page.locator('.inline-notice--error').getByText('Authentication is not connected yet. No request was sent.').waitFor();
  assert((await page.url()).includes('/login?'));
  await page.goto(base + '/verify?email=nobody%40example.invalid');
  await page.getByRole('heading', { name: 'Confirm your account.' }).waitFor();
  await page.getByText('No code has been generated or sent.').waitFor();
  assert.equal(await page.locator('.dev-code-card, [aria-label^="Access code"]').count(), 0);
  await page.getByRole('button', { name: 'Request another code' }).click();
  await page.locator('.inline-notice--error').getByText('Authentication is not connected yet. No request was sent.').waitFor();
  await page.goto(base + '/forgot-password');
  await page.getByRole('heading', { name: 'Reset your password.' }).waitFor();
  await page.getByLabel('Email address').fill('nobody@example.invalid');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.locator('.inline-notice--error').getByText('Authentication is not connected yet. No request was sent.').waitFor();
  assert((await page.url()).endsWith('/forgot-password'));
  await page.goto(base + '/reset-password?email=nobody%40example.invalid');
  await page.getByRole('heading', { name: 'Choose a new password.' }).waitFor();
  assert.equal(await page.locator('.dev-code-card').count(), 0);
  assert.equal(await page.getByRole('heading', { name: 'Password updated.' }).count(), 0);
  console.log('✓ login, confirmation, and password-reset shells disclose the unavailable provider without fabricated codes or results');

  for (const path of ['/app', '/app/assistant', '/app/verification', '/app/account', '/app/recovery?service=actual-wallet-recovery']) {
    await page.goto(base + path);
    await page.waitForURL('**/login?next=**');
    assert.equal(new URL(page.url()).searchParams.get('next'), path);
  }
  await page.goto(base + '/terms');
  await page.getByRole('heading', { name: 'Services and fees' }).waitFor();
  await page.getByText(/6 Free Support services cost nothing/).waitFor();
  await page.getByRole('heading', { name: 'Account and session' }).waitFor();
  await page.getByText(/these forms do not create accounts or sessions/).waitFor();
  await page.goto(base + '/privacy');
  await page.getByText(/No account confirmation or reset code is generated, shown, or emailed/).waitFor();
  console.log('✓ workspace remains protected; Terms and privacy reflect removed development authentication');

  for (const width of [900, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/', '/login', '/signup', '/verify?email=nobody%40example.invalid', '/forgot-password', '/reset-password?email=nobody%40example.invalid', '/security', '/privacy', '/terms', '/app/recovery?service=access-recovery']) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      if (route.startsWith('/app/')) await page.waitForURL('**/login?next=**');
      const sizes = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
      assert(sizes[0] <= sizes[1], `${route} overflows at ${width}px: ${sizes.join(' > ')}`);
      await checkNoStatusClutter(page, `${route} at ${width}px`);
    }
  }
  await page.goto(base);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Services', exact: true }).waitFor();
  console.log('✓ public/auth shells and a protected redirect at tablet/mobile widths; mobile navigation');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await checkAccessibility(page, 'landing light mobile');
  for (const [route, heading, label] of [
    ['/login', 'Log in to Trustos.', 'login'],
    ['/signup', 'Create your account.', 'signup'],
    ['/verify?email=nobody%40example.invalid', 'Confirm your account.', 'confirmation'],
    ['/reset-password?email=nobody%40example.invalid', 'Choose a new password.', 'reset'],
    ['/privacy', 'Know the boundary.', 'privacy'],
  ]) {
    await page.goto(base + route);
    await page.getByRole('heading', { name: heading }).waitFor();
    await checkAccessibility(page, `${label} light mobile`);
  }
  assert.deepEqual(apiRequests, [], 'No legacy auth or other API request should leave the browser.');
  assert.deepEqual(errors, [], 'No browser script or console errors.');
  console.log('✓ light/dark WCAG AA audits and no auth API requests, fabricated sessions, or browser errors');
} finally {
  if (browser) await browser.close();
  await server.close();
}
