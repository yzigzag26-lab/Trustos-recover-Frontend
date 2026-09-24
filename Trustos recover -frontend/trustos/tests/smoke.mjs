/** Browser-level smoke test. Run `npx playwright install chromium` once, then `npm run test:smoke`. */
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { createServer } from 'vite';
import { chromium } from 'playwright';

const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');
async function checkNoStatusClutter(page, label) {
  const text = await page.locator('body').innerText();
  assert(!/interface preview|local development|review service \/ not connected|no live (recovery|verification)|no production authentication|scripted response|future integration|backend not connected|demo only/i.test(text), `${label}: development-status copy surfaced in the UI`);
}

async function checkAccessibility(page, label) {
  await page.addScriptTag({ path: axePath });
  const violations = await page.evaluate(() => window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } }));
  assert.equal(violations.violations.length, 0, `${label}: ${violations.violations.map((item) => `${item.id}: ${item.nodes.map((node) => node.target.join(' ')).join(', ')}`).join('; ')}`);
}

const server = await createServer({ server: { host: '127.0.0.1', port: 5183 } });
let browser;
try {
  await server.listen();
  const address = server.httpServer.address();
  if (!address || typeof address === 'string') throw new Error('Could not find local port');
  const base = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 850 }, colorScheme: 'light' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error' && !/status of 400 \(Bad Request\)/.test(message.text())) errors.push(message.text()); });

  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Recovery starts/ }).waitFor();
  await page.getByRole('heading', { name: 'No community reviews yet.' }).waitFor();
  assert.equal(await page.locator('.published-review').count(), 0);
  assert.equal(await page.getByRole('link', { name: /View source code/ }).getAttribute('href'), 'https://github.com/yzigzag26-lab/Trustos-recover-Frontend');
  assert.equal(await page.getByRole('link', { name: /Report an issue/ }).getAttribute('href'), 'https://github.com/yzigzag26-lab/Trustos-recover-Frontend/issues');
  assert.equal(await page.getByRole('link', { name: /yzigzag26@gmail.com/ }).getAttribute('href'), 'mailto:yzigzag26@gmail.com');
  assert.equal(await page.getByRole('link', { name: /TrustOSLLC/ }).getAttribute('href'), 'https://t.me/TrustOSLLC');
  const hierarchy = await page.evaluate(() => ['verification', 'community', 'landing-cta-section'].map((id) => id === 'landing-cta-section' ? document.querySelector('.landing-cta-section')?.getBoundingClientRect().top + scrollY : document.getElementById(id)?.getBoundingClientRect().top + scrollY));
  assert(hierarchy[0] < hierarchy[1] && hierarchy[1] < hierarchy[2]);
  await checkNoStatusClutter(page, 'landing');
  console.log('✓ genuine-only empty state, section placement, real source/contact links');
  await page.getByRole('button', { name: /02 Recover/ }).click();
  assert.equal(await page.getByRole('button', { name: /02 Recover/ }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await checkAccessibility(page, 'landing dark');
  console.log('✓ landing, Core interaction, persistent dark theme, WCAG AA audit');

  await page.goto(base + '/app/recovery');
  await page.waitForURL('**/login?next=**');
  assert((await page.url()).includes('recovery'));
  await page.getByRole('button', { name: 'Continue with Google' }).click();
  await page.getByRole('heading', { name: 'Google sign-in is unavailable.' }).waitFor();
  assert((await page.url()).includes('/login'), 'The Google button must not authenticate the user.');
  await page.getByRole('button', { name: 'Continue with email' }).click();
  console.log('✓ protected workspace route and truthful Google sign-in behavior');

  const email = `smoke-${randomBytes(4).toString('hex')}@example.test`;
  const password = 'NotARealPassword123!';
  await page.goto(base + '/signup?next=%2Fapp%2Frecovery');
  await page.getByLabel('Your name').fill('Preview Tester');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm password').fill(password);
  await page.getByRole('button', { name: /Create account/ }).click();
  await page.getByText('Please accept the Terms & Conditions.').waitFor();
  await page.getByRole('checkbox', { name: /I have read and agree/ }).check();
  await page.getByRole('button', { name: /Create account/ }).click();
  await page.waitForURL('**/verify?**');
  const code = (await page.locator('.dev-code-card strong').textContent()).trim();
  assert.match(code, /^\d{6}$/);
  await page.getByText('Shown here, not sent by email. Valid for 10 minutes.').waitFor();
  await checkNoStatusClutter(page, 'code confirmation');
  await page.getByLabel('Six-digit code').fill('000000' === code ? '111111' : '000000');
  await page.getByRole('button', { name: /Confirm and continue/ }).click();
  await page.getByText('That code does not match.').waitFor();
  await page.getByLabel('Six-digit code').fill(code);
  await page.getByRole('button', { name: /Confirm and continue/ }).click();
  await page.waitForURL('**/app/recovery');
  await checkAccessibility(page, 'recovery dark');
  console.log('✓ sign up, explicit Terms consent, on-screen verification code, auth session');

  await page.getByRole('button', { name: /Continue to explore/ }).click();
  await page.getByText('Choose the issue that best describes your situation.').waitFor();
  await page.locator('.issue-choice').filter({ hasText: 'Wallet access' }).click();
  await page.locator('.known-choice').filter({ hasText: 'The wallet or service name' }).click();
  await page.getByRole('checkbox', { name: /I understand this walkthrough offers guidance only/ }).check();
  await page.getByRole('button', { name: /Continue to explore/ }).click();
  await page.getByRole('button', { name: /Continue to review/ }).click();
  await page.getByRole('heading', { name: 'Review what happened.' }).waitFor();
  await page.getByRole('checkbox', { name: /I understand this walkthrough did not produce/ }).check();
  await page.getByRole('button', { name: /Complete walkthrough/ }).click();
  await page.getByRole('heading', { name: /No recovery was performed/ }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Share your experience' }).count(), 0, 'Demo completion must never invite a public review.');
  console.log('✓ Identify → Recover → Verify demo, no review invitation or fabricated recovery result');

  await page.goto(base + '/app');
  await page.getByText('Walkthrough completed').waitFor();
  await page.goto(base + '/app/assistant');
  await checkAccessibility(page, 'assistant dark');
  await page.getByRole('button', { name: /Verifying a result/ }).click();
  await page.getByRole('heading', { name: 'Verification should be independent.' }).waitFor();
  await page.getByLabel('Ask Trustos AI a question').fill('0x' + 'f'.repeat(64));
  await page.getByRole('button', { name: 'Send question' }).click();
  await page.getByText(/it might contain a recovery phrase or private key/).waitFor();
  await page.goto(base + '/app/verification');
  await page.getByRole('heading', { name: 'A framework for independent review' }).waitFor();
  await page.getByText(/not completed checks or a verified result/).waitFor();
  await checkNoStatusClutter(page, 'verification');
  console.log('✓ local activity, scripted guide, secret detection, verification boundary');

  for (const width of [900, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/', '/app', '/app/recovery', '/app/assistant', '/app/verification', '/app/account', '/security', '/privacy', '/terms']) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      const sizes = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
      assert(sizes[0] <= sizes[1], `${route} overflows at ${width}px: ${sizes.join(' > ')}`);
      await checkNoStatusClutter(page, `${route} at ${width}px`);
    }
  }
  await page.goto(base);
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'How it works', exact: true }).waitFor();
  console.log('✓ clean presentation and no horizontal overflow across nine routes at tablet/mobile widths; mobile navigation');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await checkAccessibility(page, 'landing light mobile');
  await page.goto(base + '/app/account');
  await checkAccessibility(page, 'account light mobile');
  await page.goto(base + '/app/verification');
  await checkAccessibility(page, 'verification light mobile');
  console.log('✓ persisted light theme and WCAG AA audits on mobile landing, account, and verification');

  await page.goto(base + '/app/account');
  await page.locator('.account-logout').click();
  await page.waitForURL(base + '/');
  await page.goto(base + '/app');
  await page.waitForURL('**/login?next=**');
  await page.goto(base + '/forgot-password');
  await page.getByLabel('Email address').fill(email);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.waitForURL('**/reset-password?**');
  const resetCode = (await page.locator('.dev-code-card strong').textContent()).trim();
  assert.match(resetCode, /^\d{6}$/);
  await page.getByText('Shown here, not sent by email. Valid for 10 minutes.').waitFor();
  await page.getByLabel('Six-digit code').fill(resetCode);
  await page.getByLabel('New password', { exact: true }).fill('ANewUniquePassword123!');
  await page.getByLabel('Confirm new password').fill('ANewUniquePassword123!');
  await page.getByRole('button', { name: 'Update password' }).click();
  await page.getByRole('heading', { name: 'Password updated.' }).waitFor();
  await checkNoStatusClutter(page, 'password reset');
  await page.goto(base + '/app');
  await page.waitForURL('**/login?next=**');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('ANewUniquePassword123!');
  await page.getByRole('button', { name: /Log in/ }).click();
  await page.waitForURL('**/app');
  assert.deepEqual(errors, []);
  console.log('✓ logout, on-screen password reset, re-login, protected access, no browser errors');
} finally {
  if (browser) await browser.close();
  await server.close();
}
